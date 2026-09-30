"""Transparent, evidence-based Risk Scoring Engine."""
from typing import List, Tuple
from backend.models.schemas import EvidenceItem, RiskSignal, Severity, Decision
from backend.core.config import settings

class RiskEngine:
    @staticmethod
    def calculate_score(
        evidence_items: List[EvidenceItem],
        has_critical_block_policy: bool = False
    ) -> Tuple[int, Severity, Decision]:
        """
        Aggregate individual evidence contributions into a normalized 0-100 score.
        Determine Severity and Decision (ALLOW / REVIEW / BLOCK).
        """
        raw_score = sum(ev.score_contribution for ev in evidence_items)

        if has_critical_block_policy:
            raw_score = max(raw_score, 85)

        normalized_score = min(max(raw_score, 0), 100)

        # Severity classification
        if normalized_score >= 80:
            severity = Severity.CRITICAL
        elif normalized_score >= 60:
            severity = Severity.HIGH
        elif normalized_score >= 30:
            severity = Severity.MEDIUM
        elif normalized_score > 0:
            severity = Severity.LOW
        else:
            severity = Severity.SAFE

        # Decision thresholds
        if normalized_score >= settings.RISK_THRESHOLD_BLOCK or has_critical_block_policy:
            decision = Decision.BLOCK
        elif normalized_score >= settings.RISK_THRESHOLD_REVIEW:
            decision = Decision.REVIEW
        else:
            decision = Decision.ALLOW

        return normalized_score, severity, decision
