"""Forensic Case Management Engine."""
import uuid
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.models.schemas import ForensicCase, CaseStatus, Severity, EvidenceItem, TimelineEvent
from backend.storage.db import SessionLocal, DBCase

class CaseManager:
    @staticmethod
    def create_case(
        title: str,
        severity: Severity,
        agent_id: str,
        session_id: str,
        user_id: str,
        incident_type: str,
        risk_score: int,
        evidence: List[EvidenceItem],
        timeline: List[TimelineEvent],
        affected_tools: List[str],
        affected_data: List[str],
        policy_violations: List[str],
        recommended_actions: List[str]
    ) -> ForensicCase:
        case_id = f"CASE-{uuid.uuid4().hex[:5].upper()}"
        created_at = datetime.utcnow().isoformat()

        case = ForensicCase(
            case_id=case_id,
            title=title,
            severity=severity,
            status=CaseStatus.OPEN,
            created_at=created_at,
            agent_id=agent_id,
            session_id=session_id,
            user_id=user_id,
            incident_type=incident_type,
            risk_score=risk_score,
            evidence=evidence,
            timeline=timeline,
            affected_tools=affected_tools,
            affected_data=affected_data,
            policy_violations=policy_violations,
            recommended_actions=recommended_actions
        )

        # Persist to database
        db = SessionLocal()
        try:
            db_case = DBCase(
                case_id=case_id,
                title=title,
                severity=severity.value,
                status=CaseStatus.OPEN.value,
                created_at=datetime.utcnow(),
                agent_id=agent_id,
                session_id=session_id,
                user_id=user_id,
                incident_type=incident_type,
                risk_score=risk_score,
                evidence_json=json.dumps([e.model_dump() for e in evidence]),
                timeline_json=json.dumps([t.model_dump() for t in timeline]),
                affected_tools=json.dumps(affected_tools),
                affected_data=json.dumps(affected_data),
                policy_violations=json.dumps(policy_violations),
                recommended_actions=json.dumps(recommended_actions)
            )
            db.add(db_case)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Error persisting case: {e}")
        finally:
            db.close()

        return case

    @staticmethod
    def get_case(case_id: str) -> Optional[ForensicCase]:
        db = SessionLocal()
        try:
            db_case = db.query(DBCase).filter(DBCase.case_id == case_id).first()
            if not db_case:
                return None
            return CaseManager._to_pydantic(db_case)
        finally:
            db.close()

    @staticmethod
    def list_cases(limit: int = 50) -> List[ForensicCase]:
        db = SessionLocal()
        try:
            db_cases = db.query(DBCase).order_by(DBCase.created_at.desc()).limit(limit).all()
            return [CaseManager._to_pydantic(c) for c in db_cases]
        finally:
            db.close()

    @staticmethod
    def update_case_status(case_id: str, new_status: CaseStatus, feedback: Optional[Dict[str, Any]] = None) -> Optional[ForensicCase]:
        db = SessionLocal()
        try:
            db_case = db.query(DBCase).filter(DBCase.case_id == case_id).first()
            if not db_case:
                return None
            db_case.status = new_status.value
            if feedback:
                db_case.false_positive_feedback = json.dumps(feedback)
            db.commit()
            db.refresh(db_case)
            return CaseManager._to_pydantic(db_case)
        finally:
            db.close()

    @staticmethod
    def _to_pydantic(db_case: DBCase) -> ForensicCase:
        evidence_list = [EvidenceItem(**item) for item in json.loads(db_case.evidence_json or "[]")]
        timeline_list = [TimelineEvent(**item) for item in json.loads(db_case.timeline_json or "[]")]
        return ForensicCase(
            case_id=db_case.case_id,
            title=db_case.title,
            severity=Severity(db_case.severity),
            status=CaseStatus(db_case.status),
            created_at=db_case.created_at.isoformat() if db_case.created_at else datetime.utcnow().isoformat(),
            agent_id=db_case.agent_id or "",
            session_id=db_case.session_id or "",
            user_id=db_case.user_id or "",
            incident_type=db_case.incident_type or "Unknown",
            risk_score=db_case.risk_score or 0,
            evidence=evidence_list,
            timeline=timeline_list,
            affected_tools=json.loads(db_case.affected_tools or "[]"),
            affected_data=json.loads(db_case.affected_data or "[]"),
            policy_violations=json.loads(db_case.policy_violations or "[]"),
            recommended_actions=json.loads(db_case.recommended_actions or "[]"),
            false_positive_feedback=json.loads(db_case.false_positive_feedback) if db_case.false_positive_feedback else None
        )

case_manager = CaseManager()
