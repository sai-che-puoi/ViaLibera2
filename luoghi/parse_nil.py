import json
import re
from pathlib import Path

from docx import Document
import csv

DOCX_PATH = Path("Luoghi_selezionati.docx")
OUTPUT_JSON_PATH = Path("luoghi_parsed.json")
CSV_OUTPUT_PATH = Path("luoghi_id_nil.csv")

HEADER_RE = re.compile(r"^\s*(\d{1,2})\.\s*(.+?)\s*$")

def extract_paragraph_entries(doc: Document):
    """
    Returns a list of entries:
      {
        "text": <visible paragraph text>,
        "hyperlinks": [list of URLs found in that paragraph]
      }
    """
    entries = []

    # The WordprocessingML namespace used for <w:hyperlink>
    W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    HYPERLINK_TAG = f"{{{W_NS}}}hyperlink"  # -> "{...}hyperlink"

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue

        hyperlinks = []

        # Inspect underlying XML element <w:p> (para._p)
        # and iterate over all <w:hyperlink> descendants
        for hlink in para._p.iter(HYPERLINK_TAG):
            r_id = hlink.get(
                "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
            )
            if r_id and r_id in doc.part.rels:
                url = doc.part.rels[r_id]._target
                hyperlinks.append(str(url))

        entries.append({"text": text, "hyperlinks": hyperlinks})

    return entries

def parse_entries(entries):
    results = []
    current = None
    state = None  # None, 'after_header', 'after_title1', 'after_text1', 'after_link1', 'after_title2', 'after_text2', 'after_link2'

    i = 0
    while i < len(entries):
        entry = entries[i]
        text = entry["text"]
        links = entry["hyperlinks"]

        # 1️⃣ Detect new NIL header: "02. Brera"
        header_match = HEADER_RE.match(text)
        if header_match:
            # flush previous object
            if current:
                results.append(current)

            id_str, nil_name = header_match.groups()
            current = {
                "id": int(id_str),
                "nil_name": nil_name,
                "title1": None,
                "text1": None,
                "link1": None,
                "title2": None,
                "text2": None,
                "link2": None,
            }
            state = "after_header"
            i += 1
            continue

        # If we haven't started an item yet, skip until we find the first header
        if not current:
            i += 1
            continue

        # 2️⃣ After header → Title1
        if state == "after_header":
            current["title1"] = text
            state = "after_title1"
            i += 1
            continue

        # 3️⃣ After Title1 → Text1
        if state == "after_title1":
            current["text1"] = text
            state = "after_text1"
            i += 1
            continue

        # 4️⃣ After Text1 → Link1 (use first hyperlink in the paragraph, if any)
        if state == "after_text1":
            if links:
                current["link1"] = links[0]
                state = "after_link1"
                i += 1
                continue
            else:
                # If there's no hyperlink here, it's probably noise; skip
                i += 1
                continue

        # 5️⃣ After Link1 → Title2
        if state == "after_link1":
            # Skip if this is another header (edge case)
            if HEADER_RE.match(text):
                # New NIL; restart loop without finishing second place
                # (flush current first)
                results.append(current)
                id_str, nil_name = HEADER_RE.match(text).groups()
                current = {
                    "id": int(id_str),
                    "nil_name": nil_name,
                    "title1": None,
                    "text1": None,
                    "link1": None,
                    "title2": None,
                    "text2": None,
                    "link2": None,
                }
                state = "after_header"
                i += 1
                continue

            current["title2"] = text
            state = "after_title2"
            i += 1
            continue

        # 6️⃣ After Title2 → Text2
        if state == "after_title2":
            current["text2"] = text
            state = "after_text2"
            i += 1
            continue

        # 7️⃣ After Text2 → Link2
        if state == "after_text2":
            if links:
                current["link2"] = links[0]
                state = "after_link2"
                i += 1
                continue
            else:
                i += 1
                continue

        # 8️⃣ After Link2 – anything else until next header is ignored
        if state == "after_link2":
            i += 1
            continue

        # Safety fallback
        i += 1

    if current:
        results.append(current)

    return results


def main():
    doc = Document(DOCX_PATH)

    # Step 1: extract paragraphs + hyperlinks
    entries = extract_paragraph_entries(doc)

    # Step 2: parse into structured items
    items = parse_entries(entries)

    # Optional: sort by id
    items.sort(key=lambda x: x["id"])

    # Save JSON
    with OUTPUT_JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    # Save CSV with just id and nil_name
    with CSV_OUTPUT_PATH.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "nil_name"])  # header
        for item in items:
            writer.writerow([item["id"], item["nil_name"]])

    # Print a quick preview
    print(json.dumps(items[:3], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()