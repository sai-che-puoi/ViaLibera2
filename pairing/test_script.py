import random
import json
import numpy as np
import itertools
from faker import Faker

random.seed(1)

# Initialize Faker for Italian names
fake = Faker('it_IT')
fake.seed_instance(1)

# --- CONFIGURATION ---
TOTAL_USERS = 299
PAIR_CHANCE = 0.20  # 50% chance a user is part of a pair
AREA_AVAILABLE_CHANCE = 0.50
TIME_AVAILABLE_CHANCE = 0.50
MIN_LOCATIONS = 1
MAX_LOCATIONS = 3
MIN_TIME_SLOTS = 1
MAX_TIME_SLOTS = 2

# --- DATA: THE 88 DISTRICTS (NIL) CLUSTERED BY MACRO-ZONE (MUNICIPI) ---
# This grouping ensures "Adjacency". If we pick from a cluster,
# the districts are guaranteed to be neighbors or very close.

area_slots_base = np.array([
    "01. Duomo", "02. Brera", "03. Giardini Porta Venezia", "04. Guastalla",
    "05. Porta Vigentina - Porta Lodovica", "06. Porta Ticinese - Conca del Naviglio",
    "07. Magenta- San Vittore", "08. Parco Sempione", "09. Porta Garibaldi - Porta Nuova",
    "10. Stazione Centrale - Ponte Seveso", "11. Isola", "12. Maciachini-Maggiolina",
    "13. Greco - Segnano", "14. Niguarda - Ca’ Granda - Prato Centenaro - Q.re Fulvio Testi",
    "15. Bicocca", "16. Gorla - Precotto", "17. Adriano", "18. Cimiano - Rottole - Q.re Feltre",
    "19. Padova - Turro - Crescenzago", "20. Loreto - Casoretto - NoLo",
    "21. Buenos Aires - Porta Venezia - Porta Monforte", "22. Città studi",
    "23. Lambrate - Ortica", "24. Parco Forlanini - Cavriano", "25. Corsica",
    "26. XXII Marzo", "27. Porta Romana", "28. Umbria - Molise - Calvairate",
    "29. Ortomercato", "30. Taliedo - Morsenchio - Q.re Forlanini",
    "31. Monluè - Ponte Lambro", "32. Triulzo Superiore", "33. Rogoredo - Santa Giulia",
    "34. Chiaravalle", "35. Lodi-Corvetto", "36. Scalo Romana", "37. Morivione",
    "38. Vigentino - Q.re Fatima", "39. Quintosole", "40. Ronchetto delle Rane",
    "41. Gratosoglio - Q.re Missaglia - Q.re Terrazze",
    "42. Stadera - Chiesa Rossa - Q.re Torretta - Conca Fallata", "43. Tibaldi",
    "44. Porta Ticinese - Conchetta", "45. Moncucco - San Cristoforo", "46. Barona",
    "47. Cantalupa", "48. Ronchetto sul Naviglio - Q.re Lodovico il Moro",
    "49. Giambellino", "50. Porta Genova", "51. Porta Magenta", "52. Bande Nere",
    "53. Lorenteggio", "54. Muggiano", "55. Baggio - Q.re degli Olmi - Q.re Valsesia",
    "56. Forze Armate", "57. San Siro", "58. De Angeli-Monte Rosa", "59. Tre Torri",
    "60. Stadio - Ippodromi", "61. Quarto Cagnino", "62. Quinto Romano", "63. Figino",
    "64. Trenno", "65. Q.re Gallaratese - Q.re San Leonardo - Lampugnano", "66. QT8",
    "67. Portello", "68. Pagano", "69. Sarpi", "70. Ghisolfa",
    "71. Villapizzone - Cagnola - Boldinasco", "72. Maggiore - Musocco - Certosa",
    "73. MIND - Cascina Triulza", "74. Roserio", "75. Stephenson",
    "76. Quarto Oggiaro - Vialba - Musocco", "77. Bovisa", "78. Farini", "79. Dergano",
    "80. Affori", "81. Bovisasca", "82. Comasina", "83. Bruzzano", "84. Parco Nord",
    "85. Parco delle Abbazie", "86. Parco dei Navigli", "87. Assiano",
    "88. Parco Bosco in città"
])

ZONE_CLUSTERS_BASE = {
    "Zone 1": [0, 1, 2, 3, 4, 5, 6, 7],
    "Zone 2": [8, 9, 10, 11, 12, 13, 14, 15, 16, 83],
    "Zone 3": [17, 18, 19, 20, 21, 22, 23, 24],
    "Zone 4": [25, 26, 27, 28, 29, 30, 31, 32],
    "Zone 5": [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 84],
    "Zone 6": [43, 44, 45, 46, 47, 48, 49, 50, 51, 85],
    "Zone 7": [52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 86, 87],
    "Zone 8": [63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74],
    "Zone 9": [75, 76, 77, 78, 79, 80, 81, 82]
}

print("Gen area slots...")

area_slots = area_slots_base
# We decided for two addresses per NIL
# area_slots = np.array(
#     [f"{name} A" for name in area_slots_base] +
#     [f"{name} B" for name in area_slots_base]
# )

time_slots = np.array(["Sabato mattina", "Sabato pomeriggio", "Domenica mattina", "Domenica pomeriggio"])
time_area_slots = np.array(list(itertools.product(time_slots, area_slots)))

print("Gen zone clusters...")

ZONE_CLUSTERS = ZONE_CLUSTERS_BASE
# Same as ZONE_CLUSTERS, but related to area_slots
# ZONE_CLUSTERS = {
#     zone: [2*i for i in indices] + [2*i + 1 for i in indices]
#     for zone, indices in ZONE_CLUSTERS_BASE.items()
# }

def get_user_area_slots():
    all_available = (random.random() < AREA_AVAILABLE_CHANCE)
    if all_available:
        return np.arange(len(area_slots), dtype=int)
    zone_indices = random.choice(list(ZONE_CLUSTERS.values()))
    num_picks = random.randint(MIN_LOCATIONS, MAX_LOCATIONS)

    if len(zone_indices) <= num_picks:
        selected_indices = zone_indices
    else:
        selected_indices = random.sample(zone_indices, num_picks)

    return np.array(selected_indices, dtype=int)

def get_user_time_slots():
    all_available = (random.random() < TIME_AVAILABLE_CHANCE)
    if all_available:
        return np.arange(len(time_slots), dtype=int)
    num_picks = random.randint(MIN_TIME_SLOTS, MAX_TIME_SLOTS)
    return np.array(random.sample(list(np.arange(len(time_slots))), num_picks), dtype=int)

def generate_users(count):
    users = []
    couples = []
    gen = 0

    while gen < count:
        # Determine if this iteration creates a pair
        # We check (count - len(users) >= 2) to ensure we don't go over limit
        is_pair = (random.random() < PAIR_CHANCE) and ((count - len(users)) >= 2)

        slots = {
            "area_slots": get_user_area_slots(),
            "time_slots": get_user_time_slots()
        }
        time_area_slots = [t_i * len(area_slots) + a_i for t_i, a_i in itertools.product(slots["time_slots"], slots["area_slots"])]
        slots["time_area_slots"] = np.array(time_area_slots, dtype=int)

        if is_pair:
            gen += 2
            couple = {
                "users": [
                    {
                        "name": fake.first_name(),
                        "surname": fake.last_name(),
                    },
                    {
                        "name": fake.first_name(),
                        "surname": fake.last_name(),
                    }
            ]} | slots
            couples.append(couple)

        else:
            gen += 1
            user = {
                "user": {
                    "name": fake.first_name(),
                    "surname": fake.last_name(),
                }
            } | slots
            users.append(user)

    return users, couples

print("Gen users & couples...")

# --- EXECUTION ---
users, couples = generate_users(TOTAL_USERS)

from pairing import pair_fun

compute = True
save = True
if compute:
    print("Pairing...")
    _, defs = pair_fun.run (couples=couples, singles=users, time_area_slots=time_area_slots, area_slots=area_slots) # time_slots=time_slots,
    output = defs['output']
    if save:
        np.save("output.npy", output)
else:
    output = np.load("output.npy", allow_pickle=True)

slot_map, user_map, couple_map = output


def flatten(xss):
    return [x for xs in xss for x in xs]

slot_counters = [len(flatten(slot_map[k])) for k in slot_map]
print("\n" + "="*40)
print(f"               RISULTATI")
print("="*40)
print(f"Total people: {len(user_map) + len(couple_map) * 2}, Expected: {len(users) + len(couples) * 2}")
print(f"Min group size: {min(slot_counters)}, Max group size: {max(slot_counters)}")
print(f"Slots taken: {len(slot_map)}, Empty slots: {len(time_area_slots) - len(slot_map)}\n")

import collections

# # 2. Aggregates counts (How many slots have exactly N people?)
hist_data = collections.Counter(slot_counters)
limit = 6  # Your hard limit

# Print normalization
MAX_BAR_WIDTH = 40
COUNT_WIDTH = 3

max_count = max(1, max(hist_data.values(), default=1))

max_area_name_length = max([len(a) for a in area_slots])
zones = list(set([k[1] for k in slot_map]))
zones.sort()
for z in zones:
    print(f"{z:<{max_area_name_length}} == {"█" * sum([len(flatten(slot_map[k])) for k in slot_map if z in k])}")
print(f"Filled {len(zones)} out of {len(area_slots)}")

# 3. Print ASCII Histogram
print("\n" + "="*40)
print("      ISTOGRAMMA RIEMPIMENTO SLOT")
print("="*40)

for n in range(limit + 1):
    count = hist_data.get(n, 0)

    # Normalize bar length
    bar_len = int(round(count / max_count * MAX_BAR_WIDTH))

    # Visual bar (use '█' for a solid look, or '#' for standard ascii)
    filled = "█" * bar_len
    empty = "." * (MAX_BAR_WIDTH - bar_len)
    bar = filled + empty

    # Only print rows that aren't empty, or print all to show gaps
    if count > 0 or n == 0:
        # Format: " 3 people: █████ (5)"
        print(f"{n:>2} persone: {bar} ({count:>{COUNT_WIDTH}} slot)")
    else:
        # Optional: Print faint line for empty bins
        print(f"{n:>2} persone: -")

print("="*40)

def who_registered_for(time=None, area=None):
    """ Finds users that registered for a specific time/area """
    mask = np.ones(len(time_area_slots), dtype=bool)
    if time is not None:
        mask &= (time_area_slots[:, 0] == time)
    if area is not None:
        mask &= (time_area_slots[:, 1] == area)
    tas_ids = np.where(mask)[0]
    if len(tas_ids) == 0:
        print(f"Wrong tas: {time}, {area}")
        return
    match_users = [u for u in users for tas_id in tas_ids if tas_id in u['time_area_slots']]
    print(time, area, tas_ids, len(match_users))

# print(who_registered_for("Sabato mattina", "01. Duomo"))
# print(who_registered_for(None, "01. Duomo"))
print(who_registered_for(None, "85. Parco delle Abbazie"))
print([(k, slot_map[k]) for k in slot_map if "85. Parco delle Abbazie" in k])
# print([u["user"] for u in slot_map[k] for k in slot_map

