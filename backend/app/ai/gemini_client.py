"""Gemini Flash REST client with retries, JSON-mode support, and graceful fallback."""
from __future__ import annotations

import asyncio
import json
import logging
import re
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


class GeminiError(Exception):
    pass


def _strip_code_fence(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        # remove first fence line
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text


def _extract_json(text: str) -> dict[str, Any]:
    text = _strip_code_fence(text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # last-resort extraction of outermost JSON object
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise


async def _call_gemini(
    contents: list[dict[str, Any]],
    *,
    system: str | None = None,
    json_mode: bool = False,
    max_retries: int = 2,
    timeout: float = 30.0,
) -> str:
    if not settings.GEMINI_API_KEY:
        raise GeminiError("GEMINI_API_KEY is not configured")

    url = f"{GEMINI_BASE}/{settings.GEMINI_MODEL}:generateContent"
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": settings.GEMINI_API_KEY,
    }
    body: dict[str, Any] = {"contents": contents}
    if system:
        body["systemInstruction"] = {"parts": [{"text": system}]}
    if json_mode:
        body["generationConfig"] = {
            "responseMimeType": "application/json",
            "temperature": 0.2,
        }
    else:
        body["generationConfig"] = {"temperature": 0.6}

    last_err: Exception | None = None
    delay = 0.7
    async with httpx.AsyncClient(timeout=timeout) as client:
        for attempt in range(max_retries + 1):
            try:
                r = await client.post(url, headers=headers, json=body)
                if r.status_code == 429 or r.status_code >= 500:
                    raise GeminiError(f"Gemini transient error {r.status_code}: {r.text[:300]}")
                r.raise_for_status()
                data = r.json()
                parts = (
                    data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])
                )
                text = "".join(p.get("text", "") for p in parts)
                if not text:
                    raise GeminiError("Empty Gemini response")
                return text
            except Exception as e:  # noqa: BLE001
                last_err = e
                logger.warning("Gemini call failed (attempt %d): %s", attempt + 1, e)
                if attempt < max_retries:
                    await asyncio.sleep(delay)
                    delay *= 2
    raise GeminiError(str(last_err) if last_err else "Unknown Gemini error")


async def generate_text(prompt: str, *, system: str | None = None) -> str:
    contents = [{"role": "user", "parts": [{"text": prompt}]}]
    return await _call_gemini(contents, system=system, json_mode=False)


async def generate_chat(
    history: list[dict[str, str]], *, system: str | None = None
) -> str:
    """history items: [{role: user|assistant, content: str}]"""
    contents = []
    for m in history:
        role = "user" if m["role"] == "user" else "model"
        contents.append({"role": role, "parts": [{"text": m["content"]}]})
    return await _call_gemini(contents, system=system, json_mode=False)


async def generate_json(prompt: str, *, system: str | None = None) -> dict[str, Any]:
    contents = [{"role": "user", "parts": [{"text": prompt}]}]
    text = await _call_gemini(contents, system=system, json_mode=True)
    return _extract_json(text)
