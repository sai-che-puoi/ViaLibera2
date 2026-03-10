import json
from typing import List, Dict, Any

# ---------------------------------------------------------
# 1. Attitudes and mapping to slider question IDs
#    (q1..q7 exactly as in your JS config)
# ---------------------------------------------------------

ATTITUDES = {
    "VIVO_SENZA_AUTO": "Vivo anche senza auto",
    "GRETA": "Siamo con Greta!",
    "VERDE": "Più verde c'è meglio è",
    "PIAZZA": "La piazza è la mia casa",
    "FATEMI_DORMIRE": "Fatemi dormire",
    "STATUS_QUO": "Lascia stare, perchè cambiare?",
    "NON_VIVO_SENZA_AUTO": "Non posso vivere senza auto",
}

# Map attitude "keys" (like VIVO_SENZA_AUTO) to slider question IDs
ATTITUDE_TO_QID = {
    "VIVO_SENZA_AUTO": "q1",
    "NON_VIVO_SENZA_AUTO": "q2",
    "GRETA": "q3",
    "STATUS_QUO": "q4",
    "VERDE": "q5",
    "FATEMI_DORMIRE": "q6",
    "PIAZZA": "q7",
}

SLIDER_QIDS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"]

# ---------------------------------------------------------
# 2. Archetypes (label + base attitudes)
#    base entries correspond to ATTITUDE keys above
# ---------------------------------------------------------

ARCHETYPES = [
    {
        "label": "L'ecociclista",
        "base": ["VIVO_SENZA_AUTO", "GRETA"],
    },
    {
        "label": "Il pedone socievole",
        "base": ["VIVO_SENZA_AUTO", "PIAZZA"],
    },
    {
        "label": "Il visionario di quartiere",
        "base": ["VIVO_SENZA_AUTO", "VERDE"],
    },
    {
        "label": "L'automobilista illuminato",
        "base": ["NON_VIVO_SENZA_AUTO", "GRETA"],
    },
    {
        "label": "L'amante del verde quieto",
        "base": ["VERDE", "FATEMI_DORMIRE"],
    },
    {
        "label": "L'estroverso zen",
        "base": ["FATEMI_DORMIRE", "PIAZZA"],
    },
    {
        "label": "L'ambientalista selettivo",
        "base": ["GRETA", "FATEMI_DORMIRE"],
    },
    {
        "label": "Il coltivatore della socialità",
        "base": ["VERDE", "PIAZZA"],
    },
    {
        "label": "L'automobilista combattuto",
        "base": ["NON_VIVO_SENZA_AUTO", "VERDE"],
    },
    {
        "label": "L'estroverso combattuto",
        "base": ["FATEMI_DORMIRE", "PIAZZA"],
    },
    {
        "label": "Il tradizionalista silenzioso",
        "base": ["FATEMI_DORMIRE", "STATUS_QUO"],
    },
    {
        "label": "L'ecologista prudente",
        "base": ["VERDE", "STATUS_QUO"],
    },
    {
        "label": "L'automobilista di sobborgo",
        "base": ["NON_VIVO_SENZA_AUTO", "FATEMI_DORMIRE"],
    },
    {
        "label": "Il tradizionalista a quattro ruote",
        "base": ["NON_VIVO_SENZA_AUTO", "STATUS_QUO"],
    },
    {
        "label": "L'automobilista da bar",
        "base": ["NON_VIVO_SENZA_AUTO", "PIAZZA"],
    },
    {
        "label": 'Il socievole "zero sbatti"',
        "base": ["STATUS_QUO", "PIAZZA"],
    },
    {
        "label": "Il riformista cauto",
        "base": ["STATUS_QUO", "GRETA"],
    },
    {
        "label": "L'automobilista sincero",
        "base": ["NON_VIVO_SENZA_AUTO", "GRETA"],
    },
    {
        "label": "L'ecologista inaspettato",
        "base": ["VIVO_SENZA_AUTO", "STATUS_QUO"],
    },
    {
        "label": "Il minimalista urbano",
        "base": ["VIVO_SENZA_AUTO", "FATEMI_DORMIRE"],
    },
    {
        "label": "L’automobilista riflessivo",
        "base": ["VIVO_SENZA_AUTO", "NON_VIVO_SENZA_AUTO"],
    },
    {
        "label": "L'ecopioniere",
        "base": ["VERDE", "GRETA"],
    },
]


# ---------------------------------------------------------
# 3. Coordinate logic – ported from JS ResultCalculator
# ---------------------------------------------------------

def norm01(Q: float) -> float:
    """
    Equivalent of JS norm01: (Q - 1) / 9, mapping 1..10 -> 0..1
    """
    return (Q - 1.0) / 9.0


def clamp(v: float, lo: float, hi: float) -> float:
    """
    Clamp a value to [lo, hi]
    """
    if v < lo:
        return lo
    if v > hi:
        return hi
    return v


def calculate_coordinates(answers: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Port of JS calculateCoordinates:
    - answers: list of dicts with keys: id (e.g. 'q1'), type='slider', value (1..10)
    - returns: dict with x, y (SVG space: -100..100)
    """
    # Build Q1..Q7 from answers based on id
    Q = {}
    for ans in answers:
        if ans.get("type") == "slider" and "id" in ans:
            qid = ans["id"]
            # extract number from 'q1'..'q7'
            num_str = ''.join(ch for ch in qid if ch.isdigit())
            if num_str:
                key = f"Q{int(num_str)}"
                Q[key] = float(ans["value"])

    # Ensure all Q1..Q7 exist
    for i in range(1, 8):
        key = f"Q{i}"
        if key not in Q:
            raise ValueError(f"Missing value for {key}")

    # Normalize to [0,1]
    q1 = norm01(Q["Q1"])
    q2 = norm01(Q["Q2"])
    q3 = norm01(Q["Q3"])
    q4 = norm01(Q["Q4"])
    q5 = norm01(Q["Q5"])
    q6 = norm01(Q["Q6"])
    q7 = norm01(Q["Q7"])

    # Centered (neutral = 0.5)
    c1 = q1 - 0.5
    c2 = q2 - 0.5
    c3 = q3 - 0.5
    c4 = q4 - 0.5
    c5 = q5 - 0.5
    c6 = q6 - 0.5
    c7 = q7 - 0.5

    # Axis X: Quartiere vivace <-> Quartiere tranquillo e ordinato
    X_raw = 0.90 * (q7 - q6) + 0.10 * (c5)
    X = clamp(5.0 + 5.0 * X_raw, 0.0, 10.0)

    # Axis Y: Cambiamo lo spazio pubblico <-> Teniamolo così
    Y_core = 0.40 * c1 + 0.35 * (-c4) + 0.25 * c5
    Y_sup = 0.12 * c3 + 0.06 * c7 + 0.04 * c2 + 0.08 * (-c6)
    Y_raw = Y_core + Y_sup
    Y = clamp(5.0 + 5.0 * Y_raw, 0.0, 10.0)

    # Convert to SVG coordinates (-100 to 100)
    x = (X - 5.0) * 20.0
    y = (Y - 5.0) * 20.0

    # Round for readability
    return {
        "x": round(x, 2),
        "y": round(y, 2),
    }


# ---------------------------------------------------------
# 4. Synthetic answers generator for each archetype
# ---------------------------------------------------------

HIGH_VALUE = 10.0   # maximum agreement for base attitudes
NEUTRAL_VALUE = 1.0 # neutral / mid for other sliders


def synthetic_answers_for_archetype(archetype: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Build synthetic slider answers for a given archetype:
    - its two base attitudes -> HIGH_VALUE
    - all other sliders       -> NEUTRAL_VALUE
    Structure mimics your JS answer format: {id, type:'slider', value}
    """
    base_attitudes = set(archetype["base"])  # e.g. {"VIVO_SENZA_AUTO", "GRETA"}

    # Determine which question IDs are "high"
    high_qids = set()
    for att_key in base_attitudes:
        qid = ATTITUDE_TO_QID.get(att_key)
        if not qid:
            raise ValueError(f"Unknown attitude key in base: {att_key}")
        high_qids.add(qid)

    answers = []
    for qid in SLIDER_QIDS:
        value = HIGH_VALUE if qid in high_qids else NEUTRAL_VALUE
        answers.append({
            "id": qid,
            "type": "slider",
            "value": value,
        })

    return answers


# ---------------------------------------------------------
# 5. Main: compute positions for all archetypes and print JSON
# ---------------------------------------------------------

def main():
    result = []

    for archetype in ARCHETYPES:
        answers = synthetic_answers_for_archetype(archetype)
        coords = calculate_coordinates(answers)
        result.append({
            "label": archetype["label"],
            "position": [coords["x"], coords["y"]],
        })

    # Print JSON to stdout
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()