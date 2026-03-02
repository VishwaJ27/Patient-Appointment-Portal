# Pennilson Lifeline — Patient Appointment Portal

A hospital appointment management system built with Flask and MySQL. Patients can book appointments through a multi-step form, and hospital staff can view and manage all records through an admin dashboard.

---

## Overview

Pennilson Lifeline is a web-based appointment system with two sides:

- **Patient Form** — A 4-step form where patients submit their personal details, symptoms, and appointment preferences.
- **Admin Dashboard** — A management interface where staff can view all patients and appointments, search records, and inspect full details.

---

## Features

**Patient Form**
- 4-step form with section-by-section validation
- Live age calculator from date of birth
- Dynamic doctor list based on selected department
- Blood group selector, severity toggle, multi-select medical conditions
- Emergency flag for urgent cases
- Consent section with required checkboxes
- Unique reference number generated on submission (e.g. PL-100001)

**Admin Dashboard**
- Overview page with total patients, appointments, emergencies, and today's count
- Separate pages for Patients and Appointments
- Search and filter on every table
- Full detail modal for each appointment record

---

## Project Structure

```
pennilson_lifeline/
│
├── app.py                        # Flask application and all routes
├── database.py                   # Database connection
├── init_db.py                    # Creates database tables (run once)
│
├── templates/
│   ├── index.html                # Patient appointment form
│   └── admin/
│       ├── dashboard.html        # Admin overview page
│       ├── patients.html         # Patients list
│       └── appointments.html     # Appointments list
│
└── static/
    ├── style.css                 # Patient form styles
    ├── script.js                 # Patient form JavaScript
    └── admin/
        ├── admin.css             # Admin panel styles
        └── admin.js              # Admin panel JavaScript
```

---

## Requirements

- Python 3.8 or higher
- MySQL 8.0 or higher
- pip

---

## Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/pennilson-lifeline.git
cd pennilson-lifeline
```

**2. Install Python dependencies**

```bash
pip install flask mysql-connector-python
```

**3. Create the database**

Open your MySQL terminal and run:

```sql
CREATE DATABASE pennilson_lifeline;
```

**4. Update database credentials**

Open `database.py` and set your MySQL username and password:

```python
def get_connection():
    return mysql.connector.connect(
        host     = "localhost",
        user     = "root",
        password = "your_password",
        database = "pennilson_lifeline"
    )
```

**5. Create the tables**

```bash
python init_db.py
```

**6. Start the application**

```bash
python app.py
```

---

## Usage

Once the app is running, open your browser and go to:

```
http://127.0.0.1:5000
```

To access the admin dashboard:

```
http://127.0.0.1:5000/admin
```

---

## Pages

| URL | Description |
|---|---|
| `/` | Patient appointment form |
| `/admin` | Admin dashboard overview |
| `/admin/patients` | All registered patients |
| `/admin/appointments` | All appointments with detail view |

---

## Database

The system uses two tables.

**patients**

| Column | Type | Description |
|---|---|---|
| id | INT | Primary key, auto increment |
| full_name | VARCHAR(255) | Patient full name |
| dob | DATE | Date of birth |
| gender | VARCHAR(50) | Gender |
| blood_group | VARCHAR(10) | Blood group |
| phone | VARCHAR(30) | Phone number with country code |
| email | VARCHAR(255) | Email address |
| address | TEXT | Address (optional) |
| created_at | TIMESTAMP | Record creation time |

**appointments**

| Column | Type | Description |
|---|---|---|
| id | INT | Primary key, auto increment |
| appointment_id | VARCHAR(50) | Reference number (PL-XXXXXX) |
| patient_id | INT | Foreign key to patients table |
| symptoms | TEXT | Symptom description |
| duration | VARCHAR(100) | How long symptoms have lasted |
| severity | VARCHAR(50) | Mild, Moderate, or Severe |
| conditions | TEXT | Existing medical conditions |
| medications | TEXT | Current medications |
| allergies | TEXT | Known allergies |
| department | VARCHAR(100) | Hospital department |
| doctor | VARCHAR(255) | Preferred doctor |
| preferred_date | DATE | Requested appointment date |
| time_slot | VARCHAR(50) | Morning, Afternoon, or Evening |
| emergency | VARCHAR(10) | Yes or No |
| created_at | TIMESTAMP | Record creation time |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask |
| Database | MySQL, mysql-connector-python |
| Frontend | HTML, CSS, JavaScript |
| Fonts | Google Fonts (Cormorant Garamond, DM Sans) |

---

## Future Improvements

- Admin login and authentication
- Edit and delete appointments from the admin panel
- Export records to PDF or Excel
- Email confirmation sent to patients after booking
- Appointment status tracking (Pending, Confirmed, Completed)

---

## License

This project is open source and available under the [MIT License](LICENSE).
