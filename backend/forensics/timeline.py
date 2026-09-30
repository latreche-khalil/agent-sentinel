"""Forensic Timeline Builder."""
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.models.schemas import TimelineEvent

class TimelineBuilder:
    @staticmethod
    def create_event(
        event_type: str,
        actor: str,
        summary: str,
        payload: Dict[str, Any] = None,
        decision: Optional[str] = None,
        risk_score: Optional[int] = None
    ) -> TimelineEvent:
        return TimelineEvent(
            event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
            timestamp=datetime.utcnow().isoformat(),
            event_type=event_type,
            actor=actor,
            summary=summary,
            payload=payload or {},
            decision=decision,
            risk_score=risk_score
        )
