# Volunteer Scheduler

**v2.1.0** – Fullstack Volunteer Scheduling Platform

A rule-based, score-driven scheduling system for weekly volunteer assignments with a modern web interface.

The application consists of a Python scheduling engine exposed through a Flask API and a React + TypeScript frontend for managing volunteer data, fixed assignments, and schedule generation.

This project is designed to generate fair, balanced schedules while respecting
availability, skills, fixed commitments, and long-term workload distribution.

The system is **data-driven**, **extensible**, and intentionally separated from
real human data to keep the repository clean and safe for public use.

---

## Features

- Multiple roles per week (`hot`, `cold`, `order`)
- Configurable role requirements (minimum & target)

- Hard constraints
  - Availability
  - Skill compatibility
  - One role per volunteer per week

- Soft constraints via scoring & penalties
- Fixed (immutable) assignments

- Interactive React frontend
- Editable table-based data management
- Dropdown-based assignment entry
- Volunteer autocomplete / combobox support

- Optional bonus rules (CSV-driven)
- Fairness & workload balancing
- Warning system for unmet constraints
- CSV export for spreadsheet usage

---

## Role Requirements

| Role  | Minimum | Target |
|------|--------|--------|
| Hot  | 2 | 2 |
| Order | 2 | 2 |
| Cold | 2 | 2 |

> Note:  
> The system always attempts to meet **target** first.  
> If target cannot be reached, it falls back to **minimum** and prints a warning.

---

## How Scheduling Works

1. **Fixed assignments** are loaded first and treated as immutable
2. For each week and role, the scheduler fills slots until the target is reached
3. Candidates are filtered using **hard constraints**:
   - Availability for that week
   - Skill compatibility for the role
   - One role per person per week
4. Remaining candidates are scored using **soft constraints**:
   - Monthly workload balance
   - Cooldown between consecutive weeks
   - Repeated role penalties
   - First-time coverage bonus
   - Optional special bonuses
5. The highest-scoring candidate is selected
6. If minimum requirements cannot be met, a warning is printed

---

## Project Structure

```text
.
├── backend/                       # Python Flask API + Scheduling Engine
│   ├── scheduler/                 # Scheduling engine
│   │   ├── __init__.py
│   │   ├── models.py              # Volunteer data model
│   │   ├── constraints.py         # Hard constraints
│   │   ├── scoring.py             # Base scoring logic
│   │   └── scheduler.py           # Core scheduling engine
│   ├── data/                      # CSV input files (local only, ignored)
│   │   ├── volunteers.csv
│   │   ├── availability.csv
│   │   ├── fixed_assignments.csv
│   │   └── special_rules.csv
│   ├── output/                    # Generated schedules (local only, ignored)
│   │   ├── schedule.csv
│   │   └── schedule_copyable.csv
│   ├── api.py                     # Flask backend API
│   ├── main.py                    # CLI entry point
│   └── __init__.py
│
├── frontend/                      # React + TypeScript UI
│   ├── src/
│   │   ├── App.tsx                # Main application
│   │   ├── components/            # Reusable React components
│   │   ├── pages/                 # Page components
│   │   ├── services/
│   │   │   └── api.ts             # Backend API client
│   │   ├── types/                 # TypeScript types
│   │   └── theme.ts               # UI theme configuration
│   ├── vite.config.ts
│   └── package.json
│
├── README.md
├── QUICK_START.md                 # Getting started guide
├── IMPLEMENTATION_SUMMARY.md      # Technical overview
├── BACKEND_MIGRATION.md           # Refactoring notes
├── start-dev.ps1                  # Windows PowerShell startup script
├── start-dev.bat                  # Windows Batch startup script
└── .gitignore
```

---

## Technology Stack

- **Backend**: Python (Flask) + Scheduling Engine
- **Frontend**: React + TypeScript + Vite
- **Data Format**: CSV (human-editable)
- **API**: RESTful JSON endpoints

---

## Running the Application

### Start Both Backend and Frontend

**Windows (PowerShell):**
```powershell
.\start-dev.ps1
```

**Windows (Batch):**
```cmd
start-dev.bat
```

This will launch:
- Flask API on `http://localhost:5000`
- Frontend on `http://localhost:5173` (Vite dev server)

### Frontend Features

The web interface provides:

- Editable table-based data management
- Dropdown selectors for weeks and roles
- Volunteer autocomplete for fixed assignments
- CSV-backed persistence
- Schedule generation through REST API

The frontend improves data entry through dropdown and autocomplete controls while preserving the original CSV-based storage format internally.

### Backend Only (CLI)

```bash
cd backend
python main.py
```

Generates schedules and exports to `backend/output/`

---

## CSV File Formats

All input data is provided via CSV files to keep the system simple, auditable, and editable without code changes.

### volunteers.csv

Defines volunteer identities and their skill eligibility.

```
id,name,skills
V01,Alice,"hot,cold"
V02,Bob,"order"
V03,Charlie,"hot,order"
```

- `id` must be unique
- `skills` is a comma-separated list
- Volunteers can only be assigned to roles listed in skills

### availability.csv

Defines weekly availability for each volunteer.

```
volunteer_id,week,available
V01,1,true
V01,2,false
V02,1,true
```

- If `available = false`, the volunteer is never considered for that week
- Missing rows are treated as false by default

### fixed_assignments.csv

Defines immutable assignments that cannot be overridden.

```
week,role,volunteer_id
1,hot,V03
```

- Loaded before scheduling starts
- Count toward role requirements
- Violations (e.g. unavailable volunteer) will raise warnings

### special_rules.csv (optional)

Defines bonus or penalty rules applied during scoring.

```
rule,role,value
first_time_bonus,hot,3
cooldown_penalty,hot,-2
```

- Allows tuning behavior without touching code
- Can be extended freely

---

## Output

All generated schedules are exported as CSV for easy sharing and review.

### schedule.csv

Structured output intended for programmatic or spreadsheet use.

```
week,role,volunteer_id
1,hot,V01
1,cold,V02
```

### schedule_copyable.csv

Human-readable format optimized for copy-paste into chat or documents.

```
Week 1
Hot: Alice
Cold: Bob
Order: Charlie
```

---

## Versioning

This project follows semantic versioning:

`MAJOR.MINOR.PATCH`

- **MAJOR** – breaking logic or structural changes
- **MINOR** – new features or scoring rules
- **PATCH** – bug fixes or small adjustments

### Version History

- v1.0.0 – Initial public release
- v2.0.0 – Fullstack architecture with Flask API and React frontend
- v2.1.0 – Improved data entry experience with dropdowns and volunteer autocomplete

Tags are used instead of versioned folder names.

---

## Design Philosophy

This scheduler is intentionally designed with the following principles:

### Data over Code

All configuration lives in CSV files.
Non-developers can adjust behavior without touching Python.

### Hard vs Soft Constraints

- Hard constraints are never violated
- Soft constraints guide decisions via scoring

This makes the system predictable while still flexible.

### Deterministic, Explainable Output

- Given the same inputs, the scheduler produces the same result.
- Warnings are explicit when requirements cannot be satisfied.

### No Real Human Data

- The repository never contains real names, schedules, or availability.
- All personal data is local-only and ignored via `.gitignore`.

### Extensible, Not Over-Engineered

- The system favors clarity over abstraction.
- Rules are easy to add, trace, and remove.

---

## License

This project is licensed under the MIT License.
See the LICENSE file for details.

