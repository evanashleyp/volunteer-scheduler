import sys
import os

# Add current directory to path so scheduler imports work
sys.path.insert(0, os.path.dirname(__file__))

from scheduler.scheduler import fill_schedule
from scheduler.models import Volunteer
import csv

# Base directory for data and output folders
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")


def load_volunteers():
    volunteer_path = os.path.join(DATA_DIR, "volunteers.csv")
    volunteers = []
    with open(volunteer_path, newline="") as f:
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
    availability_path = os.path.join(DATA_DIR, "availability.csv")
    availability = {}
    with open(availability_path, newline="") as f:
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
    fixed_path = os.path.join(DATA_DIR, "fixed_assignments.csv")
    fixed = []
    with open(fixed_path, newline="") as f:
        reader = csv.DictReader(f)
        for r in reader:
            fixed.append({
                "week": int(r["week"]),
                "role": r["role"],
                "name": r["name"]
            })
    return fixed


def load_special_rules():
    rules_path = os.path.join(DATA_DIR, "special_rules.csv")
    rules = []
    if not os.path.exists(rules_path):
        return rules

    with open(rules_path, newline="") as f:
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
def write_schedule_csv(assignments, path=None):
    if path is None:
        path = os.path.join(OUTPUT_DIR, "schedule.csv")
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)

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

    copyable_path = os.path.join(OUTPUT_DIR, "schedule_copyable.csv")
    with open(copyable_path, "w", newline="") as f:
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
