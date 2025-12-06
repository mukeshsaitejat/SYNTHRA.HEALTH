const LS_PATIENTS = "synthra_patients";
const LS_APPOINTMENTS = "synthra_appointments";
const LS_HOSPITALS = "synthra_hospitals";
const LS_CURRENT_PATIENT = "synthra_patient";
const LS_REVIEWS = "synthra_reviews";

const SKELETON_DELAY = 350;

const DEFAULT_HOSPITALS = [
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

function getJSON(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

(function initHospitals() {
  const existing = getJSON(LS_HOSPITALS, null);
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    setJSON(LS_HOSPITALS, DEFAULT_HOSPITALS);
  }
})();

function getCurrentPatient() {
  return getJSON(LS_CURRENT_PATIENT, null);
}

function setCurrentPatient(patient) {
  setJSON(LS_CURRENT_PATIENT, patient);
}

function clearCurrentPatient() {
  localStorage.removeItem(LS_CURRENT_PATIENT);
}

const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authAlert = document.getElementById("auth-alert");

const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");

const btnShowLogin = document.getElementById("btn-show-login");
const btnLogout = document.getElementById("btn-logout");
const userNameEl = document.getElementById("user-name");

const navHospitals = document.getElementById("nav-hospitals");
const navAppointments = document.getElementById("nav-appointments");

const hospitalsView = document.getElementById("hospitals-view");
const appointmentsView = document.getElementById("appointments-view");
const hospitalsList = document.getElementById("hospitals-list");
const appointmentsList = document.getElementById("appointments-list");

const todaySummary = document.getElementById("today-summary");

const modalBackdrop = document.getElementById("modal-backdrop");
const modalHospitalName = document.getElementById("modal-hospital-name");
const modalDate = document.getElementById("modal-date");
const modalReason = document.getElementById("modal-reason");
const modalAlert = document.getElementById("modal-alert");
const modalCancel = document.getElementById("modal-cancel");
const modalConfirm = document.getElementById("modal-confirm");

const qrBackdrop = document.getElementById("qr-backdrop");
const qrClose = document.getElementById("qr-close");
const qrBox = document.getElementById("qr-box");
const qrHospitalName = document.getElementById("qr-hospital-name");
const qrDate = document.getElementById("qr-date");
const qrNote = document.getElementById("qr-note");

const reviewBackdrop = document.getElementById("review-backdrop");
const reviewHospitalName = document.getElementById("review-hospital-name");
const reviewStarsEl = document.getElementById("review-stars");
const reviewCommentEl = document.getElementById("review-comment");
const reviewAlert = document.getElementById("review-alert");
const reviewCancel = document.getElementById("review-cancel");
const reviewSave = document.getElementById("review-save");

let selectedHospitalId = null;

let currentReviewApptId = null;
let currentReviewHospitalId = null;
let currentReviewRating = 0;

function showElement(el) {
  el.classList.remove("hidden");
}
function hideElement(el) {
  el.classList.add("hidden");
}

function setAuthAlert(message, type = "error") {
  if (!message) {
    hideElement(authAlert);
    authAlert.textContent = "";
    authAlert.className = "alert hidden";
    return;
  }
  authAlert.textContent = message;
  authAlert.className =
    "alert " + (type === "error" ? "alert-error" : "alert-success");
}

function setModalAlert(message, type = "error") {
  if (!message) {
    hideElement(modalAlert);
    modalAlert.textContent = "";
    modalAlert.className = "alert alert-sm hidden";
    return;
  }
  modalAlert.textContent = message;
  modalAlert.className =
    "alert alert-sm " + (type === "error" ? "alert-error" : "alert-success");
}

function setReviewAlert(message, type = "error") {
  if (!message) {
    hideElement(reviewAlert);
    reviewAlert.textContent = "";
    reviewAlert.className = "alert alert-sm hidden";
    return;
  }
  reviewAlert.textContent = message;
  reviewAlert.className =
    "alert alert-sm " + (type === "error" ? "alert-error" : "alert-success");
}

function registerPatientLocal({ name, phone, email, password }) {
  const patients = getJSON(LS_PATIENTS, []);

  if (patients.some((p) => p.phone === phone)) {
    throw new Error("Phone already registered");
  }

  const newPatient = {
    id: "p" + Date.now(),
    name,
    phone,
    email,
    password, 
  };

  patients.push(newPatient);
  setJSON(LS_PATIENTS, patients);
  setCurrentPatient(newPatient);
  return newPatient;
}

function loginPatientLocal({ phone, password }) {
  const patients = getJSON(LS_PATIENTS, []);
  const patient = patients.find(
    (p) => p.phone === phone && p.password === password
  );
  if (!patient) {
    throw new Error("Invalid phone or password");
  }
  setCurrentPatient(patient);
  return patient;
}

function getHospitalsLocal() {
  return getJSON(LS_HOSPITALS, []);
}

function getAppointmentsLocalForPatient(patientId) {
  const all = getJSON(LS_APPOINTMENTS, []);
  return all
    .filter((a) => a.patientId === patientId)
    .sort(
      (a, b) =>
        new Date(b.appointmentDate).getTime() -
        new Date(a.appointmentDate).getTime()
    );
}

function addAppointmentLocal({ patientId, hospitalId, appointmentDate, reason }) {
  const all = getJSON(LS_APPOINTMENTS, []);
  const newAppt = {
    id: "a" + Date.now(),
    patientId,
    hospitalId,
    appointmentDate,
    reason,
    status: "pending",
  };
  all.push(newAppt);
  setJSON(LS_APPOINTMENTS, all);
  return newAppt;
}

function getAllReviews() {
  return getJSON(LS_REVIEWS, []);
}

function getReviewForAppointment(appointmentId) {
  const all = getAllReviews();
  return all.find((r) => r.appointmentId === appointmentId) || null;
}

function getReviewsForHospital(hospitalId) {
  const all = getAllReviews();
  return all.filter((r) => r.hospitalId === hospitalId);
}

function upsertReview({ appointmentId, hospitalId, rating, comment }) {
  const patient = getCurrentPatient();
  if (!patient) return;

  const all = getAllReviews();
  const existingIndex = all.findIndex(
    (r) => r.appointmentId === appointmentId
  );

  if (existingIndex !== -1) {
    all[existingIndex].rating = rating;
    all[existingIndex].comment = comment;
    all[existingIndex].updatedAt = new Date().toISOString();
  } else {
    all.push({
      id: "r" + Date.now(),
      appointmentId,
      hospitalId,
      patientId: patient.id,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    });
  }

  setJSON(LS_REVIEWS, all);
}

function showLoginTab() {
  tabLogin.classList.add("auth-tab-active");
  tabRegister.classList.remove("auth-tab-active");
  showElement(loginForm);
  hideElement(registerForm);
  setAuthAlert("");
}

function showRegisterTab() {
  tabRegister.classList.add("auth-tab-active");
  tabLogin.classList.remove("auth-tab-active");
  showElement(registerForm);
  hideElement(loginForm);
  setAuthAlert("");
}

function showHospitalsView() {
  navHospitals.classList.add("nav-link-active");
  navAppointments.classList.remove("nav-link-active");
  showElement(hospitalsView);
  hideElement(appointmentsView);
}

function showAppointmentsView() {
  navAppointments.classList.add("nav-link-active");
  navHospitals.classList.remove("nav-link-active");
  showElement(appointmentsView);
  hideElement(hospitalsView);
}

function hospitalsSkeletonHTML() {
  let items = "";
  for (let i = 0; i < 3; i++) {
    items += `
      <div class="list-item skeleton">
        <div class="skeleton-inner item-main">
          <div class="skeleton-bar skeleton-bar-lg"></div>
          <div class="skeleton-bar skeleton-bar-md"></div>
          <div class="skeleton-bar skeleton-bar-sm"></div>
        </div>
        <div class="skeleton-inner">
          <div class="skeleton-pill"></div>
        </div>
      </div>
    `;
  }
  return items;
}

function appointmentsSkeletonHTML() {
  let items = "";
  for (let i = 0; i < 3; i++) {
    items += `
      <div class="list-item skeleton">
        <div class="skeleton-inner item-main">
          <div class="skeleton-bar skeleton-bar-lg"></div>
          <div class="skeleton-bar skeleton-bar-md"></div>
          <div class="skeleton-bar skeleton-bar-sm"></div>
        </div>
      </div>
    `;
  }
  return items;
}

// ================= TODAY SUMMARY =================
function renderTodaySummary(appointments, hospitals) {
  if (!todaySummary) return;

  if (!appointments || appointments.length === 0) {
    todaySummary.innerHTML = `
      <div class="today-main">
        <span class="today-label">Today</span>
        <div class="today-title">No appointments yet</div>
        <div class="today-meta">Book a hospital to see your visits here.</div>
      </div>
      <div class="today-right">
        <div class="today-tag">Your day is currently free</div>
      </div>
    `;
    todaySummary.classList.remove("hidden");
    return;
  }

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const todays = appointments.filter((ap) => {
    const d = new Date(ap.appointmentDate);
    if (isNaN(d.getTime())) return false;
    return (
      d.toISOString().slice(0, 10) === todayStr && ap.status !== "cancelled"
    );
  });

  let target = null;

  if (todays.length > 0) {
    const future = todays.filter(
      (ap) => new Date(ap.appointmentDate).getTime() >= now.getTime()
    );
    if (future.length > 0) {
      target = future.sort(
        (a, b) =>
          new Date(a.appointmentDate).getTime() -
          new Date(b.appointmentDate).getTime()
      )[0];
    } else {
      target = todays.sort(
        (a, b) =>
          new Date(b.appointmentDate).getTime() -
          new Date(a.appointmentDate).getTime()
      )[0];
    }
  }

  if (!target) {
    const upcoming = appointments
      .filter((ap) => new Date(ap.appointmentDate).getTime() >= now.getTime())
      .sort(
        (a, b) =>
          new Date(a.appointmentDate).getTime() -
          new Date(b.appointmentDate).getTime()
      )[0];

    if (!upcoming) {
      todaySummary.innerHTML = `
        <div class="today-main">
          <span class="today-label">Today</span>
          <div class="today-title">No visit scheduled today</div>
          <div class="today-meta">Your next slot is not booked yet.</div>
        </div>
        <div class="today-right">
          <div class="today-tag">Use “Hospitals” to book a visit</div>
        </div>
      `;
      todaySummary.classList.remove("hidden");
      return;
    }

    target = upcoming;
  }

  const d = new Date(target.appointmentDate);
  const hosp = hospitals.find((h) => h.id === target.hospitalId);
  const hospName = hosp ? hosp.name : "Hospital";
  const city = hosp && hosp.city ? hosp.city : "";
  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = d.toLocaleDateString();
  const status = target.status || "pending";

  let statusClass = "";
  if (status === "pending") statusClass = "status-pending";
  else if (status === "confirmed") statusClass = "status-confirmed";
  else if (status === "completed") statusClass = "status-completed";
  else if (status === "cancelled") statusClass = "status-cancelled";

  todaySummary.innerHTML = `
    <div class="today-main">
      <span class="today-label">${
        todays.length > 0 ? "Today’s visit" : "Next visit"
      }</span>
      <div class="today-title">${hospName}</div>
      <div class="today-meta">
        ${city ? city + " · " : ""}${dateStr} · ${timeStr}
      </div>
    </div>
    <div class="today-right">
      <div class="status-chip ${statusClass}">${status}</div>
      <div class="today-tag">Auto-added from your bookings</div>
    </div>
  `;
  todaySummary.classList.remove("hidden");
}

function loadHospitals() {
  const hospitals = getHospitalsLocal();
  const allReviews = getAllReviews();

  hospitalsList.innerHTML = hospitalsSkeletonHTML();

  setTimeout(() => {
    if (!hospitals || hospitals.length === 0) {
      hospitalsList.innerHTML =
        '<div class="item-meta">No hospitals available. Edit DEFAULT_HOSPITALS in patient.js.</div>';
      return;
    }

    hospitalsList.innerHTML = "";
    hospitals.forEach((hosp) => {
      const div = document.createElement("div");
      div.className = "list-item";

      const left = document.createElement("div");
      left.className = "item-main";

      const title = document.createElement("div");
      title.className = "item-title";
      title.textContent = hosp.name;

      const meta = document.createElement("div");
      meta.className = "item-meta";
      meta.textContent = `${hosp.city || ""}${
        hosp.address ? " · " + hosp.address : ""
      }`;

      const dept = document.createElement("div");
      dept.className = "item-meta";
      const deps = Array.isArray(hosp.departments) ? hosp.departments : [];
      dept.textContent =
        deps.length > 0
          ? `Departments: ${deps.join(", ")}`
          : "Departments not listed";

      left.appendChild(title);
      left.appendChild(meta);
      left.appendChild(dept);

      const right = document.createElement("div");
      right.style.display = "flex";
      right.style.flexDirection = "column";
      right.style.alignItems = "flex-end";
      right.style.gap = "6px";

      const hospReviews = allReviews.filter(
        (r) => r.hospitalId === hosp.id
      );
      if (hospReviews.length > 0) {
        const avg =
          hospReviews.reduce((sum, r) => sum + r.rating, 0) /
          hospReviews.length;
        const badge = document.createElement("div");
        badge.className = "rating-pill";
        badge.textContent = `★ ${avg.toFixed(1)} · ${hospReviews.length} review${
          hospReviews.length > 1 ? "s" : ""
        }`;
        right.appendChild(badge);
      }

      const btn = document.createElement("button");
      btn.className = "btn-primary btn-small";
      btn.textContent = "Book";
      btn.addEventListener("click", () => openBookingModal(hosp));

      right.appendChild(btn);

      div.appendChild(left);
      div.appendChild(right);
      hospitalsList.appendChild(div);
    });
  }, SKELETON_DELAY);
}

function loadAppointments() {
  const patient = getCurrentPatient();
  if (!patient) {
    if (todaySummary) {
      todaySummary.innerHTML = `
        <div class="today-main">
          <span class="today-label">Today</span>
          <div class="today-title">Login to see your visits</div>
          <div class="today-meta">Your appointments will appear here.</div>
        </div>
      `;
      todaySummary.classList.remove("hidden");
    }
    appointmentsList.innerHTML =
      '<div class="item-meta">Login to view appointments.</div>';
    return;
  }

  appointmentsList.innerHTML = appointmentsSkeletonHTML();
  if (todaySummary) {
    todaySummary.classList.remove("hidden");
    todaySummary.innerHTML = `
      <div class="today-main skeleton">
        <div class="skeleton-inner">
          <div class="skeleton-bar skeleton-bar-sm"></div>
          <div class="skeleton-bar skeleton-bar-lg"></div>
          <div class="skeleton-bar skeleton-bar-md"></div>
        </div>
      </div>
    `;
  }

  setTimeout(() => {
    const appointments = getAppointmentsLocalForPatient(patient.id);
    const hospitals = getHospitalsLocal();

    renderTodaySummary(appointments, hospitals);

    if (!appointments || appointments.length === 0) {
      appointmentsList.innerHTML =
        '<div class="item-meta">You don’t have any appointments yet.</div>';
      return;
    }

    appointmentsList.innerHTML = "";
    appointments.forEach((ap) => {
      const div = document.createElement("div");
      div.className = "list-item";

      const left = document.createElement("div");
      left.className = "item-main";

      const hosp = hospitals.find((h) => h.id === ap.hospitalId);
      const title = document.createElement("div");
      title.className = "item-title";
      title.textContent = hosp ? hosp.name : "Hospital";

      const metaTop = document.createElement("div");
      metaTop.className = "item-meta";
      const date = new Date(ap.appointmentDate);
      metaTop.textContent = `${date.toLocaleDateString()} · ${date.toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      )}`;

      const metaReason = document.createElement("div");
      metaReason.className = "item-meta";
      metaReason.textContent = ap.reason
        ? `Reason: ${ap.reason}`
        : "No reason added";

      left.appendChild(title);
      left.appendChild(metaTop);
      left.appendChild(metaReason);

      const right = document.createElement("div");
      right.style.display = "flex";
      right.style.flexDirection = "column";
      right.style.alignItems = "flex-end";
      right.style.gap = "4px";

      const statusChip = document.createElement("div");
      statusChip.className = "status-chip";
      statusChip.textContent = ap.status;

      if (ap.status === "pending") statusChip.classList.add("status-pending");
      else if (ap.status === "confirmed")
        statusChip.classList.add("status-confirmed");
      else if (ap.status === "completed")
        statusChip.classList.add("status-completed");
      else if (ap.status === "cancelled")
        statusChip.classList.add("status-cancelled");

      const qrBtn = document.createElement("button");
      qrBtn.className = "btn-outline btn-small";
      qrBtn.textContent = "QR";
      qrBtn.addEventListener("click", () => {
        openQrModal(ap, hosp);
      });

      right.appendChild(statusChip);
      right.appendChild(qrBtn);

      if (ap.status === "completed") {
        const existingReview = getReviewForAppointment(ap.id);
        const reviewBtn = document.createElement("button");
        reviewBtn.className = "btn-outline btn-small";
        reviewBtn.textContent = existingReview ? "Edit review" : "Add review";
        reviewBtn.addEventListener("click", () =>
          openReviewModal(ap, hosp, existingReview)
        );
        right.appendChild(reviewBtn);
      }

      div.appendChild(left);
      div.appendChild(right);
      appointmentsList.appendChild(div);
    });
  }, SKELETON_DELAY);
}

function openBookingModal(hospital) {
  selectedHospitalId = hospital.id;
  modalHospitalName.textContent = hospital.name;
  modalDate.value = "";
  modalReason.value = "";
  setModalAlert("");
  showElement(modalBackdrop);
}

function closeBookingModal() {
  selectedHospitalId = null;
  hideElement(modalBackdrop);
}

function confirmBooking() {
  const patient = getCurrentPatient();
  if (!patient) {
    setModalAlert("Please login first.", "error");
    return;
  }
  if (!selectedHospitalId) return;

  const dateVal = modalDate.value;
  if (!dateVal) {
    setModalAlert("Please select date & time.", "error");
    return;
  }

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) {
    setModalAlert("Invalid date.", "error");
    return;
  }

  addAppointmentLocal({
    patientId: patient.id,
    hospitalId: selectedHospitalId,
    appointmentDate: d.toISOString(),
    reason: modalReason.value.trim(),
  });

  setModalAlert("Appointment booked!", "success");
  loadAppointments();

  setTimeout(() => {
    closeBookingModal();
  }, 600);
}

function openQrModal(appt, hospital) {
  if (!qrBackdrop || !qrBox) return;

  qrBox.innerHTML = "";

  const payload = {
    t: "synthra_appt",
    id: appt.id,
    patientId: appt.patientId,
    hospitalId: appt.hospitalId,
    ts: appt.appointmentDate,
    status: appt.status || "pending",
  };

  const d = new Date(appt.appointmentDate);
  const hospName = hospital ? hospital.name : "Hospital";
  const city = hospital && hospital.city ? hospital.city : "";
  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = d.toLocaleDateString();

  qrHospitalName.textContent = hospName;
  qrDate.textContent = `${city ? city + " · " : ""}${dateStr} · ${timeStr}`;
  qrNote.textContent =
    "Show this QR at the hospital front desk to verify your booking.";

  new QRCode(qrBox, {
    text: JSON.stringify(payload),
    width: 160,
    height: 160,
    colorDark: "#020617",
    colorLight: "#e5e7eb",
    correctLevel: QRCode.CorrectLevel.H,
  });

  showElement(qrBackdrop);
}

function closeQrModal() {
  if (!qrBackdrop) return;
  hideElement(qrBackdrop);
  if (qrBox) qrBox.innerHTML = "";
}

function buildReviewStars() {
  if (!reviewStarsEl) return;
  reviewStarsEl.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const span = document.createElement("span");
    span.className = "review-star";
    span.dataset.value = String(i);
    span.textContent = "★";
    span.addEventListener("click", () => {
      setReviewRating(i);
    });
    reviewStarsEl.appendChild(span);
  }
}

function setReviewRating(value) {
  currentReviewRating = value;
  const stars = reviewStarsEl.querySelectorAll(".review-star");
  stars.forEach((s) => {
    const v = Number(s.dataset.value || "0");
    if (v <= value) s.classList.add("review-star-active");
    else s.classList.remove("review-star-active");
  });
}

function openReviewModal(appt, hospital, existingReview) {
  currentReviewApptId = appt.id;
  currentReviewHospitalId = appt.hospitalId;
  setReviewAlert("");

  reviewHospitalName.textContent = hospital ? hospital.name : "Hospital";
  reviewCommentEl.value = existingReview ? existingReview.comment || "" : "";
  const rating = existingReview ? existingReview.rating : 0;
  setReviewRating(rating);

  showElement(reviewBackdrop);
}

function closeReviewModal() {
  currentReviewApptId = null;
  currentReviewHospitalId = null;
  currentReviewRating = 0;
  setReviewAlert("");
  if (reviewCommentEl) reviewCommentEl.value = "";
  setReviewRating(0);
  hideElement(reviewBackdrop);
}

function updateUIForAuth() {
  const patient = getCurrentPatient();
  if (patient) {
    userNameEl.textContent = patient.name || "";
    showElement(btnLogout);
    hideElement(btnShowLogin);
    hideElement(authSection);
    showElement(appSection);
    showHospitalsView();
    loadHospitals();
    loadAppointments();
  } else {
    userNameEl.textContent = "";
    hideElement(btnLogout);
    showElement(btnShowLogin);
    showElement(authSection);
    hideElement(appSection);
  }
}

tabLogin.addEventListener("click", showLoginTab);
tabRegister.addEventListener("click", showRegisterTab);

btnShowLogin.addEventListener("click", () => {
  showLoginTab();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

btnLogout.addEventListener("click", () => {
  clearCurrentPatient();
  updateUIForAuth();
});
navHospitals.addEventListener("click", showHospitalsView);
navAppointments.addEventListener("click", showAppointmentsView);

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  setAuthAlert("");

  const phone = document.getElementById("login-phone").value.trim();
  const password = document.getElementById("login-password").value;

  if (!phone || !password) {
    setAuthAlert("Phone and password are required");
    return;
  }

  try {
    setAuthAlert("Logging in...", "success");
    loginPatientLocal({ phone, password });
    updateUIForAuth();
    setAuthAlert("");
  } catch (err) {
    setAuthAlert(err.message, "error");
  }
});


registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  setAuthAlert("");

  const name = document.getElementById("reg-name").value.trim();
  const phone = document.getElementById("reg-phone").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;

  if (!name || !phone || !password) {
    setAuthAlert("Name, phone and password are required");
    return;
  }

  try {
    setAuthAlert("Creating account...", "success");
    registerPatientLocal({ name, phone, email, password });
    updateUIForAuth();
    setAuthAlert("");
  } catch (err) {
    setAuthAlert(err.message, "error");
  }
});


modalCancel.addEventListener("click", closeBookingModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeBookingModal();
});
modalConfirm.addEventListener("click", confirmBooking);


if (qrClose) {
  qrClose.addEventListener("click", closeQrModal);
}
if (qrBackdrop) {
  qrBackdrop.addEventListener("click", (e) => {
    if (e.target === qrBackdrop) closeQrModal();
  });
}


buildReviewStars();

reviewCancel.addEventListener("click", closeReviewModal);
reviewBackdrop.addEventListener("click", (e) => {
  if (e.target === reviewBackdrop) closeReviewModal();
});
reviewSave.addEventListener("click", () => {
  if (!currentReviewApptId || !currentReviewHospitalId) return;

  if (!currentReviewRating) {
    setReviewAlert("Please select a rating to continue.");
    return;
  }

  upsertReview({
    appointmentId: currentReviewApptId,
    hospitalId: currentReviewHospitalId,
    rating: currentReviewRating,
    comment: reviewCommentEl.value.trim(),
  });

  setReviewAlert("Review saved.", "success");

  loadHospitals();
  loadAppointments();
  setTimeout(() => {
    closeReviewModal();
  }, 500);
});


showLoginTab();
updateUIForAuth();
