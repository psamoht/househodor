let selectedPerson = [];
let selectedTasks = new Set();
let emotionalData = {
  stress: false,
  streit: ""
};

// Highlight selected button
function highlightSelection(btn, groupSelector, multi = false) {
  const buttons = document.querySelectorAll(groupSelector);

  if (!multi) {
    buttons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
  } else {
    btn.classList.toggle("selected");
  }
}

// Person selection
const personButtons = document.querySelectorAll("#person-buttons button");
personButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("selected");
    const name = btn.textContent;
    if (selectedPerson.includes(name)) {
      selectedPerson = selectedPerson.filter((p) => p !== name);
    } else {
      selectedPerson.push(name);
    }
  });
});

// Task selection
const taskButtons = document.querySelectorAll("#task-buttons button");
taskButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const task = btn.getAttribute("data-task");
    if (selectedTasks.has(task)) {
      selectedTasks.delete(task);
    } else {
      selectedTasks.add(task);
    }
    highlightSelection(btn, "#task-buttons button", true);
  });
});

// Emotional Health
const stressCheckbox = document.getElementById("stress");
stressCheckbox.addEventListener("change", () => {
  emotionalData.stress = stressCheckbox.checked;
});

document.getElementById("submit").addEventListener("click", () => {
  if (selectedPerson.length === 0 || selectedTasks.size === 0) {
    alert("Please select at least one person and one task.");
    return;
  }

  const timestamp = new Date();
  const dateForSheet = new Date(timestamp);
  if (timestamp.getHours() < 3) {
    dateForSheet.setDate(dateForSheet.getDate() - 1);
  }

  const formattedTimestamp = timestamp.toLocaleString("de-DE");
  const erledigungsdatum = dateForSheet.toLocaleDateString("de-DE");
  const personField =
    selectedPerson.length === 2 ? "Gemeinsam" : selectedPerson[0];

  const rows = [];

  // Regular tasks
  selectedTasks.forEach((taskString) => {
    const [category, task] = taskString.split("|");
    rows.push([personField, category, task, formattedTimestamp, erledigungsdatum]);
  });

  // Freitext Task
  const otherTask = document.getElementById("other-task").value.trim();
  if (otherTask) {
    rows.push([
      personField,
      "Generell",
      otherTask,
      formattedTimestamp,
      erledigungsdatum
    ]);
  }

  // Stress
  if (emotionalData.stress) {
    rows.push([
      personField,
      "Stress",
      "Ja",
      formattedTimestamp,
      erledigungsdatum
    ]);
  }

  // Streit
  const streitText = document.getElementById("streit-text").value.trim();
  if (streitText) {
    rows.push([
      "Beide",
      "Streit",
      streitText,
      formattedTimestamp,
      erledigungsdatum
    ]);
  }

  // Send to Google Sheets
  fetch(
    "https://script.google.com/macros/s/AKfycbzThbuiqM_gqasr_0HcbehS3E5iDnkdH0ZYDTWzS1ppSv_3ag4FV8nwA3-EjcT4GY8LnQ/exec",
    {
      method: "POST",
      body: JSON.stringify(rows),
      headers: {
        "Content-Type": "application/json"
      }
    }
  )
    .then((res) => res.text())
    .then((text) => {
      if (text.trim() === "Success") {
        showConfirmation();
        resetAll();
      } else {
        alert("Server error: " + text);
      }
    })
    .catch((err) => {
      alert("Error sending data: " + err);
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

function resetAll() {
  selectedPerson = [];
  selectedTasks.clear();
  emotionalData = { stress: false, streit: "" };
  document.querySelectorAll(".selected").forEach((btn) => {
    btn.classList.remove("selected");
  });
  document.getElementById("other-task").value = "";
  document.getElementById("streit-text").value = "";
  document.getElementById("stress").checked = false;
}
