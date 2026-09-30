"""Agent Sentinel Python SDK."""
from typing import Dict, Any, Optional, List
import uuid
from backend.models.schemas import ActionProposal, InterceptResult, Decision
from backend.security.interceptor import sentinel_interceptor

class DecisionWrapper:
    def __init__(self, result: InterceptResult):
        self.result = result
        self.decision = result.decision.value
        self.risk_score = result.risk_score
        self.severity = result.severity.value
        self.reasons = result.reasons
        self.evidence = result.evidence
        self.policy_violations = result.policy_violations
        self.required_approval = result.required_approval
        self.approval_id = result.approval_id
        self.safe_alternative = result.safe_alternative

    @property
    def allowed(self) -> bool:
        return self.result.decision == Decision.ALLOW

    @property
    def blocked(self) -> bool:
        return self.result.decision == Decision.BLOCK

    @property
    def requires_review(self) -> bool:
        return self.result.decision == Decision.REVIEW

    def __repr__(self) -> str:
        return f"<Decision decision={self.decision} risk_score={self.risk_score}/100 blocked={self.blocked}>"

class Sentinel:
    def __init__(self, agent_id: str, default_task: str = "Automated Agent Task", user_id: str = "analyst_1"):
        self.agent_id = agent_id
        self.default_task = default_task
        self.user_id = user_id
        self.session_id = f"SESS-{uuid.uuid4().hex[:6].upper()}"
        self.history: List[str] = []

    def evaluate_tool_call(
        self,
        tool: str,
        arguments: Dict[str, Any] = None,
        task: Optional[str] = None,
        untrusted_context: Optional[str] = None
    ) -> DecisionWrapper:
        """
        Evaluate a proposed tool invocation before execution.
        Returns a DecisionWrapper with .allowed, .blocked, .risk_score, .reasons.
        """
        proposal = ActionProposal(
            agent_id=self.agent_id,
            session_id=self.session_id,
            user_id=self.user_id,
            original_task=task or self.default_task,
            tool=tool,
            arguments=arguments or {},
            previous_actions=self.history.copy(),
            untrusted_context=untrusted_context
        )
        res = sentinel_interceptor.intercept(proposal)
        if res.execution_allowed:
            self.history.append(tool)
        return DecisionWrapper(res)

    def intercept_tool(self, tool_name: Optional[str] = None, task: Optional[str] = None):
        """Decorator to wrap agent tool functions with Sentinel enforcement."""
        def decorator(func):
            def wrapper(*args, **kwargs):
                name = tool_name or func.__name__
                decision = self.evaluate_tool_call(name, kwargs, task=task)
                if decision.blocked:
                    raise PermissionError(
                        f"[Agent Sentinel BLOCKED] Tool '{name}' call blocked. Risk Score: {decision.risk_score}/100. "
                        f"Reasons: {'; '.join(decision.reasons)}"
                    )
                return func(*args, **kwargs)
            return wrapper
        return decorator

__all__ = ["Sentinel", "DecisionWrapper"]
