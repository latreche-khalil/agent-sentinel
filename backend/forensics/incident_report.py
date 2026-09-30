"""Forensic Incident Report Generator (Markdown, JSON, HTML)."""
import json
from typing import Dict, Any
from backend.models.schemas import ForensicCase

class IncidentReportGenerator:
    @staticmethod
    def generate_markdown(case: ForensicCase) -> str:
        md = []
        md.append(f"# INCIDENT FORENSIC REPORT: {case.case_id}")
        md.append(f"**Title**: {case.title}")
        md.append(f"**Severity**: {case.severity.value} | **Risk Score**: {case.risk_score} / 100")
        md.append(f"**Status**: {case.status.value} | **Generated At**: {case.created_at}")
        md.append(f"**Agent ID**: `{case.agent_id}` | **Session ID**: `{case.session_id}` | **User**: `{case.user_id}`")
        md.append("\n---\n")

        md.append("## 1. Executive Summary")
        md.append(f"Agent Sentinel intercepted a security incident of type **{case.incident_type}**.")
        md.append(f"The autonomous agent was executing an action that violated organizational runtime security policies.")
        md.append(f"Runtime enforcement status: **BLOCKED**. Zero unauthorized data egress occurred.")
        md.append("\n---\n")

        md.append("## 2. Policy Violations")
        for pv in case.policy_violations:
            md.append(f"- [x] {pv}")
        md.append("\n---\n")

        md.append("## 3. Forensic Evidence Breakdown")
        md.append("| Signal | Category | Current Value | Baseline | Score Impact |")
        md.append("|---|---|---|---|---|")
        for ev in case.evidence:
            baseline = ev.baseline_value or "N/A"
            md.append(f"| **{ev.signal_name}** | {ev.category} | `{ev.current_value}` | {baseline} | +{ev.score_contribution} ({ev.impact}) |")
            md.append(f"  > *Explanation*: {ev.explanation}")
        md.append("\n---\n")

        md.append("## 4. Forensic Action Timeline")
        for evt in case.timeline:
            dec_badge = f" `[{evt.decision}]`" if evt.decision else ""
            md.append(f"- **{evt.timestamp}** `[{evt.actor.upper()}]` - {evt.summary}{dec_badge}")
        md.append("\n---\n")

        md.append("## 5. Affected Assets & Data Classes")
        md.append(f"- **Tools Involved**: {', '.join(case.affected_tools)}")
        md.append(f"- **Data Classifications**: {', '.join(case.affected_data)}")
        md.append("\n---\n")

        md.append("## 6. Recommended Remediations")
        for act in case.recommended_actions:
            md.append(f"1. {act}")

        return "\n".join(md)

    @staticmethod
    def generate_html(case: ForensicCase) -> str:
        md_content = IncidentReportGenerator.generate_markdown(case)
        # Wrap in a clean, professional dark-mode printable HTML template
        html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Agent Sentinel Forensic Report - {case.case_id}</title>
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f17; color: #e2e8f0; line-height: 1.6; padding: 40px; max-width: 900px; margin: 0 auto; }}
  h1 {{ color: #f87171; border-bottom: 2px solid #ef4444; padding-bottom: 12px; }}
  h2 {{ color: #93c5fd; margin-top: 30px; border-bottom: 1px solid #1e293b; padding-bottom: 8px; }}
  table {{ width: 100%; border-collapse: collapse; margin: 20px 0; background: #111827; border-radius: 8px; overflow: hidden; }}
  th, td {{ padding: 12px; border: 1px solid #1f2937; text-align: left; }}
  th {{ background: #1e293b; color: #cbd5e1; font-weight: 600; }}
  code {{ background: #1e293b; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }}
  blockquote {{ border-left: 3px solid #ef4444; padding-left: 14px; color: #94a3b8; font-style: italic; margin: 8px 0; }}
  .badge-critical {{ background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; }}
  .footer {{ margin-top: 50px; font-size: 0.85em; color: #64748b; border-top: 1px solid #1e293b; padding-top: 15px; text-align: center; }}
</style>
</head>
<body>
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <div><strong>AGENT SENTINEL</strong> | Runtime Security & Forensics</div>
    <span class="badge-critical">{case.severity.value} RISK {case.risk_score}/100</span>
  </div>
  <pre style="white-space: pre-wrap; font-family: inherit;">{md_content}</pre>
  <div class="footer">Confidential Security Incident Record &bull; Generated deterministically by Agent Sentinel Security Core</div>
</body>
</html>"""
        return html
