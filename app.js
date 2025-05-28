// app.js – aktualisiert mit Buttons für "Stress" und "Streit"
let selectedPerson = [];
let selectedTasks = new Set();
let emotionalStates = new Set(); // "Stress" oder "Streit"

function updateButtonStyles() {
  // Personen-Buttons
  document.querySelectorAll("#person-buttons button").forEach((btn) => {
    const personName = btn.dataset.person;
    const cssClass = `person-${personName.toLowerCase()}`;
    if (selectedPerson.includes(personName)) {
      btn.classList.add("selected", cssClass);
    } else {
      btn.classList.remove("selected", cssClass);
    }
  });

  // Task-Buttons
  document.querySelectorAll("div[data-category] button").forEach((btn) => {
    const taskText = btn.textContent;
    const category = btn.closest("div[data-category]").dataset.category;
    const uniqueTaskKey = `${category}|${taskText}`;
    if (selectedTasks.has(uniqueTaskKey)) {
      btn.classList.add("selected-task");
    } else {
      btn.classList.remove("selected-task");
    }
  });

  // Emotional Buttons
  document.querySelectorAll("#emotional-buttons button").forEach((btn) => {
    const state = btn.dataset.state;
    if (emotionalStates.has(state)) {
      btn.classList.add("selected-task");
    } else {
      btn.classList.remove("selected-task");
    }
  });
}

// Personen-Buttons
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

// Task-Buttons
document.querySelectorAll("div[data-category] button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const taskText = btn.textContent;
    const category = btn.closest("div[data-category]").dataset.category;
    const uniqueTaskKey = `${category}|${taskText}`;
    if (selectedTasks.has(uniqueTaskKey)) {
      selectedTasks.delete(uniqueTaskKey);
    } else {
      selectedTasks.add(uniqueTaskKey);
    }
    updateButtonStyles();
  });
});

// Emotional Buttons
document.querySelectorAll("#emotional-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const state = btn.dataset.state;
    if (emotionalStates.has(state)) {
      emotionalStates.delete(state);
    } else {
      emotionalStates.add(state);
    }
    updateButtonStyles();
  });
});

const saveButton = document.getElementById("submit");
saveButton.addEventListener("click", () => {
  const person = selectedPerson.length === 2 ? "Gemeinsam" : selectedPerson[0] || "";
  const customTaskValue = document.getElementById("customTask").value.trim();

  // neue Validierung: mindestens 1 Person + (Task oder Emotional)
  if (!person || (selectedTasks.size === 0 && !customTaskValue && emotionalStates.size === 0)) {
    alert("Bitte wähle mindestens eine Person und eine Aufgabe oder einen Emotionalzustand aus.");
    return;
  }

  const timestamp = new Date();
  const timestampStr = timestamp.toISOString();
  const erledigungsdatumObj = new Date(timestamp);
  if (erledigungsdatumObj.getHours() < 3) {
    erledigungsdatumObj.setDate(erledigungsdatumObj.getDate() - 1);
  }
  const erledigungsdatumStr = erledigungsdatumObj.toLocaleDateString("de-DE", { year: 'numeric', month: '2-digit', day: '2-digit' });

  const entries = [];

  // Tasks
  selectedTasks.forEach((uniqueTaskKey) => {
    const [category, taskText] = uniqueTaskKey.split('|');
    entries.push({ person, category, task: taskText, timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  });

  // Custom Task
  if (customTaskValue) {
    entries.push({ person, category: "Generell", task: customTaskValue, timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  }

  // Emotional States
  emotionalStates.forEach((state) => {
    const taskText = state === "Streit" ? document.getElementById("conflictDetails").value.trim() || "Ja" : "Ja";
    const category = state;
    const personForState = (state === "Streit" && selectedPerson.length === 1) ? selectedPerson[0] : person;
    entries.push({ person: personForState, category, task: taskText, timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  });

  const confirmationElement = document.getElementById("confirmation");
  const scriptURL = "https://script.google.com/macros/s/AKfycbzThbuiqM_gqasr_0HcbehS3E5iDnkdH0ZYDTWzS1ppSv_3ag4FV8nwA3-EjcT4GY8LnQ/exec";

  fetch(scriptURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "data=" + encodeURIComponent(JSON.stringify(entries)),
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          errorData = await res.text();
        }
        const errorMessage = (errorData && (errorData.message || (typeof errorData === 'string' ? errorData : res.statusText))) || `Server error ${res.status}`;
        throw new Error(errorMessage);
      }
      return res.json();
    })
    .then((data) => {
      console.log("Apps Script Response:", data);
      confirmationElement.textContent = `✅ ${data.message || 'Task(s) gespeichert'}`;
      confirmationElement.style.display = "block";
      setTimeout(() => {
        confirmationElement.style.display = "none";
      }, 3000);

      selectedPerson = [];
      selectedTasks.clear();
      emotionalStates.clear();
      document.getElementById("customTask").value = "";
      document.getElementById("conflictDetails").value = "";
      updateButtonStyles();
    })
    .catch((err) => {
      console.error("Fetch Error:", err);
      confirmationElement.textContent = `❌ Fehler beim Speichern: ${err.message}`;
      confirmationElement.style.display = "block";
      setTimeout(() => {
        confirmationElement.style.display = "none";
      }, 7000);
    });
});

updateButtonStyles();
