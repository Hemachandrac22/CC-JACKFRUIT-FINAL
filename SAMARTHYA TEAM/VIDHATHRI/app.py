from flask import Flask, render_template, request, jsonify
import pymongo
import google.generativeai as genai
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId

load_dotenv()

app = Flask(__name__)

# === Gemini API Setup ===
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# === MongoDB Configuration ===
mongo_client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = mongo_client[os.getenv("DB_NAME")]
predictions_collection = db["predictions"]

# === Gemini-based AI Analysis Function ===
def generate_analysis(student_data):
    try:
        prompt = f"""
        Analyze the following student performance data:
        {student_data}
        Provide a detailed performance analysis and helpful academic insights in a friendly, easy-to-understand way.
        """

        model = genai.GenerativeModel(model_name="models/gemini-1.5-pro")
        response = model.generate_content(
            contents=[{"role": "user", "parts": [prompt]}]
        )
        return response.text
    except Exception as e:
        print("Gemini error:", e)
        return "Sorry, I couldn't generate an analysis at the moment."

# === Get Latest Student Data from MongoDB ===
def get_latest_student_data():
    return predictions_collection.find_one(sort=[("_id", pymongo.DESCENDING)])

# === Routes ===
@app.route('/')
def index():
    return render_template("index.html")

@app.route('/submit', methods=['POST'])
def submit():
    data = request.json

    # Input validation
    try:
        if not (0 <= data['avg_study_hours_per_day'] <= 24):
            return jsonify({"status": "error", "message": "Study hours must be between 0 and 24."}), 400
        if not (0 <= data['attendance_percent'] <= 100):
            return jsonify({"status": "error", "message": "Attendance must be between 0% and 100%."}), 400
        if not (0 <= data['past_exam_score_1'] <= 100):
            return jsonify({"status": "error", "message": "Past Exam Score 1 must be between 0 and 100."}), 400
        if not (0 <= data['past_exam_score_2'] <= 100):
            return jsonify({"status": "error", "message": "Past Exam Score 2 must be between 0 and 100."}), 400
        if not (0 <= data['past_exam_score_3'] <= 100):
            return jsonify({"status": "error", "message": "Past Exam Score 3 must be between 0 and 100."}), 400
        if not (0 <= data['sleep_hours_per_day'] <= 24):
            return jsonify({"status": "error", "message": "Sleep hours must be between 0 and 24."}), 400
        if not (0 <= data['internet_usage_hours'] <= 24):
            return jsonify({"status": "error", "message": "Internet usage hours must be between 0 and 24."}), 400
        if not (0 <= data['participation_score'] <= 100):
            return jsonify({"status": "error", "message": "Participation score must be between 0 and 100."}), 400
        if not (0 <= data['assignments_completed_ratio'] <= 1):
            return jsonify({"status": "error", "message": "Assignment completion ratio must be between 0 and 1."}), 400
        if not (0 <= data['extra_curricular_score'] <= 100):
            return jsonify({"status": "error", "message": "Extracurricular score must be between 0 and 100."}), 400
    except KeyError as e:
        return jsonify({"status": "error", "message": f"Missing field: {e}"}), 400

    # Insert into MongoDB if valid
    result = predictions_collection.insert_one(data)
    
    if result.inserted_id:
        return jsonify({"status": "success"})
    else:
        return jsonify({"status": "error", "message": "Failed to save data"}), 500

@app.route('/analysis', methods=['GET'])
def analysis():
    # Fetch the latest student's data
    student_data = get_latest_student_data()
    
    if not student_data:
        return jsonify({"status": "error", "message": "No student data found"}), 404
    
    # Convert ObjectId to string for JSON serialization
    student_data['_id'] = str(student_data['_id'])

    # Fetch the average of the relevant fields using MongoDB aggregation pipeline
    average_pipeline = [
        {
            "$group": {
                "_id": None,
                "avg_study_hours_per_day": {"$avg": "$avg_study_hours_per_day"},
                "attendance_percent": {"$avg": "$attendance_percent"},
                "sleep_hours_per_day": {"$avg": "$sleep_hours_per_day"},
                "internet_usage_hours": {"$avg": "$internet_usage_hours"},
                "participation_score": {"$avg": "$participation_score"},
                "assignments_completed_ratio": {"$avg": "$assignments_completed_ratio"},
                "extra_curricular_score": {"$avg": "$extra_curricular_score"}
            }
        }
    ]
    
    average_data = list(predictions_collection.aggregate(average_pipeline))
    
    if average_data:
        average_data = average_data[0]
        del average_data['_id']  # Remove the _id field from the result
    else:
        average_data = {
            "avg_study_hours_per_day": 0,
            "attendance_percent": 0,
            "sleep_hours_per_day": 0,
            "internet_usage_hours": 0,
            "participation_score": 0,
            "assignments_completed_ratio": 0,
            "extra_curricular_score": 0
        }

    # Generate AI response for this student
    ai_response = generate_analysis(student_data)

    return jsonify({
        "ai_response": ai_response,
        "student_data": student_data,
        "average_data": average_data
    })

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True, port=5003)