let selectedPerson = null;
let selectedTask = null;

// Handle person button selection
document.querySelectorAll("#person-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedPerson = btn.textContent;
    highlightSelection(btn, "#person-buttons button");
  });
});

// Handle task button selection
document.querySelectorAll("#task-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedTask = btn.textContent;
    highlightSelection(btn, "#task-buttons button");
  });
});

// Highlight selected button
function highlightSelection(activeBtn, selector) {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.classList.remove("selected");
  });
  activeBtn.classList.add("selected");
}

// Handle submit
document.getElementById("submit").addEventListener("click", () => {
  if (!selectedPerson || !selectedTask) {
    alert("Please select a person and a task.");
    return;
  }

  const data = {
    person: selectedPerson,
    task: selectedTask,
    timestamp: new Date().toISOString()
  };

  fetch("https://script.google.com/macros/s/AKfycbzThbuiqM_gqasr_0HcbehS3E5iDnkdH0ZYDTWzS1ppSv_3ag4FV8nwA3-EjcT4GY8LnQ/exec", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(() => {
    document.getElementById("confirmation").style.display = "block";
    setTimeout(() => {
      document.getElementById("confirmation").style.display = "none";
    }, 2000);

    // Reset UI
    selectedPerson = null;
    selectedTask = null;
    document.querySelectorAll("button").forEach((btn) => btn.classList.remove("selected"));
  }).catch((err) => {
    alert("Error sending data");
    console.error(err);
  });
});
