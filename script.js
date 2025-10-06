(() => {
  const STORAGE_KEY = "scheduleEntries";
  const numberFormatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const form = document.getElementById("schedule-form");
  const clearAllButton = document.getElementById("clear-all");
  const tableBody = document.querySelector("#schedule-table tbody");
  const hoursTableBody = document.querySelector("#hours-table tbody");
  const emptyState = document.getElementById("empty-state");
  const hoursEmptyState = document.getElementById("hours-empty-state");
  const scheduleRowTemplate = document.getElementById("schedule-row-template");
  const hoursRowTemplate = document.getElementById("hours-row-template");

  let scheduleEntries = loadSchedule();
  render();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const instructor = formData.get("instructor").trim();
    const className = formData.get("className").trim();
    const durationRaw = formData.get("duration");
    const room = formData.get("room").trim();

    clearErrors();

    const errors = {};
    if (!instructor) {
      errors.instructor = "Instructor name is required.";
    }
    if (!className) {
      errors.className = "Class name is required.";
    }

    const duration = Number.parseFloat(durationRaw);
    if (!Number.isFinite(duration) || duration <= 0) {
      errors.duration = "Duration must be a positive number.";
    }

    if (!room) {
      errors.room = "Room is required.";
    }

    if (Object.keys(errors).length > 0) {
      displayErrors(errors);
      return;
    }

    scheduleEntries.push({
      id: crypto.randomUUID(),
      instructor,
      className,
      duration,
      room,
    });

    saveSchedule();
    render();
    form.reset();
    form.elements["instructor"].focus();
  });

  clearAllButton.addEventListener("click", () => {
    if (scheduleEntries.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "This will remove all scheduled sessions. Do you want to continue?"
    );

    if (!confirmed) {
      return;
    }

    scheduleEntries = [];
    saveSchedule();
    render();
  });

  tableBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='delete']");
    if (!button) {
      return;
    }

    const row = button.closest("tr");
    const { id } = row.dataset;

    scheduleEntries = scheduleEntries.filter((entry) => entry.id !== id);
    saveSchedule();
    render();
  });

  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      const errorElement = form.querySelector(
        `.error[data-error-for="${input.name}"]`
      );
      if (errorElement && errorElement.textContent) {
        errorElement.textContent = "";
      }
    });
  });

  function render() {
    renderScheduleTable();
    renderInstructorHours();
  }

  function renderScheduleTable() {
    tableBody.innerHTML = "";

    if (scheduleEntries.length === 0) {
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    scheduleEntries.forEach((entry) => {
      const row = scheduleRowTemplate.content
        .firstElementChild.cloneNode(true);

      row.dataset.id = entry.id;
      row.querySelector('[data-field="instructor"]').textContent =
        entry.instructor;
      row.querySelector('[data-field="className"]').textContent =
        entry.className;
      row.querySelector('[data-field="duration"]').textContent =
        numberFormatter.format(entry.duration);
      row.querySelector('[data-field="room"]').textContent = entry.room;

      tableBody.appendChild(row);
    });
  }

  function renderInstructorHours() {
    hoursTableBody.innerHTML = "";

    if (scheduleEntries.length === 0) {
      hoursEmptyState.hidden = false;
      return;
    }

    hoursEmptyState.hidden = true;

    const totals = scheduleEntries.reduce((acc, entry) => {
      const key = entry.instructor.toLowerCase();
      const displayName = entry.instructor;
      if (!acc[key]) {
        acc[key] = { instructor: displayName, total: 0 };
      }
      acc[key].total += entry.duration;
      return acc;
    }, {});

    const sortedTotals = Object.values(totals).sort((a, b) =>
      a.instructor.localeCompare(b.instructor, undefined, { sensitivity: "base" })
    );

    sortedTotals.forEach((item) => {
      const row = hoursRowTemplate.content
        .firstElementChild.cloneNode(true);
      row.querySelector('[data-field="instructor"]').textContent =
        item.instructor;
      row.querySelector('[data-field="total"]').textContent =
        numberFormatter.format(item.total);
      hoursTableBody.appendChild(row);
    });
  }

  function clearErrors() {
    form.querySelectorAll(".error").forEach((el) => {
      el.textContent = "";
    });
  }

  function displayErrors(errors) {
    Object.entries(errors).forEach(([field, message]) => {
      const errorElement = form.querySelector(
        `.error[data-error-for="${field}"]`
      );
      if (errorElement) {
        errorElement.textContent = message;
      }
    });
  }

  function loadSchedule() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(isValidEntry);
    } catch (error) {
      console.warn("Unable to load schedule from storage", error);
      return [];
    }
  }

  function saveSchedule() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduleEntries));
  }

  function isValidEntry(candidate) {
    if (typeof candidate !== "object" || candidate === null) {
      return false;
    }
    const { id, instructor, className, duration, room } = candidate;
    return (
      typeof id === "string" &&
      typeof instructor === "string" &&
      typeof className === "string" &&
      typeof room === "string" &&
      typeof duration === "number" &&
      Number.isFinite(duration)
    );
  }
})();
