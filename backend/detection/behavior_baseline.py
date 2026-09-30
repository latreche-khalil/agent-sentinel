"""Behavioral baseline management and statistical profiling using Pandas/NumPy."""
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from backend.models.schemas import AgentBaseline

# Standard baselines for known agent profiles
PRECONFIGURED_BASELINES: Dict[str, Dict[str, Any]] = {
    "sales-agent": {
        "agent_name": "Sales Performance Analyst Agent",
        "average_tool_calls": 5.7,
        "tool_calls_std": 1.2,
        "typical_tools": ["search_sales", "aggregate_sales", "generate_report", "export_pdf_summary"],
        "median_rows_accessed": 124,
        "iqr_rows_range": (45, 280),
        "max_normal_rows": 500,
        "allowed_data_classes": ["INTERNAL", "CONFIDENTIAL"],
        "normal_destinations": ["internal_reporting_dashboard", "local_cache"],
        "external_transfers_allowed": False,
        "max_chain_depth": 10,
        "average_call_interval_sec": 1.8
    },
    "support-agent": {
        "agent_name": "Customer Support Tier 1 Agent",
        "average_tool_calls": 4.2,
        "tool_calls_std": 1.5,
        "typical_tools": ["lookup_ticket", "get_kb_article", "post_ticket_reply"],
        "median_rows_accessed": 15,
        "iqr_rows_range": (1, 30),
        "max_normal_rows": 100,
        "allowed_data_classes": ["INTERNAL", "PII"],
        "normal_destinations": ["zendesk_internal", "support_portal"],
        "external_transfers_allowed": False,
        "max_chain_depth": 8,
        "average_call_interval_sec": 2.5
    }
}

class BehaviorBaselineManager:
    @staticmethod
    def get_baseline(agent_id: str) -> Dict[str, Any]:
        """Fetch baseline profile for agent id or supply default."""
        if agent_id in PRECONFIGURED_BASELINES:
            return PRECONFIGURED_BASELINES[agent_id]
        return {
            "agent_name": agent_id,
            "average_tool_calls": 5.0,
            "tool_calls_std": 2.0,
            "typical_tools": [],
            "median_rows_accessed": 100,
            "iqr_rows_range": (20, 250),
            "max_normal_rows": 1000,
            "allowed_data_classes": ["INTERNAL"],
            "normal_destinations": ["internal"],
            "external_transfers_allowed": False,
            "max_chain_depth": 12,
            "average_call_interval_sec": 2.0
        }

    @staticmethod
    def compute_session_stats(historical_sessions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Dynamically compute summary statistics across past sessions using Pandas."""
        if not historical_sessions:
            return {}
        df = pd.DataFrame(historical_sessions)
        stats = {
            "mean_tool_calls": float(df["tool_calls"].mean()) if "tool_calls" in df else 5.0,
            "std_tool_calls": float(df["tool_calls"].std()) if "tool_calls" in df and len(df) > 1 else 1.0,
            "median_rows": float(df["rows_accessed"].median()) if "rows_accessed" in df else 100.0,
            "q25_rows": float(df["rows_accessed"].quantile(0.25)) if "rows_accessed" in df else 20.0,
            "q75_rows": float(df["rows_accessed"].quantile(0.75)) if "rows_accessed" in df else 250.0
        }
        return stats
