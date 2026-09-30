"""Permission evaluation and scope validation."""
from typing import List, Set, Tuple
from backend.models.schemas import AgentModel, DataClassification, ToolMetadata

class PermissionEvaluator:
    @staticmethod
    def check_tool_permission(agent: AgentModel, tool_name: str) -> Tuple[bool, str]:
        """Check if an agent is authorized to call the requested tool."""
        # 1. Deny list takes strict precedence
        if tool_name in agent.denied_tools:
            return False, f"Tool '{tool_name}' is explicitly denied for agent '{agent.id}'."

        # 2. If allowed_tools is defined (non-empty), must be explicitly allowed
        if agent.allowed_tools and tool_name not in agent.allowed_tools:
            return False, f"Tool '{tool_name}' is not in allowed tools list for agent '{agent.id}'."

        return True, "Tool authorized under agent permission profile."

    @staticmethod
    def check_data_class_permission(agent: AgentModel, requested_classes: Set[DataClassification]) -> Tuple[bool, List[str]]:
        """Verify whether agent is permitted to view or process the requested data classes."""
        allowed_set = set(agent.allowed_data_classes)
        violations = []

        for dc in requested_classes:
            val = dc.value
            if val not in allowed_set and val in [DataClassification.PII.value, DataClassification.SECRET.value, DataClassification.FINANCIAL.value, DataClassification.CREDENTIAL.value]:
                violations.append(f"Agent '{agent.id}' lacks privilege for '{val}' data class.")

        return len(violations) == 0, violations
