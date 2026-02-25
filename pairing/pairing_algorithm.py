import collections
import numpy as np
import pulp

def pair(couples, singles, area_slots, time_area_slots, time_limit = 60, eps_gap = 0.01):
    print(
        f"\n== Pair ==\n"
        f"\n"
        f"- Num couples:     {len(couples)}\n"
        f"- Num singles:     {len(singles)}\n"
        f"- Num areas:       {len(area_slots)}\n"
        f"- Num total slots: {len(time_area_slots)}\n"
    )
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
        (1, 10 - PENALTY_THIRD_WHEEL),
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
    prob.solve(pulp.PULP_CBC_CMD(msg=True, timeLimit=time_limit, gapRel=eps_gap))

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
    return output
