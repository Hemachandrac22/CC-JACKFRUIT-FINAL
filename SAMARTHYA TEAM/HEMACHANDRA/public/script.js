document.addEventListener('DOMContentLoaded', () => {
    // Generate Quiz button click handler
    document.getElementById('generateBtn').addEventListener('click', async () => {
      const syllabus = document.getElementById('syllabusInput').value.trim();
      const teacherName = document.getElementById('teacherName').value.trim();
      
      if (!syllabus) {
        alert("Please paste your syllabus first.");
        return;
      }
      
      if (!teacherName) {
        alert("Please enter the teacher's name.");
        return;
      }
      
      try {
        const response = await fetch('/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ syllabus, teacherName })
        });
        
        if (!response.ok) {
          throw new Error('Server error occurred');
        }
        
        const data = await response.json();
        displayQuiz(data);
      } catch (error) {
        console.error('Error generating quiz:', error);
        document.getElementById('quizOutput').innerHTML = "<p>❌ Failed to generate quiz. Try again later.</p>";
      }
    });
    
    // Search for teacher's quizzes
    document.getElementById('searchBtn').addEventListener('click', async () => {
      const teacherName = document.getElementById('searchTeacher').value.trim();
      
      if (!teacherName) {
        alert("Please enter a teacher name to search.");
        return;
      }
      
      try {
        const response = await fetch(`/quizzes/${teacherName}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        
        const quizzes = await response.json();
        displayQuizList(quizzes);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        document.getElementById('quizList').innerHTML = "<p>❌ Failed to fetch quizzes. Try again later.</p>";
      }
    });
    
    // Function to display a quiz
    function displayQuiz(data) {
      const quizContainer = document.getElementById('quizOutput');
      
      if (data.questions && data.questions.length > 0) {
        // Save quiz ID for reference
        quizContainer.dataset.quizId = data.quizId;
        
        quizContainer.innerHTML = "<h2>📝 Generated Quiz</h2>";
        const correctSummary = [];
        
        data.questions.forEach((q, i) => {
          correctSummary.push(`Q${i + 1}: Option ${String.fromCharCode(65 + q.correctIndex)}`);
          
          const optionsHtml = q.options.map((opt, j) => `
            <label style="display: block; margin-left: 10px;">
              <input type="radio" name="q${i}" value="${j}">
              ${String.fromCharCode(65 + j)}. ${opt}
            </label>
          `).join('');
          
          quizContainer.innerHTML += `
            <div style="margin-bottom: 20px;">
              <strong>Q${i + 1}. ${q.question}</strong><br>
              ${optionsHtml}
            </div>
          `;
        });
        
        quizContainer.innerHTML += `
          <hr>
          <h3>✅ Correct Answers:</h3>
          <ul>
            ${correctSummary.map(ans => `<li>${ans}</li>`).join('')}
          </ul>
          <p>Quiz saved to database with ID: ${data.quizId}</p>
        `;
      } else {
        quizContainer.innerHTML = "<p>❌ Failed to generate quiz. Try again later.</p>";
      }
    }
    
    // Function to display list of quizzes
    function displayQuizList(quizzes) {
      const quizList = document.getElementById('quizList');
      
      if (quizzes.length === 0) {
        quizList.innerHTML = "<p>No quizzes found for this teacher.</p>";
        return;
      }
      
      quizList.innerHTML = "";
      
      quizzes.forEach(quiz => {
        const date = new Date(quiz.createdAt).toLocaleString();
        const questionCount = quiz.questions.length;
        
        const quizItem = document.createElement('div');
        quizItem.className = 'quiz-item';
        quizItem.dataset.id = quiz._id;
        
        quizItem.innerHTML = `
          <h4>Quiz created on ${date}</h4>
          <p>Teacher: ${quiz.teacherName}</p>
          <p>Questions: ${questionCount}</p>
          <button class="view-quiz-btn">View Quiz</button>
        `;
        
        quizItem.querySelector('.view-quiz-btn').addEventListener('click', async () => {
          try {
            const response = await fetch(`/quiz/${quiz._id}`);
            
            if (!response.ok) {
              throw new Error('Failed to fetch quiz');
            }
            
            const quizData = await response.json();
            
            // Format the quiz data for display
            const displayData = {
              questions: quizData.questions.map(q => {
                const options = q.options.map(o => o.text);
                const correctIndex = q.options.findIndex(o => o.isCorrect);
                return {
                  question: q.question,
                  options,
                  correctIndex
                };
              }),
              quizId: quiz._id
            };
            
            displayQuiz(displayData);
            
            // Scroll to the quiz output
            document.getElementById('quizOutput').scrollIntoView({ behavior: 'smooth' });
          } catch (error) {
            console.error('Error fetching quiz:', error);
            alert('Failed to fetch the quiz. Please try again.');
          }
        });
        
        quizList.appendChild(quizItem);
      });
    }
  });