let selectedPeople = new Set();
let selectedTasks = new Set();

// Handle person button selection (multiple possible)
document.querySelectorAll("#person-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.textContent;
    if (selectedPeople.has(name)) {
      selectedPeople.delete(name);
      btn.classList.remove("selected", "peter-selected", "mimi-selected");
    } else {
      selectedPeople.add(name);
      if (name === "Peter") btn.classList.add("peter-selected");
      else if (name === "Mimi") btn.classList.add("mimi-selected");
    }
  });
});

// Handle task button selection (multiple possible)
document.querySelectorAll("#task-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.textContent;
    if (selectedTasks.has(name)) {
      selectedTasks.delete(name);
      btn.classList.remove("selected-task");
    } else {
      selectedTasks.add(name);
      btn.classList.add("selected-task");
    }
  });
});

// Handle emotional health checkboxes
document.getElementById("submit").addEventListener("click", () => {
  if (selectedPeople.size === 0 || (selectedTasks.size === 0 && !document.getElementById("other-task").value.trim() && !document.getElementById("stress").checked && !document.getElementById("conflict").checked)) {
    alert("Bitte wähle mindestens eine Person und eine Aufgabe oder gib eine andere Aufgabe an.");
    return;
  }

  const person = Array.from(selectedPeople);
  const tasks = Array.from(selectedTasks).map(task => ({
    name: task,
    category: document.querySelector(`button[data-task='${task}']`).closest(".section").dataset.category
  }));

  const data = {
    person,
    tasks,
    otherTask: document.getElementById("other-task").value,
    stress: document.getElementById("stress").checked,
    conflict: document.getElementById("conflict").checked,
    conflictDetails: document.getElementById("conflict-details").value,
    timestamp: new Date().toISOString()
  };

  fetch("https://script.google.com/macros/s/AKfycbzThbuiqM_gqasr_0HcbehS3E5iDnkdH0ZYDTWzS1ppSv_3ag4FV8nwA3-EjcT4GY8LnQ/exec", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.text())
    .then(text => {
      if (text.trim() === "Success") {
        showConfirmation();
        resetForm();
      } else {
        alert("Server Error: " + text);
      }
    })
    .catch(err => {
      alert("Fehler beim Senden: " + err.message);
      console.error(err);
    });
});

function showConfirmation() {
  const confirmation = document.getElementById("confirmation");
  confirmation.style.display = "block";
  setTimeout(() => {
    confirmation.style.display = "none";
  }, 2000);
}

function resetForm() {
  selectedPeople.clear();
  selectedTasks.clear();
  document.querySelectorAll("button").forEach(btn => btn.classList.remove("selected", "peter-selected", "mimi-selected", "selected-task"));
  document.getElementById("other-task").value = "";
  document.getElementById("stress").checked = false;
  document.getElementById("conflict").checked = false;
  document.getElementById("conflict-details").value = "";
} 
