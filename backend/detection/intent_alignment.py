"""Intent Alignment Engine: Validates proposed actions against declared user task intent."""
from typing import Dict, Any, Tuple, List, Set
import re

INTENT_CATEGORIES = {
    "analytics": ["analyze", "summary", "performance", "trend", "aggregate", "metrics", "kpi", "sales", "report"],
    "reporting": ["generate_report", "chart", "export_pdf", "dashboard", "visualize", "summary_report"],
    "retrieval": ["search", "query", "find", "get", "fetch", "list", "lookup"],
    "communication": ["email", "notify", "slack", "message", "send", "broadcast", "alert"],
    "modification": ["update", "insert", "delete", "write", "alter", "modify", "patch", "drop"],
    "export": ["export", "download", "dump", "backup", "exfiltrate", "transfer", "upload"],
    "financial": ["wire", "payment", "balance", "credit", "invoice", "refund", "charge", "transfer_funds"],
    "administrative": ["grant", "revoke", "admin", "create_user", "change_password", "permission", "sudo", "config"]
}

# Compatibility Matrix: Which action intents are naturally permitted for a given user task category
COMPATIBLE_INTENTS = {
    "analytics": {"analytics", "reporting", "retrieval"},
    "reporting": {"analytics", "reporting", "retrieval"},
    "retrieval": {"retrieval"},
    "communication": {"communication", "retrieval"},
    "modification": {"modification", "retrieval", "analytics"},
    "export": {"export", "retrieval", "reporting"},
    "financial": {"financial", "retrieval"},
    "administrative": {"administrative", "retrieval"}
}

class IntentAlignmentEngine:
    @staticmethod
    def infer_task_intent(task_text: str) -> Set[str]:
        """Infer the primary intent categories from declared user prompt."""
        text_lower = task_text.lower()
        detected = set()
        for category, keywords in INTENT_CATEGORIES.items():
            if any(re.search(rf"\b{kw}\b", text_lower) for kw in keywords):
                detected.add(category)
        if not detected:
            detected.add("retrieval")  # default safe fallback
        return detected

    @staticmethod
    def infer_action_intent(tool_name: str, arguments: Dict[str, Any], requested_classes: List[str]) -> Set[str]:
        """Infer the intent category of the proposed tool invocation."""
        name_lower = tool_name.lower()
        args_repr = str(arguments).lower()
        combined = f"{name_lower} {args_repr}"
        
        detected = set()
        
        if "export" in combined or "upload" in combined or "download" in combined or "dump" in combined:
            detected.add("export")
        if "query" in combined or "search" in combined or "fetch" in combined or "find" in combined:
            detected.add("retrieval")
        if "aggregate" in combined or "sales" in combined or "metrics" in combined:
            detected.add("analytics")
        if "report" in combined:
            detected.add("reporting")
        if "admin" in combined or "config" in combined or "sudo" in combined or "credential" in combined:
            detected.add("administrative")
        if "email" in combined or "slack" in combined or "webhook" in combined or "external" in combined:
            detected.add("communication")
        if "update" in combined or "delete" in combined or "drop" in combined or "insert" in combined:
            detected.add("modification")
        if "payment" in combined or "balance" in combined or "transaction" in combined:
            detected.add("financial")
            
        if "PII" in requested_classes or "SECRET" in requested_classes:
            if "export" in detected or "communication" in detected:
                detected.add("bulk_pii_export")

        if not detected:
            detected.add("retrieval")
        return detected

    @classmethod
    def evaluate_alignment(
        cls, 
        original_task: str, 
        tool_name: str, 
        arguments: Dict[str, Any], 
        requested_data_classes: List[str]
    ) -> Tuple[int, str, List[str]]:
        """
        Evaluate alignment between user task and proposed action.
        Returns:
            mismatch_score: 0 to 100 (0 = perfect alignment, 100 = severe divergence)
            mismatch_level: 'NONE', 'LOW', 'MEDIUM', 'HIGH'
            explanations: Human-auditable explanations
        """
        task_intents = cls.infer_task_intent(original_task)
        action_intents = cls.infer_action_intent(tool_name, arguments, requested_data_classes)
        
        explanations = []
        score = 0
        
        # Check if action intent matches compatible set
        allowed_intents = set()
        for ti in task_intents:
            allowed_intents.update(COMPATIBLE_INTENTS.get(ti, set()))

        incompatible_action_intents = action_intents - allowed_intents
        
        # Severe mismatch: Bulk PII or External transfer during analytics
        if "bulk_pii_export" in action_intents or ("export" in action_intents and "PII" in requested_data_classes):
            score += 45
            explanations.append(
                f"Customer PII export is outside the apparent scope of '{original_task}' (declared intent: {list(task_intents)})."
            )
            
        if "administrative" in action_intents and "administrative" not in task_intents:
            score += 40
            explanations.append(f"Administrative tool action requested during non-admin task '{original_task}'.")
            
        if "communication" in action_intents and "communication" not in task_intents:
            score += 30
            explanations.append(f"External communication action requested during internal analysis task.")

        if incompatible_action_intents and score == 0:
            score += 20
            explanations.append(
                f"Action intents {list(incompatible_action_intents)} diverge from user task intents {list(task_intents)}."
            )

        # Contextual check: Customer database query during Sales Analytics
        tool_lower = tool_name.lower()
        if "customer" in tool_lower and "sales" in original_task.lower() and "customer" not in original_task.lower():
            if "query" in tool_lower or "search" in tool_lower or "export" in tool_lower:
                score += 25
                explanations.append("Agent accessed customer records outside the declared task scope (sales analysis).")

        score = min(score, 100)
        level = "NONE" if score < 15 else "LOW" if score < 40 else "MEDIUM" if score < 70 else "HIGH"
        return score, level, explanations
