from .models import Volunteer

def can_do_role(volunteer: Volunteer, role: str) -> bool:
    return {
        "hot": volunteer.can_hot,
        "cold": volunteer.can_cold,
        "order": volunteer.can_order
    }.get(role, False)


def already_assigned(assignments, name, week) -> bool:
    return any(
        a for a in assignments
        if a["week"] == week and a["name"] == name
    )
