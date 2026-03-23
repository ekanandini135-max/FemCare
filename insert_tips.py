import sqlite3

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

# Drop old table if exists
cursor.execute("DROP TABLE IF EXISTS reminders")

# Create correct table
cursor.execute("""
CREATE TABLE reminders(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine TEXT,
    time TEXT
)
""")

conn.commit()
conn.close()
print("Table reminders recreated successfully!")