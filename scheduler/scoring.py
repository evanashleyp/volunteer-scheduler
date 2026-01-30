from scheduler.models import Volunteer

def score(volunteer: Volunteer, role: str, week: int, availability: dict) -> int:
    if availability[volunteer.name][week] == 0:
        return -10_000  # hard block

    return 120  # available + skill fit
