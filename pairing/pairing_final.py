import marimo

__generated_with = "0.18.0"
app = marimo.App(width="columns")


@app.cell
def _():
    import marimo as mo
    import pandas as pd
    import numpy as np
    import itertools
    import csv
    import io
    import nomi_gruppi
    return csv, itertools, mo, nomi_gruppi, np, pd


@app.cell
def _():
    url = "https://docs.google.com/spreadsheets/d/1B3h7TWd4T5mqpa6t3ii8exTpdk1gPBgRSSEQKVdnBvI/export?format=csv&gid=1028023449"
    phone_cols = [
        "Cellulare (senza il +39)",
        "Il suo cellulare (senza il +39)"
    ]
    return phone_cols, url


@app.cell
def _(pd, phone_cols, url):
    df = pd.read_csv(url, dtype={col: str for col in phone_cols}, keep_default_na=False)
    df
    return (df,)


@app.cell
def _(df):
    for v in df.columns.values:
        print(v)
    return


@app.cell
def _(np, phone_cols):
    # Column names to hardcode depending on the file to load
    col_user_name = "Nome"
    col_user_surname = "Cognome"
    col_user_email = "E-mail"
    col_user_phone = phone_cols[0]
    col_user_age = "Età"
    col_user_partner = "Hai già una coppia?\nLe interviste si faranno in coppia. Se hai già una persona con cui vuoi partecipare, diccelo! Se no, la formeremo noi e ti faremo sapere."
    user_partner_yes = "Si"

    col_time_slots = "In quale fascia preferisci partecipare? "
    time_slot_all = "Non ho preferenze, ditemi voi quando serve di più!"
    col_area_slots = "Facci sapere se sei disponibile a spostarti in diverse zone di Milano: ci aiuterà a intervistare persone in tutta la città, senza concentrarci solo su alcune aree. In alternativa, puoi selezionare l’area per te più comoda."
    area_slot_all = "Posso intervistare dove serve"

    municipi_cols = ["MUNICIPIO " + str(i) for i in np.arange(1, 10)]

    col_partner_name = "Il suo nome"
    col_partner_surname = "Il suo cognome"
    col_partner_email = "La sua e-mail"
    col_partner_phone = phone_cols[1]
    return (
        area_slot_all,
        col_area_slots,
        col_partner_email,
        col_partner_name,
        col_partner_phone,
        col_partner_surname,
        col_time_slots,
        col_user_age,
        col_user_email,
        col_user_name,
        col_user_phone,
        col_user_surname,
        municipi_cols,
        time_slot_all,
    )


@app.cell
def _(itertools):
    import area_gen
    area_slots, time_slots = area_gen.gen_slots()

    print(area_slots)
    print(time_slots)

    # All possible combinations of times and areas
    time_area_slots = list(itertools.product(time_slots, area_slots))
    return area_slots, time_area_slots, time_slots


@app.cell
def _(
    area_slot_all,
    area_slots,
    col_area_slots,
    col_partner_email,
    col_partner_name,
    col_partner_phone,
    col_partner_surname,
    col_time_slots,
    col_user_age,
    col_user_email,
    col_user_name,
    col_user_phone,
    col_user_surname,
    df,
    itertools,
    municipi_cols,
    np,
    time_area_slots,
    time_slot_all,
    time_slots,
):
    def parse_dataframe(df):
        singles = []
        couples = []

        for _, row in df.iterrows():
            user = {
                "name": row[col_user_name],
                "surname": row[col_user_surname],
                "email": row[col_user_email],
                "phone": row[col_user_phone],
                "age": row[col_user_age],
            }

            # We merge the slots afterwards so here we can still debug the output more easily
            orig_time_slots = row[col_time_slots]
            if not orig_time_slots or orig_time_slots == time_slot_all:
                user_time_slots = np.arange(len(time_slots))
            else:
                user_time_slots = [time_slots.index(t.strip()) for t in str(row[col_time_slots]).split(",")]

            orig_area_slots = row[col_area_slots]
            if not orig_area_slots or orig_area_slots == area_slot_all:
                user_area_slots = np.arange(len(area_slots))
            else:
                user_area_slots = []
                for m in municipi_cols:
                    user_area_slots.extend([area_slots.index(a.strip()) for a in str(row[m]).split(",") if a != ""])

            # Compute time area slot ids given original cartesian product.
            # We use ids here because later we need to build a graph and it's easier like that.
            user_time_area_slots = [t_i * len(area_slots) + a_i for t_i, a_i in itertools.product(user_time_slots, user_area_slots)]

            slots = {
                "time_slots": np.array(user_time_slots, dtype=int),
                "area_slots": np.array(user_area_slots, dtype=int),
                "time_area_slots": np.array(user_time_area_slots, dtype=int),
            }
            if len(slots["time_area_slots"]) == 0:
                print("INFEASIBLE!")
                print(user, slots)

            # partner_info = row[col_user_partner]
            # has_partner = isinstance(partner_info, str) and user_partner_yes in partner_info
            partner_name = row[col_partner_name]
            has_partner = isinstance(partner_name, str) and partner_name != ""

            if has_partner:
                partner = {
                    "name": row[col_partner_name],
                    "surname": row[col_partner_surname],
                    "email": row[col_partner_email],
                    "phone": row[col_partner_phone],
                }

                couple = {
                    "users": [user, partner],
                } | slots
                couples.append(couple)

            else:
                single = {
                    "user": user,
                } | slots
                singles.append(single)

        return singles, couples

    # Helper function to print time slots with their actual names instead of ids
    def resolve_slots(items):
        resolved = []
        for i in items:
            i2 = i.copy()
            i2["time_slots"] = [time_slots[t] for t in i2["time_slots"]]
            i2["area_slots"] = [area_slots[a] for a in i2["area_slots"]]
            i2["time_area_slots"] = [time_area_slots[ta] for ta in i2["time_area_slots"]]
            resolved.append(i2)
        return resolved

    singles, couples = parse_dataframe(df)
    return couples, singles


@app.cell
def _(singles):
    # singles
    sorted(singles, key=lambda u: len(u['user']['name']))
    return


@app.cell
def _(mo):
    time_limit = mo.ui.slider(30, 180, value=60, show_value=True, label="Tempo limite massimo algoritmo in secondi")
    time_limit
    return (time_limit,)


@app.cell
def _(mo):
    epsilon = mo.ui.slider(0.001, 0.5, value=0.01, step=0.01, show_value=True, label="Differenza accettabile da soluzione teorical ottimale")
    epsilon
    return (epsilon,)


@app.cell
def _(area_slots, couples, epsilon, singles, time_area_slots, time_limit):
    import pairing_algorithm
    output = pairing_algorithm.pair(couples, singles, area_slots, time_area_slots, time_limit.value, epsilon.value)
    return (output,)


@app.cell
def _(area_slots, couples, output, singles, time_area_slots):
    import pretty_print_output
    import importlib
    importlib.reload(pretty_print_output)

    pretty_print_output.prettify(couples, singles, area_slots, time_area_slots, output)
    return


@app.cell
def _(area_slots, mo):
    area_dropdown = mo.ui.dropdown(options=sorted(area_slots), label="Select Area")
    area_dropdown
    return (area_dropdown,)


@app.cell
def _(area_dropdown, mo, output):
    selected_area = area_dropdown.value
    slot_map = output[0]

    rows = []
    if selected_area:
        for (time, area), entries in sorted(slot_map.items()):
            if area != selected_area:
                continue
            user_names = []
            for entry in entries:
                entry_append = []
                for user in entry:
                    if 'user' in user:
                        u = user['user']
                        entry_append.append(f"{u.get('name', '')} {u.get('surname', '')}".strip())
                    else:
                        name = f"{user.get('name', '')} {user.get('surname', '')}".strip()
                        entry_append.append(name)
                user_names.append("[" + ", ".join(entry_append) + "]")
            rows.append({"Time Slot": time, "Users": ", ".join(user_names) if user_names else "(empty)"})

    mo.ui.table(rows)
    return (slot_map,)


@app.cell
def _(nomi_gruppi):
    group_names = nomi_gruppi.genera_nomi()
    return (group_names,)


@app.cell
def _(csv, group_names, warnings):
    def export_slot_map_to_csv(slot_map, filepath="output.csv"):
        MAX_USERS = 3

        fieldnames = ["NomeGruppo", "NIL", "Data"]
        for i in range(1, MAX_USERS + 1):
            fieldnames += [f"Nome{i}", f"Cognome{i}", f"Telefono{i}"]

        group_counter = 0
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()

            for (time, area), entries in sorted(slot_map.items()):
                # Flatten all users (deconstruct couples)
                all_users = []
                for entry in entries:
                    for user in entry:
                        if 'user' in user:
                            all_users.append(user['user'])
                        else:
                            all_users.append(user)
                if area == "Affori":
                    print("LOL")
                    print(all_users)

                if not all_users:
                    continue

                if len(all_users) > MAX_USERS:
                    warnings.warn(
                        f"Slot ({time}, {area}) has {len(all_users)} users — only first {MAX_USERS} will be written."
                    )

                row = {"NomeGruppo": group_names[group_counter], "NIL": area, "Data": time}
                for i, user in enumerate(all_users[:MAX_USERS], start=1):
                    row[f"Nome{i}"] = user.get("name", "")
                    row[f"Cognome{i}"] = user.get("surname", "")
                    row[f"Telefono{i}"] = user.get("phone", "")

                writer.writerow(row)
                group_counter += 1

        print(f"CSV written to {filepath}")
    return (export_slot_map_to_csv,)


@app.cell
def _(mo):
    save_button = mo.ui.run_button(label="💾 Save CSV")
    save_button
    return (save_button,)


@app.cell
def _(export_slot_map_to_csv, mo, save_button, slot_map):
    mo.stop(not save_button.value)  # blocks execution unless button was just clicked

    export_slot_map_to_csv(slot_map, "slots_output.csv")
    mo.callout(mo.md("✅ **CSV saved** to `slots_output.csv`"), kind="success")
    return


if __name__ == "__main__":
    app.run()
