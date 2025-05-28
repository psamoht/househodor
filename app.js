// ✅ Aktualisierte app.js mit Emotional Health, Duplikatschutz-Unterstützung, Nachtmodus-kompatibel

let selectedPeople = [];
let selectedTasks = [];

// Personenauswahl (Mehrfach möglich)
document.querySelectorAll("#person-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("selected");

    const name = btn.textContent;
    const index = selectedPeople.indexOf(name);

    if (index >= 0) {
      selectedPeople.splice(index, 1);
    } else {
      selectedPeople.push(name);
    }
  });
});

// Taskauswahl (Mehrfachauswahl)
document.querySelectorAll("[data-category] button").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("selected");

    const task = btn.textContent;
    const category = btn.closest("[data-category]").getAttribute("data-category");

    const index = selectedTasks.findIndex(t => t.task === task && t.category === category);
    if (index >= 0) {
      selectedTasks.splice(index, 1);
    } else {
      selectedTasks.push({ task, category });
    }
  });
});

function formatTimestamp(date) {
  const pad = (n) => (n < 10 ? "0" + n : n);
  return (
    pad(date.getDate()) + "." +
    pad(date.getMonth() + 1) + "." +
    date.getFullYear() + " " +
    pad(date.getHours()) + ":" +
    pad(date.getMinutes()) + ":" +
    pad(date.getSeconds())
  );
}

document.getElementById("submit").addEventListener("click", () => {
  const otherTask = document.getElementById("other-task").value.trim();
  const stressChecked = document.getElementById("stress-check").checked;
  const streitChecked = document.getElementById("streit-check").checked;
  const streitText = document.getElementById("streit-text").value.trim();

  if (selectedPeople.length === 0) {
    alert("Bitte eine Person auswählen.");
    return;
  }

  const timestamp = formatTimestamp(new Date());
  const personField = selectedPeople.length === 2 ? "Gemeinsam" : selectedPeople[0];

  let tasksToSend = [...selectedTasks];

  if (otherTask) {
    tasksToSend.push({ task: otherTask, category: "Generell" });
  }

  if (stressChecked) {
    tasksToSend.push({ task: "Ja", category: "Stress", forcePerson: personField });
  }

  if (streitChecked && streitText) {
    tasksToSend.push({ task: streitText, category: "Streit", forcePerson: "Beide" });
  }

  if (tasksToSend.length === 0) {
    alert("Bitte mindestens eine Aufgabe auswählen oder eingeben.");
    return;
  }

  tasksToSend.forEach(({ task, category, forcePerson }) => {
    const params = new URLSearchParams();
    params.append("person", forcePerson || personField);
    params.append("category", category);
    params.append("task", task);
    params.append("timestamp", timestamp);

    fetch("https://script.google.com/macros/s/AKfycbzThbuiqM_gqasr_0HcbehS3E5iDnkdH0ZYDTWzS1ppSv_3ag4FV8nwA3-EjcT4GY8LnQ/exec?" + params.toString(), {
      method: "GET",
      mode: "no-cors"
    });
  });

  document.getElementById("confirmation").style.display = "block";
  setTimeout(() => {
    document.getElementById("confirmation").style.display = "none";
  }, 2000);

  selectedPeople = [];
  selectedTasks = [];
  document.getElementById("other-task").value = "";
  document.getElementById("stress-check").checked = false;
  document.getElementById("streit-check").checked = false;
  document.getElementById("streit-text").value = "";

  document.querySelectorAll("button").forEach((btn) => btn.classList.remove("selected"));
});
