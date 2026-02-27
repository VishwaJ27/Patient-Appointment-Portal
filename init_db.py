

from database import get_connection

def create_tables():
    conn = get_connection()
    cursor = conn.cursor()
    # Patients Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            full_name   VARCHAR(255) NOT NULL,
            dob         DATE         NOT NULL,
            gender      VARCHAR(50)  NOT NULL,
            blood_group VARCHAR(10)  NOT NULL,
            phone       VARCHAR(30)  NOT NULL,
            email       VARCHAR(255) NOT NULL,
            address     TEXT,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    #  Appointments Table 

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id              INT AUTO_INCREMENT PRIMARY KEY,
            appointment_id  VARCHAR(50)  UNIQUE,
            patient_id      INT          NOT NULL,
            symptoms        TEXT         NOT NULL,
            duration        VARCHAR(100) NOT NULL,
            severity        VARCHAR(50)  NOT NULL,
            conditions      TEXT,
            medications     TEXT,
            allergies       TEXT,
            department      VARCHAR(100) NOT NULL,
            doctor          VARCHAR(255),
            preferred_date  DATE         NOT NULL,
            time_slot       VARCHAR(50)  NOT NULL,
            emergency       VARCHAR(10)  NOT NULL,
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
        )
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("✅  Tables created successfully.")

if __name__ == "__main__":
    create_tables()