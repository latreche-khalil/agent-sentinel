"""Deterministic authorization checks (Source of Truth)."""
from typing import Dict, Any, Tuple, List, Optional
from backend.models.schemas import AgentModel, ToolMetadata, Decision

class AuthorizationEngine:
    @staticmethod
    def evaluate_limits(agent: AgentModel, current_chain_depth: int, session_tool_calls_count: int, estimated_rows: int) -> Tuple[bool, List[str]]:
        """Evaluate deterministic operational limits (chain depth, session calls, row limit)."""
        reasons = []

        if current_chain_depth > agent.maximum_chain_depth:
            reasons.append(f"Exceeded maximum chain depth: {current_chain_depth} > {agent.maximum_chain_depth}")

        if session_tool_calls_count >= agent.maximum_tool_calls_per_session:
            reasons.append(f"Exceeded tool call quota per session: {session_tool_calls_count} >= {agent.maximum_tool_calls_per_session}")

        if estimated_rows > agent.maximum_rows:
            reasons.append(f"Excessive data scope requested: {estimated_rows:,} rows exceeds limit of {agent.maximum_rows:,} rows")

        return len(reasons) == 0, reasons

    @staticmethod
    def requires_approval_check(agent: AgentModel, tool_meta: Optional[ToolMetadata]) -> bool:
        """Check if action triggers a mandatory human-in-the-loop review."""
        if not tool_meta:
            return False
        if tool_meta.requires_approval:
            return True
        if tool_meta.name in agent.approval_required_for:
            return True
        if tool_meta.risk_level in ["high", "critical"]:
            return True
        return False
