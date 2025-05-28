let selectedPerson = [];
let selectedTasks = new Set();

function updateButtonStyles() {
  document.querySelectorAll("#person-buttons button").forEach((btn) => {
    const personName = btn.dataset.person;
    const cssClass = `person-${personName.toLowerCase()}`;
    if (selectedPerson.includes(personName)) {
      btn.classList.add("selected", cssClass);
    } else {
      btn.classList.remove("selected", cssClass);
    }
  });

  document.querySelectorAll("#person-buttons button").forEach(pBtn => {
    const pName = pBtn.dataset.person;
    const pCssClass = `person-${pName.toLowerCase()}`;
    if (!selectedPerson.includes(pName)) {
      pBtn.classList.remove("selected", pCssClass);
    }
  });

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
}

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
  const timestampStr = timestamp.toISOString();
  const erledigungsdatumObj = new Date(timestamp);
  if (erledigungsdatumObj.getHours() < 3) {
    erledigungsdatumObj.setDate(erledigungsdatumObj.getDate() - 1);
  }
  const erledigungsdatumStr = erledigungsdatumObj.toLocaleDateString("de-DE", { year: 'numeric', month: '2-digit', day: '2-digit' });

  const entries = [];

  selectedTasks.forEach((uniqueTaskKey) => {
    const [category, taskText] = uniqueTaskKey.split('|');
    entries.push({ person, category, task: taskText, timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  });

  if (customTaskValue) {
    entries.push({ person, category: "Generell", task: customTaskValue, timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  }

  if (document.getElementById("stressCheckbox").checked) {
    entries.push({ person, category: "Stress", task: "Ja", timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  }

  const streitChecked = document.getElementById("conflictCheckbox").checked;
  const streitText = document.getElementById("conflictDetails").value.trim();
  if (streitChecked) {
    entries.push({ person: selectedPerson.length === 1 ? selectedPerson[0] : "Beide", category: "Streit", task: streitText || "Ja", timestamp: timestampStr, erledigungsdatum: erledigungsdatumStr });
  }

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
      setTimeout(() => {
        confirmationElement.style.display = "none";
      }, 7000);
    });
});

updateButtonStyles();
