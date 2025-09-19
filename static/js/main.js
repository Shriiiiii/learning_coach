// main.js

// When the page loads, show the first section
document.addEventListener("DOMContentLoaded", () => {
  showSection('topic');
});

// -------------------
// Sidebar Section Switching
// -------------------
function showSection(sectionId) {
  const sections = document.querySelectorAll(".section");
  sections.forEach(sec => sec.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");
}

// -------------------
// Feature 1: Topic Explorer
// -------------------
async function exploreTopic() {
  const topicInput = document.getElementById("topicInput");
  const topicResult = document.getElementById("topicResult");
  const topic = topicInput.value.trim();

  if (!topic) {
    topicResult.innerHTML = "<p style='color:red;'>⚠️ Please enter a topic.</p>";
    return;
  }

  topicResult.innerHTML = "<p>⏳ Fetching explanation...</p>";
  
  // Clear previous results from other divs
  document.getElementById("bookSuggestions").innerHTML = "";
  document.getElementById("videoSuggestions").innerHTML = "";

  try {
    let res = await fetch("/api/generate_topic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });
    let data = await res.json();

    if (data.error) {
      topicResult.innerHTML = `<p style='color:red;'>❌ ${data.error}</p>`;
      return;
    }

    // Display the generated concept
    topicResult.innerHTML = `<h3>📘 Explanation:</h3><p>${data.concept}</p>`;

    // Display suggested textbook and video
    const bookCard = document.createElement("div");
    bookCard.className = "card";
    bookCard.innerHTML = `
      <h3>📚 Suggested Textbook</h3>
      <p>${data.textbook || "Coming soon..."}</p>
    `;
    document.getElementById("bookSuggestions").appendChild(bookCard);

    const videoCard = document.createElement("div");
    videoCard.className = "card";
    videoCard.innerHTML = `
      <h3>🎥 Suggested Video</h3>
      <p><a href="${data.video || '#'}" target="_blank">${data.video || "Coming soon..."}</a></p>
    `;
    document.getElementById("videoSuggestions").appendChild(videoCard);

  } catch (err) {
    topicResult.innerHTML = `<p style='color:red;'>❌ Error: ${err.message}</p>`;
  }
}

// -------------------
// Feature 2: PDF Upload
// -------------------
async function uploadPDF() {
  const pdfInput = document.getElementById("pdfInput");
  const pdfSummary = document.getElementById("pdfSummary");
  const file = pdfInput.files[0];

  if (!file) {
    pdfSummary.innerHTML = "<p style='color:red;'>⚠️ Please select a PDF file.</p>";
    return;
  }

  pdfSummary.innerHTML = "<p>⏳ Uploading and summarizing PDF...</p>";

  let formData = new FormData();
  formData.append("file", file);

  try {
    let res = await fetch("/api/upload_pdf", {
      method: "POST",
      body: formData
    });
    let data = await res.json();

    if (data.error) {
      pdfSummary.innerHTML = `<p style='color:red;'>❌ ${data.error}</p>`;
      return;
    }

    pdfSummary.innerHTML = `<h3>📑 Summary:</h3><p>${data.summary}</p>`;
  } catch (err) {
    pdfSummary.innerHTML = `<p style='color:red;'>❌ Error: ${err.message}</p>`;
  }
}

// -------------------
// Feature 3: Quiz Generator
// -------------------
async function generateQuiz() {
  const quizInput = document.getElementById("pdfSummary"); // Using PDF summary for quiz
  const quizContainer = document.getElementById("quizContainer");
  const text = quizInput.innerText.trim();

  if (!text) {
    quizContainer.innerHTML = "<p style='color:red;'>⚠️ No text available to generate quiz.</p>";
    return;
  }

  quizContainer.innerHTML = "<p>⏳ Generating quiz...</p>";

  try {
    let res = await fetch("/api/generate_quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    let data = await res.json();

    if (data.error) {
      quizContainer.innerHTML = `<p style='color:red;'>❌ ${data.error}</p>`;
      return;
    }

    let quizHTML = `
      <h3>📝 Quiz:</h3>
      <p><b>${data.question}</b></p>
      <ul>
    `;
    data.options.forEach(opt => {
      quizHTML += `<li>${opt}</li>`;
    });
    quizHTML += `</ul>
      <p><i>(Answer: ${data.answer})</i></p>
    `;

    quizContainer.innerHTML = quizHTML;
  } catch (err) {
    quizContainer.innerHTML = `<p style='color:red;'>❌ Error: ${err.message}</p>`;
  }
}
