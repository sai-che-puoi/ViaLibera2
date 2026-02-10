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
def pair_fun(couples, np, singles, time_area_slots, area_slots):
    import collections
    g_users = {f"s{i}": user for i, user in enumerate(singles)}
    g_couples = {f"c{i}": couple for i, couple in enumerate(couples)}
    g_slots = np.arange(len(time_area_slots))

    # Create the Area Map: area_name -> [list of slot indices]
    # We use the explicit string values to be safe
    area_map = collections.defaultdict(list)
    for idx, (t, area) in enumerate(time_area_slots):
        area_map[area].append(idx)

    # Preferenze (iscritto, slot_tempo_luogo) -> costo
    # Un costo minore è preferibile
    # Preferenze non inserite non sono considerate (impossibili)
    g_user_costs = { (k, s) : 10 for k, u in g_users.items() for s in u["time_area_slots"] }
    g_couple_costs = { (k, s) : 10 for k, c in g_couples.items() for s in c["time_area_slots"] }

    # 2. Setup Solver
    import pulp
    prob = pulp.LpProblem("Gestione_Iscritti_MIP", pulp.LpMinimize)

    # --- 2. Create Decision Variables ---
    x = pulp.LpVariable.dicts("single",
                              ((u, s) for u in g_users for s in g_slots),
                              cat='Binary')

    y = pulp.LpVariable.dicts("couple",
                              ((c, s) for c in g_couples for s in g_slots),
                              cat='Binary')

    ## CONSTRAINTS ##

    # Every Single assigned once
    for u in g_users:
        valid_slots = [s for s in g_slots if (u, s) in g_user_costs]
        prob += pulp.lpSum([x[u, s] for s in valid_slots]) == 1

    # Every Couple assigned once
    for c in g_couples:
        valid_slots = [s for s in g_slots if (c, s) in g_couple_costs]
        prob += pulp.lpSum([y[c, s] for s in valid_slots]) == 1


    # Objective Function Accumulator
    objective_terms = []


    # --- LOGIC A: AREA DISTRIBUTION (The Macro View) ---
    # Goal: Spread people evenly.
    # Strategy: Diminishing returns.
    # - Filling the first 2 spots in an area is High Priority (Reward -200)
    # - Filling spots 3-4 is Medium Priority (Reward -100)
    # - Filling spots 5+ is Bad (Cost +1000)

    # This forces the solver to fill ALL areas to 2 before it fills ANY area to 4.

    print(len(area_slots))
    area_tiers_def = [
        (2, -200),  # Tier 1: 0 -> 2 people
        (2, -100),  # Tier 1: 0 -> 2 people
        (300, 0),  # Tier 2: 2 -> 4 people
        # (20, 1000)  # Tier 3: 4+ people (Overflow penalty)
    ]

    for area in area_slots:
        s_indices = area_map[area]

        # Calculate total people in this area (sum of all time slots)
        people_in_area = (
            pulp.lpSum([x[u, s] for s in s_indices for u in g_users if (u, s) in g_user_costs]) +
            pulp.lpSum([2 * y[c, s] for s in s_indices for c in g_couples if (c, s) in g_couple_costs])
        )

        # Create "Bucket" variables for this area
        area_vars = []
        for idx, (cap, cost) in enumerate(area_tiers_def):
            # Integer variable for this bucket (e.g., how many people are in Tier 1?)
            av = pulp.LpVariable(f"area_{area}_tier_{idx}", 0, cap, cat='Integer')
            area_vars.append(av)
            objective_terms.append(av * cost)

        # Constraint: Area Buckets must sum to People in Area
        prob += people_in_area == pulp.lpSum(area_vars)

    # --- LOGIC B: SLOT CONFIGURATION (The Micro View) ---
    # Goal: Avoid odd numbers (1, 3). Prefer even numbers (2, 4).
    # Strategy: "Sawtooth" marginal costs.

    PENALTY_LONELY = 1000
    PENALTY_THIRD_WHEEL = 100

    # Tier structure for a single slot:
    # 1st person: Cost +5000
    # 2nd person: Cost -5000 (Net 0)
    # 3rd person: Cost +5000 (Net 5000)
    # 4th person: Cost -5000 (Net 0)

    slot_tier_defs = [
        (1, 10 + PENALTY_LONELY),
        (1, 10 - PENALTY_LONELY),
        # (1, 10),
        # (1, 20),
        (1, 10 + PENALTY_THIRD_WHEEL),
        (1, 10 - PENALTY_THIRD_WHEEL)
    ]

    for s in g_slots:
        # Calculate people in this specific slot
        people_in_slot = (
            pulp.lpSum([x[u, s] for u in g_users if (u, s) in g_user_costs]) +
            pulp.lpSum([2 * y[c, s] for c in g_couples if (c, s) in g_couple_costs])
        )

        # Create Bucket variables
        sv = []
        for idx, (cap, cost) in enumerate(slot_tier_defs):
            t_var = pulp.LpVariable(f"slot_{s}_tier_{idx}", cat='Binary')
            sv.append(t_var)
            objective_terms.append(t_var * cost)

        prob += people_in_slot == pulp.lpSum(sv)

        # STRICT Sequence Enforcement
        # Crucial because Tier 2 is cheaper than Tier 1.
        # Without this, solver would pick Tier 2 and skip Tier 1.
        for i in range(len(sv) - 1):
             prob += sv[i+1] <= sv[i]

    # Combine all costs
    pref_cost = (
        pulp.lpSum([x[u, s] * cost for (u, s), cost in g_user_costs.items()]) +
        pulp.lpSum([y[c, s] * cost for (c, s), cost in g_couple_costs.items()])
    )

    prob += pref_cost + pulp.lpSum(objective_terms)

    # ======================= SOLVE ======================
    #
    # IF SOLVER DOESN'T END INCREASE TOLERANCE!
    #
    print("Solving...")
    prob.solve(pulp.PULP_CBC_CMD(msg=True, timeLimit=60, gapRel=0.01))

    output = ()
    status = pulp.LpStatus[prob.status]
    if status != 'Optimal':
        print(f"Error: Solver finished with status '{status}'")
    else:
        print("Solver finished successfully (Optimal).")

        # --- 6. Build Output Maps ---
        slot_map = collections.defaultdict(list) # (time, area) -> [User Dicts]
        user_map = {}                              # UserID -> (time, area)
        couple_map = {}                            # UserID -> (time, area)

        for s in g_slots:
            current_slot_key = tuple(time_area_slots[s]) # (time, area) as tuple key

            # Singles
            for u in g_users:
                if (u, s) in g_user_costs and pulp.value(x[u, s]) == 1:
                    user_obj = g_users[u]
                    slot_map[current_slot_key].append([user_obj])
                    user_map[u] = current_slot_key

            # Couples
            for c in g_couples:
                if (c, s) in g_couple_costs and pulp.value(y[c, s]) == 1:
                    u1 = g_couples[c]["users"][0]
                    u2 = g_couples[c]["users"][1]

                    slot_map[current_slot_key].append([u1, u2])
                    couple_map[c] = current_slot_key

        output = (slot_map, user_map, couple_map)

    return (output,)


@app.cell
def _(output):
    import json
    print(f"export const interviewers = {json.dumps(output)}")
    return


if __name__ == "__main__":
    app.run()
