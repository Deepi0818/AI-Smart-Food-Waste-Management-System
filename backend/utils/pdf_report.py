"""
pdf_report.py
Generates a professional multi-page PDF impact report using ReportLab,
including a branded cover page, KPI summary, and an embedded matplotlib
chart, with page numbers and footer.
"""

import io
import os
from datetime import datetime, timezone
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak
)
from reportlab.lib.enums import TA_CENTER

EMERALD = colors.HexColor("#059669")
ROYAL_BLUE = colors.HexColor("#1d4ed8")
DARK = colors.HexColor("#111827")
GRAY = colors.HexColor("#6b7280")


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRAY)
    canvas.drawString(2 * cm, 1.2 * cm, "AI Smart Food Waste Analysis & Redistribution System")
    canvas.drawRightString(A4[0] - 2 * cm, 1.2 * cm, f"Page {doc.page}")
    canvas.restoreState()


def _make_trend_chart(waste_over_time):
    fig, ax = plt.subplots(figsize=(6, 3))
    if waste_over_time:
        dates = [d["date"] for d in waste_over_time]
        vals = [d["waste_kg"] for d in waste_over_time]
        ax.plot(dates, vals, color="#059669", linewidth=2, marker="o", markersize=3)
        ax.fill_between(dates, vals, color="#059669", alpha=0.15)
        ax.set_xticks(dates[::max(1, len(dates) // 6)])
        ax.tick_params(axis="x", rotation=45, labelsize=7)
    else:
        ax.text(0.5, 0.5, "No prediction data yet", ha="center", va="center")
        ax.set_xticks([])
    ax.set_ylabel("Waste (kg)", fontsize=8)
    ax.set_title("Predicted Waste Over Time", fontsize=10, fontweight="bold")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    fig.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=160)
    plt.close(fig)
    buf.seek(0)
    return buf


def generate_report(user_name, summary, trends, recent_predictions, save_path):
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("TitleBig", parent=styles["Title"], fontSize=28,
                                  textColor=EMERALD, alignment=TA_CENTER, spaceAfter=6)
    subtitle_style = ParagraphStyle("Sub", parent=styles["Normal"], fontSize=13,
                                     textColor=ROYAL_BLUE, alignment=TA_CENTER, spaceAfter=20)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], textColor=DARK, spaceBefore=14, spaceAfter=8)
    body = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, textColor=DARK, leading=14)

    doc = SimpleDocTemplate(save_path, pagesize=A4,
                             topMargin=2.5 * cm, bottomMargin=2 * cm,
                             leftMargin=2 * cm, rightMargin=2 * cm)
    elements = []

    # ---- Cover Page ----
    elements.append(Spacer(1, 4 * cm))
    elements.append(Paragraph("🌱", ParagraphStyle("Logo", alignment=TA_CENTER, fontSize=48)))
    elements.append(Paragraph("AI Smart Food Waste Analysis", title_style))
    elements.append(Paragraph("& Redistribution System — Impact Report", subtitle_style))
    elements.append(Spacer(1, 1 * cm))
    meta_table = Table([
        ["Prepared for:", user_name],
        ["Generated on:", datetime.now(timezone.utc).strftime("%d %B %Y, %H:%M UTC")],
        ["Report type:", "Environmental & Redistribution Impact Summary"],
    ], colWidths=[4 * cm, 8 * cm])
    meta_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), GRAY),
        ("TEXTCOLOR", (1, 0), (1, -1), DARK),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(meta_table)
    elements.append(PageBreak())

    # ---- KPI Summary ----
    elements.append(Paragraph("Executive Summary", h2))
    kpi_data = [
        ["Total Predictions", str(summary["total_predictions"])],
        ["Avg. Prediction Confidence", f"{summary['avg_prediction_confidence']}%"],
        ["Total Waste Estimated", f"{summary['total_waste_estimated_kg']} kg"],
        ["CO\u2082 Emissions Avoided", f"{summary['total_co2_saved_kg']} kg"],
        ["People Potentially Fed", str(summary["total_people_feedable"])],
        ["Total Donations Logged", str(summary["total_donations"])],
        ["Total Food Donated", f"{summary['total_food_donated_kg']} kg"],
        ["Donations Delivered", str(summary["donations_delivered"])],
    ]
    kpi_table = Table(kpi_data, colWidths=[9 * cm, 6 * cm])
    kpi_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f0fdf4")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1fae5")),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (1, 0), (1, -1), EMERALD),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    elements.append(kpi_table)

    # ---- Chart ----
    elements.append(Paragraph("Waste Prediction Trend", h2))
    chart_buf = _make_trend_chart(trends.get("waste_over_time", []))
    elements.append(RLImage(chart_buf, width=16 * cm, height=8 * cm))

    # ---- Recommendations ----
    elements.append(Paragraph("AI Recommendations", h2))
    rec_text = (
        "Based on observed prediction patterns, the system recommends prioritizing NGO donation "
        "channels for high-waste events (weddings, religious functions) where surplus volume "
        "consistently exceeds 25kg, and composting for smaller gatherings. Continued logging of "
        "outcomes will further improve model confidence over time."
    )
    elements.append(Paragraph(rec_text, body))

    # ---- Recent Predictions Table ----
    if recent_predictions:
        elements.append(Paragraph("Recent Prediction Log", h2))
        table_data = [["Date", "Event", "Guests", "Waste (kg)", "Confidence"]]
        for p in recent_predictions[:10]:
            table_data.append([
                p.get("created_at", "")[:10], p.get("event_type", ""), str(p.get("guests", "")),
                str(p.get("predicted_waste_kg", "")), f"{p.get('confidence', '')}%",
            ])
        log_table = Table(table_data, colWidths=[2.6 * cm, 4.2 * cm, 2.2 * cm, 3 * cm, 3 * cm])
        log_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), ROYAL_BLUE),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(log_table)

    doc.build(elements, onFirstPage=_footer, onLaterPages=_footer)
    return save_path
