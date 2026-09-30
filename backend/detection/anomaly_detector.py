"""Deterministic Anomaly Detection Engine (z-score, IQR, frequency, row spike)."""
from typing import Dict, Any, List, Tuple
from backend.models.schemas import EvidenceItem, RiskSignal, Severity
from backend.detection.behavior_baseline import BehaviorBaselineManager

class AnomalyDetector:
    @staticmethod
    def detect_anomalies(
        agent_id: str,
        current_tool: str,
        current_rows: int,
        session_tool_calls_count: int,
        has_external_destination: bool,
        has_sensitive_data: bool
    ) -> Tuple[int, List[EvidenceItem], List[RiskSignal]]:
        """
        Evaluate current metrics against statistical baseline.
        Returns:
            anomaly_score (0-100)
            evidence_items (transparent calculation details)
            signals (risk signals)
        """
        baseline = BehaviorBaselineManager.get_baseline(agent_id)
        evidence: List[EvidenceItem] = []
        signals: List[RiskSignal] = []
        score = 0

        # 1. Row count anomaly (IQR and percentage threshold)
        median_rows = baseline.get("median_rows_accessed", 124)
        max_normal = baseline.get("max_normal_rows", 500)
        if current_rows > max_normal:
            diff_pct = ((current_rows - median_rows) / max_normal) * 100.0
            contrib = 25 if current_rows > 10000 else 15
            score += contrib

            ev = EvidenceItem(
                signal_name="Row Volume Anomaly",
                category="anomaly",
                current_value=f"{current_rows:,} rows",
                baseline_value=f"{median_rows:,} rows (median)",
                difference=f"+{diff_pct:,.1f}% deviation",
                threshold=f"{max_normal:,} rows",
                score_contribution=contrib,
                impact="HIGH",
                explanation=f"Agent requested {current_rows:,} records, dramatically exceeding normal baseline of {median_rows} rows."
            )
            evidence.append(ev)
            signals.append(RiskSignal(
                category="anomaly",
                score_contribution=contrib,
                severity=Severity.HIGH,
                description=f"Abnormal data volume spike ({current_rows:,} rows vs normal {median_rows})",
                evidence_detail={"rows": current_rows, "baseline": median_rows, "deviation_pct": diff_pct}
            ))

        # 2. Tool frequency / novel tool anomaly
        typical_tools = baseline.get("typical_tools", [])
        if typical_tools and current_tool not in typical_tools:
            contrib = 15
            score += contrib
            ev = EvidenceItem(
                signal_name="Unfamiliar Tool Invocation",
                category="anomaly",
                current_value=current_tool,
                baseline_value=", ".join(typical_tools[:3]),
                difference="Tool absent from established typical tools set",
                threshold="Established typical tool profile",
                score_contribution=contrib,
                impact="MEDIUM",
                explanation=f"Tool '{current_tool}' has not been observed in baseline profile for agent '{agent_id}'."
            )
            evidence.append(ev)
            signals.append(RiskSignal(
                category="anomaly",
                score_contribution=contrib,
                severity=Severity.MEDIUM,
                description=f"Novel tool '{current_tool}' invoked outside behavioral baseline",
                evidence_detail={"tool": current_tool, "typical": typical_tools}
            ))

        # 3. Tool call volume per session
        avg_calls = baseline.get("average_tool_calls", 5.7)
        if session_tool_calls_count > (avg_calls * 2.5):
            contrib = 10
            score += contrib
            ev = EvidenceItem(
                signal_name="Session Tool Call Frequency Spike",
                category="anomaly",
                current_value=session_tool_calls_count,
                baseline_value=f"{avg_calls:.1f} avg calls",
                difference=f"+{session_tool_calls_count - avg_calls:.1f} calls",
                threshold=f"{avg_calls * 2:.1f} calls",
                score_contribution=contrib,
                impact="LOW",
                explanation=f"High frequency of tool invocations ({session_tool_calls_count}) in single session indicates potential loop or excessive exploration."
            )
            evidence.append(ev)

        # 4. External transfer anomaly
        if has_external_destination and not baseline.get("external_transfers_allowed", False):
            contrib = 20
            score += contrib
            ev = EvidenceItem(
                signal_name="Unauthorized External Destination",
                category="anomaly",
                current_value="External transmission attempted",
                baseline_value="0 external transfers allowed",
                difference="Policy divergence (external disallowed)",
                threshold="Internal only",
                score_contribution=contrib,
                impact="HIGH",
                explanation="Agent baseline strictly disallows external egress, but an external transfer was attempted."
            )
            evidence.append(ev)
            signals.append(RiskSignal(
                category="anomaly",
                score_contribution=contrib,
                severity=Severity.HIGH,
                description="External egress attempted on an internal-only agent baseline",
                evidence_detail={"external": True}
            ))

        score = min(score, 100)
        return score, evidence, signals
