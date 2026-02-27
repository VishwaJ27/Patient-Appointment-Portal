# app.py

from flask import Flask, render_template, request, jsonify
import mysql.connector
from database import get_connection

app = Flask(__name__)


# ── Helpers ──────────────────────────────────────────────────────────
def rows_to_strings(rows):
    """Convert any date/datetime values in DB rows to ISO strings
    so Jinja templates and tojson can handle them safely."""
    for row in rows:
        for key, val in row.items():
            if hasattr(val, 'isoformat'):
                row[key] = val.isoformat()
    return rows


def get_stats(cursor):
    cursor.execute("SELECT COUNT(*) AS n FROM patients")
    total_patients = cursor.fetchone()["n"]

    cursor.execute("SELECT COUNT(*) AS n FROM appointments")
    total_appointments = cursor.fetchone()["n"]

    cursor.execute("SELECT COUNT(*) AS n FROM appointments WHERE emergency = 'Yes'")
    emergencies = cursor.fetchone()["n"]

    cursor.execute("SELECT COUNT(*) AS n FROM appointments WHERE DATE(preferred_date) = CURDATE()")
    today = cursor.fetchone()["n"]

    return {
        "total_patients":     total_patients,
        "total_appointments": total_appointments,
        "emergencies":        emergencies,
        "today":              today,
    }


# ── Home — Patient Form ───────────────────────────────────────────────
@app.route("/")
def home():
    return render_template("index.html")


# ── Admin: Dashboard ─────────────────────────────────────────────────
@app.route("/admin")
def admin_dashboard():
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)

        stats = get_stats(cursor)

        # 5 most recent appointments for the preview table
        cursor.execute("""
            SELECT
                a.appointment_id, a.department, a.preferred_date,
                a.time_slot, a.severity, a.emergency,
                p.full_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            ORDER BY a.created_at DESC
            LIMIT 5
        """)
        recent = rows_to_strings(cursor.fetchall())

        cursor.close()
        conn.close()

        return render_template("admin/dashboard.html", stats=stats, recent=recent)

    except mysql.connector.Error as err:
        return f"<h2 style='font-family:sans-serif;padding:40px;color:#e05c5c'>Database error: {err}</h2>", 500


# ── Admin: Patients ───────────────────────────────────────────────────
@app.route("/admin/patients")
def admin_patients():
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, full_name, dob, gender, blood_group,
                   phone, email, address, created_at
            FROM patients
            ORDER BY created_at DESC
        """)
        patients = rows_to_strings(cursor.fetchall())

        cursor.close()
        conn.close()

        return render_template("admin/patients.html", patients=patients)

    except mysql.connector.Error as err:
        return f"<h2 style='font-family:sans-serif;padding:40px;color:#e05c5c'>Database error: {err}</h2>", 500


# ── Admin: Appointments ───────────────────────────────────────────────
@app.route("/admin/appointments")
def admin_appointments():
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                a.appointment_id,
                a.symptoms, a.duration, a.severity,
                a.conditions, a.medications, a.allergies,
                a.department, a.doctor, a.preferred_date,
                a.time_slot, a.emergency, a.created_at,
                p.full_name, p.dob, p.gender, p.blood_group,
                p.phone, p.email, p.address
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            ORDER BY a.created_at DESC
        """)
        appointments = rows_to_strings(cursor.fetchall())

        cursor.close()
        conn.close()

        return render_template("admin/appointments.html", appointments=appointments)

    except mysql.connector.Error as err:
        return f"<h2 style='font-family:sans-serif;padding:40px;color:#e05c5c'>Database error: {err}</h2>", 500


# ── Submit Appointment ────────────────────────────────────────────────
@app.route("/submit", methods=["POST"])
def submit():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    try:
        conn   = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO patients
                (full_name, dob, gender, blood_group, phone, email, address)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data.get("fullName",   ""),
            data.get("dob",        ""),
            data.get("gender",     ""),
            data.get("bloodGroup", ""),
            data.get("phone",      ""),
            data.get("email",      ""),
            data.get("address",    ""),
        ))
        patient_id = cursor.lastrowid
        reference  = f"PL-{100000 + patient_id}"

        cursor.execute("""
            INSERT INTO appointments
                (appointment_id, patient_id,
                 symptoms, duration, severity, conditions, medications, allergies,
                 department, doctor, preferred_date, time_slot, emergency)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            reference, patient_id,
            data.get("symptoms",    ""),
            data.get("duration",    ""),
            data.get("severity",    ""),
            data.get("conditions",  ""),
            data.get("medications", ""),
            data.get("allergies",   ""),
            data.get("department",  ""),
            data.get("doctor",      ""),
            data.get("apptDate",    ""),
            data.get("timeSlot",    ""),
            data.get("emergency",   ""),
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Saved successfully", "reference": reference}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500


if __name__ == "__main__":
    app.run(debug=True)