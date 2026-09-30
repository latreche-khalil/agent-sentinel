"""Data Exfiltration Detection Engine."""
import re
from typing import Dict, Any, List, Tuple
from backend.models.schemas import EvidenceItem, RiskSignal, Severity

EXTERNAL_DEST_PATTERNS = [
    re.compile(r'https?://[^\s/$.?#].[^\s]*', re.IGNORECASE),
    re.compile(r'upload_external', re.IGNORECASE),
    re.compile(r'send_external_email', re.IGNORECASE),
    re.compile(r'transfer\.sh|pastebin|webhook\.site|simulated_external_destination', re.IGNORECASE)
]

BASE64_LONG_REGEX = re.compile(r'(?:[A-Za-z0-9+/]{4}){15,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?')

class ExfiltrationDetector:
    @staticmethod
    def inspect_exfiltration(
        tool_name: str,
        arguments: Dict[str, Any],
        has_pii: bool,
        estimated_rows: int
    ) -> Tuple[int, List[EvidenceItem], List[RiskSignal]]:
        """
        Evaluate exfiltration indicators.
        Returns:
            exfil_score (0-100)
            evidence_items
            signals
        """
        score = 0
        evidence: List[EvidenceItem] = []
        signals: List[RiskSignal] = []

        args_str = str(arguments)
        is_external_tool = "upload_external" in tool_name.lower() or "external" in tool_name.lower()
        has_url = any(p.search(args_str) for p in EXTERNAL_DEST_PATTERNS)
        has_suspicious_encoding = bool(BASE64_LONG_REGEX.search(args_str))

        if is_external_tool or has_url:
            dest_name = arguments.get("destination", arguments.get("url", "SIMULATED_EXTERNAL_DESTINATION"))
            contrib = 25
            score += contrib

            ev = EvidenceItem(
                signal_name="External Egress Destination",
                category="exfiltration",
                current_value=f"Target: {dest_name}",
                baseline_value="Internal only",
                difference="Outbound external network connection requested",
                threshold="Zero external transfers",
                score_contribution=contrib,
                impact="HIGH",
                explanation=f"Agent attempted outbound transmission to external destination '{dest_name}'."
            )
            evidence.append(ev)
            signals.append(RiskSignal(
                category="exfiltration",
                score_contribution=contrib,
                severity=Severity.HIGH,
                description=f"Outbound transfer attempted to external destination ({dest_name})",
                evidence_detail={"destination": dest_name}
            ))

            # Compound check: External transfer + PII or bulk data
            if has_pii:
                comp_contrib = 20
                score += comp_contrib
                ev_pii = EvidenceItem(
                    signal_name="Sensitive Data in Outbound Payload",
                    category="exfiltration",
                    current_value="PII / Sensitive fields present in outbound stream",
                    baseline_value="No sensitive data in outbound payloads",
                    difference="Critical data leakage vector",
                    threshold="Strict zero PII outbound",
                    score_contribution=comp_contrib,
                    impact="CRITICAL",
                    explanation="Outbound transfer payload includes sensitive customer PII fields."
                )
                evidence.append(ev_pii)
                signals.append(RiskSignal(
                    category="exfiltration",
                    score_contribution=comp_contrib,
                    severity=Severity.CRITICAL,
                    description="Outbound transfer attempted with customer PII payload",
                    evidence_detail={"pii": True}
                ))

            if estimated_rows > 1000:
                bulk_contrib = 15
                score += bulk_contrib
                ev_bulk = EvidenceItem(
                    signal_name="Bulk Record Exfiltration Attempt",
                    category="exfiltration",
                    current_value=f"{estimated_rows:,} records",
                    baseline_value="< 500 records",
                    difference=f"Bulk staging of {estimated_rows:,} records for outbound transfer",
                    threshold="1,000 records",
                    score_contribution=bulk_contrib,
                    impact="HIGH",
                    explanation=f"Large volume export staging ({estimated_rows:,} records) detected immediately prior to egress."
                )
                evidence.append(ev_bulk)

        if has_suspicious_encoding:
            enc_contrib = 15
            score += enc_contrib
            ev_enc = EvidenceItem(
                signal_name="Obfuscated / Base64 Encoded Payload",
                category="exfiltration",
                current_value="Long Base64 / Hex binary string detected in arguments",
                baseline_value="Structured JSON / text parameters",
                difference="High-entropy encoded data block present",
                threshold="Standard readable parameter format",
                score_contribution=enc_contrib,
                impact="MEDIUM",
                explanation="Parameters contain high-entropy base64 block frequently used to bypass text filters during exfiltration."
            )
            evidence.append(ev_enc)

        score = min(score, 100)
        return score, evidence, signals
