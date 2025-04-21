**AI-Powered University Management System**

This repository contains a complete AI-Powered University Management System, composed of six microservices. Four of these microservices were developed as part of this project, 
while two were integrated from external sources to deliver a comprehensive university management experience.

**Project Structure:**

The main folder contains:
SAMARTHYA TEAM/: Includes the four AI-based microservices built by us.
KARTHIKEYA NEW/: Includes two additional microservices fetched from external sources.
docker-compose.yml: Configuration file that defines the build instructions, port numbers, and dependencies for all microservices.

Each microservice folder includes a Dockerfile for containerization.

**Microservices Overview**

**Built In-House:**
1. Intelligent Course Scheduler:

Takes user input (subjects, timings, constraints) to generate optimized class schedules.
Helps automate timetable creation based on user-defined conditions.

2. Smart Content Recommendation:

Accepts subject/topic input and provides curated, relevant study content.
Aims to reduce the time spent searching for educational material.

3. Automated Quiz Generation:

Generates quizzes from user-provided text (syllabus) on any topic.
Includes multiple-choice questions with answers, enabling learning through self-assessment.

4. Student Performance Analysis:

Analyzes various student metrics (sleep hours, attendance, grades, etc.).
Produces detailed performance reports and comparisons with peer data.

**Integrated from External Sources:**

5. Faculty Management:

Manages faculty records and permissions.
Allows roles like "HOD" to manage faculty data and privileges.

6. Event Management:

Enables faculty members to create and manage academic events.
Events are visible across faculty accounts with permission-based access.

**Docker Setup**

Each microservice is containerized using Docker. There are two types of microservices:
Flask-based services: Dockerfiles include steps to copy files, install dependencies, expose ports, and run app.py.
Node.js-based services: Dockerfiles perform similar steps, ending with the execution of server.js.

**Build & Run Instructions:**

1. Clone the github repository using "git clone https://github.com/Hemachandrac22/CC-JACKFRUIT-FINAL.git".
2. Go to the folder where you cloned the repository, then run "docker compose build".
3. Finally, run "docker compose up" in the same terminal.
