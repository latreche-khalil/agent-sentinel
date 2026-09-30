"""Database models and persistence layer using SQLAlchemy."""
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

class DBAgent(Base):
    __tablename__ = "agents"
    id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, default="")
    trust_level = Column(String(32), default="MEDIUM")
    allowed_tools = Column(Text, default="[]")  # JSON list
    denied_tools = Column(Text, default="[]")   # JSON list
    allowed_data_classes = Column(Text, default="[]")
    maximum_rows = Column(Integer, default=5000)
    maximum_tool_calls_per_session = Column(Integer, default=30)
    maximum_chain_depth = Column(Integer, default=15)
    approval_required_for = Column(Text, default="[]")
    baseline_behavior = Column(Text, default="{}")  # JSON
    policy_profile = Column(String(64), default="default_strict")
    created_at = Column(DateTime, default=datetime.utcnow)

class DBTool(Base):
    __tablename__ = "tools"
    name = Column(String(128), primary_key=True)
    description = Column(Text, default="")
    risk_level = Column(String(32), default="low")
    data_access = Column(Text, default="[]")
    side_effect = Column(Boolean, default=False)
    requires_approval = Column(Boolean, default=False)
    read_only = Column(Boolean, default=True)
    server_source = Column(String(128), default="native")
    definition_hash = Column(String(128), default="")
    parameters_schema = Column(Text, default="{}")

class DBPolicy(Base):
    __tablename__ = "policies"
    id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, default="")
    category = Column(String(64), default="security")
    when_condition = Column(Text, nullable=False)  # JSON
    decision = Column(String(32), default="BLOCK")
    enabled = Column(Boolean, default=True)
    priority = Column(Integer, default=100)

class DBActionLog(Base):
    __tablename__ = "action_logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    action_hash = Column(String(64), index=True)
    agent_id = Column(String(64), index=True)
    session_id = Column(String(64), index=True)
    user_id = Column(String(64))
    original_task = Column(Text)
    tool = Column(String(128), index=True)
    arguments = Column(Text)
    decision = Column(String(32))
    risk_score = Column(Integer)
    severity = Column(String(32))
    reasons = Column(Text)  # JSON
    evidence = Column(Text)  # JSON
    policy_violations = Column(Text)  # JSON
    latency_ms = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class DBCase(Base):
    __tablename__ = "cases"
    case_id = Column(String(64), primary_key=True)
    title = Column(String(256), nullable=False)
    severity = Column(String(32), nullable=False, index=True)
    status = Column(String(32), default="OPEN", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    agent_id = Column(String(64), index=True)
    session_id = Column(String(64), index=True)
    user_id = Column(String(64))
    incident_type = Column(String(128))
    risk_score = Column(Integer)
    evidence_json = Column(Text)
    timeline_json = Column(Text)
    affected_tools = Column(Text)  # JSON
    affected_data = Column(Text)   # JSON
    policy_violations = Column(Text)
    recommended_actions = Column(Text)
    false_positive_feedback = Column(Text, nullable=True)

class DBApproval(Base):
    __tablename__ = "approvals"
    approval_id = Column(String(64), primary_key=True)
    action_hash = Column(String(64), index=True)
    session_id = Column(String(64), index=True)
    agent_id = Column(String(64))
    tool = Column(String(128))
    parameters = Column(Text)
    reason = Column(Text)
    requested_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    status = Column(String(32), default="PENDING")
    approver = Column(String(64), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    modified_parameters = Column(Text, nullable=True)

# Database Engine initialization
engine = create_engine("sqlite:///./sentinel.db", echo=False, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
