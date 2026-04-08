"""
Flask backend API for the Barista Scheduler
Wraps the existing scheduler logic and exposes REST endpoints
"""

import sys
import os

# Add backend directory to path so scheduler imports work
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, request, jsonify
from flask_cors import CORS
from scheduler.scheduler import fill_schedule
from scheduler.models import Volunteer
import csv
import logging

# Configure logging for debugging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Base directory for data and output folders
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

app = Flask(__name__)
CORS(app)


def load_volunteers():
    """Load volunteers from CSV"""
    volunteers = []
    volunteer_path = os.path.join(DATA_DIR, "volunteers.csv")
    try:
        if os.path.exists(volunteer_path):
            with open(volunteer_path, newline="") as f:
                reader = csv.DictReader(f)
                for r in reader:
                    volunteers.append(
                        Volunteer(
                            name=r["name"],
                            can_hot=bool(int(r["can_hot"])),
                            can_cold=bool(int(r["can_cold"])),
                            can_order=bool(int(r["can_order"])),
                        )
                    )
            logger.info(f"[LOAD] Loaded {len(volunteers)} volunteers from {volunteer_path}")
        else:
            logger.warning(f"[LOAD] No volunteers.csv found at {volunteer_path}")
    except Exception as e:
        logger.error(f"[LOAD] Error loading volunteers: {str(e)}")
    return volunteers


def load_availability():
    """Load availability from CSV"""
    availability = {}
    availability_path = os.path.join(DATA_DIR, "availability.csv")
    try:
        if os.path.exists(availability_path):
            with open(availability_path, newline="") as f:
                reader = csv.DictReader(f)
                for r in reader:
                    availability[r["name"]] = {
                        1: int(r["week1"]),
                        2: int(r["week2"]),
                        3: int(r["week3"]),
                        4: int(r["week4"]),
                    }
            logger.info(f"[LOAD] Loaded {len(availability)} availability entries from {availability_path}")
        else:
            logger.warning(f"[LOAD] No availability.csv found at {availability_path}")
    except Exception as e:
        logger.error(f"[LOAD] Error loading availability: {str(e)}")
    return availability


def load_fixed_assignments():
    """Load fixed assignments from CSV"""
    fixed = []
    fixed_path = os.path.join(DATA_DIR, "fixed_assignments.csv")
    try:
        if os.path.exists(fixed_path):
            with open(fixed_path, newline="") as f:
                reader = csv.DictReader(f)
                for r in reader:
                    fixed.append(
                        {
                            "week": int(r["week"]),
                            "role": r["role"],
                            "name": r["name"],
                        }
                    )
            logger.info(f"[LOAD] Loaded {len(fixed)} fixed assignments from {fixed_path}")
        else:
            logger.warning(f"[LOAD] No fixed_assignments.csv found at {fixed_path}")
    except Exception as e:
        logger.error(f"[LOAD] Error loading fixed assignments: {str(e)}")
    return fixed


def load_special_rules():
    """Load special rules from CSV"""
    rules = []
    rules_path = os.path.join(DATA_DIR, "special_rules.csv")
    try:
        if os.path.exists(rules_path):
            with open(rules_path, newline="") as f:
                reader = csv.DictReader(f)
                for r in reader:
                    rules.append(
                        {
                            "name": r["name"],
                            "week": int(r["week"]),
                            "role": r["role"],
                            "bonus": int(r["bonus"]),
                        }
                    )
            logger.info(f"[LOAD] Loaded {len(rules)} special rules from {rules_path}")
        else:
            logger.info(f"[LOAD] No special_rules.csv found at {rules_path} (optional)")
    except Exception as e:
        logger.error(f"[LOAD] Error loading special rules: {str(e)}")
    return rules


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"}), 200


@app.route("/api/data", methods=["GET"])
def get_data():
    """Get current data from CSV files"""
    try:
        logger.info("[DATA] Loading all data from CSV files...")
        volunteers = load_volunteers()
        availability = load_availability()
        fixed_assignments = load_fixed_assignments()
        special_rules = load_special_rules()

        logger.info(f"[DATA] Loaded: {len(volunteers)} volunteers, {len(availability)} availability, {len(fixed_assignments)} fixed, {len(special_rules)} rules")

        # Convert Volunteer objects to dicts
        volunteer_dicts = [
            {
                "name": v.name,
                "can_hot": int(v.can_hot),
                "can_cold": int(v.can_cold),
                "can_order": int(v.can_order),
            }
            for v in volunteers
        ]

        # Convert availability dict to list of dicts
        availability_list = [
            {
                "name": name,
                "week1": avail[1],
                "week2": avail[2],
                "week3": avail[3],
                "week4": avail[4],
            }
            for name, avail in availability.items()
        ]

        logger.info("[DATA] Returning data to frontend")
        return (
            jsonify(
                {
                    "volunteers": volunteer_dicts,
                    "availability": availability_list,
                    "fixed_assignments": fixed_assignments,
                    "special_rules": special_rules,
                }
            ),
            200,
        )
    except Exception as e:
        logger.error(f"[DATA] Error loading data: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route("/api/save-data", methods=["POST"])
def save_data():
    """
    Save provided data to CSV files
    
    Expected JSON body:
    {
        "volunteers": [...],
        "availability": [...],
        "fixed_assignments": [...],
        "special_rules": [...]
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Ensure data directory exists
        os.makedirs(DATA_DIR, exist_ok=True)

        # Save volunteers.csv
        volunteers_data = data.get("volunteers", [])
        if volunteers_data:
            volunteer_path = os.path.join(DATA_DIR, "volunteers.csv")
            with open(volunteer_path, "w", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=["name", "can_hot", "can_cold", "can_order"])
                writer.writeheader()
                for v in volunteers_data:
                    writer.writerow({
                        "name": v.get("name", ""),
                        "can_hot": int(v.get("can_hot", 0)),
                        "can_cold": int(v.get("can_cold", 0)),
                        "can_order": int(v.get("can_order", 0)),
                    })
            logger.info(f"[SAVE] Saved {len(volunteers_data)} volunteers to {volunteer_path}")

        # Save availability.csv
        availability_data = data.get("availability", [])
        if availability_data:
            # Determine max week from the data
            max_weeks = 4
            for avail in availability_data:
                for key in avail.keys():
                    if key.startswith("week"):
                        week_num = int(key.replace("week", ""))
                        max_weeks = max(max_weeks, week_num)
            
            availability_path = os.path.join(DATA_DIR, "availability.csv")
            with open(availability_path, "w", newline="") as f:
                fieldnames = ["name"] + [f"week{i}" for i in range(1, max_weeks + 1)]
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                for avail in availability_data:
                    row = {"name": avail.get("name", "")}
                    for i in range(1, max_weeks + 1):
                        row[f"week{i}"] = int(avail.get(f"week{i}", 1))
                    writer.writerow(row)
            logger.info(f"[SAVE] Saved {len(availability_data)} availability entries to {availability_path}")

        # Save fixed_assignments.csv
        fixed_assignments_data = data.get("fixed_assignments", [])
        if fixed_assignments_data:
            fixed_path = os.path.join(DATA_DIR, "fixed_assignments.csv")
            with open(fixed_path, "w", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=["week", "role", "name"])
                writer.writeheader()
                for fa in fixed_assignments_data:
                    if fa.get("name", "").strip():
                        writer.writerow({
                            "week": int(fa.get("week", 1)),
                            "role": fa.get("role", "hot"),
                            "name": fa.get("name", ""),
                        })
            logger.info(f"[SAVE] Saved {len(fixed_assignments_data)} fixed assignments to {fixed_path}")

        # Save special_rules.csv
        special_rules_data = data.get("special_rules", [])
        if special_rules_data:
            rules_path = os.path.join(DATA_DIR, "special_rules.csv")
            with open(rules_path, "w", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=["name", "week", "role", "bonus"])
                writer.writeheader()
                for sr in special_rules_data:
                    if sr.get("name", "").strip():
                        writer.writerow({
                            "name": sr.get("name", ""),
                            "week": int(sr.get("week", 1)),
                            "role": sr.get("role", "hot"),
                            "bonus": int(sr.get("bonus", 0)),
                        })
            logger.info(f"[SAVE] Saved {len(special_rules_data)} special rules to {rules_path}")

        logger.info("[SAVE] All data saved successfully")
        return jsonify({"message": "Data saved successfully"}), 200

    except Exception as e:
        logger.error(f"[SAVE] Error saving data: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/schedule", methods=["POST"])
def run_schedule():
    """
    Run the scheduler with provided data
    
    Expected JSON body:
    {
        "volunteers": [...],
        "availability": [...],
        "fixed_assignments": [...],
        "special_rules": [...]
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Convert JSON data to Volunteer objects and structures
        volunteers_data = data.get("volunteers", [])
        availability_data = data.get("availability", [])
        fixed_assignments_data = data.get("fixed_assignments", [])
        special_rules_data = data.get("special_rules", [])

        # Create Volunteer objects
        volunteers = [
            Volunteer(
                name=v["name"],
                can_hot=bool(v.get("can_hot", 0)),
                can_cold=bool(v.get("can_cold", 0)),
                can_order=bool(v.get("can_order", 0)),
            )
            for v in volunteers_data
        ]

        # Get number of weeks requested
        num_weeks = data.get("weeks", 4)
        
        # Convert availability to dict format with dynamic weeks
        availability = {}
        for avail in availability_data:
            availability[avail["name"]] = {}
            for week in range(1, num_weeks + 1):
                week_key = f"week{week}"
                # Use the data if available, else default to 1 (available) for weeks beyond CSV
                if week_key in avail:
                    availability[avail["name"]][week] = int(avail.get(week_key, 0))
                else:
                    # Default to 1 (available) for weeks not in the CSV data
                    availability[avail["name"]][week] = 1
        fixed_assignments = [
            {
                "week": int(fa.get("week", 1)),
                "role": fa.get("role", "hot"),
                "name": fa.get("name", ""),
            }
            for fa in fixed_assignments_data
            if fa.get("name", "").strip()
        ]

        # Log fixed assignments for debugging
        logger.info(f"[SCHEDULE] Received {len(fixed_assignments)} fixed assignments")
        if fixed_assignments:
            logger.info(f"[SCHEDULE] Fixed assignments: {fixed_assignments}")

        # Special rules
        special_rules = [
            {
                "name": sr.get("name", ""),
                "week": int(sr.get("week", 1)),
                "role": sr.get("role", "hot"),
                "bonus": int(sr.get("bonus", 0)),
            }
            for sr in special_rules_data
            if sr.get("name", "").strip()
        ]

        # Run scheduler
        weeks_list = list(range(1, num_weeks + 1))
        
        assignments = fill_schedule(
            volunteers=volunteers,
            availability=availability,
            fixed_assignments=fixed_assignments,
            special_rules=special_rules,
            weeks=weeks_list,
            roles=["hot", "order", "cold"],
        )

        # Mark which assignments are fixed vs generated
        fixed_assignment_set = set((a["week"], a["role"], a["name"]) for a in fixed_assignments)
        assignments_with_flags = [
            {
                "week": a["week"],
                "role": a["role"],
                "name": a["name"],
                "is_fixed": (a["week"], a["role"], a["name"]) in fixed_assignment_set,
            }
            for a in assignments
        ]

        logger.info(f"[SCHEDULE] Generated {len(assignments_with_flags)} total assignments ({len(fixed_assignments)} fixed, {len(assignments_with_flags) - len(fixed_assignments)} generated)")

        return (
            jsonify(
                {
                    "assignments": assignments_with_flags
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)
