"""Lightweight log/IOC parsing helpers."""
from __future__ import annotations

import re
from collections import Counter

IPV4_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
DOMAIN_RE = re.compile(r"\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b", re.IGNORECASE)
SHA256_RE = re.compile(r"\b[a-f0-9]{64}\b", re.IGNORECASE)
URL_RE = re.compile(r"https?://[^\s<>\"']+", re.IGNORECASE)
CVE_RE = re.compile(r"CVE-\d{4}-\d{4,7}", re.IGNORECASE)


def extract_iocs(text: str) -> dict[str, list[str]]:
    return {
        "ips": list(dict.fromkeys(IPV4_RE.findall(text))),
        "urls": list(dict.fromkeys(URL_RE.findall(text))),
        "hashes": list(dict.fromkeys(SHA256_RE.findall(text))),
        "cves": list(dict.fromkeys(c.upper() for c in CVE_RE.findall(text))),
    }


def top_ips(text: str, limit: int = 10) -> list[tuple[str, int]]:
    return Counter(IPV4_RE.findall(text)).most_common(limit)
