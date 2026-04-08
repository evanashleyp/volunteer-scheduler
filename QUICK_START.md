# Quick Start Guide

## Starting the Application

The app requires **both** servers running. Follow these steps:

### Option 1: Automatic (Recommended)
Run this from the project root:

**Windows PowerShell:**
```powershell
.\start-dev.ps1
```

**Windows Batch:**
```cmd
start-dev.bat
```

This will automatically open two terminal windows.

### Option 2: Manual - Start Backend First

**Terminal 1 - Backend (Flask API):**
```powershell
cd backend
python api.py
```

You should see output like:
```
[LOAD] Loaded 17 volunteers from backend/data/volunteers.csv
[DATA] Loading all data from CSV files...
WARNING in app.run_simple(): This is a development server. Do not use it in production applications.
 * Serving Flask app 'api'
 * Running on http://127.0.0.1:5000
```

**Terminal 2 - Frontend (React Vite):**
```powershell
cd frontend
pnpm dev
```

You should see output like:
```
VITE v4.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Verify It Works

1. **Backend health check** - Open a new terminal and run:
```powershell
(Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing).Content | ConvertFrom-Json
```
Should return: `{status: "ok"}`

2. **Open browser** - Go to `http://localhost:5173`
You should see the app load with data tables populated from `backend/data/` CSV files.

### Troubleshooting

| Issue | Solution |
|-------|----------|
| White screen on frontend | Check backend is running (Port 5000) |
| `ERR_CONNECTION_REFUSED` | Start backend first: `python backend/api.py` |
| Port already in use | Close other apps or kill process using that port |
| CSV data not loading | Check `backend/data/` folder has all 4 CSV files with data |

### Key Ports

- **Backend**: `http://localhost:5000` (Flask API)
- **Frontend**: `http://localhost:5173` (React Vite)

Both must be running for the app to work!
