"""Generate downloadable PDF incident reports."""
from __future__ import annotations

from io import BytesIO
from datetime import datetime
from typing import Any

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)


def _styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "title", parent=base["Title"], textColor=colors.HexColor("#06b6d4"), fontSize=22
        ),
        "h2": ParagraphStyle(
            "h2", parent=base["Heading2"], textColor=colors.HexColor("#a78bfa"), fontSize=14
        ),
        "body": ParagraphStyle("body", parent=base["BodyText"], fontSize=10, leading=14),
        "muted": ParagraphStyle(
            "muted", parent=base["BodyText"], textColor=colors.grey, fontSize=9
        ),
    }


def build_threat_report_pdf(*, user_name: str, analysis: dict[str, Any]) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm)
    s = _styles()
    story = []

    story.append(Paragraph("AI Cyber Threat Intelligence Report", s["title"]))
    story.append(Spacer(1, 4))
    story.append(
        Paragraph(
            f"Generated for <b>{user_name}</b> &nbsp;|&nbsp; "
            f"{datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
            s["muted"],
        )
    )
    story.append(Spacer(1, 14))

    story.append(Paragraph("Executive Summary", s["h2"]))
    story.append(Paragraph(analysis.get("summary", ""), s["body"]))
    story.append(Spacer(1, 10))

    table_data = [
        ["Severity", str(analysis.get("severity", "")).upper()],
        ["Risk Score", f"{analysis.get('score', 0):.0f} / 100"],
        ["Threats Detected", str(len(analysis.get("threats", [])))],
    ]
    t = Table(table_data, colWidths=[60 * mm, 100 * mm])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.white),
                ("BACKGROUND", (1, 0), (1, -1), colors.HexColor("#f1f5f9")),
                ("BOX", (0, 0), (-1, -1), 0.4, colors.grey),
                ("INNERGRID", (0, 0), (-1, -1), 0.2, colors.grey),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 14))

    story.append(Paragraph("Detected Threats", s["h2"]))
    threats = analysis.get("threats", [])
    if not threats:
        story.append(Paragraph("No threats detected.", s["body"]))
    for i, th in enumerate(threats, start=1):
        story.append(
            Paragraph(
                f"<b>{i}. {th.get('title', 'Threat')}</b> &nbsp;"
                f"<font color='#dc2626'>[{str(th.get('severity', '')).upper()}]</font>",
                s["body"],
            )
        )
        story.append(Paragraph(th.get("description", ""), s["body"]))
        story.append(
            Paragraph(
                f"Type: {th.get('type', '-')} &nbsp;|&nbsp; "
                f"Source IP: {th.get('source_ip') or '-'} &nbsp;|&nbsp; "
                f"Confidence: {th.get('confidence', '-')}%",
                s["muted"],
            )
        )
        if th.get("indicators"):
            story.append(
                Paragraph("Indicators: " + ", ".join(map(str, th["indicators"])), s["muted"])
            )
        story.append(Spacer(1, 8))

    story.append(Spacer(1, 6))
    story.append(Paragraph("Recommended Mitigations", s["h2"]))
    for r in analysis.get("recommendations", []):
        story.append(Paragraph(f"• {r}", s["body"]))

    if analysis.get("attack_chain"):
        story.append(Spacer(1, 12))
        story.append(Paragraph("Attack Chain", s["h2"]))
        story.append(Paragraph(" → ".join(analysis["attack_chain"]), s["body"]))

    if analysis.get("mitre_tactics"):
        story.append(Spacer(1, 6))
        story.append(Paragraph("MITRE ATT&CK Tactics", s["h2"]))
        story.append(Paragraph(", ".join(analysis["mitre_tactics"]), s["body"]))

    doc.build(story)
    return buf.getvalue()
