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
def pair_fun(couples, np, singles, time_area_slots):
    g_users = {f"s{i}": user for i, user in enumerate(singles)}
    g_couples = {f"c{i}": couple for i, couple in enumerate(couples)}
    g_slots = np.arange(len(time_area_slots))

    # Preferenze (iscritto, slot_tempo_luogo) -> costo
    # Un costo minore è preferibile
    # Preferenze non inserite non sono considerate (impossibili)
    g_user_costs = { (k, s) : 10 for k, u in g_users.items() for s in u["time_area_slots"] }
    g_couple_costs = { (k, s) : 10 for k, c in g_couples.items() for s in c["time_area_slots"] }

    # Setup del problema come flow graph
    import pulp
    prob = pulp.LpProblem("Gestione_Iscritti_MIP", pulp.LpMinimize)

    # --- 2. Create Decision Variables ---
    x = pulp.LpVariable.dicts("single",
                              ((u, s) for u in g_users for s in g_slots),
                              cat='Binary')

    y = pulp.LpVariable.dicts("couple",
                              ((c, s) for c in g_couples for s in g_slots),
                              cat='Binary')

    # --- 3. Modeling the Slot Capacity & Penalty ---

    # We want:
    # 1 person  -> Cost: 10 + PENALTY
    # 2 people  -> Cost: 20 (10 + 10)
    # 3 people  -> Cost: 30 (10 + 10 + 10)
    # 4+ people -> Higher tiers (20 each, etc.)

    PENALTY_LONELY = 1000 # Cost added if only 1 person is in a slot

    slot_vars = {}
    for s in g_slots:
        # First two people
        slot_vars[s] = [
            (pulp.LpVariable(f"slot_{s}_p1", cat='Binary'), 10 + PENALTY_LONELY),
            (pulp.LpVariable(f"slot_{s}_p2", cat='Binary'), 10 - PENALTY_LONELY)
        ]

        rest_tier_defs = [
            (1, 10), # Important that this is 10 otherwise solver gets stuck?
            (1, 20),
            (1, 30),
            (1, 50),
            (1, 100),
            (1, 180),
            (1, 300),
            (1, 500),
            (1, 1000),
        ]

        for idx, (cap, cost) in enumerate(rest_tier_defs):
            t_var = pulp.LpVariable(f"slot_{s}_tier_{idx}", lowBound=0, upBound=cap, cat='Integer')
            slot_vars[s].append((t_var, cost))


    # --- 4. Constraints ---

    # A & B: Assignment constraints (same as before)
    for u in g_users:
        valid_slots = [s for s in g_slots if (u, s) in g_user_costs]
        prob += pulp.lpSum([x[u, s] for s in valid_slots]) == 1

    for c in g_couples:
        valid_slots = [s for s in g_slots if (c, s) in g_couple_costs]
        prob += pulp.lpSum([y[c, s] for s in valid_slots]) == 1

    # C. Link People to the Sequential Buckets
    for s in g_slots:
        # 1. Calculate actual people assigned to this slot
        people_in_slot = (
            pulp.lpSum([x[u, s] for u in g_users if (u, s) in g_user_costs]) +
            pulp.lpSum([2 * y[c, s] for c in g_couples if (c, s) in g_couple_costs])
        )

        # 2. Sum of all buckets must equal people_in_slot
        sv = slot_vars[s]
        prob += people_in_slot == pulp.lpSum([t[0] for t in sv])

        # 3. Enforce Sequence (Cannot fill b2 unless b1 is full)
        # This prevents the solver from just picking the "Discounted" b2 and skipping the expensive b1.
        prob += sv[1][0] <= sv[0][0]
        prob += sv[2][0] <= sv[1][0]
        prob += sv[3][0] <= sv[2][0]
        prob += sv[4][0] <= sv[3][0]

    preference_cost = (
        pulp.lpSum([x[u, s] * cost for (u, s), cost in g_user_costs.items()]) +
        pulp.lpSum([y[c, s] * cost for (c, s), cost in g_couple_costs.items()])
    )

    # Sum up costs of b1, b2, b3 and the tiers
    filling_cost = 0
    for s in g_slots:
        for t_var, t_cost in slot_vars[s]:
            filling_cost += t_var * t_cost

    prob += preference_cost + filling_cost

    # --- 6. Solve ---
    print("Esecuzione del solver PuLP...")
    # msg=False hides the verbose solver logs
    prob.solve(pulp.PULP_CBC_CMD(msg=False))
    print("Solver terminato.")

    # --- 7. Output Formatting ---

    output = []
    min_flow = 10
    max_flow = 0
    empty_slots = 0
    if prob.status != pulp.LpStatusOptimal:
        print("Errore: Il problema non ha trovato una soluzione ottimale (Infeasible).")
    else:
        print(f"\nAccoppiamenti ottimali (Objective Value: {pulp.value(prob.objective)}):")

        total_people_assigned = 0

        for s in g_slots:
            print(f"  slot_tempo_luogo '{time_area_slots[s]}':")
            flow_in_slot = 0
            slot_surnames = []

            # Find Singles in this slot
            for u in g_users:
                if (u, s) in g_user_costs and pulp.value(x[u, s]) == 1:
                    uu = g_users[u]["user"]
                    print(f"    - {uu['name']} {uu['surname']} (costo: {g_user_costs[(u,s)]})")
                    slot_surnames.append(uu["surname"])
                    flow_in_slot += 1

            # Find Couples in this slot
            for c in g_couples:
                if (c, s) in g_couple_costs and pulp.value(y[c, s]) == 1:
                    u1 = g_couples[c]["users"][0]
                    u2 = g_couples[c]["users"][1]
                    print(f"    - {u1['name']} {u1['surname']} & {u2['name']} {u2['surname']} (costo: {g_couple_costs[(c,s)]})")
                    slot_surnames.append(u1["surname"])
                    slot_surnames.append(u2["surname"])
                    flow_in_slot += 2

            if flow_in_slot == 0:
                print("    (vuoto)")
                empty_slots += 1
            else:
                print(f"    -> Totale slot: {flow_in_slot}")
                output.append({
                    "time": time_area_slots[s][0],
                    "location": time_area_slots[s][1],
                    "couple": " - ".join(slot_surnames)
                })

                total_people_assigned += flow_in_slot
                min_flow = min(min_flow, flow_in_slot)
                max_flow = max(max_flow, flow_in_slot)

        expected_demand = len(g_users) + len(g_couples) * 2
        print(f"Total people: {total_people_assigned}, Expected: {expected_demand}")
        print(f"Min group size: {min_flow}, Max group size: {max_flow}")
        print(f"Empty slots: {empty_slots}")

        print("\n" + "="*40)
        print("      ISTOGRAMMA RIEMPIMENTO SLOT")
        print("="*40)

        import collections
        # 1. Calculate actual population for every slot
        slot_populations = []

        for s in g_slots:
            # Sum Singles (x variables)
            s_count = sum(pulp.value(x[u, s]) for u in g_users if (u, s) in g_user_costs)
            # Sum Couples (y variables * 2)
            c_count = sum(pulp.value(y[c, s]) * 2 for c in g_couples if (c, s) in g_couple_costs)

            total = int(s_count + c_count)
            slot_populations.append(total)

        # 2. Aggregates counts (How many slots have exactly N people?)
        hist_data = collections.Counter(slot_populations)
        limit = 11  # Your hard limit

        # 3. Print ASCII Histogram
        for n in range(limit + 1):
            count = hist_data.get(n, 0)

            # Visual bar (use '█' for a solid look, or '#' for standard ascii)
            bar = "█" * count

            # Only print rows that aren't empty, or print all to show gaps
            if count > 0 or n == 0:
                # Format: " 3 people: █████ (5)"
                print(f"{n:>2} persone: {bar:<20} ({count} slot)")
            else:
                # Optional: Print faint line for empty bins
                print(f"{n:>2} persone: -")

        print("="*40)
    return (output,)


@app.cell
def _(output):
    import json
    print(f"export const interviewers = {json.dumps(output)}")
    return


if __name__ == "__main__":
    app.run()
