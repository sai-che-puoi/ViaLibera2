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
TOTAL_USERS = 300
PAIR_CHANCE = 0.30  # 30% chance a user is part of a pair
MIN_LOCATIONS = 3
MAX_LOCATIONS = 4
MIN_TIME_SLOTS = 1
MAX_TIME_SLOTS = 4

# --- DATA: THE 88 DISTRICTS CLUSTERED BY MACRO-ZONE (MUNICIPI) ---
# This grouping ensures "Adjacency". If we pick from a cluster,
# the districts are guaranteed to be neighbors or very close.

area_slots = np.array([
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
time_slots = np.array(["Sabato mattina", "Sabato pomeriggio", "Domenica mattina", "Domenica pomeriggio"])
time_area_slots = np.array(list(itertools.product(time_slots, area_slots)))

ZONE_CLUSTERS = {
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

def get_user_area_slots():
    zone_indices = random.choice(list(ZONE_CLUSTERS.values()))
    num_picks = random.randint(MIN_LOCATIONS, MAX_LOCATIONS)

    if len(zone_indices) <= num_picks:
        selected_indices = zone_indices
    else:
        selected_indices = random.sample(zone_indices, num_picks)

    return np.array(selected_indices, dtype=int)

def get_user_time_slots():
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

# --- EXECUTION ---
users, couples = generate_users(TOTAL_USERS)

# Check our work: Print first 3 users to console
# print(f"Generated {len(users)} users & {len(couples)} couples.")
# print("-" * 30)
# for u in users[:3]:
#     print(u)
#     print(f"Name: {u['user']['name']} {u['user']['surname']}")
#     print(f"Locations: {u['time_area_slots'].dtype}")
#     print(f"Locations: {time_area_slots[u['time_area_slots']]}")
#     print("-" * 30)

from pairing import pair_fun

pair_fun.run (np=np, couples=couples, singles=users, time_area_slots=time_area_slots)
