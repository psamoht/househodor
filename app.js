let selectedPerson = null;
let selectedTasks = [];

document.querySelectorAll("#person-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedPerson = btn.textContent;
    highlightSelection(btn, "#person-buttons button");
  });
});

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

function highlightSelection(activeBtn, selector) {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.classList.remove("selected");
  });
  activeBtn.classList.add("selected");
}

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

  if (!selectedPerson) {
    alert("Please select a person.");
    return;
  }

  const timestamp = formatTimestamp(new Date());

  let tasksToSend = [...selectedTasks];

  if (otherTask) {
    tasksToSend.push({ task: otherTask, category: "Generell" });
  }

  if (tasksToSend.length === 0) {
    alert("Please select at least one task or enter one under 'Other'.");
    return;
  }

  tasksToSend.forEach(({ task, category }) => {
    const params = new URLSearchParams();
    params.append("person", selectedPerson);
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

  // Reset
  selectedPerson = null;
  selectedTasks = [];
  document.getElementById("other-task").value = "";
  document.querySelectorAll("button").forEach((btn) => btn.classList.remove("selected"));
});
