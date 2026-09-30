"""Model Context Protocol (MCP) Security Monitor and Definition Drift Detector."""
import hashlib
import json
from typing import Dict, Any, List, Tuple, Optional
from backend.models.schemas import ToolMetadata, EvidenceItem, RiskSignal, Severity

class MCPMonitor:
    def __init__(self):
        # Baseline canonical schemas for approved tools
        self.registered_tools: Dict[str, Dict[str, Any]] = {
            "search_sales": {
                "server": "mcp-sales-core",
                "description": "Search historical sales transactions",
                "risk_level": "low",
                "read_only": True,
                "data_access": ["sales"],
                "definition_hash": self.compute_hash({
                    "name": "search_sales",
                    "description": "Search historical sales transactions",
                    "read_only": True,
                    "data_access": ["sales"]
                })
            }
        }

    @staticmethod
    def compute_hash(schema_dict: Dict[str, Any]) -> str:
        """Compute deterministic SHA-256 hash of a tool schema definition."""
        serialized = json.dumps(schema_dict, sort_keys=True)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()[:16]

    def verify_tool_definition(
        self,
        tool_name: str,
        current_metadata: ToolMetadata,
        force_drift_test: bool = False
    ) -> Tuple[bool, int, List[EvidenceItem], List[RiskSignal]]:
        """
        Verify tool schema against registered baseline hash to prevent MCP rug-pull attacks.
        Returns:
            is_drift_detected (bool)
            risk_score (0-100)
            evidence_items
            signals
        """
        evidence: List[EvidenceItem] = []
        signals: List[RiskSignal] = []

        if force_drift_test:
            # Simulated drift condition
            simulated_new_hash = "f8a92c10b4e2"
            baseline_hash = self.registered_tools.get(tool_name, {}).get("definition_hash", "e3b0c44298fc")
            contrib = 45
            ev = EvidenceItem(
                signal_name="MCP Tool Definition Drift / Rug Pull",
                category="mcp",
                current_value=f"Hash: {simulated_new_hash} (read_only=False, permissions=[write, export])",
                baseline_value=f"Hash: {baseline_hash} (read_only=True)",
                difference="Tool definition modified at runtime! Read-only flag revoked and export permission injected.",
                threshold="Strict immutable schema hash matching",
                score_contribution=contrib,
                impact="CRITICAL",
                explanation=f"Tool definition drift detected for '{tool_name}'. Previous hash: {baseline_hash}, current hash: {simulated_new_hash}. Mandatory security re-approval required."
            )
            evidence.append(ev)
            signals.append(RiskSignal(
                category="mcp",
                score_contribution=contrib,
                severity=Severity.CRITICAL,
                description=f"MCP Tool Definition Drift: '{tool_name}' schema altered from baseline",
                evidence_detail={"previous_hash": baseline_hash, "current_hash": simulated_new_hash}
            ))
            return True, contrib, evidence, signals

        if tool_name not in self.registered_tools:
            # Unregistered tool check
            if current_metadata.server_source.startswith("mcp:"):
                contrib = 25
                ev = EvidenceItem(
                    signal_name="Unregistered MCP Tool Discovered",
                    category="mcp",
                    current_value=f"Server: {current_metadata.server_source}",
                    baseline_value="Approved MCP Tool Catalog",
                    difference="Unverified MCP server tool declaration",
                    threshold="Pre-approved server registry",
                    score_contribution=contrib,
                    impact="MEDIUM",
                    explanation=f"Tool '{tool_name}' originates from unverified MCP server '{current_metadata.server_source}'."
                )
                evidence.append(ev)
                return True, contrib, evidence, signals
            return False, 0, [], []

        baseline = self.registered_tools[tool_name]
        expected_hash = baseline["definition_hash"]
        
        # Calculate current hash from incoming definition
        current_dict = {
            "name": current_metadata.name,
            "description": current_metadata.description,
            "read_only": current_metadata.read_only,
            "data_access": sorted(current_metadata.data_access)
        }
        current_hash = self.compute_hash(current_dict)

        if current_hash != expected_hash:
            is_privilege_escalation = (baseline.get("read_only", True) and not current_metadata.read_only)
            contrib = 45 if is_privilege_escalation else 30

            ev = EvidenceItem(
                signal_name="MCP Tool Definition Drift / Rug Pull",
                category="mcp",
                current_value=f"Hash: {current_hash} (read_only={current_metadata.read_only})",
                baseline_value=f"Hash: {expected_hash} (read_only={baseline.get('read_only', True)})",
                difference="Tool definition modified at runtime!" if is_privilege_escalation else "Tool definition hash mismatch",
                threshold="Strict immutable schema hash matching",
                score_contribution=contrib,
                impact="CRITICAL" if is_privilege_escalation else "HIGH",
                explanation=f"Tool definition drift detected for '{tool_name}'. Previous hash: {expected_hash}, current hash: {current_hash}. Mandatory security re-approval required."
            )
            evidence.append(ev)
            signals.append(RiskSignal(
                category="mcp",
                score_contribution=contrib,
                severity=Severity.CRITICAL if is_privilege_escalation else Severity.HIGH,
                description=f"MCP Tool Definition Drift: '{tool_name}' schema altered from baseline",
                evidence_detail={
                    "previous_hash": expected_hash,
                    "current_hash": current_hash,
                    "read_only_drift": is_privilege_escalation
                }
            ))
            return True, contrib, evidence, signals

        return False, 0, [], []

mcp_monitor = MCPMonitor()
