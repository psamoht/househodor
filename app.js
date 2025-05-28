// app.js
let selectedPerson = [];
let selectedTasks = new Set(); // Speichert jetzt uniqueTaskKey (z.B. "Morgen|Smoothie")

function updateButtonStyles() {
  // Personen-Buttons (Logik von vorheriger Korrektur beibehalten)
  document.querySelectorAll("#person-buttons button").forEach((btn) => {
    const personName = btn.dataset.person;
    const cssClass = `person-${personName.toLowerCase()}`;
    if (selectedPerson.includes(personName)) {
      btn.classList.add("selected", cssClass);
    } else {
      btn.classList.remove("selected", cssClass);
    }
  });
  // Bereinigung, falls ein Button nicht mehr in selectedPerson ist, aber noch Klasse hat
  document.querySelectorAll("#person-buttons button").forEach(pBtn => {
    const pName = pBtn.dataset.person;
    const pCssClass = `person-${pName.toLowerCase()}`;
    if (!selectedPerson.includes(pName)) {
        pBtn.classList.remove("selected", pCssClass);
    }
  });


  // Task-Buttons
  document.querySelectorAll("div[data-category] button").forEach((btn) => {
    const taskText = btn.textContent;
    const category = btn.closest("div[data-category]").dataset.category;
    const uniqueTaskKey = `${category}|${taskText}`; // Eindeutiger Schlüssel

    if (selectedTasks.has(uniqueTaskKey)) {
      btn.classList.add("selected-task");
    } else {
      btn.classList.remove("selected-task");
    }
  });
}

// Person Buttons
document.querySelectorAll("#person-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.person;
    if (selectedPerson.includes(name)) {
      selectedPerson = selectedPerson.filter((n) => n !== name);
    } else {
      selectedPerson.push(name);
    }
    updateButtonStyles();
  });
});

// Task Buttons
document.querySelectorAll("div[data-category] button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const taskText = btn.textContent;
    const category = btn.closest("div[data-category]").dataset.category;
    const uniqueTaskKey = `${category}|${taskText}`; // Eindeutigen Schlüssel verwenden

    if (selectedTasks.has(uniqueTaskKey)) {
      selectedTasks.delete(uniqueTaskKey);
    } else {
      selectedTasks.add(uniqueTaskKey);
    }
    updateButtonStyles();
  });
});

// Save Button
const saveButton = document.getElementById("submit");
saveButton.addEventListener("click", () => {
  const person =
    selectedPerson.length === 2 ? "Gemeinsam" : selectedPerson[0] || "";

  const customTaskValue = document.getElementById("customTask").value.trim();

  if (!person || (selectedTasks.size === 0 && !customTaskValue)) {
    alert("Bitte wähle mindestens eine Person und eine Aufgabe aus oder gib eine benutzerdefinierte Aufgabe ein.");
    return;
  }

  const timestamp = new Date();
  const timestampStr = timestamp.toISOString(); // ISO-String ist gut für Server-Verarbeitung

  // Erledigungsdatum (bis 03:00 zählt noch zum Vortag) - wird clientseitig berechnet
  const erledigungsdatumObj = new Date(timestamp);
  if (erledigungsdatumObj.getHours() < 3) {
    erledigungsdatumObj.setDate(erledigungsdatumObj.getDate() - 1);
  }
  const erledigungsdatumStr = erledigungsdatumObj.toLocaleDateString("de-DE", { year: 'numeric', month: '2-digit', day: '2-digit' });


  const entries = [];

  // Tasks aus selectedTasks
  selectedTasks.forEach((uniqueTaskKey) => {
    const [category, taskText] = uniqueTaskKey.split('|'); // Eindeutigen Schlüssel aufteilen
    entries.push({ person, category, task: taskText, timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  });

  // Other (Custom Task)
  if (customTaskValue) {
    entries.push({ person, category: "Generell", task: customTaskValue, timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  }

  // Stress
  if (document.getElementById("stressCheckbox").checked) {
    entries.push({ person, category: "Stress", task: "Ja", timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  }

  // Streit
  const streitChecked = document.getElementById("conflictCheckbox").checked;
  const streitText = document.getElementById("conflictDetails").value.trim();
  if (streitChecked) {
    entries.push({ person: selectedPerson.length === 1 ? selectedPerson[0] : "Beide", category: "Streit", task: streitText || "Ja", timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  }

  const confirmationElement = document.getElementById("confirmation");

  // URL DEINES AKTUELL BEREITGESTELLTEN APPS SCRIPT WEBHOOKS
  const scriptURL = "https://script.google.com/macros/s/AKfycbzThbuiqM_gqasr_0HcbehS3E5iDnkdH0ZYDTWzS1ppSv_3ag4FV8nwA3-EjcT4GY8LnQ/exec";

  fetch(scriptURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entries),
  })
  .then(async (res) => {
    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json(); // Versuche, Fehlerdetails als JSON zu lesen
      } catch (e) {
        errorData = await res.text(); // Fallback zu Text, wenn nicht JSON
      }
      const errorMessage = (errorData && (errorData.message || (typeof errorData === 'string' ? errorData : res.statusText))) || `Server error ${res.status}`;
      throw new Error(errorMessage);
    }
    return res.json(); // Erwarte JSON-Antwort vom Apps Script bei Erfolg
  })
  .then((data) => {
    console.log("Apps Script Response:", data);
    confirmationElement.textContent = `✅ ${data.message || 'Task(s) processed!'}`;
    confirmationElement.style.display = "block";
    setTimeout(() => {
      confirmationElement.style.display = "none";
    }, 3000);

    selectedPerson = [];
    selectedTasks.clear();
    document.getElementById("customTask").value = "";
    document.getElementById("stressCheckbox").checked = false;
    document.getElementById("conflictCheckbox").checked = false;
    document.getElementById("conflictDetails").value = "";
    updateButtonStyles();
  })
  .catch((err) => {
    console.error("Fetch Error:", err);
    confirmationElement.textContent = `❌ Fehler beim Speichern: ${err.message}`;
    confirmationElement.style.display = "block";
    setTimeout(() => { // Fehler länger anzeigen
        confirmationElement.style.display = "none";
    }, 7000);
  });
});

// Initialen Style setzen
updateButtonStyles();
