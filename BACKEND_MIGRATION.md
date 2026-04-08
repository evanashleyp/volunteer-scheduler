# Backend Refactoring - Data Migration Notice

## Changed Structure

After the backend refactoring on April 8, 2026:

### ✅ USE THIS NOW:
```
backend/
├── data/              # ← All CSV files here
│   ├── volunteers.csv
│   ├── availability.csv
│   ├── fixed_assignments.csv
│   └── special_rules.csv
├── output/            # ← Schedule outputs here
├── scheduler/         # ← Python scheduler logic
├── api.py             # ← Flask API (run this)
└── main.py            # ← CLI runner
```

### ❌ DEPRECATED (can be deleted):
```
data/                 # Root level - no longer used
output/               # Root level - no longer used
scheduler/            # Root level - no longer used
api.py                # Root level - no longer used
main.py               # Root level - no longer used
```

## How to Use

1. **Edit CSV files here**: `backend/data/*.csv`
2. **Run the API**: `python backend/api.py` (or use `start-dev.ps1` / `start-dev.bat`)
3. **Reload in UI**: Click "🔄 Reload Data" button to sync CSV changes

## Why This Structure?

- **Cleaner organization**: All backend logic together
- **No confusion**: Single source of truth for data (`backend/data/`)
- **Easier deployment**: Backend is self-contained
- **Relative paths**: `backend/api.py` correctly finds its data folder

## Cleanup (Optional)

You can safely delete:
- `data/` (root level)
- `output/` (root level)  
- `scheduler/` (root level)
- `api.py` (root level)
- `main.py` (root level)

These have been moved into `backend/` and are no longer referenced.
