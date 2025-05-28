// app.js
let selectedPerson = [];
let selectedTasks = new Set();

function updateButtonStyles() {
  // Personen-Buttons
  document.querySelectorAll("#person-buttons button").forEach((btn) => {
    const personName = btn.dataset.person.toLowerCase(); // Verwende data-person für die Klasse
    if (selectedPerson.includes(btn.dataset.person)) {
      btn.classList.add("selected", `person-${personName}`); // z.B. person-peter
    } else {
      btn.classList.remove("selected", `person-${personName}`);
      // Stelle sicher, dass alle Personenklassen entfernt werden, falls mehrere möglich wären
      // Da hier nur eine Person pro Button, ist dies spezifisch genug.
      // Falls ein Button für "Gemeinsam" existieren würde, bräuchte es eine andere Logik.
      // Die aktuelle Logik entfernt "peter" und "mimi" explizit beim Deselektieren,
      // was okay ist, solange es nur diese zwei gibt. Besser ist es, die spezifische Klasse zu entfernen.
      document.querySelectorAll("#person-buttons button").forEach(pBtn => {
          pBtn.classList.remove(`person-${pBtn.dataset.person.toLowerCase()}`);
          if (selectedPerson.includes(pBtn.dataset.person)) {
              pBtn.classList.add("selected", `person-${pBtn.dataset.person.toLowerCase()}`);
          } else {
              pBtn.classList.remove("selected");
          }
      });
    }
  });

  // Task-Buttons
  document.querySelectorAll("div[data-category] button").forEach((btn) => { // *** KORRIGIERTER SELEKTOR ***
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
    const name = btn.dataset.person; // Verwende data-person Attribut
    if (selectedPerson.includes(name)) {
      selectedPerson = selectedPerson.filter((n) => n !== name);
    } else {
      selectedPerson.push(name);
    }
    updateButtonStyles();
  });
});

// Task Buttons
document.querySelectorAll("div[data-category] button").forEach((btn) => { // *** KORRIGIERTER SELEKTOR ***
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

  const customTaskValue = document.getElementById("customTask").value.trim(); // *** KORRIGIERTE ID ***

  if (!person || (selectedTasks.size === 0 && !customTaskValue)) {
    alert("Bitte wähle mindestens eine Person und eine Aufgabe aus oder gib eine benutzerdefinierte Aufgabe ein.");
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
  selectedTasks.forEach((taskText) => {
    let category = "Generell"; // Standardkategorie
    // Finde den Button, um die Kategorie zu bestimmen
    document.querySelectorAll("div[data-category] button").forEach(btn => {
      if (btn.textContent === taskText) {
        const parentGrid = btn.closest("div[data-category]");
        if (parentGrid) {
          category = parentGrid.dataset.category;
        }
      }
    });
    entries.push({ person, category, task: taskText, timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  });

  // Other (Custom Task)
  if (customTaskValue) { // *** Verwendet korrigierte Variable ***
    entries.push({ person, category: "Generell", task: customTaskValue, timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  }

  // Stress
  if (document.getElementById("stressCheckbox").checked) { // *** KORRIGIERTE ID ***
    entries.push({ person, category: "Stress", task: "Ja", timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  }

  // Streit
  const streitChecked = document.getElementById("conflictCheckbox").checked; // *** KORRIGIERTE ID ***
  const streitText = document.getElementById("conflictDetails").value.trim(); // *** KORRIGIERTE ID ***
  if (streitChecked) { // Streit wird auch ohne Details gespeichert, falls die Checkbox aktiv ist
    entries.push({ person: selectedPerson.length === 1 ? selectedPerson[0] : "Beide", category: "Streit", task: streitText || "Ja", timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  }

  // Send to Apps Script
  fetch("https://script.google.com/macros/s/AKfycbzThbuiqM_gqasr_0HcbehS3E5iDnkdH0ZYDTWzS1ppSv_3ag4FV8nwA3-EjcT4GY8LnQ/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entries),
  })
    .then((res) => {
        if (!res.ok) {
            // Wenn der Server einen Fehlerstatus zurückgibt (z.B. 4xx, 5xx)
            return res.text().then(text => { throw new Error("Server-Antwort: " + res.status + " " + text) });
        }
        return res.text();
    })
    .then((textResponse) => {
      console.log("Apps Script Response:", textResponse); // Log für Debugging
      document.getElementById("confirmation").style.display = "block";
      setTimeout(() => {
        document.getElementById("confirmation").style.display = "none";
      }, 2000);

      selectedPerson = [];
      selectedTasks.clear();
      document.getElementById("customTask").value = ""; // *** KORRIGIERTE ID ***
      document.getElementById("stressCheckbox").checked = false; // *** KORRIGIERTE ID ***
      document.getElementById("conflictCheckbox").checked = false; // *** KORRIGIERTE ID ***
      document.getElementById("conflictDetails").value = ""; // *** KORRIGIERTE ID ***
      updateButtonStyles();
    })
    .catch((err) => {
      alert("Fehler beim Speichern: " + err.message);
      console.error("Fetch Error:", err);
    });
});

// Initialen Style setzen, falls notwendig (z.B. wenn Werte aus LocalStorage geladen werden)
updateButtonStyles();
