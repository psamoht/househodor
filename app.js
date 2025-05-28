// app.js
let selectedPerson = [];
let selectedTasks = new Set();

function updateButtonStyles() {
  // Personen-Buttons
  document.querySelectorAll("#person-buttons button").forEach((btn) => {
    if (selectedPerson.includes(btn.textContent)) {
      btn.classList.add("selected", btn.textContent.toLowerCase());
    } else {
      btn.classList.remove("selected", "peter", "mimi");
    }
  });

  // Task-Buttons
  document.querySelectorAll("#task-buttons button").forEach((btn) => {
    if (selectedTasks.has(btn.textContent)) {
      btn.classList.add("selected-task");
    } else {
      btn.classList.remove("selected-task");
    }
  });
}

// Person Buttons
document.querySelectorAll("#person-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.textContent;
    if (selectedPerson.includes(name)) {
      selectedPerson = selectedPerson.filter((n) => n !== name);
    } else {
      selectedPerson.push(name);
    }
    updateButtonStyles();
  });
});

// Task Buttons
document.querySelectorAll("#task-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const task = btn.textContent;
    if (selectedTasks.has(task)) {
      selectedTasks.delete(task);
    } else {
      selectedTasks.add(task);
    }
    updateButtonStyles();
  });
});

// Save Button
const saveButton = document.getElementById("submit");
saveButton.addEventListener("click", () => {
  const person =
    selectedPerson.length === 2 ? "Gemeinsam" : selectedPerson[0] || "";

  if (!person || selectedTasks.size === 0) {
    alert("Bitte wähle mindestens eine Person und eine Aufgabe aus.");
    return;
  }

  const timestamp = new Date();
  const timestampStr = timestamp.toISOString();

  // Erledigungsdatum (bis 03:00 zählt noch zum Vortag)
  const erledigungsdatum = new Date(timestamp);
  if (erledigungsdatum.getHours() < 3) {
    erledigungsdatum.setDate(erledigungsdatum.getDate() - 1);
  }
  const erledigungsdatumStr = erledigungsdatum.toLocaleDateString("de-DE");

  const entries = [];

  // Tasks
  selectedTasks.forEach((task) => {
    const category = document.querySelector(
      `#task-buttons button[value='${task}']`
    )?.dataset.category || "Generell";
    entries.push({ person, category, task, timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  });

  // Other
  const other = document.getElementById("other-task").value.trim();
  if (other) {
    entries.push({ person, category: "Generell", task: other, timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  }

  // Stress
  if (document.getElementById("stress-check").checked) {
    entries.push({ person, category: "Stress", task: "Ja", timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  }

  // Streit
  const streit = document.getElementById("streit-check").checked;
  const streitText = document.getElementById("streit-text").value.trim();
  if (streit && streitText) {
    entries.push({ person: "Beide", category: "Streit", task: streitText, timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  }

  // Send to Apps Script
  fetch("https://script.google.com/macros/s/AKfycbzThbuiqM_gqasr_0HcbehS3E5iDnkdH0ZYDTWzS1ppSv_3ag4FV8nwA3-EjcT4GY8LnQ/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entries),
  })
    .then((res) => res.text())
    .then(() => {
      document.getElementById("confirmation").style.display = "block";
      setTimeout(() => {
        document.getElementById("confirmation").style.display = "none";
      }, 2000);

      selectedPerson = [];
      selectedTasks.clear();
      document.getElementById("other-task").value = "";
      document.getElementById("stress-check").checked = false;
      document.getElementById("streit-check").checked = false;
      document.getElementById("streit-text").value = "";
      updateButtonStyles();
    })
    .catch((err) => {
      alert("Fehler beim Speichern: " + err.message);
    });
});
