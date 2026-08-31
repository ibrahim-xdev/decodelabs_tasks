// ============================================================
//  DATA LAYER
// ============================================================
const STORAGE_KEY = "daily_intention_data";

let state = {
  entries: [], // { date, intention, mood, reflection, rating }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.entries)) {
        state.entries = parsed.entries;
        return;
      }
    }
  } catch (_) {}
  state.entries = [];
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries: state.entries }));
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

// ============================================================
//  HELPERS
// ============================================================
function getTodayEntry() {
  const today = getToday();
  return state.entries.find((e) => e.date === today) || null;
}

function getStreak() {
  if (!state.entries.length) return 0;
  const sorted = [...state.entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  let streak = 0;
  let checkDate = new Date(getToday());
  const todayStr = getToday();
  const hasToday = state.entries.some((e) => e.date === todayStr);
  if (!hasToday) {
    const yesterday = new Date(checkDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    const hasYesterday = state.entries.some((e) => e.date === yStr);
    if (!hasYesterday) return 0;
    checkDate = yesterday;
  }
  while (true) {
    const dateStr = checkDate.toISOString().slice(0, 10);
    const hasEntry = state.entries.some((e) => e.date === dateStr);
    if (!hasEntry) break;
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
}

// ============================================================
//  RENDER
// ============================================================
function render() {
  document.getElementById("streakDisplay").textContent =
    `🔥 ${getStreak()} days`;

  const todayEntry = getTodayEntry();
  const intentionText = document.getElementById("intentionText");
  const moodSelect = document.getElementById("moodSelect");
  const reflectionText = document.getElementById("reflectionText");
  const ratingStars = document.querySelectorAll("#ratingStars span");
  const ratingHidden = document.getElementById("ratingValue");

  if (todayEntry) {
    intentionText.value = todayEntry.intention || "";
    moodSelect.value = todayEntry.mood || "😊 Happy";
    reflectionText.value = todayEntry.reflection || "";
    const rating = todayEntry.rating || 0;
    ratingHidden.value = rating;
    ratingStars.forEach((star) => {
      const val = parseInt(star.dataset.value);
      star.classList.toggle("active", val <= rating);
    });
  } else {
    intentionText.value = "";
    moodSelect.value = "😊 Happy";
    reflectionText.value = "";
    ratingHidden.value = 0;
    ratingStars.forEach((star) => star.classList.remove("active"));
  }

  const container = document.getElementById("timelineContainer");
  if (state.entries.length === 0) {
    container.innerHTML = `<div class="empty-msg">No entries yet. Start your journey today!</div>`;
    return;
  }
  const sorted = [...state.entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  let html = '<div class="timeline">';
  sorted.forEach((entry) => {
    const stars =
      "★".repeat(entry.rating || 0) + "☆".repeat(5 - (entry.rating || 0));
    const dateDisplay = entry.date;
    html += `
          <div class="entry-card">
            <div class="date">${dateDisplay}</div>
            <div class="intention">🎯 ${entry.intention || "(no intention set)"}</div>
            ${entry.reflection ? `<div class="reflection">💭 ${entry.reflection}</div>` : ""}
            <div class="meta">
              <span>${entry.mood || "😊"}</span>
              <span class="stars">${stars}</span>
            </div>
          </div>
        `;
  });
  html += "</div>";
  container.innerHTML = html;
}

// ============================================================
//  ACTIONS
// ============================================================
function saveIntention(text, mood) {
  const today = getToday();
  let entry = getTodayEntry();
  if (entry) {
    entry.intention = text;
    entry.mood = mood;
  } else {
    state.entries.push({
      date: today,
      intention: text,
      mood: mood,
      reflection: "",
      rating: 0,
    });
  }
  saveState();
  render();
  showToast("✅ Intention saved!");
}

function saveReflection(text, rating) {
  const today = getToday();
  let entry = getTodayEntry();
  if (!entry) {
    state.entries.push({
      date: today,
      intention: "",
      mood: "😊 Happy",
      reflection: text,
      rating: rating,
    });
  } else {
    entry.reflection = text;
    entry.rating = rating;
  }
  saveState();
  render();
  showToast("🌙 Reflection saved!");
}

// ============================================================
//  TOAST
// ============================================================
let toastTimer;

function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.cssText = `
          position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%) translateY(80px);
          background: #1a2a3a; color: #fff; padding: 0.6rem 1.8rem;
          border-radius: 60px; font-weight: 500; box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          opacity: 0; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 100; pointer-events: none;
        `;
    document.body.appendChild(toast);
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      toast.style.background = "#eef2f6";
      toast.style.color = "#1a2a3a";
    }
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(0)";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(80px)";
  }, 2500);
}

// ============================================================
//  EVENT BINDING & INIT
// ============================================================
function init() {
  loadState();
  render();

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      document
        .getElementById("panel-today")
        .classList.toggle("active", tab === "today");
      document
        .getElementById("panel-history")
        .classList.toggle("active", tab === "history");
    });
  });

  document.getElementById("intentionForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = document.getElementById("intentionText").value.trim();
    if (!text) {
      showToast("Please write your intention.");
      return;
    }
    const mood = document.getElementById("moodSelect").value;
    saveIntention(text, mood);
  });

  document.getElementById("reflectionForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = document.getElementById("reflectionText").value.trim();
    const rating = parseInt(document.getElementById("ratingValue").value) || 0;
    if (rating === 0) {
      showToast("Please rate your day (tap a star).");
      return;
    }
    saveReflection(text, rating);
  });

  document.querySelectorAll("#ratingStars span").forEach((star) => {
    star.addEventListener("click", () => {
      const val = parseInt(star.dataset.value);
      document.getElementById("ratingValue").value = val;
      document.querySelectorAll("#ratingStars span").forEach((s) => {
        s.classList.toggle("active", parseInt(s.dataset.value) <= val);
      });
    });
    star.addEventListener("mouseenter", () => {
      const val = parseInt(star.dataset.value);
      document.querySelectorAll("#ratingStars span").forEach((s) => {
        s.style.color = parseInt(s.dataset.value) <= val ? "#f5b342" : "";
      });
    });
    star.addEventListener("mouseleave", () => {
      document.querySelectorAll("#ratingStars span").forEach((s) => {
        s.style.color = "";
      });
    });
  });

  console.log("🌱 Daily Intention loaded!");
}

document.addEventListener("DOMContentLoaded", init);
