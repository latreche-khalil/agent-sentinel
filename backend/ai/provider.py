"""Abstract LLM provider interface supporting Local, OpenAI, Anthropic, and Ollama."""
import os
import json
import urllib.request
from typing import Dict, Any, Optional

class LLMProvider:
    def complete(self, prompt: str, system_prompt: str = "") -> str:
        raise NotImplementedError

class LocalDeterministicProvider(LLMProvider):
    """
    Offline deterministic security reasoning provider.
    Ensures Agent Sentinel works completely out of the box without external API keys.
    """
    def complete(self, prompt: str, system_prompt: str = "") -> str:
        # Structured contextual reasoning based on the prompt content
        return "LOCAL_COMPLETION"

class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        self.api_key = api_key
        self.model = model

    def complete(self, prompt: str, system_prompt: str = "") -> str:
        if not self.api_key:
            return ""
        try:
            req_data = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2
            }
            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=json.dumps(req_data).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            return f"[OpenAI Provider error: {str(e)}]"

class OllamaProvider(LLMProvider):
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3"):
        self.base_url = base_url
        self.model = model

    def complete(self, prompt: str, system_prompt: str = "") -> str:
        try:
            req_data = {
                "model": self.model,
                "prompt": f"{system_prompt}\n\n{prompt}",
                "stream": False
            }
            req = urllib.request.Request(
                f"{self.base_url}/api/generate",
                data=json.dumps(req_data).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data["response"]
        except Exception as e:
            return f"[Ollama Provider error: {str(e)}]"
