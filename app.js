let selectedPerson = null;
let selectedTask = null;

document.querySelectorAll("#person-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedPerson = btn.textContent;
    highlightSelection(btn, "#person-buttons button");
  });
});

document.querySelectorAll("#task-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedTask = btn.textContent;
    highlightSelection(btn, "#task-buttons button");
  });
});

function highlightSelection(activeBtn, selector) {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.classList.remove("selected");
  });
  activeBtn.classList.add("selected");
}

document.getElementById("submit").addEventListener("click", () => {
  if (!selectedPerson || !selectedTask) {
    alert("Please select a person and a task.");
    return;
  }

  const params = new URLSearchParams();
  params.append("person", selectedPerson);
  params.append("task", selectedTask);
  params.append("timestamp", new Date().toISOString());

  fetch("https://script.google.com/macros/s/AKfycbzThbuiqM_gqasr_0HcbehS3E5iDnkdH0ZYDTWzS1ppSv_3ag4FV8nwA3-EjcT4GY8LnQ/exec", {
    method: "GET",
    mode: "no-cors" // 👉 unterdrückt CORS-Fehler, ist für Google Apps Script okay
  });

  // Zeige sofort Bestätigung (da keine Antwort kommt im no-cors-Modus)
  document.getElementById("confirmation").style.display = "block";
  setTimeout(() => {
    document.getElementById("confirmation").style.display = "none";
  }, 2000);

  selectedPerson = null;
  selectedTask = null;
  document.querySelectorAll("button").forEach((btn) => btn.classList.remove("selected"));
});
