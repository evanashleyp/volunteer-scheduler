from scheduler.scheduler import fill_schedule
from scheduler.models import Volunteer
import csv
import os


def load_volunteers():
    volunteers = []
    with open("data/volunteers.csv", newline="") as f:
        reader = csv.DictReader(f)
        for r in reader:
            volunteers.append(
                Volunteer(
                    name=r["name"],
                    can_hot=bool(int(r["can_hot"])),
                    can_cold=bool(int(r["can_cold"])),
                    can_order=bool(int(r["can_order"]))
                )
            )
    return volunteers


def load_availability():
    availability = {}
    with open("data/availability.csv", newline="") as f:
        reader = csv.DictReader(f)
        for r in reader:
            availability[r["name"]] = {
                1: int(r["week1"]),
                2: int(r["week2"]),
                3: int(r["week3"]),
                4: int(r["week4"]),
            }
    return availability


def load_fixed_assignments():
    fixed = []
    with open("data/fixed_assignments.csv", newline="") as f:
        reader = csv.DictReader(f)
        for r in reader:
            fixed.append({
                "week": int(r["week"]),
                "role": r["role"],
                "name": r["name"]
            })
    return fixed


def load_special_rules():
    rules = []
    if not os.path.exists("data/special_rules.csv"):
        return rules

    with open("data/special_rules.csv", newline="") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rules.append({
                "name": r["name"],
                "week": int(r["week"]),
                "role": r["role"],
                "bonus": int(r["bonus"])
            })
    return rules


# =========================
# NEW: WRITE OUTPUT CSV
# =========================
def write_schedule_csv(assignments, path="output/schedule.csv"):
    import os
    import csv

    os.makedirs("output", exist_ok=True)

    weeks = [1, 2, 3, 4]
    roles = ["hot", "order", "cold"]

    # init table
    table = {
        role: {week: [] for week in weeks}
        for role in roles
    }

    # fill table
    for a in assignments:
        table[a["role"]][a["week"]].append(a["name"])

    with open(path, "w", newline="") as f:
        writer = csv.writer(f)

        # header
        writer.writerow(["role", "week1", "week2", "week3", "week4"])

        # rows
        for role in roles:
            row = [role]
            for week in weeks:
                names = table[role][week]
                if not names:
                    row.append("")
                elif len(names) == 1:
                    row.append(names[0])
                else:
                    row.append(f"({','.join(names)})")
            writer.writerow(row)

    print(f"Schedule written to {path}")

def write_schedule_copyable_csv(assignments, weeks):
    """
    Human-friendly CSV for Google Sheets copy-paste
    Row-based slots
    """

    ROLE_ORDER = [
        "hot", "hot",
        "order", "order",
        "cold", "cold"
    ]

    # build lookup: role -> week -> [names]
    table = {role: {w: [] for w in weeks} for role in ["hot", "order", "cold"]}

    for a in assignments:
        table[a["role"]][a["week"]].append(a["name"])

    rows = []

    role_slot_counter = {
        "hot": 0,
        "order": 0,
        "cold": 0
    }

    for role in ROLE_ORDER:
        slot = role_slot_counter[role]
        role_slot_counter[role] += 1

        row = []

        for w in weeks:
            names = table[role][w]
            if slot < len(names):
                row.append(names[slot])
            else:
                row.append("")

        row.append(role)
        rows.append(row)

    with open("output/schedule_copyable.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(
            [f"week{i+1}" for i in range(len(weeks))] + ["role"]
        )
        writer.writerows(rows)


def main():
    volunteers = load_volunteers()
    availability = load_availability()
    fixed = load_fixed_assignments()
    special_rules = load_special_rules()

    weeks = [1, 2, 3, 4]
    roles = ["hot", "cold", "order"]

    schedule = fill_schedule(
        volunteers,
        availability,
        fixed,
        special_rules,
        weeks,
        roles
    )

    write_schedule_csv(schedule)
    write_schedule_copyable_csv(schedule, weeks)


if __name__ == "__main__":
    main()
