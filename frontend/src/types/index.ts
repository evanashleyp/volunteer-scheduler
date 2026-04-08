// Volunteer data with skills
export interface Volunteer {
  name: string;
  can_hot: boolean;
  can_cold: boolean;
  can_order: boolean;
}

// Availability for each volunteer across 4 weeks
export interface Availability {
  name: string;
  week1: number; // 0 or 1
  week2: number;
  week3: number;
  week4: number;
}

// Pre-assigned volunteer to a role in a specific week
export interface FixedAssignment {
  week: number;
  role: "hot" | "order" | "cold";
  name: string;
}

// Special bonus rules for specific assignments
export interface SpecialRule {
  name: string;
  week: number;
  role: "hot" | "order" | "cold";
  bonus: number;
}

// Individual assignment output
export interface Assignment {
  week: number;
  role: "hot" | "order" | "cold";
  name: string;
  is_fixed?: boolean; // True if this assignment is from fixed_assignments
}

// Scheduler response with all assignments
export interface ScheduleResponse {
  assignments: Assignment[];
  warnings?: string[];
}

// Form state for editable tables
export interface TableData {
  volunteers: Volunteer[];
  availability: Availability[];
  fixed_assignments: FixedAssignment[];
  special_rules: SpecialRule[];
}
