import marimo

__generated_with = "0.18.0"
app = marimo.App(width="columns")


@app.cell
def _():
    import marimo as mo
    import pandas as pd
    import numpy as np
    import itertools
    return itertools, np, pd


@app.cell
def _(pd):
    url = "https://docs.google.com/spreadsheets/d/1gHa5afpKbl2vlA9HwVY0Unbnrc5x32Bii8mBBlR5LMY/export?format=csv&gid=1277067403"
    # Phone columns must be kept as strings, otherwise they will be converted to numbers
    phone_cols = [
        "Numero di cellulare (senza il +39)",
        "Il suo numero di cellulare (senza il +39)"
    ]
    df = pd.read_csv(url, dtype={col: str for col in phone_cols}, keep_default_na=False)
    return (df,)


@app.cell
def _(df):
    df
    return


@app.cell
def _():
    # Column names to hardcode depending on the file to load
    col_user_name = "Nome"
    col_user_surname = "Cognome"
    col_user_email = "E-mail"
    col_user_phone = "Numero di cellulare (senza il +39)"
    col_user_age = "Quanti anni hai?"
    col_user_partner = "Hai già una coppia?\nLe interviste si faranno in coppia. Se hai già una persona con cui vuoi partecipare, diccelo! Se no, la formeremo noi e ti faremo sapere."
    user_partner_yes = "Si"

    col_time_slots = "Le interviste si faranno il 18-19 ottobre. Quando puoi partecipare? "
    time_slot_all = "Non ho preferenze, ditemi voi quando serve di più!"
    col_area_slots = "In quali aree della città preferisci fare le interviste? Indicane 2. Ti faremo poi sapere la località precisa dove dovrai andare."
    area_slot_all = ""

    col_partner_name = "Il suo nome"
    col_partner_surname = "Il suo cognome"
    col_partner_email = "La sua e-mail"
    col_partner_phone = "Il suo numero di cellulare (senza il +39)"
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
        col_user_partner,
        col_user_phone,
        col_user_surname,
        time_slot_all,
        user_partner_yes,
    )


@app.cell
def _(
    area_slot_all,
    col_area_slots,
    col_time_slots,
    df,
    itertools,
    time_slot_all,
):
    # All available time slots and area slots. Either hardcode or determine from read file.

    # Currently these are determined from the file. Should probably be hardcoded.
    time_slots = set(df[col_time_slots])
    time_slots.discard("")
    time_slots.discard(time_slot_all)
    time_slots = list(time_slots)
    print(time_slots)

    area_slots = {area.strip() for areas in df[col_area_slots] for area in areas.split(",")}
    area_slots.discard("")
    area_slots.discard(area_slot_all)
    area_slots = list(area_slots)
    print(area_slots)

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
    col_user_partner,
    col_user_phone,
    col_user_surname,
    df,
    itertools,
    np,
    time_area_slots,
    time_slot_all,
    time_slots,
    user_partner_yes,
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
                user_area_slots = [area_slots.index(a.strip()) for a in str(row[col_area_slots]).split(",")]

            # Compute time area slot ids given original cartesian product.
            # We use ids here because later we need to build a graph and it's easier like that.
            user_time_area_slots = [t_i * len(area_slots) + a_i for t_i, a_i in itertools.product(user_time_slots, user_area_slots)]

            slots = {
                "time_slots": np.array(user_time_slots, dtype=int),
                "area_slots": np.array(user_area_slots, dtype=int),
                "time_area_slots": np.array(user_time_area_slots, dtype=int),
            }

            partner_info = row[col_user_partner]
            has_partner = isinstance(partner_info, str) and user_partner_yes in partner_info

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
def _(output):
    import pairing_algorithm
    output = pairing_algorithm.pair(couples, singles, area_slots, time_area_slots)
    import json
    print(f"export const interviewers = {json.dumps(output)}")
    return


if __name__ == "__main__":
    app.run()
