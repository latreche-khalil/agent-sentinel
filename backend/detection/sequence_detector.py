"""Tool Sequence Analysis Engine using transition graphs and NetworkX."""
from typing import List, Dict, Any, Tuple, Set
import networkx as nx

# Normal baseline graph transitions for SalesAgent
NORMAL_TRANSITIONS = {
    ("search_sales", "aggregate_sales"): 0.95,
    ("aggregate_sales", "generate_report"): 0.90,
    ("search_sales", "generate_report"): 0.40,
    ("search_products", "search_sales"): 0.80
}

# Explicitly high-risk or prohibited transitions
DANGEROUS_TRANSITIONS = {
    ("search_sales", "database.query"): "Abnormal pivot from sales analytics to direct database querying.",
    ("database.query", "export_customer_data"): "Sensitive data extraction following unconstrained query.",
    ("export_customer_data", "upload_external"): "Potential exfiltration pipeline: Customer export piped directly to external transfer.",
    ("search_customer", "upload_external"): "Sensitive customer lookup piped directly to external transfer.",
    ("search_sales", "upload_external"): "Sales report dispatched to untrusted external destination.",
    ("read_file", "upload_external"): "Local file staging followed by external transmission."
}

class SequenceDetector:
    def __init__(self):
        self.graph = nx.DiGraph()
        # Populate normal transition edges
        for (src, dst), weight in NORMAL_TRANSITIONS.items():
            self.graph.add_edge(src, dst, weight=weight, risk="normal")

    def analyze_sequence(self, previous_tools: List[str], current_tool: str) -> Tuple[int, List[str], Dict[str, Any]]:
        """
        Analyze the tool transition sequence.
        Returns:
            risk_score (0-100)
            reasons (list of strings)
            graph_data (serializable nodes and edges for UI visualization)
        """
        reasons = []
        score = 0
        full_sequence = previous_tools + [current_tool]

        # 1. Immediate pairwise transition check
        if previous_tools:
            last_tool = previous_tools[-1]
            pair = (last_tool, current_tool)

            if pair in DANGEROUS_TRANSITIONS:
                score += 35
                reasons.append(f"Dangerous tool transition detected: {last_tool} → {current_tool}. {DANGEROUS_TRANSITIONS[pair]}")
            elif not self.graph.has_edge(last_tool, current_tool) and len(previous_tools) >= 2:
                # Sequence novelty penalty
                score += 15
                reasons.append(f"Unusual tool transition sequence: {last_tool} → {current_tool} differs from established baseline.")

        # 2. Cumulative multi-step pipeline detection (e.g. data access -> export -> external)
        seq_str = " -> ".join(full_sequence)
        if any(t in full_sequence for t in ["database.query", "export_customer_data", "search_customer"]) and "upload_external" in current_tool:
            score += 45
            reasons.append(f"High-confidence exfiltration chain pattern recognized across sequence: {seq_str}")

        # 3. Detect rapid loops / repetition
        if len(previous_tools) >= 3:
            recent_3 = previous_tools[-3:]
            if recent_3.count(current_tool) >= 2:
                score += 20
                reasons.append(f"Tool looping/repetition detected on '{current_tool}' ({recent_3.count(current_tool)+1} calls in recent window).")

        # Build graph serialization for frontend visualization
        nodes = []
        for idx, tool in enumerate(full_sequence):
            is_current = (idx == len(full_sequence) - 1)
            nodes.append({
                "id": f"{tool}_{idx}",
                "name": tool,
                "step": idx + 1,
                "is_current": is_current,
                "status": "blocked" if (is_current and score >= 40) else "warning" if (is_current and score > 20) else "normal"
            })

        edges = []
        for i in range(len(full_sequence) - 1):
            src_tool = full_sequence[i]
            dst_tool = full_sequence[i+1]
            pair = (src_tool, dst_tool)
            is_dangerous = pair in DANGEROUS_TRANSITIONS
            edges.append({
                "source": f"{src_tool}_{i}",
                "target": f"{dst_tool}_{i+1}",
                "label": f"{src_tool} → {dst_tool}",
                "is_dangerous": is_dangerous,
                "risk": "critical" if is_dangerous else "normal"
            })

        graph_data = {
            "nodes": nodes,
            "edges": edges,
            "full_sequence": full_sequence
        }

        score = min(score, 100)
        return score, reasons, graph_data
