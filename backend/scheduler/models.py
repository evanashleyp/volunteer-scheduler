from dataclasses import dataclass

@dataclass
class Volunteer:
    name: str
    can_hot: bool
    can_cold: bool
    can_order: bool
