from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
from datetime import datetime, timedelta
import os
import requests


# ================= APP CONFIG =================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")

app = Flask(__name__)
CORS(app)

# ================= HUGGINGFACE API CONFIG =================

HF_API_KEY = ""

API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-base"

headers = {
    "Authorization": f"Bearer {HF_API_KEY}"
}


def query_ai(prompt):
    response = requests.post(
        API_URL,
        headers=headers,
        json={"inputs": prompt}
    )

    try:
        return response.json()[0]["generated_text"]
    except:
        return "Sorry, AI service is temporarily unavailable."


# ================= FRONTEND ROUTES =================

@app.route("/")
def serve_home():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/style.css")
def serve_css():
    return send_from_directory(FRONTEND_DIR, "style.css")


@app.route("/script.js")
def serve_js():
    return send_from_directory(FRONTEND_DIR, "script.js")


# ================= PERIOD TRACKER =================

@app.route("/save-period", methods=["POST"])
def save_period():

    data = request.json
    date = data["date"]
    cycle = int(data["cycle"])

    next_date = datetime.strptime(date, "%Y-%m-%d") + timedelta(days=cycle)

    return jsonify({
        "message": f"Next period expected on {next_date.date()}"
    })


# ================= MEDICINE REMINDER =================

@app.route("/save-reminder", methods=["POST"])
def save_reminder():

    data = request.json
    medicine = data["medicine"]
    time = data["time"]

    db_path = os.path.join(BASE_DIR, "database.db")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reminders(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medicine TEXT,
        time TEXT
    )
    """)

    cursor.execute(
        "INSERT INTO reminders(medicine,time) VALUES (?,?)",
        (medicine, time)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Reminder saved successfully"})


# ================= FOOD AI =================

@app.route("/food-ai", methods=["POST"])
def food_ai():

    symptom = request.json["symptom"]

    prompt = f"Suggest healthy foods for {symptom} for teenage girls."

    reply = query_ai(prompt)

    return jsonify({"answer": reply})


# ================= CHATBOT AI =================

@app.route("/chat-ai", methods=["POST"])
def chat_ai():

    question = request.json["question"]

    prompt = f"Answer simply for teenage girls: {question}"

    reply = query_ai(prompt)

    return jsonify({"answer": reply})


# ================= RUN SERVER =================

if __name__ == "__main__":
    app.run(debug=True)