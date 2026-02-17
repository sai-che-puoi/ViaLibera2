import random
import json
import numpy as np
import itertools
import area_gen
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

print("Gen area slots...")

area_slots_base, time_slots_base = area_gen.gen_slots()

area_slots = area_slots_base
# We decided for two addresses per NIL
# area_slots = np.array(
#     [f"{name} A" for name in area_slots_base] +
#     [f"{name} B" for name in area_slots_base]
# )

time_slots = time_slots_base
time_area_slots = np.array(list(itertools.product(time_slots, area_slots)))

print("Gen zone clusters...")

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

ZONE_CLUSTERS = ZONE_CLUSTERS_BASE
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

import pairing_algorithm

compute = True
save = True
if compute:
    print("Pairing...")
    output = pairing_algorithm.pair (couples=couples, singles=users, time_area_slots=time_area_slots, area_slots=area_slots)
    if save:
        np.save("output.npy", output)
else:
    output = np.load("output.npy", allow_pickle=True)
    output = (output[0], output[1], output[2])

import pretty_print_output

pretty_print_output.prettify(couples, users, area_slots, time_area_slots, output)
