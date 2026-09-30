"""Data Loss Prevention (DLP) and Data Classification Engine."""
import re
from typing import Any, Dict, List, Set, Tuple
from backend.models.schemas import DataClassification

# Regular expression patterns for DLP scanning
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')
PHONE_REGEX = re.compile(r'\b(?:\+?1[-. ]?)?\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}\b')
CREDIT_CARD_REGEX = re.compile(r'\b(?:\d{4}[ -]?){3}\d{4}\b')
SSN_REGEX = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
API_KEY_REGEX = re.compile(r'\b(?:sk-[a-zA-Z0-9]{20,60}|ghp_[a-zA-Z0-9]{36}|AKIA[0-9A-Z]{16})\b')
JWT_REGEX = re.compile(r'\beyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\b')

# Sensitive field name patterns
PII_FIELD_PATTERNS = {"email", "phone", "address", "full_name", "ssn", "date_of_birth", "dob", "patient", "customer_name"}
FINANCIAL_FIELD_PATTERNS = {"credit_card", "account_balance", "salary", "routing_number", "card_last4", "bank_account"}
SECRET_FIELD_PATTERNS = {"password", "secret", "api_key", "token", "private_key", "auth_token", "credential"}

class DLPEngine:
    @staticmethod
    def classify_fields(fields: List[str]) -> Dict[str, Set[DataClassification]]:
        """Classify a list of field/column names into sensitivity categories."""
        classification_map: Dict[str, Set[DataClassification]] = {}
        for f in fields:
            lowered = f.lower().replace("-", "_").strip()
            cats: Set[DataClassification] = set()
            
            if any(p in lowered for p in SECRET_FIELD_PATTERNS):
                cats.add(DataClassification.SECRET)
                cats.add(DataClassification.CREDENTIAL)
            if any(p in lowered for p in FINANCIAL_FIELD_PATTERNS):
                cats.add(DataClassification.FINANCIAL)
                cats.add(DataClassification.SENSITIVE)
            if any(p in lowered for p in PII_FIELD_PATTERNS):
                cats.add(DataClassification.PII)
                cats.add(DataClassification.CONFIDENTIAL)
                
            if not cats:
                cats.add(DataClassification.INTERNAL)
            classification_map[f] = cats
        return classification_map

    @staticmethod
    def inspect_text_or_arguments(data: Any) -> Tuple[Set[DataClassification], List[str]]:
        """Scan any arbitrary dictionary, list, or string for sensitive patterns."""
        detected_classes: Set[DataClassification] = set()
        matched_indicators: List[str] = []
        
        text_repr = str(data)
        
        # Secrets
        if API_KEY_REGEX.search(text_repr):
            detected_classes.add(DataClassification.SECRET)
            detected_classes.add(DataClassification.CREDENTIAL)
            matched_indicators.append("API key pattern detected in parameters")
        if JWT_REGEX.search(text_repr):
            detected_classes.add(DataClassification.CREDENTIAL)
            matched_indicators.append("JWT bearer token detected")
        if any(term in text_repr.lower() for term in ["bearer ", "secret_key", "password="]):
            detected_classes.add(DataClassification.SECRET)
            matched_indicators.append("Plaintext credential key/value pattern detected")
            
        # PII
        if EMAIL_REGEX.search(text_repr):
            detected_classes.add(DataClassification.PII)
            matched_indicators.append("Customer email address pattern detected")
        if PHONE_REGEX.search(text_repr):
            detected_classes.add(DataClassification.PII)
            matched_indicators.append("Phone number pattern detected")
        if SSN_REGEX.search(text_repr):
            detected_classes.add(DataClassification.PII)
            detected_classes.add(DataClassification.SENSITIVE)
            matched_indicators.append("SSN pattern detected")
            
        # Financial
        if CREDIT_CARD_REGEX.search(text_repr):
            detected_classes.add(DataClassification.FINANCIAL)
            detected_classes.add(DataClassification.SENSITIVE)
            matched_indicators.append("Credit card number sequence detected")
            
        # Inspect dictionary keys if applicable
        if isinstance(data, dict):
            for k, v in data.items():
                k_lower = str(k).lower()
                if any(p in k_lower for p in PII_FIELD_PATTERNS):
                    detected_classes.add(DataClassification.PII)
                    matched_indicators.append(f"PII argument key '{k}' detected")
                if any(p in k_lower for p in SECRET_FIELD_PATTERNS):
                    detected_classes.add(DataClassification.SECRET)
                    matched_indicators.append(f"Secret argument key '{k}' detected")
                if any(p in k_lower for p in FINANCIAL_FIELD_PATTERNS):
                    detected_classes.add(DataClassification.FINANCIAL)
                    matched_indicators.append(f"Financial argument key '{k}' detected")
                    
        return detected_classes, matched_indicators

    @staticmethod
    def redact_sensitive_text(text: str) -> str:
        """Redact sensitive PII and secrets for forensic display."""
        if not text:
            return ""
        redacted = EMAIL_REGEX.sub(r"[REDACTED_EMAIL]", text)
        redacted = PHONE_REGEX.sub(r"[REDACTED_PHONE]", redacted)
        redacted = CREDIT_CARD_REGEX.sub(r"[REDACTED_CARD]", redacted)
        redacted = SSN_REGEX.sub(r"[REDACTED_SSN]", redacted)
        redacted = API_KEY_REGEX.sub(r"[REDACTED_API_KEY]", redacted)
        redacted = JWT_REGEX.sub(r"[REDACTED_JWT]", redacted)
        return redacted

    @staticmethod
    def estimate_row_count(tool_name: str, arguments: Dict[str, Any]) -> int:
        """Extract or estimate expected row count requested by an action."""
        if "limit" in arguments:
            try:
                return int(arguments["limit"])
            except (ValueError, TypeError):
                pass
        if "row_count" in arguments:
            try:
                return int(arguments["row_count"])
            except (ValueError, TypeError):
                pass
        if "rows" in arguments:
            try:
                return int(arguments["rows"])
            except (ValueError, TypeError):
                pass
        if "query" in arguments:
            query_str = str(arguments["query"]).lower()
            if "limit " in query_str:
                match = re.search(r'limit\s+(\d+)', query_str)
                if match:
                    return int(match.group(1))
            if "select * from customers" in query_str or "export" in tool_name.lower():
                # Bulk unrestricted scan
                return 42812
        if "export" in tool_name.lower() or "bulk" in tool_name.lower():
            return 10000
        return 50  # standard single retrieval
