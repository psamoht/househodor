let selectedPerson = null;
let selectedTask = null;
let selectedCategory = null;

document.querySelectorAll("#person-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedPerson = btn.textContent;
    highlightSelection(btn, "#person-buttons button");
  });
});

document.querySelectorAll("[data-category] button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedTask = btn.textContent;
    selectedCategory = btn.closest("[data-category]").getAttribute("data-category");
    highlightSelection(btn, "[data-category] button");
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

  let task = selectedTask;
  let category = selectedCategory;

  if (otherTask) {
    task = otherTask;
    category = "Generell";
  }

  if (!task || !category) {
    alert("Please select a task or enter one under 'Other'.");
    return;
  }

  const params = new URLSearchParams();
  params.append("person", selectedPerson);
  params.append("category", category);
  params.append("task", task);
  params.append("timestamp", formatTimestamp(new Date()));

  fetch("https://script.google.com/macros/s/AKfycbzThbuiqM_gqasr_0HcbehS3E5iDnkdH0ZYDTWzS1ppSv_3ag4FV8nwA3-EjcT4GY8LnQ/exec?" + params.toString(), {
    method: "GET",
    mode: "no-cors"
  });

  document.getElementById("confirmation").style.display = "block";
  setTimeout(() => {
    document.getElementById("confirmation").style.display = "none";
  }, 2000);

  selectedPerson = null;
  selectedTask = null;
  selectedCategory = null;
  document.getElementById("other-task").value = "";
  document.querySelectorAll("button").forEach((btn) => btn.classList.remove("selected"));
});
