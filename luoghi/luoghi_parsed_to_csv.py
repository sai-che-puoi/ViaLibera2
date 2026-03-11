import json

JSON_PATH = "luoghi_parsed_redacted.json"
CSV_PATH = "luoghi_parsed_redacted.csv"
encoding = "latin-1"


def load_json():
    with open(JSON_PATH, "r", encoding=encoding) as f:
        return json.load(f)
    
def convert_to_csv(data, csv_path):
    """
    Given a json object, convert it to csv format and save it to a file.
    """
    keys = data[0].keys()
    with open(csv_path, "w", encoding=encoding) as f:
        f.write("\t".join(keys) + "\n")
        for item in data:
            values = [str(item[key]) for key in keys]
            f.write("\t".join(values) + "\n")

if __name__ == "__main__":
    data = load_json()
    convert_to_csv(data, CSV_PATH)