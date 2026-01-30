from scheduler.constraints import can_do_role, already_assigned
from scheduler.scoring import score


ROLE_REQUIREMENTS = {
    "hot":   {"min": 2, "target": 2},
    "order": {"min": 2, "target": 2},
    "cold":  {"min": 2, "target": 2},  
}


# =========================
# COUNT HELPERS
# =========================

def count_assignments(assignments, name):
    return sum(1 for a in assignments if a["name"] == name)


def count_role(assignments, week, role):
    return sum(
        1 for a in assignments
        if a["week"] == week and a["role"] == role
    )


def count_role_month(assignments, name, role):
    return sum(
        1 for a in assignments
        if a["name"] == name and a["role"] == role
    )


# =========================
# PENALTIES
# =========================

def monthly_penalty(assignments, name):
    """
    Total load in the month (including fixed assignments)
    """
    count = count_assignments(assignments, name)

    if count <= 1:
        return 0
    elif count == 2:
        return 10
    elif count == 3:
        return 30
    else:
        return 60


def cooldown_penalty(assignments, name, week):
    """
    Penalize consecutive weeks (week index based)
    """
    served_weeks = sorted(
        a["week"] for a in assignments
        if a["name"] == name
    )

    if not served_weeks:
        return 0

    last_week = max(served_weeks)

    if week - last_week == 1:
        return 30   # last week → this week
    if week - last_week == 2:
        return 10   # short rest
    return 0


def same_role_penalty(assignments, name, role):
    """
    Same role repetition in the same month
    """
    count = count_role_month(assignments, name, role)

    if count == 0:
        return 0
    elif count == 1:
        return 5
    elif count == 2:
        return 20
    else:
        return 40


# =========================
# CORE SCHEDULER
# =========================

def fill_schedule(
    volunteers,
    availability,
    fixed_assignments,
    special_rules,
    weeks,
    roles,
    debug=False
):

    # IMPORTANT: fixed assignments are part of history
    assignments = fixed_assignments.copy()

    for week in weeks:
        for role in roles:

            req = ROLE_REQUIREMENTS[role]

            while count_role(assignments, week, role) < req["target"]:

                candidates = []

                for v in volunteers:

                    # ---------- HARD CONSTRAINTS ----------
                    if availability[v.name][week] == 0:
                        continue

                    if already_assigned(assignments, v.name, week):
                        continue

                    if not can_do_role(v, role):
                        continue

                    s = score(v, role, week, availability)

                    # ---------- FAIRNESS ----------
                    s -= monthly_penalty(assignments, v.name)
                    s -= cooldown_penalty(assignments, v.name, week)
                    s -= same_role_penalty(assignments, v.name, role)

                    # ---------- COVERAGE ----------
                    if count_assignments(assignments, v.name) == 0:
                        s += 25

                    candidates.append((s, v.name))

                if not candidates:
                    break

                best_name = max(candidates)[1]

                assignments.append({
                    "week": week,
                    "role": role,
                    "name": best_name
                })

            # WARNING if minimum not met
            if count_role(assignments, week, role) < req["min"]:
                print(
                    f"WARNING: week {week} role {role} "
                    f"only filled {count_role(assignments, week, role)}"
                )

    return assignments
