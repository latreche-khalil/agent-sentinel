# Agent Sentinel

## Runtime Security & Forensics for AI Agents

> **Detect. Explain. Block. Investigate.**

**Agent Sentinel** is an inline, zero-trust runtime security and forensic platform that sits between autonomous AI agents and their tools. It continuously inspects agent tool proposals in real-time, evaluating them deterministically against user intent, permissions, data sensitivity (DLP), behavioral baselines, Markov transition sequence graphs, and security policies to allow, review, or block dangerous actions with sub-5ms overhead.

```
       User Intent & Prompt
               │
               ▼
       ┌───────────────┐
       │   AI Agent    │
       └───────┬───────┘
               │  Tool Proposal (e.g., upload_external)
               ▼
┌────────────────────────────────────────────────────────┐
│               AGENT SENTINEL GATEWAY                   │
│                                                        │
│  [ Stage 1: Role-Based Tool Entitlements (RBAC) ]      │
│  [ Stage 2: Session & Chain Depth Rate Limits   ]      │
│  [ Stage 3: Data Sensitivity Classification/DLP ]      │
│  [ Stage 4: Untrusted Boundary / Prompt Inject  ]      │
│  [ Stage 5: MCP Parameter Schema Hash Drift     ]      │
│  [ Stage 6: Markov Transition Graph (Sequence)  ]      │
│  [ Stage 7: Statistical Anomaly Detection (IQR) ]      │
│  [ Stage 8: User Intent Alignment Scorer        ]      │
│  [ Stage 9: Deterministic Policy Rulebook       ]      │
│  [ Stage 10: Multi-Factor Risk Scorer (0-100)   ]      │
│                                                        │
│         ALLOW (0)   │   REVIEW   │   BLOCK (94)        │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
         [ Execution ]            [ Cryptographic Case ]
               ▼                           ▼
      Tools / Databases           Forensic Incident Hub
     MCP Servers / APIs           AI Root-Cause Copilot
```

---

## Key Capabilities

1. **Deterministic Inline Interception (< 4ms Latency)**
   - All authorization decisions are strictly deterministic rules, statistical baselines, and graph algorithms.
   - Built-in fast-path optimizes benign operational patterns (`search_sales` → `aggregate_sales` → `generate_report`) to execute with sub-2ms latency.

2. **Full-Spectrum Threat Detection Engines**
   - **Intent Alignment**: Detects pivot attacks where an agent instructed to analyze sales pivots to dumping customer databases.
   - **Sequence Graph (NetworkX)**: Detects compounding multi-tool weaponization chains (read internal → export staging → external upload).
   - **Behavioral Baselines (Pandas/NumPy)**: Z-score & IQR outlier analysis tracking tool invocation frequencies and query row counts.
   - **DLP & Data Classification**: Deep regex scanning for PII (SSN, credit cards, emails, phone numbers) and API credentials.
   - **MCP Tool Definition Drift**: SHA-256 fingerprinting of tool schemas prevents "MCP Rug Pull" parameter injection.
   - **Indirect Prompt Injection Quarantine**: Taints untrusted payloads from external files, support tickets, and web scraping.

3. **Multi-Factor Risk Decomposition**
   - In accordance with enterprise SIEM standards, every block decision provides granular, explainable factor attribution.
   - Example 94/100 risk score decomposition:
     - `+25` Intent Category Mismatch
     - `+20` Sensitive Customer Fields Requested
     - `+18` Bulk Volume Egress
     - `+20` External Transfer Destination
     - `+11` Statistical Baseline Deviation
     - **Total: 94 / 100 (CRITICAL RISK → BLOCK)**

4. **Forensic Incident Hub & AI Copilot**
   - Cryptographically linked timeline events showing pre-compromise vs post-compromise agent actions.
   - **AI Forensic Investigator**: Structured reasoning separating confirmed facts, working hypotheses, unknown variables, and immediate containment measures.
   - Exportable compliance reports in **Markdown** and **HTML** formats.

5. **Security Control Center (Next.js 15 / Tailwind / TypeScript)**
   - Dark SIEM aesthetic built for security teams.
   - Interactive **Red Team Attack Simulator** with 5 pre-configured adversarial scenarios.
   - Real-time audit log stream and session telemetry inspector.

---

## Directory Structure

```
Agents/
├── backend/
│   ├── ai/                # Structured AI Forensic Copilot (facts, hypotheses, containment)
│   ├── api/               # FastAPI application & endpoints
│   ├── core/              # Config & security thresholds
│   ├── detection/         # Intent, sequence, baseline, exfiltration, privilege, MCP detectors
│   ├── forensics/         # Incident timelines, case manager, HTML/Markdown report generators
│   ├── models/            # Pydantic schemas (AgentModel, InterceptResult, ForensicCase)
│   ├── policy/            # Declarative JSON policy engine & regression test suite
│   ├── security/          # DLP engine, permissions, authorization, risk scorer, interceptor
│   ├── storage/           # SQLAlchemy SQLite persistence layer
│   └── tests/             # Comprehensive Pytest test suite (11 unit tests)
├── cli/                   # Rich Terminal CLI (`sentinel_cli.py`)
├── demo/
│   ├── agents/            # SalesAgent implementation (normal & compromised workflows)
│   ├── attack_scenarios/  # 5 threat scenarios (exfiltration, injection, privilege, drift, volume)
│   └── datasets/          # Synthetic datasets (customers, sales, employees, transactions)
├── frontend/              # Next.js 15 App Router web application
│   ├── src/app/           # Dashboard, Simulator, Cases, Agents, Sessions, Policies, Tools
│   ├── src/components/    # Sidebar, Header, Badge, RiskMeter
│   └── src/lib/           # TypeScript API client
├── sdk/                   # Python SDK (`agentsentinel`)
├── scripts/               # Dataset generators and flow verification scripts
├── requirements.txt       # Backend dependencies
├── run_backend.bat        # Windows launch script for FastAPI
├── run_frontend.bat       # Windows launch script for Next.js
└── run_all.bat            # One-click launch script for both services
```

---

## Quickstart

### 1. Backend Setup (Python 3.10+)

```powershell
# From the project root
$env:PYTHONPATH="."

# Run test suite to verify all 11 security tests pass
python -m pytest backend/tests/test_sentinel_core.py -v

# Start the FastAPI gateway
python -m uvicorn backend.api.app:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at: `http://localhost:8000` (Swagger docs at `/docs`).

### 2. Frontend Console Setup (Node.js 18+)

```powershell
cd frontend
npm install
npm run dev
```

Frontend Security Console will be live at: `http://localhost:3000`.

### 3. One-Click Windows Launch

Simply double-click `run_all.bat` or run:
```powershell
.\run_all.bat
```

---

## CLI Usage

Agent Sentinel comes with a rich terminal CLI:

```powershell
$env:PYTHONPATH="."

# List registered agents
python cli/sentinel_cli.py agents

# Run the live Exfiltration attack simulation
python cli/sentinel_cli.py simulate --scenario scenario-exfiltration

# List forensic cases
python cli/sentinel_cli.py cases

# Run policy regression suite
python cli/sentinel_cli.py policies
```

---

## Python SDK Integration

To integrate Sentinel into any Python AI agent:

```python
from agentsentinel import Sentinel

# Initialize inline interceptor
sentinel = Sentinel(api_url="http://localhost:8000/api/v1")

# Protect any tool call inline
result = sentinel.evaluate_tool_call(
    agent_id="sales-agent",
    tool="upload_external",
    arguments={"url": "https://attacker-webhook.site", "data": "customer_export.csv"},
    original_task="Generate Q3 sales report",
    previous_actions=["search_sales", "database.query", "export_customer_data"]
)

if not result.execution_allowed:
    print(f"Action blocked! Risk score: {result.risk_score}")
    for reason in result.reasons:
        print(f" - {reason}")
else:
    # Safe to execute tool
    execute_tool(...)
```

Or using the Python decorator:

```python
@sentinel.intercept_tool(agent_id="support-agent")
def refund_payment(customer_id: str, amount: float):
    # This function is automatically blocked or paused for human approval if unsafe
    ...
```

---

## Attack Simulation Scenarios

Agent Sentinel includes 5 pre-configured red team scenarios in `demo/attack_scenarios/scenarios.py`:

| Scenario ID | Name | Attack Vector | Expected Decision |
|---|---|---|---|
| `scenario-exfiltration` | Multi-Step Data Exfiltration | Compounding chain: DB query → PII export → External webhook | **BLOCK (Risk: 94)** |
| `scenario-injection` | Indirect Prompt Injection | SQL injection payload embedded inside customer support ticket | **BLOCK (Risk: 100)** |
| `scenario-privilege` | Admin Privilege Leap | Analyst agent attempts raw SQL alteration of auth table | **BLOCK (Risk: 100)** |
| `scenario-mcp-drift` | MCP Definition Rug Pull | Dynamic parameter schema modification to inject shell command | **BLOCK (Risk: 90)** |
| `scenario-volume` | Denial of Wallet / Loop | Burst tool invocation exceeding session limits | **BLOCK (Risk: 85)** |

---

## Verification & Test Results

Run the full core engine test suite:
```powershell
python -m pytest backend/tests/test_sentinel_core.py -v
```

Output:
```
======================= 11 passed, 0 failed in 4.34s =======================
test_1_unauthorized_tool_blocked                       PASSED
test_2_sensitive_export_blocked                        PASSED
test_3_external_exfiltration_blocked_with_high_risk    PASSED
test_4_intent_alignment_mismatch_detection             PASSED
test_5_untrusted_data_prompt_injection_quarantine      PASSED
test_6_mcp_tool_definition_drift                       PASSED
test_7_behavioral_anomaly_detection                    PASSED
test_8_sequence_graph_analysis                         PASSED
test_9_policy_engine_suite                             PASSED
test_10_forensic_case_and_ai_investigator              PASSED
test_11_sdk_usage                                      PASSED
```

---

## License

Proprietary enterprise runtime security architecture designed for autonomous AI agents.
