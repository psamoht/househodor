let selectedPerson = null;
let selectedTask = null;

document.querySelectorAll("#person-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedPerson = btn.textContent;
    highlightSelection(btn, "#person-buttons button");
  });
});

document.querySelectorAll("#task-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedTask = btn.textContent;
    highlightSelection(btn, "#task-buttons button");
  });
});

function highlightSelection(activeBtn, selector) {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.classList.remove("selected");
  });
  activeBtn.classList.add("selected");
}

document.getElementById("submit").addEventListener("click", () => {
  if (!selectedPerson || !selectedTask) {
    alert("Please select a person and a task.");
    return;
  }

  const form = document.getElementById("hiddenForm");
  document.getElementById("form-person").value = selectedPerson;
  document.getElementById("form-task").value = selectedTask;
  document.getElementById("form-timestamp").value = new Date().toISOString();

  const iframe = document.getElementById("hiddenIframe");

  // Trick: neuer iframe, um Load sicher abzufangen
  const tempIframe = iframe.cloneNode();
  iframe.replaceWith(tempIframe);

  tempIframe.onload = () => {
    document.getElementById("confirmation").style.display = "block";
    setTimeout(() => {
      document.getElementById("confirmation").style.display = "none";
    }, 2000);

    selectedPerson = null;
    selectedTask = null;
    document.querySelectorAll("button").forEach((btn) => btn.classList.remove("selected"));
  };

  form.target = tempIframe.name;
  form.submit();
});
