# student-performance-analysis
Analyse student performance based on the previous examination results and other factors like sleep duration and internet usage.

## Features
-  **Student Performance Entry**: Input academic and lifestyle metrics like study hours, sleep, attendance, etc.
-  **AI Feedback (Gemini)**: Automatically generates friendly, personalized insights based on performance.
-  **Data Visualization**: Compare an individual student's metrics against the average of all students.
-  **MySQL Integration**: Stores performance entries in a structured database.
-  **.env Configuration**: Securely stores sensitive keys and credentials.

## Tech Stack  
- Frontend :  HTML, CSS, JS, Chart.js
- Backend : Python (Flask), Flask REST API
- AI & DB : Gemini API (Google), MySQL

## Installation
1. **Clone the repository:**
git clone https://github.com/vvidha3/student-performance-analysis.git
cd student-performance-analysis

2. **Install dependencies:**
pip install -r requirements.txt

3. **Create .env file:**
GEMINI_API_KEY=your_gemini_api_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_analytics

4. **Set up MySQL database:**
CREATE DATABASE student_analytics;
USE student_analytics;
CREATE TABLE predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    avg_study_hours_per_day FLOAT,
    attendance_percent FLOAT,
    past_exam_score_1 FLOAT,
    past_exam_score_2 FLOAT,
    past_exam_score_3 FLOAT,
    sleep_hours_per_day FLOAT,
    internet_usage_hours FLOAT,
    participation_score FLOAT,
    assignments_completed_ratio FLOAT,
    extra_curricular_score FLOAT,
    predicted_grade VARCHAR(5)
);

5. **Run the app:**
python app.py
