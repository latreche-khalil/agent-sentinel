"""AI Forensic Investigator: Provides structured fact-based incident analysis."""
from datetime import datetime
from typing import Dict, Any, List
from backend.models.schemas import ForensicCase, AIInvestigationResponse
from backend.core.config import settings
from backend.ai.provider import LocalDeterministicProvider, OpenAIProvider, OllamaProvider

class AIInvestigator:
    def __init__(self):
        if settings.LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            self.provider = OpenAIProvider(api_key=settings.OPENAI_API_KEY)
            self.model_name = "OpenAI gpt-4o"
        elif settings.LLM_PROVIDER == "ollama":
            self.provider = OllamaProvider(base_url=settings.OLLAMA_BASE_URL)
            self.model_name = "Ollama (Local LLM)"
        else:
            self.provider = LocalDeterministicProvider()
            self.model_name = "Sentinel Deterministic Engine (Offline)"

    def investigate(self, case: ForensicCase) -> AIInvestigationResponse:
        """
        Analyze a forensic case and produce structured findings:
        - What we know (strictly supported by evidence)
        - Possible explanations (hypotheses, not accusations)
        - What to investigate (concrete next steps)
        - Confidence rating
        """
        # 1. Compile strictly factual evidence statements
        what_we_know: List[str] = [
            f"Incident type '{case.incident_type}' was recorded with risk score {case.risk_score}/100 and severity {case.severity.value}.",
            f"Agent '{case.agent_id}' invoked tool(s): {', '.join(case.affected_tools)} during session '{case.session_id}'.",
        ]

        has_bulk = False
        has_pii = False
        has_exfil = False
        has_drift = False
        has_injection = False

        for ev in case.evidence:
            if "Anomaly" in ev.signal_name or "Volume" in ev.signal_name:
                what_we_know.append(f"Recorded volume anomaly: {ev.current_value} vs baseline {ev.baseline_value} ({ev.difference}).")
                has_bulk = True
            elif "PII" in ev.signal_name or "Sensitive" in ev.signal_name:
                what_we_know.append(f"Detected sensitive fields/data classes: {', '.join(case.affected_data) or 'PII/Financial'}.")
                has_pii = True
            elif "External" in ev.signal_name or "Egress" in ev.signal_name:
                what_we_know.append(f"Outbound transfer attempted: {ev.current_value}.")
                has_exfil = True
            elif "Drift" in ev.signal_name or "MCP" in ev.signal_name:
                what_we_know.append(f"Schema definition drift detected: {ev.difference}.")
                has_drift = True
            elif "Injection" in ev.signal_name or "Payload" in ev.signal_name:
                what_we_know.append(f"Untrusted context injection payload detected: {ev.current_value}.")
                has_injection = True

        for pv in case.policy_violations:
            what_we_know.append(f"Automated policy violation triggered: {pv}")

        # 2. Derive objective hypotheses (explanations)
        possible_explanations: List[str] = []
        if has_injection:
            possible_explanations.append("Indirect prompt injection: Untrusted text retrieved into agent context manipulated the agent's planning layer.")
            possible_explanations.append("Agent instruction boundary failure: The model failed to segregate untrusted data from tool execution directives.")
        elif has_exfil and has_bulk:
            possible_explanations.append("Compromised agent tool planning: Agent attempted unauthorized data export pipeline (query -> export -> external transfer).")
            possible_explanations.append("Task over-generalization: Agent expanded sales analysis query into broad customer table extraction due to ambiguous sub-goal.")
            possible_explanations.append("Tool misuse / misconfiguration: Agent selected bulk export tool when aggregate summary tool was appropriate.")
        elif has_drift:
            possible_explanations.append("MCP tool definition drift / rug-pull: The upstream tool schema was modified without corresponding security policy update.")
            possible_explanations.append("Deployment synchronization desync: Newer version of MCP tool deployed before Sentinel policy profile was re-hashed.")
        else:
            possible_explanations.append("Agent behavioral drift: Observed tool sequence diverges from established historical statistical profile.")
            possible_explanations.append("Prompt ambiguity: The original user request may have lacked explicit boundary constraints.")

        # 3. Actionable next forensic steps
        what_to_investigate: List[str] = [
            "Inspect raw session input stream and preceding tool outputs for hidden prompt injection patterns or untrusted data sources.",
            "Compare current tool invocation sequence with the last 10 successful normal sessions for this agent profile.",
            "Verify agent system prompt to ensure tool usage constraints and data boundary instructions are strictly defined.",
            "Review parameter sensitivity and check whether safe parameter transformations (e.g. column projections) could be applied."
        ]

        if has_drift:
            what_to_investigate.insert(0, "Audit the upstream MCP server repository for recent commit changes to tool parameter schemas.")
        if has_exfil:
            what_to_investigate.insert(0, "Check firewall / proxy audit logs to verify whether network egress connections to the target destination were dropped.")

        # Determine confidence level
        confidence = "HIGH" if (len(case.evidence) >= 3 or case.risk_score >= 80) else "MEDIUM"

        return AIInvestigationResponse(
            case_id=case.case_id,
            what_we_know=what_we_know,
            possible_explanations=possible_explanations,
            what_to_investigate=what_to_investigate,
            confidence=confidence,
            generated_at=datetime.utcnow().isoformat(),
            model_used=self.model_name
        )

ai_investigator = AIInvestigator()
