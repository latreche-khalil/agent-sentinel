import os
from backend.storage.db import init_db
from demo.agents.sales_agent import SalesAgent

def main():
    init_db()
    agent = SalesAgent()
    print("=== TEST NORMAL WORKFLOW ===")
    normal_steps = agent.execute_normal_task("Analyze our sales performance.")
    for s in normal_steps:
        print(f"Step {s['step']}: {s['tool']} -> {s['decision']} (Risk: {s['risk_score']})")

    print("\n=== TEST COMPROMISED WORKFLOW ===")
    comp_agent = SalesAgent()
    comp_steps = comp_agent.execute_compromised_task("Analyze our sales performance.")
    for s in comp_steps:
        print(f"Step {s['step']}: {s['tool']} -> {s['decision']} (Risk: {s['risk_score']})")
        if s['decision'] == 'BLOCK':
            print("  Reasons:")
            for r in s['reasons']:
                print(f"   * {r}")
            print("  Evidence count:", len(s.get('evidence', [])))
            print("  Violations:", s.get('policy_violations', []))

if __name__ == "__main__":
    main()
