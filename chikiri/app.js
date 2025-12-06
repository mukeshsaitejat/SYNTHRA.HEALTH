const LS_PATIENTS = "synthra_patients";
const LS_APPOINTMENTS = "synthra_appointments";
const LS_HOSPITALS = "synthra_hospitals";
const LS_REVIEWS = "synthra_reviews";
const LS_HOSPITAL_USERS = "synthra_hospital_users"; 
const LS_CURRENT_USER = "synthra_current_hospital_user";

const getJSON = (k, fallback) => {
  const raw = localStorage.getItem(k);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};
const setJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const loginScreen = document.getElementById("login-screen");
const adminScreen = document.getElementById("admin-screen");
const hospitalScreen = document.getElementById("hospital-screen");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginAlert = document.getElementById("login-alert");
const btnLogin = document.getElementById("btn-login");

const btnLogoutAdmin = document.getElementById("btn-logout-admin");
const adminAlert = document.getElementById("admin-alert");
const adminHospitalList = document.getElementById("admin-hospital-list");

const hNameInput = document.getElementById("h-name");
const hCityInput = document.getElementById("h-city");
const hAddressInput = document.getElementById("h-address");
const hDepartmentsInput = document.getElementById("h-departments");
const hEmailInput = document.getElementById("h-email");
const hPasswordInput = document.getElementById("h-password");
const btnCreateHospital = document.getElementById("btn-create-hospital");

const btnLogoutHospital = document.getElementById("btn-logout-hospital");
const hospitalNameEl = document.getElementById("hospital-name");
const hospitalMetaEl = document.getElementById("hospital-meta");
const statsBox = document.getElementById("hospital-stats");
const statUpcoming = document.getElementById("stat-upcoming");
const statPending = document.getElementById("stat-pending");
const statCompleted = document.getElementById("stat-completed");
const apptListEl = document.getElementById("hospital-appointments");
const reviewsEl = document.getElementById("hospital-reviews");

(function initHospitals() {
  let hospitals = getJSON(LS_HOSPITALS, null);
  if (!hospitals || !Array.isArray(hospitals) || hospitals.length === 0) {
    hospitals = [
      {
        id: "h1",
        name: "Nellore Multi Speciality Hospital",
        city: "Nellore",
        address: "Magunta Layout",
        departments: ["General Medicine", "Cardiology", "Orthopedics"],
      },
      {
        id: "h2",
        name: "Bhimavaram Super Care Hospital",
        city: "Bhimavaram",
        address: "Main Road",
        departments: ["Pediatrics", "Gynecology", "Neurology"],
      },
      {
        id: "h3",
        name: "Vizag Coastal Care Hospital",
        city: "Visakhapatnam",
        address: "Beach Road",
        departments: ["Dermatology", "ENT", "General Surgery"],
      },
    ];
    setJSON(LS_HOSPITALS, hospitals);
  }
})();


(function initUsers() {
  let users = getJSON(LS_HOSPITAL_USERS, []);
  if (users.length === 0) {
    users = [
      {
        id: "u-admin",
        role: "admin",
        email: "admin@synthra.com",
        password: "admin123",
      },
      { id: "u-h1", role: "hospital", hospitalId: "h1", email: "h1@synthra.com", password: "1234" },
      { id: "u-h2", role: "hospital", hospitalId: "h2", email: "h2@synthra.com", password: "1234" },
      { id: "u-h3", role: "hospital", hospitalId: "h3", email: "h3@synthra.com", password: "1234" },
    ];
    setJSON(LS_HOSPITAL_USERS, users);
  }
})();

function showLogin() {
  loginScreen.classList.remove("hidden");
  adminScreen.classList.add("hidden");
  hospitalScreen.classList.add("hidden");
  if (loginAlert) {
    loginAlert.classList.add("hidden");
    loginAlert.textContent = "";
  }
}

function showAdmin() {
  loginScreen.classList.add("hidden");
  adminScreen.classList.remove("hidden");
  hospitalScreen.classList.add("hidden");
  renderAdminHospitalList();
}

function showHospitalDashboard(user) {
  loginScreen.classList.add("hidden");
  adminScreen.classList.add("hidden");
  hospitalScreen.classList.remove("hidden");
  renderHospitalDashboard(user.hospitalId);
}

function setLoginAlert(msg) {
  if (!loginAlert) return;
  if (!msg) {
    loginAlert.classList.add("hidden");
    loginAlert.textContent = "";
    return;
  }
  loginAlert.textContent = msg;
  loginAlert.classList.remove("hidden");
}

function setAdminAlert(msg, type = "error") {
  if (!adminAlert) return;
  if (!msg) {
    adminAlert.classList.add("hidden");
    adminAlert.textContent = "";
    return;
  }
  adminAlert.textContent = msg;
  adminAlert.classList.remove("hidden");
}

btnLogin?.addEventListener("click", () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    setLoginAlert("Enter email and password.");
    return;
  }

  const users = getJSON(LS_HOSPITAL_USERS, []);
  const found = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!found) {
    setLoginAlert("Invalid credentials.");
    return;
  }

  setJSON(LS_CURRENT_USER, found);
  setLoginAlert("");

  if (found.role === "admin") showAdmin();
  else showHospitalDashboard(found);
});


btnLogoutAdmin?.addEventListener("click", () => {
  localStorage.removeItem(LS_CURRENT_USER);
  showLogin();
});

btnLogoutHospital?.addEventListener("click", () => {
  localStorage.removeItem(LS_CURRENT_USER);
  showLogin();
});


btnCreateHospital?.addEventListener("click", () => {
  const name = hNameInput.value.trim();
  const city = hCityInput.value.trim();
  const address = hAddressInput.value.trim();
  const departmentsRaw = hDepartmentsInput.value.trim();
  const email = hEmailInput.value.trim();
  const password = hPasswordInput.value.trim();

  if (!name || !city || !email || !password) {
    setAdminAlert("Name, city, email and password are required.");
    return;
  }

  const users = getJSON(LS_HOSPITAL_USERS, []);
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    setAdminAlert("This email is already used for another account.");
    return;
  }

  const hospitals = getJSON(LS_HOSPITALS, []);
  const id = "h" + Date.now();

  const departments = departmentsRaw
    ? departmentsRaw.split(",").map((d) => d.trim()).filter(Boolean)
    : [];

  const newHospital = { id, name, city, address, departments };
  hospitals.push(newHospital);
  setJSON(LS_HOSPITALS, hospitals);

  const newUser = {
    id: "u-" + id,
    role: "hospital",
    hospitalId: id,
    email,
    password,
  };
  users.push(newUser);
  setJSON(LS_HOSPITAL_USERS, users);

  setAdminAlert(`Hospital "${name}" created with login ${email}`, "success");

  
  hNameInput.value = "";
  hCityInput.value = "";
  hAddressInput.value = "";
  hDepartmentsInput.value = "";
  hEmailInput.value = "";
  hPasswordInput.value = "";

  renderAdminHospitalList();
});

function renderAdminHospitalList() {
  const hospitals = getJSON(LS_HOSPITALS, []);
  const users = getJSON(LS_HOSPITAL_USERS, []);

  if (!hospitals.length) {
    adminHospitalList.innerHTML =
      "<div class='item-meta'>No hospitals yet. Create one on the left.</div>";
    return;
  }

  adminHospitalList.innerHTML = "";
  hospitals.forEach((h) => {
    const row = document.createElement("div");
    row.className = "list-item";

    const left = document.createElement("div");
    left.className = "hospital-appt-left";

    const title = document.createElement("div");
    title.className = "item-title";
    title.textContent = h.name;

    const meta = document.createElement("div");
    meta.className = "item-meta";
    meta.textContent = `${h.city || ""}${h.address ? " · " + h.address : ""}`;

    const deps = document.createElement("div");
    deps.className = "item-meta";
    deps.textContent = h.departments && h.departments.length
      ? "Departments: " + h.departments.join(", ")
      : "Departments not listed";

    left.appendChild(title);
    left.appendChild(meta);
    left.appendChild(deps);

    const right = document.createElement("div");
    right.className = "hospital-appt-right";

    const acc = users.find(
      (u) => u.role === "hospital" && u.hospitalId === h.id
    );
    const emailLine = document.createElement("div");
    emailLine.className = "item-meta";
    emailLine.textContent = acc ? `Login: ${acc.email}` : "No login created";

    right.appendChild(emailLine);

    row.appendChild(left);
    row.appendChild(right);
    adminHospitalList.appendChild(row);
  });
}

function renderHospitalDashboard(hospitalId) {
  const hospitals = getJSON(LS_HOSPITALS, []);
  const hosp = hospitals.find((h) => h.id === hospitalId);
  if (!hosp) {
    hospitalNameEl.textContent = "Unknown hospital";
    hospitalMetaEl.textContent = "";
  } else {
    hospitalNameEl.textContent = hosp.name;
    hospitalMetaEl.textContent = `${hosp.city || ""}${
      hosp.address ? " · " + hosp.address : ""
    }`;
  }

  updateStatsForHospital(hospitalId);
  renderAppointmentsForHospital(hospitalId);
  renderReviewsForHospital(hospitalId);
}

function updateStatsForHospital(hospitalId) {
  const appts = getJSON(LS_APPOINTMENTS, []).filter(
    (a) => a.hospitalId === hospitalId
  );
  const now = Date.now();

  const upcoming = appts.filter(
    (a) => new Date(a.appointmentDate).getTime() >= now
  );
  const pending = appts.filter((a) => a.status === "pending");
  const completed = appts.filter((a) => a.status === "completed");

  statUpcoming.textContent = upcoming.length;
  statPending.textContent = pending.length;
  statCompleted.textContent = completed.length;
  statsBox.classList.remove("hidden");
}

function updateAppointmentStatus(apptId, newStatus, hospitalId) {
  const appts = getJSON(LS_APPOINTMENTS, []);
  const idx = appts.findIndex((a) => a.id === apptId);
  if (idx === -1) return;
  appts[idx].status = newStatus;
  setJSON(LS_APPOINTMENTS, appts);

  updateStatsForHospital(hospitalId);
  renderAppointmentsForHospital(hospitalId);

  renderReviewsForHospital(hospitalId);
}

function renderAppointmentsForHospital(hospitalId) {
  const appts = getJSON(LS_APPOINTMENTS, []).filter(
    (a) => a.hospitalId === hospitalId
  );
  const patients = getJSON(LS_PATIENTS, []);

  if (!appts.length) {
    apptListEl.innerHTML =
      "<div class='item-meta'>No appointments for this hospital yet.</div>";
    return;
  }

  appts.sort(
    (a, b) =>
      new Date(b.appointmentDate).getTime() -
      new Date(a.appointmentDate).getTime()
  );

  apptListEl.innerHTML = "";
  appts.forEach((a) => {
    const p = patients.find((pt) => pt.id === a.patientId);
    const d = new Date(a.appointmentDate);
    const dateStr = d.toLocaleDateString();
    const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const row = document.createElement("div");
    row.className = "list-item";

    const left = document.createElement("div");
    left.className = "hospital-appt-left";

    const title = document.createElement("div");
    title.className = "item-title";
    title.textContent = p ? p.name : "Patient";

    const meta1 = document.createElement("div");
    meta1.className = "item-meta";
    meta1.textContent = `${dateStr} · ${timeStr}`;

    const meta2 = document.createElement("div");
    meta2.className = "item-meta";
    meta2.textContent = "Reason: " + (a.reason || "-");

    left.appendChild(title);
    left.appendChild(meta1);
    left.appendChild(meta2);

    const right = document.createElement("div");
    right.className = "hospital-appt-right";

    const statusChip = document.createElement("div");
    statusChip.className = "status-chip";
    statusChip.textContent = a.status;
    if (a.status === "pending") statusChip.classList.add("status-pending");
    else if (a.status === "confirmed") statusChip.classList.add("status-confirmed");
    else if (a.status === "completed") statusChip.classList.add("status-completed");
    else if (a.status === "cancelled") statusChip.classList.add("status-cancelled");

    const buttons = document.createElement("div");
    buttons.className = "hospital-appt-buttons";

    ["pending", "confirmed", "completed", "cancelled"].forEach((st) => {
      const b = document.createElement("button");
      b.className = "btn-outline btn-small";
      b.textContent = st;
      if (st === a.status) {
        b.disabled = true;
        b.style.opacity = "0.5";
      }
      b.addEventListener("click", () =>
        updateAppointmentStatus(a.id, st, hospitalId)
      );
      buttons.appendChild(b);
    });

    right.appendChild(statusChip);
    right.appendChild(buttons);

    row.appendChild(left);
    row.appendChild(right);
    apptListEl.appendChild(row);
  });
}

function renderReviewsForHospital(hospitalId) {
  const reviews = getJSON(LS_REVIEWS, []).filter(
    (r) => r.hospitalId === hospitalId
  );
  const patients = getJSON(LS_PATIENTS, []);

  if (!reviews.length) {
    reviewsEl.innerHTML =
      "<div class='item-meta'>No verified reviews yet.</div>";
    return;
  }

  reviews.sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt || 0).getTime() -
      new Date(a.updatedAt || a.createdAt || 0).getTime()
  );

  reviewsEl.innerHTML = "";
  reviews.forEach((r) => {
    const p = patients.find((pt) => pt.id === r.patientId);
    const date = new Date(r.updatedAt || r.createdAt || Date.now()).toLocaleDateString();

    const item = document.createElement("div");
    item.className = "review-item";

    const header = document.createElement("div");
    header.className = "review-header-row";

    const left = document.createElement("div");
    const nameEl = document.createElement("div");
    nameEl.className = "review-name";
    nameEl.textContent = p ? p.name : "Patient";
    const starsEl = document.createElement("div");
    starsEl.className = "review-stars-inline";
    starsEl.textContent = "★".repeat(r.rating);

    left.appendChild(nameEl);
    left.appendChild(starsEl);

    const dateEl = document.createElement("div");
    dateEl.className = "review-date";
    dateEl.textContent = date;

    header.appendChild(left);
    header.appendChild(dateEl);

    const commentEl = document.createElement("div");
    commentEl.className = "review-comment";
    commentEl.textContent = r.comment || "No comment.";

    item.appendChild(header);
    item.appendChild(commentEl);
    reviewsEl.appendChild(item);
  });
}


(function init() {
  const user = getJSON(LS_CURRENT_USER, null);
  if (!user) {
    showLogin();
    return;
  }
  if (user.role === "admin") showAdmin();
  else if (user.role === "hospital") showHospitalDashboard(user);
  else showLogin();
})();
