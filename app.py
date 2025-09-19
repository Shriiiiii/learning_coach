from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

# --- Gemini API Configuration ---
API_KEY = "AIzaSyDAJq4lJMMV_yGlYprHcVmUDrO-KocsJM8"
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + API_KEY

def generate_content_from_gemini(prompt, response_schema=None):
    headers = {
        'Content-Type': 'application/json',
    }
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    if response_schema:
        payload["generationConfig"] = {
            "responseMimeType": "application/json",
            "responseSchema": response_schema
        }
    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        if 'candidates' in result and result['candidates']:
            # Return the first candidate's content
            content = result['candidates'][0]['content']['parts'][0]['text']
            try:
                return json.loads(content)
            except Exception:
                return {"concept": content, "textbook": "", "video": ""}
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error calling Gemini API: {e}")
        return None
    except json.JSONDecodeError:
        print("JSON Decode Error: Failed to parse API response.")
        return None

# --- Main Route ---
@app.route("/")
def index():
    return render_template("index.html")

# --- API Endpoints ---
@app.route("/api/generate_topic", methods=["POST"])
def generate_topic():
    data = request.get_json()
    topic = data.get("topic", "")
    if not topic:
        return jsonify({"error": "No topic provided."}), 400

    prompt = f"Provide a brief, single-paragraph explanation of the concept of '{topic}'. Also, suggest one popular textbook and one relevant video for learning this topic. The output should be a single JSON object with 'concept', 'textbook', and 'video' keys."
    schema = {
        "type": "OBJECT",
        "properties": {
            "concept": {"type": "STRING", "description": "A brief explanation of the topic."},
            "textbook": {"type": "STRING", "description": "A suggestion for a relevant textbook."},
            "video": {"type": "STRING", "description": "A link to a relevant video."}
        },
        "required": ["concept", "textbook", "video"]
    }
    explanation = generate_content_from_gemini(prompt, response_schema=schema)
    if explanation:
        return jsonify(explanation)
    else:
        return jsonify({"error": "Failed to generate topic explanation."}), 500

@app.route("/api/generate_quiz", methods=["POST"])
def generate_quiz():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided for quiz generation."}), 400

    prompt = f"Generate a single multiple-choice question (MCQ) based on the following text: '{text}'. Return a JSON object with 'question', 'options' (list), and 'answer' (the correct option)."
    schema = {
        "type": "OBJECT",
        "properties": {
            "question": {"type": "STRING", "description": "The quiz question."},
            "options": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "List of options."},
            "answer": {"type": "STRING", "description": "The correct answer."}
        },
        "required": ["question", "options", "answer"]
    }
    quiz = generate_content_from_gemini(prompt, response_schema=schema)
    if quiz:
        return jsonify(quiz)
    else:
        return jsonify({"error": "Failed to generate quiz."}), 500

@app.route("/api/upload_pdf", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Here you would process the PDF and extract summary
    # For now, just return a dummy summary
    summary = "PDF summary feature coming soon!"

    return jsonify({"summary": summary})

if __name__ == "__main__":
    if API_KEY == "YOUR_API_KEY_HERE":
        print("WARNING: API Key not set. Please replace 'YOUR_API_KEY_HERE' in app.py with your actual key.")
    app.run(debug=True)