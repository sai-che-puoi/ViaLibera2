import numpy as np

def prettify(couples, users, area_slots, time_area_slots, output):
    final_output = []
    slot_map, user_map, couple_map = output
    def flatten(xss):
        return [x for xs in xss for x in xs]

    slot_counters = [len(flatten(slot_map[k])) for k in slot_map]
    final_output.append("\n" + "="*40)
    final_output.append(f"               RISULTATI")
    final_output.append("="*40)
    final_output.append(f"Total people: {len(user_map) + len(couple_map) * 2}, Expected: {len(users) + len(couples) * 2}")
    final_output.append(f"Min group size: {min(slot_counters)}, Max group size: {max(slot_counters)}")
    final_output.append(f"Slots taken: {len(slot_map)}, Empty slots: {len(time_area_slots) - len(slot_map)}\n")

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
        final_output.append(f"{z:<{max_area_name_length}} == {"█" * sum([len(flatten(slot_map[k])) for k in slot_map if z in k])}")
    final_output.append(f"Filled {len(zones)} out of {len(area_slots)}")

    # 3. Print ASCII Histogram
    final_output.append("\n" + "="*40)
    final_output.append("      ISTOGRAMMA RIEMPIMENTO SLOT")
    final_output.append("="*40)

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
            final_output.append(f"{n:>2} persone: {bar} ({count:>{COUNT_WIDTH}} slot)")
        else:
            # Optional: Print faint line for empty bins
            final_output.append(f"{n:>2} persone: -")

    final_output.append("="*40)

    def who_registered_for(time=None, area=None):
        """ Finds users that registered for a specific time/area """
        mask = np.ones(len(time_area_slots), dtype=bool)
        if time is not None:
            mask &= (time_area_slots[:, 0] == time)
        if area is not None:
            mask &= (time_area_slots[:, 1] == area)
        tas_ids = np.where(mask)[0]
        if len(tas_ids) == 0:
            final_output.append(f"Wrong tas: {time}, {area}")
            return
        match_users = [u for u in users for tas_id in tas_ids if tas_id in u['time_area_slots']]
        final_output.append(time, area, tas_ids, len(match_users))

    # print(who_registered_for("Sabato mattina", "Duomo"))
    # print(who_registered_for(None, "Duomo"))
    # print(who_registered_for(None, "Parco delle Abbazie"))
    # print([(k, slot_map[k]) for k in slot_map if "Parco delle Abbazie" in k])
    # print([u["user"] for u in slot_map[k] for k in slot_map
    return final_output

