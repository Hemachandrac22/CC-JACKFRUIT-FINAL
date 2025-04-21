document.getElementById("performanceForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const jsonData = {};

  formData.forEach((value, key) => {
    jsonData[key] = isNaN(value) ? value : parseFloat(value);
  });

  fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jsonData)
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        // Show error message from backend
        alert(`Error: ${data.message}`);
        return;
      }
      alert("Data submitted successfully!");
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      alert("Error submitting data. Please try again later.");
    });
});

document.getElementById("analyzeBtn").addEventListener("click", () => {
  fetch("/analysis")
    .then(res => res.json())
    .then(({ ai_response, student_data, average_data }) => {
      // Show AI Response
      document.getElementById("aiOutput").innerHTML = ai_response
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
        .replace(/\*(.*?)\*/g, "<em>$1</em>")             // italics
        .replace(/\n/g, "<br>");                          // line breaks

      const ctx = document.getElementById("chart").getContext("2d");

      // Destroy old chart if it exists
      if (window.myChart) {
        window.myChart.destroy();
      }

      window.myChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: [
            "Study Hours", "Attendance", "Sleep Hours", "Internet Usage",
            "Participation", "Assignments Ratio", "Extra Curricular"
          ],
          datasets: [
            {
              label: "This Student",
              data: [
                student_data.avg_study_hours_per_day,
                student_data.attendance_percent,
                student_data.sleep_hours_per_day,
                student_data.internet_usage_hours,
                student_data.participation_score,
                student_data.assignments_completed_ratio,
                student_data.extra_curricular_score
              ],
              backgroundColor: "rgba(0, 123, 255, 0.6)"
            },
            {
              label: "Average",
              data: [
                average_data.avg_study_hours_per_day,
                average_data.attendance_percent,
                average_data.sleep_hours_per_day,
                average_data.internet_usage_hours,
                average_data.participation_score,
                average_data.assignments_completed_ratio,
                average_data.extra_curricular_score
              ],
              backgroundColor: "rgba(40, 167, 69, 0.6)"
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Metric Value"
              }
            }
          }
        }
      });
    })
    .catch(err => {
      console.error("Analysis error:", err);
      alert("Error during analysis.");
    });
});