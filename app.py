from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI
import sqlite3
from datetime import datetime, timedelta
import os


# ================= APP CONFIG =================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")

app = Flask(__name__)
CORS(app)


# ================= HUGGING FACE CLIENT =================
client = OpenAI(
    api_key="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",
    base_url="https://router.huggingface.co/hf-inference/v1"
)


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


# ================= FOOD AI (DEEPSEEK) =================

@app.route("/food-ai", methods=["POST"])
def food_ai():

    symptom = request.json["symptom"]

    response = client.chat.completions.create(
        model="HuggingFaceH4/zephyr-7b-beta",
        messages=[
            {"role": "system", "content": "You are a health assistant."},
            {"role": "user", "content": f"Suggest healthy foods for: {symptom}"}
        ]
    )

    reply = response.choices[0].message.content

    return jsonify({"answer": reply})


# ================= CHATBOT (DEEPSEEK) =================

@app.route("/chat-ai", methods=["POST"])
def chat_ai():

    question = request.json["question"]

    response = client.chat.completions.create(
        model="HuggingFaceH4/zephyr-7b-beta",
        messages=[
            {"role": "system", "content": "Answer simply for teenage girls."},
            {"role": "user", "content": question}
        ]
    )

    reply = response.choices[0].message.content

    return jsonify({"answer": reply})


# ================= RUN SERVER =================

if __name__ == "__main__":
    app.run(debug=True)