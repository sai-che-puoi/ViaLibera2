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
def _(couples, np, singles, time_area_slots):
    import networkx as nx

    g_users = {f"s{i}": user for i, user in enumerate(singles)}
    g_couples = {f"c{i}": couple for i, couple in enumerate(couples)}
    g_slots = np.arange(len(time_area_slots))

    # Preferenze (iscritto, slot_tempo_luogo) -> costo
    # Un costo minore è preferibile
    # Preferenze non inserite non sono considerate (impossibili)
    g_user_costs = { (k, s) : 10 for k, u in g_users.items() for s in u["time_area_slots"] }
    g_couple_costs = { (k, s) : 10 for k, c in g_couples.items() for s in c["time_area_slots"] }

    G = nx.MultiDiGraph()

    # Setup del problema come flow graph
    # source -> iscritti -> slot_tempo_luogo -> destination

    # Inserimento nodi
    demand = len(g_users) + len(g_couples) * 2
    G.add_node('source', demand=-demand) 
    G.add_node('destination', demand=demand) 

    for u in g_users.keys():
        G.add_node(u, demand=0)
    for c in g_couples.keys():
        G.add_node(c, demand=0)
    for s in g_slots:
        G.add_node(s, demand=0)

    # Inserimento edge

    # sorgente -> iscritti
    # Ogni iscritto vale come una persona (capacity=1)
    # Ogni coppia vale due (capacity=2)
    for u in g_users.keys():
        G.add_edge('source', u, capacity=1, weight=0)
    for c in g_couples.keys():
        G.add_edge('source', c, capacity=2, weight=0)

    # iscritti -> slot_tempo_luogo
    # Qui usiamo i punteggi di preferenza come 'costo' (weight)
    # Un iscritto può riempire uno slot_tempo_luogo solo una volta (capacity=1)
    # Una coppia può riempire uno slot_tempo_luogo solo una volta (capacity=2)
    # - Peso di coppia è dimezzato perchè viene moltiplicato da capacity
    for (u, s), cost in g_user_costs.items():
        G.add_edge(u, s, capacity=1, weight=cost)
    for (c, s), cost in g_couple_costs.items():
        G.add_edge(c, s, capacity=2, weight=cost / 2)

    # slot_tempo_luogo -> destinazione
    # Ogni slot_tempo_luogo *deve* ricevere almeno 2 iscritti (capacity=2).
    # Più gruppi sono in uno slot, più costa (è meglio riempire altri slot)
    # Numero righe qui è il massimo numero di gruppi per slot
    for s in g_slots:
        G.add_edge(s, 'destination', capacity=2, weight=10)
        G.add_edge(s, 'destination', capacity=1, weight=12)
        G.add_edge(s, 'destination', capacity=1, weight=14)
        G.add_edge(s, 'destination', capacity=1, weight=16)
        G.add_edge(s, 'destination', capacity=1, weight=18)
        G.add_edge(s, 'destination', capacity=1, weight=20)
        G.add_edge(s, 'destination', capacity=1, weight=22)
        G.add_edge(s, 'destination', capacity=1, weight=24)
        G.add_edge(s, 'destination', capacity=1, weight=26)

    # Opzionale: stampa del grafo in json
    # import json
    # G_int = nx.relabel_nodes(G, lambda x: str(x))
    # print(json.dumps(nx.to_dict_of_dicts(G_int), sort_keys=True, indent=4))

    print("Esecuzione del solver...")
    # Calcola il modo più economico per soddisfare tutta la 'domanda'
    # rispettando le capacità e minimizzando i costi (weight)
    try:
        flow_dict = nx.min_cost_flow(G)
        print("Solver terminato.")

        # Calcolo manuale del costo per MultiDiGraph
        total_cost = 0
        for u, v, key, data in G.edges(data=True, keys=True):
            flow_on_edge = flow_dict.get(u, {}).get(v, {}).get(key, 0)

            if flow_on_edge > 0:
                edge_cost = data.get('weight', 0)
                total_cost += flow_on_edge * edge_cost

        print(f"\nAccoppiamenti ottimali (Costo totale: {total_cost}):")
        for s in g_slots:
            print(f"  slot_tempo_luogo '{time_area_slots[s]}':")
            flow_in_slot = 0

            for u in g_users:
                if u in flow_dict and s in flow_dict[u] and sum(flow_dict[u][s].values()) == 1:
                    print(f"    - {g_users[u]["user"]["name"]} (costo: {g_user_costs[(u,s)]})")
                    flow_in_slot += 1

            for c in g_couples:
                if c in flow_dict and s in flow_dict[c] and sum(flow_dict[c][s].values()) == 2:
                    print(f"    - {g_couples[c]["users"][0]["name"]} & {g_couples[c]["users"][1]["name"]} (costo: {g_couple_costs[(c,s)]})")
                    flow_in_slot += 2

            if flow_in_slot == 0:
                print("    - (vuoto)")
            elif flow_in_slot % 2 != 0:
                 print(f"    -> (ATTENZIONE: slot con {flow_in_slot} persone)")

    except nx.NetworkXUnfeasible:
        print("Errore: Il problema non ha una soluzione fattibile.")
    except nx.NetworkXError:
        print("Errore: Problema con il grafo (es. domanda non bilanciata).")
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
