const API_URL = "https://taskvault-backend-ktm6.onrender.com";

let tasks = [];
let editingTaskId = null;

const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const dueDateInput = document.getElementById("dueDate");
const statusInput = document.getElementById("status");
const taskList = document.getElementById("taskList");
const filterInput = document.getElementById("filter");
const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const message = document.getElementById("message");
const themeToggleBtn = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

/*
    THEME TOGGLE SYSTEM
*/

// Check saved theme or system preference
const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
  document.documentElement.setAttribute("data-theme", "dark");
  themeIcon.textContent = "☀️";
  themeText.textContent = "Light";
} else {
  document.documentElement.setAttribute("data-theme", "light");
  themeIcon.textContent = "🌙";
  themeText.textContent = "Dark";
}

themeToggleBtn.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  let newTheme = "light";

  if (currentTheme === "light") {
    newTheme = "dark";
    themeIcon.textContent = "☀️";
    themeText.textContent = "Light";
  } else {
    themeIcon.textContent = "🌙";
    themeText.textContent = "Dark";
  }

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

/*
    HELPER: FORMAT DATE (YYYY-MM-DD)
*/
function formatDate(dateString) {
  if (!dateString) return null;
  return dateString.split("T")[0];
}

/*
    SHOW MESSAGE
*/
function showMessage(text, type = "success") {
  message.textContent = text;
  message.className = `message ${type}`;

  setTimeout(() => {
    message.textContent = "";
    message.className = "";
  }, 3000);
}

/*
    LOAD TASKS
*/
async function loadTasks() {
  try {
    taskList.innerHTML = `<div class="loading">Loading tasks...</div>`;

    const response = await fetch(`${API_URL}/api/tasks`);

    if (!response.ok) {
      throw new Error("Failed to load tasks.");
    }

    const data = await response.json();

    // Parse array safely regardless of how backend structures the JSON
    if (Array.isArray(data)) {
      tasks = data;
    } else if (Array.isArray(data.tasks)) {
      tasks = data.tasks;
    } else if (Array.isArray(data.data)) {
      tasks = data.data;
    } else {
      tasks = [];
    }

    renderTasks();
  } catch (error) {
    console.error(error);
    tasks = []; // Ensure tasks remains an array on failure
    taskList.innerHTML = `<div class="empty">Could not connect to the server.</div>`;
    showMessage("Could not connect to backend.", "error");
  }
}

/*
    CREATE TASK
*/
async function createTask(taskData) {
  const response = await fetch(`${API_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create task.");
  }

  return data;
}

/*
    UPDATE TASK
*/
async function updateTaskRequest(id, taskData) {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update task.");
  }

  return data;
}

/*
    DELETE TASK
*/
async function deleteTaskRequest(id) {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete task.");
  }

  return data;
}

/*
    FORM SUBMISSION
*/
taskForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title = titleInput.value.trim();

  if (!title) {
    showMessage("Task title is required.", "error");
    return;
  }

  const taskData = {
    title,
    description: descriptionInput.value.trim(),
    status: statusInput.value,
    due_date: formatDate(dueDateInput.value),
  };

  try {
    submitButton.disabled = true;

    if (editingTaskId !== null) {
      await updateTaskRequest(editingTaskId, taskData);
      showMessage("Task updated successfully.");
    } else {
      await createTask(taskData);
      showMessage("Task created successfully.");
    }

    resetForm();
    await loadTasks();
  } catch (error) {
    console.error(error);
    showMessage(error.message, "error");
  } finally {
    submitButton.disabled = false;
  }
});

/*
    RENDER TASKS
*/
function renderTasks() {
  const filter = filterInput.value;

  let filteredTasks = tasks;

  if (filter !== "all") {
    filteredTasks = tasks.filter((task) => task.status === filter);
  }

  taskList.innerHTML = "";

  if (filteredTasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No tasks found.";
    taskList.appendChild(empty);
  } else {
    filteredTasks.forEach((task) => {
      taskList.appendChild(createTaskElement(task));
    });
  }

  updateStatistics();
}

/*
    CREATE TASK ELEMENT
*/
function createTaskElement(task) {
  const article = document.createElement("article");
  article.className = "task";

  if (task.status === "completed") {
    article.classList.add("completed");
  }

  const info = document.createElement("div");
  info.className = "task-info";

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const description = document.createElement("p");
  description.className = "task-description";
  description.textContent = task.description || "No description";

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const status = document.createElement("span");
  status.className = `badge ${task.status}`;
  status.textContent = task.status === "completed" ? "Completed" : "Pending";

  meta.appendChild(status);

  if (task.due_date) {
    const date = document.createElement("span");
    date.className = "badge date";
    date.textContent = `Due: ${formatDate(task.due_date)}`;
    meta.appendChild(date);
  }

  info.appendChild(title);
  info.appendChild(description);
  info.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const toggleButton = document.createElement("button");
  toggleButton.className = "action-btn";
  toggleButton.textContent =
    task.status === "completed" ? "Mark Pending" : "Complete";

  toggleButton.addEventListener("click", () => toggleTask(task));

  const editButton = document.createElement("button");
  editButton.className = "action-btn";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => editTask(task));

  const deleteButton = document.createElement("button");
  deleteButton.className = "action-btn delete";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  actions.appendChild(toggleButton);
  actions.appendChild(editButton);
  actions.appendChild(deleteButton);

  article.appendChild(info);
  article.appendChild(actions);

  return article;
}

/*
    TOGGLE STATUS
*/
async function toggleTask(task) {
  try {
    await updateTaskRequest(task.id, {
      title: task.title,
      description: task.description,
      status: task.status === "completed" ? "pending" : "completed",
      due_date: formatDate(task.due_date),
    });

    await loadTasks();
    showMessage("Task status updated.");
  } catch (error) {
    console.error(error);
    showMessage(error.message, "error");
  }
}

/*
    EDIT TASK
*/
function editTask(task) {
  editingTaskId = task.id;

  titleInput.value = task.title;
  descriptionInput.value = task.description || "";
  dueDateInput.value = formatDate(task.due_date) || "";
  statusInput.value = task.status;

  submitButton.textContent = "Update Task";
  cancelButton.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/*
    DELETE TASK
*/
async function deleteTask(id) {
  const confirmed = confirm("Are you sure you want to delete this task?");

  if (!confirmed) return;

  try {
    await deleteTaskRequest(id);
    await loadTasks();
    showMessage("Task deleted successfully.");
  } catch (error) {
    console.error(error);
    showMessage(error.message, "error");
  }
}

/*
    RESET FORM
*/
function resetForm() {
  taskForm.reset();
  editingTaskId = null;
  submitButton.textContent = "Add Task";
  cancelButton.classList.add("hidden");
}

cancelButton.addEventListener("click", resetForm);

/*
    FILTER
*/
filterInput.addEventListener("change", renderTasks);

/*
    STATISTICS
*/
function updateStatistics() {
  totalTasks.textContent = tasks.length;

  pendingTasks.textContent = tasks.filter(
    (task) => task.status === "pending",
  ).length;

  completedTasks.textContent = tasks.filter(
    (task) => task.status === "completed",
  ).length;
}

/*
    START APPLICATION
*/
loadTasks();
