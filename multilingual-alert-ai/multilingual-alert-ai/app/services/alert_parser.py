"""
Stage 2 - ALERT UNDERSTANDING
Stage 3 - ALERT STRUCTURING

Extract structured emergency fields (alert_type, severity, hazards, location,
recommended_action, numbers/units, ...) from free-text emergency alert
messages, and produce the language-independent StructuredAlert used by every
downstream stage.

This is implemented as a deterministic rule/keyword engine (regex + keyword
tables) rather than a generative model:
  - it is fully offline / no GPU or internet required (works in any
    hackathon environment)
  - it is auditable and 100% reproducible, which matters for an emergency
    system: we never want an LLM to "helpfully" invent or drop a fact
  - it is trivially extended by adding new keywords/patterns

It is intentionally modular (`extract_alert_fields`) so it can later be
replaced or augmented with an NLP/NER model without changing any other part
of the pipeline.
"""

from __future__ import annotations

import re
from typing import Dict, List, Optional

from app.schemas.alert_schema import StructuredAlert
from app.utils.text_utils import extract_numeric_tokens

# ---------------------------------------------------------------------
# Keyword tables
# ---------------------------------------------------------------------
ALERT_TYPE_KEYWORDS: Dict[str, List[str]] = {
    "Cyclone": ["cyclone", "hurricane", "typhoon"],
    "Flood": ["flood", "flash flood", "flooding", "inundation"],
    "Earthquake": ["earthquake", "seismic", "tremor"],
    "Tsunami": ["tsunami", "tidal wave"],
    "Heatwave": ["heatwave", "heat wave", "extreme heat"],
    "Wildfire": ["wildfire", "forest fire", "bushfire"],
    "Landslide": ["landslide", "mudslide", "mudflow"],
    "Storm": ["storm", "thunderstorm", "windstorm"],
    "Tornado": ["tornado", "twister"],
    "Drought": ["drought"],
    "Pandemic": ["pandemic", "outbreak", "epidemic"],
    "Chemical Hazard": ["chemical spill", "gas leak", "toxic release"],
    "Fire": ["fire outbreak", "building fire"],
}

SEVERITY_KEYWORDS: Dict[str, List[str]] = {
    "Critical": ["severe", "extreme", "critical", "catastrophic", "emergency", "life-threatening"],
    "High": ["high alert", "major", "serious", "significant", "warning"],
    "Moderate": ["moderate", "watch", "caution"],
    "Low": ["minor", "advisory", "low risk"],
}

HAZARD_PATTERNS = [
    (r"heavy rain(?:fall)?", "Heavy rainfall"),
    (r"(?:high\s+)?winds?[^.,;]*", None),  # captured verbatim below
    (r"storm surge", "Storm surge"),
    (r"flash flood(?:ing)?", "Flash flooding"),
    (r"landslide", "Landslide risk"),
    (r"high waves?", "High waves"),
    (r"lightning", "Lightning"),
    (r"power outages?", "Power outages"),
    (r"road closures?", "Road closures"),
]

ACTION_TRIGGER_PATTERN = re.compile(
    r"((?:residents?|people|public|citizens?)[^.]*?(?:should|must|are advised to|are urged to)[^.]*\.)",
    re.IGNORECASE,
)

LOCATION_PATTERN = re.compile(
    r"\b(?:for|in|near|across)\s+([A-Z][a-zA-Z\u0900-\u0DFF]+(?:\s+[A-Z][a-zA-Z\u0900-\u0DFF]+){0,2})"
)

AFFECTED_AREA_KEYWORDS = [
    "low-lying areas",
    "coastal areas",
    "coastal regions",
    "riverbanks",
    "hilly regions",
    "urban areas",
]


def _find_alert_type(text_lower: str) -> str:
    for canonical, kws in ALERT_TYPE_KEYWORDS.items():
        for kw in kws:
            if kw in text_lower:
                return canonical
    return "General Emergency"


def _find_severity(text_lower: str) -> str:
    for canonical, kws in SEVERITY_KEYWORDS.items():
        for kw in kws:
            if kw in text_lower:
                return canonical
    return "Unspecified"


def _find_hazards(text: str) -> List[str]:
    hazards: List[str] = []
    for pattern, label in HAZARD_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if label:
                if label not in hazards:
                    hazards.append(label)
            else:
                # "winds" pattern -> capture the exact clause verbatim so
                # numeric wind speed values are preserved untouched.
                snippet = match.group(0).strip().rstrip(",;")
                snippet = snippet[0].upper() + snippet[1:]
                if snippet not in hazards:
                    hazards.append(snippet)
    return hazards


def _find_recommended_action(text: str) -> Optional[str]:
    match = ACTION_TRIGGER_PATTERN.search(text)
    if match:
        return match.group(1).strip()
    # Fallback: look for imperative sentences containing "evacuate"/"avoid"/"seek shelter"
    for kw in ("evacuate", "avoid", "seek shelter", "stay indoors", "move to higher ground"):
        idx = text.lower().find(kw)
        if idx != -1:
            # take the sentence containing the keyword
            start = text.rfind(".", 0, idx) + 1
            end = text.find(".", idx)
            end = end + 1 if end != -1 else len(text)
            return text[start:end].strip()
    return None


def _find_location(text: str) -> Optional[str]:
    match = LOCATION_PATTERN.search(text)
    if match:
        return match.group(1).strip()
    return None


def _find_affected_area(text_lower: str) -> Optional[str]:
    for area in AFFECTED_AREA_KEYWORDS:
        if area in text_lower:
            return area.capitalize()
    return None


def extract_alert_fields(
    message: str,
    title: Optional[str] = None,
    alert_type_hint: Optional[str] = None,
    severity_hint: Optional[str] = None,
    location_hint: Optional[str] = None,
    recommended_action_hint: Optional[str] = None,
) -> Dict:
    """
    Stage 2 - ALERT UNDERSTANDING.

    Hints (alert_type_hint, severity_hint, ...) come from the API request
    when the caller (e.g. an official alert-issuing system) already knows
    these values with certainty. Hints always take precedence over inferred
    values - we never let inference override an authoritative, explicitly
    provided fact.
    """
    text_lower = message.lower()

    alert_type = alert_type_hint or _find_alert_type(text_lower)
    severity = severity_hint or _find_severity(text_lower)
    hazards = _find_hazards(message)
    recommended_action = recommended_action_hint or _find_recommended_action(message)
    location = location_hint or _find_location(message)
    affected_area = _find_affected_area(text_lower)
    numbers = extract_numeric_tokens(message)

    return {
        "alert_type": alert_type,
        "severity": severity,
        "title": title or (f"{severity} {alert_type} Warning".strip()),
        "location": location,
        "affected_area": affected_area,
        "hazards": hazards,
        "recommended_action": recommended_action,
        "numbers": numbers,
    }


def build_structured_alert(
    alert_id: str,
    message: str,
    source_language: str,
    title: Optional[str] = None,
    alert_type: Optional[str] = None,
    severity: Optional[str] = None,
    location: Optional[str] = None,
    recommended_action: Optional[str] = None,
    source: Optional[str] = None,
    event_time: Optional[str] = None,
    expiry_time: Optional[str] = None,
) -> StructuredAlert:
    """Stage 3 - build the language-independent StructuredAlert."""
    fields = extract_alert_fields(
        message=message,
        title=title,
        alert_type_hint=alert_type,
        severity_hint=severity,
        location_hint=location,
        recommended_action_hint=recommended_action,
    )

    return StructuredAlert(
        alert_id=alert_id,
        alert_type=fields["alert_type"],
        severity=fields["severity"],
        title=fields["title"],
        message=message,
        location=fields["location"],
        affected_area=fields["affected_area"],
        event_time=event_time,
        expiry_time=expiry_time,
        hazards=fields["hazards"],
        recommended_action=fields["recommended_action"] or "Follow local authority guidance",
        source=source,
        source_language=source_language,
        numbers=fields["numbers"],
    )
