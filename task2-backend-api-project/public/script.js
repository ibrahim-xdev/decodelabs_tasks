const form = document.getElementById("applicationForm");
const resultBox = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: form.name.value,
    email: form.email.value,
    age: form.age.value,
    experience: form.experience.value,
    message: form.message.value,
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting";

  try {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showResult(data.message || "Something went wrong.", true);
      return;
    }

    const { id, name, status, score } = data.application;
    const badgeClass = status == "Eligible" ? "eligible" : "review";

    resultBox.classList.remove("hidden", "error");
    resultBox.innerHTML = `
    <h3>Thanks, ${escapeHtml(name)}!</h3>
      <p>Application ID: <strong>${escapeHtml(id)}</strong></p>
      <p>Score: <strong>${score}</strong></p>
      <p>Status:
        <span class="badge ${badgeClass}">${escapeHtml(status)}</span>
      </p>`;
    form.reset();
  } catch (err) {
    showResult("Could not reach the server. Please try again.", true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit application";
  }
});

function showResult(message, isError) {
  resultBox.classList.remove("hidden");
  resultBox.classList.toggle("error", !!isError);
  resultBox.innerHTML = `<p>${escapeHtml(message)}</p>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}
