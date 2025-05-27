let selectedPerson = null;
let selectedTask = null;

// Personenauswahl
document.querySelectorAll("#person-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedPerson = btn.textContent;
    highlightSelection(btn, "#person-buttons button");
  });
});

// Taskauswahl
document.querySelectorAll("#task-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedTask = btn.textContent;
    highlightSelection(btn, "#task-buttons button");
  });
});

// Hervorhebung des gewählten Buttons
function highlightSelection(activeBtn, selector) {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.classList.remove("selected");
  });
  activeBtn.classList.add("selected");
}

// Absenden des Formulars
document.getElementById("submit").addEventListener("click", () => {
  if (!selectedPerson || !selectedTask) {
    alert("Please select a person and a task.");
    return;
  }

  // Werte ins versteckte Formular schreiben
  document.getElementById("form-person").value = selectedPerson;
  document.getElementById("form-task").value = selectedTask;
  document.getElementById("form-timestamp").value = new Date().toISOString();

  // Formular senden (via verstecktem iframe → umgeht CORS)
  document.getElementById("hiddenForm").submit();

  // Bestätigung anzeigen
  document.getElementById("confirmation").style.display = "block";
  setTimeout(() => {
    document.getElementById("confirmation").style.display = "none";
  }, 2000);

  // Reset
  selectedPerson = null;
  selectedTask = null;
  document.querySelectorAll("button").forEach((btn) => btn.classList.remove("selected"));
});
