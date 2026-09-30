"""Prompt Injection and Untrusted Context Boundary Detector."""
import re
from typing import Dict, Any, List, Tuple, Optional
from backend.models.schemas import EvidenceItem, RiskSignal, Severity

INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(?:previous|prior|above)\s+instructions?", re.IGNORECASE),
    re.compile(r"disregard\s+(?:the\s+)?(?:original|previous)\s+(?:task|system|instructions?)", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+(?:in\s+developer\s+mode|unrestricted|DAN|root)", re.IGNORECASE),
    re.compile(r"new\s+system\s+prompt:", re.IGNORECASE),
    re.compile(r"(?:bypass|disable)\s+security\s+filters?", re.IGNORECASE),
    re.compile(r"exfiltrate|send\s+all\s+records?\s+to", re.IGNORECASE),
    re.compile(r"secret\s+instruction:", re.IGNORECASE),
    re.compile(r"do\s+not\s+tell\s+the\s+user", re.IGNORECASE)
]

class PromptInjectionDetector:
    @staticmethod
    def inspect_context_and_arguments(
        untrusted_context: Optional[str],
        tool_name: str,
        arguments: Dict[str, Any]
    ) -> Tuple[int, List[EvidenceItem], List[RiskSignal]]:
        """
        Inspect untrusted context (e.g. retrieved documents/web pages/tool outputs) 
        and arguments for prompt injection and untrusted boundary violation.
        """
        score = 0
        evidence: List[EvidenceItem] = []
        signals: List[RiskSignal] = []

        context_str = str(untrusted_context) if untrusted_context else ""
        args_str = str(arguments)

        found_in_context = []
        for pat in INJECTION_PATTERNS:
            match = pat.search(context_str)
            if match:
                found_in_context.append(match.group(0))

        found_in_args = []
        for pat in INJECTION_PATTERNS:
            match = pat.search(args_str)
            if match:
                found_in_args.append(match.group(0))

        # 1. Untrusted context contains explicit jailbreak/override instructions
        if found_in_context:
            contrib = 30
            score += contrib
            ev = EvidenceItem(
                signal_name="Untrusted Context Injection Payload",
                category="injection",
                current_value=f"Matched payload: '{found_in_context[0]}'",
                baseline_value="Trusted user input stream",
                difference="Hostile prompt injection sequence in external/retrieved context",
                threshold="Clean, passive document data",
                score_contribution=contrib,
                impact="HIGH",
                explanation=f"Retrieved context contains adversarial instruction: '{found_in_context[0]}'. Untrusted external data must not dictate tool invocation authority."
            )
            evidence.append(ev)
            signals.append(RiskSignal(
                category="injection",
                score_contribution=contrib,
                severity=Severity.HIGH,
                description=f"Prompt injection pattern detected in retrieved document: '{found_in_context[0]}'",
                evidence_detail={"matches": found_in_context}
            ))

            # Architectural barrier check: did the agent adopt an action instructed by the untrusted text?
            if any(term in tool_name.lower() for term in ["export", "upload", "dump", "admin", "query"]):
                boundary_contrib = 25
                score += boundary_contrib
                ev_b = EvidenceItem(
                    signal_name="Untrusted Authority Boundary Violation",
                    category="injection",
                    current_value=f"Tool '{tool_name}' triggered subsequent to injection ingestion",
                    baseline_value="User-authorized task bounds",
                    difference="Agent executed unauthorized high-risk action commanded by untrusted payload",
                    threshold="Strict untrusted data quarantine",
                    score_contribution=boundary_contrib,
                    impact="CRITICAL",
                    explanation="Agent attempted high-impact action after ingesting untrusted prompt override. Sentinel enforced untrusted data quarantine."
                )
                evidence.append(ev_b)
                signals.append(RiskSignal(
                    category="injection",
                    score_contribution=boundary_contrib,
                    severity=Severity.CRITICAL,
                    description=f"Untrusted data gained tool authority: Agent invoked '{tool_name}' following untrusted payload ingestion",
                    evidence_detail={"tool": tool_name}
                ))

        if found_in_args:
            contrib = 25
            score += contrib
            ev_args = EvidenceItem(
                signal_name="Injection Sequence in Tool Parameters",
                category="injection",
                current_value=f"Pattern: '{found_in_args[0]}'",
                baseline_value="Standard sanitized parameters",
                difference="Adversarial command string present inside arguments",
                threshold="Clean arguments",
                score_contribution=contrib,
                impact="HIGH",
                explanation=f"Argument structure carries prompt injection tokens: '{found_in_args[0]}'."
            )
            evidence.append(ev_args)

        score = min(score, 100)
        return score, evidence, signals
