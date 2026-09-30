"""Agent Sentinel Command Line Interface (CLI)."""
import os
import sys
import json
import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.storage.db import SessionLocal, DBAgent, DBCase, DBActionLog, init_db
from backend.models.schemas import ActionProposal
from backend.security.interceptor import sentinel_interceptor
from backend.policy.engine import policy_engine
from backend.forensics.cases import case_manager
from backend.forensics.incident_report import IncidentReportGenerator
from demo.attack_scenarios.scenarios import SCENARIOS, get_scenario

cli_app = typer.Typer(name="sentinel", help="Agent Sentinel Runtime Security & Forensic CLI")
console = Console()

@cli_app.command("init")
def cmd_init():
    """Initialize Sentinel database and baseline tables."""
    init_db()
    console.print("[green]✓[/green] Sentinel database and tables successfully initialized.")

@cli_app.command("agents")
def cmd_agents(json_output: bool = typer.Option(False, "--json", help="Output raw JSON")):
    """List registered agents and their baseline security profiles."""
    init_db()
    db = SessionLocal()
    try:
        agents = db.query(DBAgent).all()
        if json_output:
            out = [{"id": a.id, "name": a.name, "trust": a.trust_level, "max_rows": a.maximum_rows} for a in agents]
            print(json.dumps(out, indent=2))
            return

        table = Table(title="Agent Sentinel - Monitored Agent Fleet")
        table.add_column("Agent ID", style="cyan")
        table.add_column("Name", style="white")
        table.add_column("Trust Level", style="magenta")
        table.add_column("Max Rows", justify="right")
        table.add_column("Allowed Tools", style="dim")

        for a in agents:
            tools = json.loads(a.allowed_tools or "[]")
            table.add_row(a.id, a.name, a.trust_level, str(a.maximum_rows), ", ".join(tools[:3]))
        console.print(table)
    finally:
        db.close()

@cli_app.command("evaluate")
def cmd_evaluate(
    file_path: str = typer.Argument(..., help="Path to action proposal JSON file"),
    json_output: bool = typer.Option(False, "--json", help="Output raw JSON")
):
    """Intercept and evaluate an action proposal against runtime security policies."""
    init_db()
    if not os.path.exists(file_path):
        console.print(f"[red]Error:[/red] File '{file_path}' not found.")
        raise typer.Exit(1)

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    proposal = ActionProposal(**data)
    result = sentinel_interceptor.intercept(proposal)

    if json_output:
        print(result.model_dump_json(indent=2))
        return

    dec_color = "red" if result.decision.value == "BLOCK" else "yellow" if result.decision.value == "REVIEW" else "green"
    panel_content = f"""[bold]Decision:[/bold] [{dec_color}]{result.decision.value}[/{dec_color}]
[bold]Risk Score:[/bold] {result.risk_score} / 100 ({result.severity.value})
[bold]Action Hash:[/bold] {result.action_hash}
[bold]Latency:[/bold] {result.latency_ms} ms

[bold]Reasons:[/bold]
""" + "\n".join(f"  • {r}" for r in result.reasons)

    if result.evidence:
        panel_content += "\n\n[bold]Evidence Signals:[/bold]\n" + "\n".join(
            f"  • [{e.category.upper()}] {e.signal_name}: +{e.score_contribution} pts ({e.difference or e.explanation})"
            for e in result.evidence
        )

    console.print(Panel(panel_content, title=f"Sentinel Inspection: {proposal.tool}", border_style=dec_color))

@cli_app.command("simulate")
def cmd_simulate(
    scenario_id: str = typer.Argument("scenario-exfiltration", help="Scenario ID (e.g. scenario-exfiltration, scenario-prompt-injection)"),
    json_output: bool = typer.Option(False, "--json", help="Output raw JSON")
):
    """Run controlled synthetic red-team attack simulation."""
    init_db()
    scenario = get_scenario(scenario_id)
    console.print(f"[bold cyan]Running Simulation:[/bold cyan] {scenario.name} ({scenario.attack_category})")
    
    accumulated_history = []
    results = []

    for idx, act in enumerate(scenario.actions):
        proposal = ActionProposal(
            agent_id=scenario.agent_id,
            session_id=f"SIM-{idx:03d}",
            original_task=scenario.user_task,
            tool=act["tool"],
            arguments=act.get("arguments", {}),
            previous_actions=accumulated_history.copy(),
            untrusted_context=act.get("untrusted_context")
        )
        res = sentinel_interceptor.intercept(proposal)
        accumulated_history.append(act["tool"])
        results.append((idx + 1, act["tool"], res))

    if json_output:
        out = [{"step": s, "tool": t, "decision": r.decision.value, "risk": r.risk_score} for s, t, r in results]
        print(json.dumps(out, indent=2))
        return

    table = Table(title=f"Simulation Trace: {scenario.name}")
    table.add_column("Step", justify="center")
    table.add_column("Tool", style="cyan")
    table.add_column("Decision", justify="center")
    table.add_column("Risk Score", justify="right")
    table.add_column("Latency")

    for s, t, r in results:
        dec_styled = f"[red]{r.decision.value}[/red]" if r.decision.value == "BLOCK" else f"[green]{r.decision.value}[/green]"
        table.add_row(str(s), t, dec_styled, f"{r.risk_score}/100", f"{r.latency_ms}ms")
    console.print(table)

    final_res = results[-1][2]
    if final_res.decision.value == scenario.expected_decision.value:
        console.print("\n[bold green][PASS] SIMULATION PASSED:[/bold green] Attack successfully intercepted and neutralized.")
    else:
        console.print("\n[bold red][FAIL] SIMULATION FAILED[/bold red]")

@cli_app.command("cases")
def cmd_cases():
    """List recorded forensic cases."""
    init_db()
    cases = case_manager.list_cases(limit=15)
    table = Table(title="Agent Sentinel - Forensic Incident Cases")
    table.add_column("Case ID", style="cyan")
    table.add_column("Severity", justify="center")
    table.add_column("Title", style="white")
    table.add_column("Risk", justify="right")
    table.add_column("Status", style="yellow")
    table.add_column("Created")

    for c in cases:
        sev_color = "red" if c.severity.value in ["HIGH", "CRITICAL"] else "yellow"
        table.add_row(
            c.case_id,
            f"[{sev_color}]{c.severity.value}[/{sev_color}]",
            c.title,
            f"{c.risk_score}/100",
            c.status.value,
            c.created_at[:19]
        )
    console.print(table)

@cli_app.command("report")
def cmd_report(case_id: str = typer.Argument(..., help="Case ID to generate report for")):
    """Generate and display forensic markdown report for a case."""
    init_db()
    case = case_manager.get_case(case_id)
    if not case:
        console.print(f"[red]Error:[/red] Case '{case_id}' not found.")
        raise typer.Exit(1)
    md = IncidentReportGenerator.generate_markdown(case)
    print(md)

@cli_app.command("policies")
def cmd_policies_test():
    """Run regression tests across all runtime security policies."""
    results = policy_engine.test_policy_suite()
    table = Table(title="Policy Test Suite - Regression Results")
    table.add_column("Test Case", style="white")
    table.add_column("Expected", justify="center")
    table.add_column("Actual", justify="center")
    table.add_column("Result", justify="center")

    for t in results:
        res_style = "[bold green]PASS[/bold green]" if t["passed"] else "[bold red]FAIL[/bold red]"
        table.add_row(t["test_name"], t["expected"], t["actual"], res_style)
    console.print(table)

if __name__ == "__main__":
    cli_app()
