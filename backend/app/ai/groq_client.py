"""Groq AI client (OpenAI-compatible Chat Completions) with retries,
JSON-mode support, and graceful fallback."""
from __future__ import annotations

import asyncio
import json
import logging
import re
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# Groq exposes an OpenAI-compatible API.
GROQ_BASE = "https://api.groq.com/openai/v1"


class GroqError(Exception):
    pass


def _strip_code_fence(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text


def _extract_json(text: str) -> dict[str, Any]:
    text = _strip_code_fence(text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise


async def _call_groq(
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.2,
    max_tokens: int = 1200,
    json_mode: bool = False,
    max_retries: int = 2,
    timeout: float = 30.0,
) -> str:
    if not settings.GROQ_API_KEY:
        raise GroqError("GROQ_API_KEY is not configured")

    url = f"{GROQ_BASE}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
    }
    body: dict[str, Any] = {
        "model": settings.GROQ_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode:
        body["response_format"] = {"type": "json_object"}

    last_err: Exception | None = None
    delay = 0.7
    async with httpx.AsyncClient(timeout=timeout) as client:
        for attempt in range(max_retries + 1):
            try:
                r = await client.post(url, headers=headers, json=body)
                if r.status_code == 429 or r.status_code >= 500:
                    raise GroqError(f"Groq transient error {r.status_code}: {r.text[:300]}")
                r.raise_for_status()
                data = r.json()
                text = (
                    (data.get("choices") or [{}])[0]
                    .get("message", {})
                    .get("content", "")
                )
                if not text:
                    raise GroqError("Empty Groq response")
                return text
            except Exception as e:  # noqa: BLE001
                last_err = e
                logger.warning("Groq call failed (attempt %d): %s", attempt + 1, e)
                if attempt < max_retries:
                    await asyncio.sleep(delay)
                    delay *= 2
    raise GroqError(str(last_err) if last_err else "Unknown Groq error")


def _build_messages(prompt: str, system: str | None) -> list[dict[str, str]]:
    messages: list[dict[str, str]] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    return messages


async def generate_text(prompt: str, *, system: str | None = None) -> str:
    return await _call_groq(
        _build_messages(prompt, system), temperature=0.6, max_tokens=1000
    )


async def generate_chat(
    history: list[dict[str, str]], *, system: str | None = None
) -> str:
    messages: list[dict[str, str]] = []
    if system:
        messages.append({"role": "system", "content": system})
    for m in history:
        role = "user" if m["role"] == "user" else "assistant"
        messages.append({"role": role, "content": m["content"]})
    return await _call_groq(messages, temperature=0.4, max_tokens=900)


async def generate_json(prompt: str, *, system: str | None = None) -> dict[str, Any]:
    # Nudge the model toward valid JSON; response_format enforces it server-side.
    sys = (system + "\n\nRespond with a single valid JSON object only.") if system else (
        "Respond with a single valid JSON object only."
    )
    text = await _call_groq(
        _build_messages(prompt, sys),
        temperature=0.2,
        max_tokens=1200,
        json_mode=True,
    )
    return _extract_json(text)
