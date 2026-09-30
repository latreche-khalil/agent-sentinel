"""Declarative Policy Engine and Policy Test Suite."""
import json
from typing import Dict, Any, List, Tuple
from backend.models.schemas import PolicyRule, Decision, DataClassification

DEFAULT_POLICIES: List[PolicyRule] = [
    PolicyRule(
        id="POL-001",
        name="Block PII Access in Analytics Tasks",
        description="Agents cannot access or query customer PII during general analytics tasks.",
        category="dlp",
        when={"task_category": "analytics", "data_classes_contains": "PII"},
        decision=Decision.BLOCK,
        enabled=True,
        priority=10
    ),
    PolicyRule(
        id="POL-002",
        name="External Egress Mandatory Approval",
        description="Any tool transferring data outside the corporate perimeter requires human review.",
        category="exfiltration",
        when={"tool_category": "external_egress"},
        decision=Decision.BLOCK,
        enabled=True,
        priority=20
    ),
    PolicyRule(
        id="POL-003",
        name="Block Large Volume Unbounded Export",
        description="Export actions requesting more than 5,000 records are blocked from autonomous execution.",
        category="scope",
        when={"min_rows": 5000, "action_type": "export"},
        decision=Decision.BLOCK,
        enabled=True,
        priority=15
    ),
    PolicyRule(
        id="POL-004",
        name="Low Trust Administrative Access Prohibited",
        description="Agents with LOW or MEDIUM trust levels are prohibited from executing administrative tools.",
        category="privilege",
        when={"agent_trust_below": "HIGH", "tool_admin": True},
        decision=Decision.BLOCK,
        enabled=True,
        priority=5
    ),
    PolicyRule(
        id="POL-005",
        name="MCP Definition Drift Requires Re-approval",
        description="If an MCP tool definition changes, freeze execution until manual review.",
        category="mcp",
        when={"mcp_drift": True},
        decision=Decision.BLOCK,
        enabled=True,
        priority=12
    )
]

class PolicyEngine:
    def __init__(self, custom_policies: List[PolicyRule] = None):
        self.policies = custom_policies if custom_policies is not None else DEFAULT_POLICIES

    def evaluate(self, context: Dict[str, Any]) -> Tuple[List[str], bool, Decision]:
        """
        Evaluate context against all active policies.
        Returns:
            violations: List of human-readable policy violation strings
            triggered_block: boolean indicating if a BLOCK decision was mandated
            strictest_decision: ALLOW, REVIEW, or BLOCK
        """
        violations = []
        strictest_decision = Decision.ALLOW

        for policy in sorted(self.policies, key=lambda p: p.priority):
            if not policy.enabled:
                continue

            matches = True
            cond = policy.when

            if "task_category" in cond and cond["task_category"] != context.get("task_category"):
                matches = False
            if "data_classes_contains" in cond and cond["data_classes_contains"] not in context.get("data_classes", []):
                matches = False
            if "tool_category" in cond and cond["tool_category"] != context.get("tool_category"):
                matches = False
            if "min_rows" in cond and context.get("estimated_rows", 0) < cond["min_rows"]:
                matches = False
            if "action_type" in cond and cond["action_type"] != context.get("action_type"):
                matches = False
            if "agent_trust_below" in cond and context.get("agent_trust") == "HIGH":
                matches = False
            if "tool_admin" in cond and not context.get("is_admin_tool", False):
                matches = False
            if "mcp_drift" in cond and not context.get("mcp_drift_detected", False):
                matches = False

            if matches:
                violations.append(f"Policy '{policy.name}' ({policy.id}): {policy.description}")
                if policy.decision == Decision.BLOCK:
                    strictest_decision = Decision.BLOCK
                elif policy.decision == Decision.REVIEW and strictest_decision != Decision.BLOCK:
                    strictest_decision = Decision.REVIEW

        return violations, (strictest_decision == Decision.BLOCK), strictest_decision

    def test_policy_suite(self) -> List[Dict[str, Any]]:
        """Run standard regression tests on the policy engine."""
        test_cases = [
            {
                "name": "PII during analytics task",
                "context": {"task_category": "analytics", "data_classes": ["PII"]},
                "expected": Decision.BLOCK
            },
            {
                "name": "Normal sales analytics aggregation",
                "context": {"task_category": "analytics", "data_classes": ["INTERNAL"], "estimated_rows": 120},
                "expected": Decision.ALLOW
            },
            {
                "name": "Bulk customer data export (42,812 rows)",
                "context": {"min_rows": 5000, "estimated_rows": 42812, "action_type": "export"},
                "expected": Decision.BLOCK
            },
            {
                "name": "External upload attempt",
                "context": {"tool_category": "external_egress"},
                "expected": Decision.BLOCK
            }
        ]

        results = []
        for tc in test_cases:
            _, _, decision = self.evaluate(tc["context"])
            results.append({
                "test_name": tc["name"],
                "expected": tc["expected"].value,
                "actual": decision.value,
                "passed": decision == tc["expected"]
            })
        return results

policy_engine = PolicyEngine()
