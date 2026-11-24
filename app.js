"use strict";

const $ = (selector) => document.querySelector(selector);
const apiOrigin = $('meta[name="protez-api-origin"]').content;
const statuses = {
  kabul: "İş kabul",
  tasarim: "Tasarımda",
  gecici: "Geçici",
  gecici_basildi: "Geçici basıldı",
  gecici_prova: "Geçici provaya gönderildi",
  gecici_goruldu: "Geçici prova görüldü",
  gecici_duzeltme: "Düzeltme istendi",
  hekim_onay: "Hekim onayladı",
  kazima: "Kazımada",
  uretim: "Üretimde",
  prova: "Prova",
  hazir: "Teslime hazır",
  teslim: "Teslim edildi"
};
const temporaryStages = new Set(["gecici", "gecici_basildi", "gecici_prova", "gecici_goruldu", "gecici_duzeltme", "hekim_onay"]);
const temporaryTypes = new Set(["Diş üstü geçici", "İmplant üstü geçici"]);
const temporaryNext = {
  kabul: ["gecici", "Geçici aşamasına al"],
  tasarim: ["gecici", "Geçici aşamasına al"],
  gecici: ["gecici_basildi", "Geçici basıldı"],
  gecici_basildi: ["gecici_prova", "Geçici provaya gönderildi"],
  gecici_prova: ["gecici_goruldu", "Geçici prova görüldü"],
  gecici_goruldu: ["hekim_onay", "Hekim onayladı"],
  gecici_duzeltme: ["gecici", "Düzeltilen geçiciyi hazırla"],
  hekim_onay: ["kazima", "Kazımaya al"]
};
const types = [
  "İmplant üstü zirkon", "Diş üstü zirkon", "Total protez", "Diş üstü geçici",
  "İmplant üstü geçici", "Bölümlü protez", "Metal destekli porselen",
  "İmplant üstü hibrit", "Tamir / Besleme"
];
const pages = {
  panom: ["Genel bakış", "Laboratuvar panosu", "İş kabulden teslimata, tüm protez işlerinizi takip edin."],
  isler: ["İş takibi", "İş takibi", "Aktif kayıtları arayın, düzenleyin ve üretim aşamalarını güncelleyin."],
  takvim: ["Teslimat takvimi", "Teslimat takvimi", "Teslim ve prova tarihlerini gün gün görün."],
  arsiv: ["Tamamlanan işler", "Tamamlanan işler", "Teslim edilen protez işlerine ve ayrıntılarına ulaşın."]
};
const icons = {
  tooth: '<path d="M12 5.8c-1.4-.3-2.2-1.7-4.6-1.5C3.5 4.7 3 8.6 4.6 12c1.1 2.5 1.1 6.4 3.1 6.8 1.8.4 1.6-5.1 4.3-5.1s2.5 5.5 4.3 5.1c2-.4 2-4.3 3.1-6.8C21 8.6 20.5 4.7 16.6 4.3c-2.4-.2-3.2 1.2-4.6 1.5Z"/><path d="M10.2 5.3c1.7 1.2 3 1.7 4.3 1.3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M8 11h8m-8 5h6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18m-13 5h2m4 0h2"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9m-9 4h4"/>',
  flask: '<path d="M9 3h6m-5 0v6l-5.4 8.6A2.2 2.2 0 0 0 6.5 21h11a2.2 2.2 0 0 0 1.9-3.4L14 9V3M7.5 15h9"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 4 9 5 9-5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
  check: '<path d="m5 12 5 5L19 8"/>',
  circled: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  tool: '<path d="M14 7a4.5 4.5 0 0 0-5.5 5.6L4 17l3 3 4.5-4.5A4.5 4.5 0 0 0 17 10l-3 3-3-3 3-3Z"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  design: '<path d="m4 17-1 4 4-1L20 7l-3-3L4 17Zm11-11 3 3M4 13V4h9m7 7v9h-9"/>',
  mill: '<path d="M4 20h16m-15 0V5h14v15M5 9h14m-9-4V3h4v2m-2 4v6m-3 1h6"/>'
};
const icon = (name, cls = "") => '<span data-icon="' + name + '" class="' + cls + '">' + svg(name) + "</span>";
const svg = (name) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[name] + "</svg>";
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const localDate = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" });
const todayString = () => {
  const parts = Object.fromEntries(localDate.formatToParts(new Date()).map(({ type, value }) => [type, value]));
  return [parts.year, parts.month, parts.day].join("-");
};
const shortDate = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric", timeZone: "UTC" });
const timeFormat = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" });
const asDate = (date) => new Date(date + "T12:00:00Z");
const displayDate = (date) => date ? shortDate.format(asDate(date)) : "—";
const number = (id) => "PL-" + String(id).padStart(4, "0");
const dateOnly = (date) => date.toISOString().slice(0, 10);
const dayOffset = (date, days) => dateOnly(new Date(asDate(date).getTime() + days * 86400000));
const openStatus = (job) => job.status !== "teslim";
const typeName = (job) => job.type || "İş türü girilmedi";

let today = todayString();
let calendarMonth = today.slice(0, 7);
let agendaDay = today;
let selectedPage = "panom";
let jobs = [];
let demoJobs = [];
let demo = false;
let ready = false;
let loadFailure = "";
let jobsTag = "";
let metricFilter = "";
let pageLimit = 10;
let editId = null;
let editVersion = null;
let submissionKey = "";
let modalToken = 0;
let snapshotSequence = 0;
let saving = false;
let toastTimeout;
let dialogSource;

const form = $("#job-form");
const dialog = $("#job-dialog");
const controls = form.elements;
const sortActive = (a, b) => (a.due || "9999").localeCompare(b.due || "9999") || b.id - a.id;
const currentJobs = () => demo ? demoJobs : jobs;

function demoData() {
  return [
    [24, "VK-1048", "İmplant üstü zirkon", "Mavi Ağız ve Diş Kliniği", 0, "kazima", 1],
    [23, "VK-1047", "Diş üstü zirkon", "Park Diş Polikliniği", 1, "gecici_goruldu", 0],
    [22, "VK-1046", "Total protez", "Merkez Diş Kliniği", 2, "hazir", -1],
    [21, "VK-1045", "Diş üstü geçici", "Mavi Ağız ve Diş Kliniği", 3, "gecici", null],
    [20, "VK-1044", "İmplant üstü hibrit", "Kıyı Diş Kliniği", 4, "tasarim", 2],
    [19, "VK-1043", "Metal destekli porselen", "Park Diş Polikliniği", 6, "uretim", null],
    [18, "VK-1042", "Bölümlü protez", "Merkez Diş Kliniği", 7, "prova", 4],
    [17, "VK-1041", "Tamir / Besleme", "Kıyı Diş Kliniği", -1, "hazir", null],
    [16, "VK-1040", "Diş üstü zirkon", "Park Diş Polikliniği", -2, "teslim", null]
  ].map(([id, patientCode, type, clinic, due, status, trial]) => ({
    id, patientCode, type, clinic, status, due: dayOffset(today, due), received: dayOffset(today, -6),
    trial: trial === null ? "" : dayOffset(today, trial), owner: "AT", teeth: "11–13", units: 3,
    shade: "A2", notes: "", doctorNotes: id === 23 ? "Geçici prova uygun. Hekim onayı bekleniyor." : "",
    temporary: id === 24 || temporaryStages.has(status), version: 1, updatedAt: new Date().toISOString()
  }));
}

async function api(path, options = {}) {
  const response = await fetch(new URL(path, apiOrigin), {
    ...options, credentials: "omit", cache: "no-store", redirect: "error",
    headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers }
  });
  if (response.status === 304) return null;
  if (!(response.headers.get("content-type") || "").includes("application/json")) {
    throw new Error("Laboratuvar kayıtlarına şu anda ulaşılamıyor.");
  }
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error || "İşlem tamamlanamadı. Lütfen tekrar deneyin.");
    error.status = response.status;
    throw error;
  }
  if (path === "/api/jobs" && (!options.method || options.method === "GET")) {
    result.etag = response.headers.get("ETag") || "";
  }
  return result;
}

async function refresh(quiet = false) {
  const sequence = ++snapshotSequence;
  try {
    const data = await api("/api/jobs", { headers: jobsTag ? { "If-None-Match": jobsTag } : {} });
    if (sequence !== snapshotSequence) return;
    if (data) {
      jobs = data.jobs;
      jobsTag = data.etag;
    }
    ready = true;
    loadFailure = "";
  } catch (error) {
    if (sequence !== snapshotSequence) return;
    loadFailure = error instanceof TypeError ? "Bağlantı kesildi. İnternet bağlantınızı kontrol edin." : error.message;
  }
  if (!demo && (!quiet || !dialog.open)) render();
}

function showConnection() {
  const state = demo ? "demo" : loadFailure ? "error" : ready ? "online" : "loading";
  const connection = $("#connection");
  connection.dataset.state = state;
  connection.lastElementChild.textContent = { demo: "Örnek görünüm", error: "Bağlantı sorunu", online: "Çevrimiçi", loading: "Bağlanıyor" }[state];
  $("#load-error").hidden = demo || !loadFailure;
  $("#load-error-text").textContent = loadFailure;
  $("#demo-banner").hidden = !demo;
  $("#demo-label").textContent = demo ? "Canlı kayıtlara dön" : "Örnek kayıtları incele";
  $("#workspace-mode").textContent = demo ? "Örnek görünüm" : "Ortak iş kayıtları";
  $(".new-button").disabled = !demo && (!ready || !!loadFailure);
  $("#backup").disabled = demo || !ready || !!loadFailure;
}

function renderMetrics() {
  const active = currentJobs().filter(openStatus);
  const todayJobs = active.filter((job) => job.due === today);
  const overdue = active.filter((job) => job.due && job.due < today);
  const tiles = [
    ["active", "Aktif işler", active.length, "Teslimat bekleyen işler", "clipboard", "mint"],
    ["tasarim", "Tasarımda", active.filter((job) => job.status === "tasarim").length, "Tasarım aşamasında", "design", "rose"],
    ["kazima", "Kazımada", active.filter((job) => job.status === "kazima").length, "Kazıma aşamasında", "mill", "cyan"],
    ["uretim", "Üretimde", active.filter((job) => job.status === "uretim").length, "Üretim aşamasındaki işler", "tool", "blue"],
    ["today", "Bugün teslim", todayJobs.length, overdue.length ? overdue.length + " geciken iş de var" : "Bugüne planlanan teslimler", "clock", "amber"],
    ["hazir", "Teslime hazır", active.filter((job) => job.status === "hazir").length, "Teslim için bekleyen işler", "circled", "purple"]
  ];
  const oldFocus = document.activeElement?.dataset.metric;
  $("#metrics").innerHTML = tiles.map(([key, label, count, hint, glyph, color]) =>
    '<button class="metric" type="button" data-metric="' + key + '" aria-pressed="' + (metricFilter === key) + '"' + (!ready && !demo ? " disabled" : "") + '><span><span class="metric-label">' + label + '</span><strong class="metric-number">' + (ready || demo ? count : "—") + '</strong></span>' + icon(glyph, "metric-icon " + color) + '<span class="metric-note">' + hint + "</span></button>"
  ).join("");
  if (oldFocus) $("#metrics").querySelector('[data-metric="' + oldFocus + '"]')?.focus({ preventScroll: true });
}

function filteredJobs() {
  const query = $("#search").value.trim().toLocaleLowerCase("tr-TR");
  const stage = $("#status-filter").value;
  let list = currentJobs();
  if (selectedPage === "arsiv") list = list.filter((job) => !openStatus(job));
  if (selectedPage === "isler" || metricFilter === "active") list = list.filter(openStatus);
  if (metricFilter === "today") list = list.filter((job) => openStatus(job) && job.due === today);
  if (stage === "temporary") list = list.filter((job) => job.temporary || temporaryStages.has(job.status));
  else if (stage) list = list.filter((job) => job.status === stage);
  if (query) list = list.filter((job) => [number(job.id), job.patientCode, job.clinic, job.type, job.owner].join(" ").toLocaleLowerCase("tr-TR").includes(query));
  return [...list].sort((a, b) => selectedPage === "arsiv"
    ? b.updatedAt.localeCompare(a.updatedAt)
    : Number(!openStatus(a)) - Number(!openStatus(b)) || sortActive(a, b));
}

function renderJobs() {
  const list = filteredJobs();
  const visible = list.slice(0, pageLimit);
  const focusedJob = $("#jobs").contains(document.activeElement) ? document.activeElement.dataset.job : null;
  $("#jobs").innerHTML = visible.map((job) =>
    '<tr class="job-row"><td><span class="cell-main case">' + number(job.id) + '</span><span class="cell-sub">' + escapeHtml(job.patientCode) +
    '</span></td><td><span class="cell-main">' + escapeHtml(typeName(job)) + '</span><span class="cell-sub">' + escapeHtml(job.clinic) +
    '</span></td><td><span class="cell-main date-cell' + (openStatus(job) && job.due && job.due < today ? " date-late" : "") + '">' + displayDate(job.due) +
    '</span></td><td><span class="badge status-' + job.status + '">' + statuses[job.status] +
    '</span></td><td><button class="open-job" type="button" data-job="' + job.id + '" aria-label="' + number(job.id) + ' ayrıntısını aç">' + icon("chevron") + '</button></td></tr>'
  ).join("");
  const empty = $("#table-empty");
  empty.hidden = !!list.length;
  if (!list.length) {
    const hasFilter = !!($("#search").value || $("#status-filter").value || metricFilter);
    const title = !ready && !demo ? (loadFailure ? "Kayıtlar yüklenemedi" : "Kayıtlar yükleniyor") : hasFilter ? "Eşleşen iş bulunamadı" : selectedPage === "arsiv" ? "Henüz teslim edilen iş yok" : "Henüz kayıt yok";
    const hint = hasFilter ? "Aramayı veya aşama filtresini değiştirin." : selectedPage === "arsiv" ? "Teslim edildi aşamasındaki işler burada görünür." : "Laboratuvara gelen ilk işi kaydedin.";
    empty.innerHTML = icon("clipboard", "empty-icon mint") + "<strong>" + title + "</strong>" +
      (ready || demo ? "<p>" + hint + "</p>" : "") +
      ((ready || demo) && !loadFailure && !hasFilter && selectedPage !== "arsiv" ? '<button type="button" class="secondary" data-new>' + icon("plus") + " Yeni iş kaydı</button>" : "");
  }
  $("#result-count").textContent = list.length > visible.length ? visible.length + " / " + list.length + " kayıt" : list.length + " kayıt";
  $("#more-jobs").hidden = list.length <= visible.length;
  $("#export").disabled = !list.length;
  if (focusedJob) $("#jobs").querySelector('[data-job="' + focusedJob + '"]')?.focus({ preventScroll: true });
}

function deadlineButton(job, date, detail) {
  const day = asDate(date);
  const month = new Intl.DateTimeFormat("tr-TR", { month: "short", timeZone: "UTC" }).format(day);
  return '<button type="button" class="deadline" data-job="' + job.id + '"><span class="date-tile"><strong>' + day.getUTCDate() +
    "</strong><small>" + month + '</small></span><span class="deadline-copy"><span class="cell-main">' + escapeHtml(typeName(job)) +
    '</span><span class="cell-sub">' + number(job.id) + " · " + escapeHtml(detail) + "</span></span>" + icon("chevron") + "</button>";
}

function renderDeadlines() {
  const upcoming = currentJobs().filter((job) => openStatus(job) && job.due >= today).sort(sortActive).slice(0, 5);
  $("#deadline-list").innerHTML = upcoming.length ? upcoming.map((job) => deadlineButton(job, job.due, job.due === today ? "Bugün" : job.clinic)).join("") :
    '<p class="small-empty">Yaklaşan teslim tarihi olan açık iş yok.</p>';
}

function renderCalendar() {
  const first = asDate(calendarMonth + "-01");
  const year = first.getUTCFullYear();
  const monthIndex = first.getUTCMonth();
  const length = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  const monthDays = new Map();
  for (const job of currentJobs()) {
    if (!openStatus(job)) continue;
    for (const [key, label] of [["due", "Teslim"], ["trial", "Prova"]]) {
      const date = job[key];
      if (!date?.startsWith(calendarMonth)) continue;
      if (!monthDays.has(date)) monthDays.set(date, []);
      monthDays.get(date).push({ job, label });
    }
  }
  $("#month-title").textContent = monthFormat.format(first);
  const weekdays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => '<span class="weekday">' + day + "</span>");
  const blank = '<span class="calendar-blank" aria-hidden="true"></span>';
  const days = Array(offset).fill(blank);
  for (let day = 1; day <= length; day++) {
    const date = calendarMonth + "-" + String(day).padStart(2, "0");
    const entries = monthDays.get(date) || [];
    const deliveries = entries.filter((entry) => entry.label === "Teslim").length;
    const trials = entries.length - deliveries;
    days.push('<button type="button" class="calendar-day" data-day="' + date + '" aria-pressed="' + (date === agendaDay) +
      '"' + (date === today ? ' aria-current="date"' : "") + ' aria-label="' + longDate.format(asDate(date)) + ", " + deliveries + " teslim, " + trials + ' prova"><span class="day-num">' + day +
      "</span>" + (deliveries ? '<span class="day-count">' + deliveries + " teslim</span>" : "") +
      (trials ? '<span class="day-count trial-count">' + trials + " prova</span>" : "") + "</button>");
  }
  while (days.length % 7) days.push(blank);
  const focusedDay = document.activeElement?.dataset.day;
  $("#calendar-grid").innerHTML = weekdays.concat(days).join("");
  if (focusedDay) $("#calendar-grid").querySelector('[data-day="' + focusedDay + '"]')?.focus({ preventScroll: true });
  $("#agenda-title").textContent = longDate.format(asDate(agendaDay));
  const entries = monthDays.get(agendaDay) || [];
  $("#agenda-list").innerHTML = entries.length ? entries.map(({ job, label }) => deadlineButton(job, agendaDay, label + " · " + job.clinic)).join("") :
    '<p class="small-empty">Bu gün için planlanmış teslim veya prova yok.</p>';
}

function render() {
  today = todayString();
  $("#today").dateTime = today;
  $("#today").textContent = longDate.format(asDate(today));
  showConnection();
  $("#metrics").hidden = selectedPage !== "panom";
  $("#content-grid").classList.toggle("full", selectedPage !== "panom");
  $("#deadlines").hidden = selectedPage !== "panom";
  $("#job-panel").hidden = selectedPage === "takvim";
  $("#calendar-panel").hidden = selectedPage !== "takvim";
  if (selectedPage === "panom") {
    renderMetrics();
    renderDeadlines();
  }
  if (selectedPage === "takvim") renderCalendar();
  else renderJobs();
}

function updatePage() {
  const hash = location.hash.slice(1);
  const knownPage = Object.hasOwn(pages, hash);
  if (hash && !knownPage) history.replaceState(null, "", location.pathname + location.search);
  selectedPage = knownPage ? hash : "panom";
  const [breadcrumb, title, subtitle] = pages[selectedPage];
  $("#breadcrumb").textContent = breadcrumb;
  $("#page-title").textContent = title;
  $("#page-subtitle").textContent = subtitle;
  $("#jobs-title").textContent = selectedPage === "arsiv" ? "Teslim edilen işler" : "İş kayıtları";
  $("#jobs-subtitle").textContent = selectedPage === "arsiv" ? "Aşaması teslim edildi olan kayıtlar" : "Laboratuvarınızdaki işlerin güncel durumu";
  $("#status-filter").hidden = selectedPage === "arsiv";
  $("#status-filter").parentElement.hidden = selectedPage === "arsiv";
  $("#status-filter").querySelector('[value="teslim"]').hidden = selectedPage === "isler";
  for (const link of document.querySelectorAll("[data-page]")) {
    if (link.dataset.page === selectedPage) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  resetFilters();
  setMenu(false);
  render();
}

function resetFilters() {
  $("#search").value = "";
  $("#status-filter").value = "";
  metricFilter = "";
  pageLimit = 10;
}

function toggleDemo(enabled) {
  if (enabled && !demoJobs.length) demoJobs = demoData();
  demo = enabled;
  resetFilters();
  setMenu(false);
  render();
  if (!demo) refresh(true);
}

function setMenu(open, restoreFocus = false) {
  $("#sidebar").classList.toggle("open", open);
  $("#nav-overlay").hidden = !open;
  const toggle = $("#menu-toggle");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
  if (open) $("#sidebar [aria-current='page']")?.focus();
  else if (restoreFocus) toggle.focus();
}

function changeMonth(delta) {
  const date = asDate(calendarMonth + "-01");
  date.setUTCMonth(date.getUTCMonth() + delta);
  calendarMonth = dateOnly(date).slice(0, 7);
  agendaDay = calendarMonth === today.slice(0, 7) ? today : calendarMonth + "-01";
  renderCalendar();
}

function setCustomType() {
  const custom = controls.type.value === "__custom";
  $("#custom-type-label").hidden = !custom;
  if (!custom) controls.customType.value = "";
}

function renderTemporaryWorkflow() {
  const stage = controls.status.value;
  const action = temporaryNext[stage];
  const temporary = controls.temporary.checked || temporaryStages.has(stage) || temporaryTypes.has(controls.type.value);
  $("#temporary-flow").hidden = !temporary || !action;
  if (!temporary || !action) return;
  const phase = $("#temporary-phase");
  phase.className = "badge status-" + stage;
  phase.textContent = statuses[stage];
  const next = $("#temporary-next");
  next.dataset.stage = action[0];
  next.textContent = action[1];
  $("#temporary-revise").hidden = stage !== "gecici_prova" && stage !== "gecici_goruldu";
}

function selectJobStage(stage) {
  controls.status.value = stage;
  if (temporaryStages.has(stage)) controls.temporary.checked = true;
  renderTemporaryWorkflow();
}

function startTemporaryWorkflow() {
  if (controls.status.value === "kabul" || controls.status.value === "tasarim") selectJobStage("gecici");
  else renderTemporaryWorkflow();
}

function showFormError(message) {
  $("#form-error").textContent = message;
  $("#form-error").hidden = !message;
}

async function openJob(id) {
  const job = id === null ? null : currentJobs().find((entry) => entry.id === id);
  if ((!job && id !== null) || (!demo && (!ready || loadFailure))) return;
  const token = ++modalToken;
  dialogSource = document.activeElement;
  editId = id;
  editVersion = job?.version ?? null;
  submissionKey = job || demo ? "" : crypto.randomUUID();
  form.reset();
  showFormError("");
  const title = $("#dialog-title");
  title.textContent = job ? "İş ayrıntısı" : "Yeni iş kaydı";
  $("#dialog-kicker").textContent = job ? number(job.id) : "İŞ KABUL";
  $("#save-job").lastElementChild.textContent = job ? "Değişiklikleri kaydet" : "İşi kaydet";
  const recordMeta = $("#record-meta");
  recordMeta.hidden = true;
  recordMeta.replaceChildren();
  if (job) {
    for (const field of ["patientCode", "clinic", "received", "due", "trial", "status", "owner", "teeth", "units", "shade", "notes", "doctorNotes"]) {
      controls[field].value = job[field] ?? "";
    }
    controls.temporary.checked = job.temporary;
    const custom = job.type && !types.includes(job.type);
    controls.type.value = custom ? "__custom" : job.type;
    controls.customType.value = custom ? job.type : "";
  } else {
    controls.received.value = today;
    controls.status.value = "kabul";
  }
  setCustomType();
  renderTemporaryWorkflow();
  dialog.showModal();
  $(".dialog-body").scrollTop = 0;
  if (!job || demo) return;
  try {
    const record = await api("/api/jobs/" + id);
    if (token !== modalToken || !dialog.open) return;
    if (record.version !== editVersion) showFormError("Bu kayıt güncellendi. Son sürümü görmek için kapatıp yeniden açın.");
    recordMeta.innerHTML = '<details><summary>Aşama geçmişi</summary><ul>' + record.history.map((entry) =>
      "<li>" + statuses[entry.status] + " · " + timeFormat.format(new Date(entry.at)) + "</li>").join("") + "</ul></details>";
    recordMeta.hidden = !record.history.length;
  } catch {
    if (token === modalToken && dialog.open) {
      recordMeta.textContent = "Aşama geçmişi şu anda görüntülenemiyor.";
      recordMeta.hidden = false;
    }
  }
}

async function saveJob(event) {
  event.preventDefault();
  if (saving) return;
  const data = Object.fromEntries(new FormData(form));
  data.type = data.type === "__custom" ? data.customType : data.type;
  delete data.customType;
  data.temporary = controls.temporary.checked;
  data.units = data.units ? Number(data.units) : null;
  data.version = editVersion;
  if (editId === null && !demo) data.submissionKey = submissionKey;
  for (const field of ["clinic", "patientCode", "owner", "type", "teeth", "shade", "notes", "doctorNotes"]) data[field] = data[field].trim();
  showFormError("");
  const id = editId;
  const button = $("#save-job");
  saving = true;
  button.disabled = true;
  try {
    let saved;
    if (demo) {
      const recordId = id ?? Math.max(0, ...demoJobs.map((job) => job.id)) + 1;
      saved = { ...data, id: recordId, version: (editVersion ?? 0) + 1, updatedAt: new Date().toISOString() };
      demoJobs = [...demoJobs.filter((job) => job.id !== recordId), saved];
    } else {
      saved = await api("/api/jobs" + (id === null ? "" : "/" + id), {
        method: id === null ? "POST" : "PUT", body: JSON.stringify(data)
      });
      snapshotSequence++;
      jobs = [...jobs.filter((job) => job.id !== saved.id), saved];
      loadFailure = "";
    }
    dialog.close();
    render();
    notify(number(saved.id) + (id === null ? " kaydedildi." : " güncellendi."));
    if (!demo) refresh(true);
  } catch (error) {
    showFormError(error instanceof TypeError ? "Bağlantı kurulamadı. Tekrar deneyin." : error.message);
    if (error.status === 409) {
      await refresh(true);
    }
  } finally {
    saving = false;
    button.disabled = false;
  }
}

function notify(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { toast.hidden = true; }, 3500);
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCsv() {
  const columns = ["İş no", "İş referansı", "Klinik / Hekim", "İş türü", "Giriş", "Teslim", "Prova", "Aşama", "Teknisyen", "Diş / Bölge", "Adet", "Renk", "Geçici", "Üretim notları", "Hekim notları"];
  const cells = (job) => [number(job.id), job.patientCode, job.clinic, job.type, job.received, job.due, job.trial, statuses[job.status], job.owner, job.teeth, job.units, job.shade, job.temporary ? "Evet" : "Hayır", job.notes, job.doctorNotes];
  const quote = (value) => {
    let cell = String(value ?? "");
    if (/^[\s\uFEFF]*[=+\-@]|^[\t\r\n]/.test(cell)) cell = "'" + cell;
    return '"' + cell.replaceAll('"', '""') + '"';
  };
  const content = "\uFEFF" + [columns, ...filteredJobs().map(cells)].map((row) => row.map(quote).join(";")).join("\r\n");
  downloadFile(new Blob([content], { type: "text/csv;charset=utf-8" }), (demo ? "ornek-" : "") + "protez-isleri-" + today + ".csv");
}

async function downloadBackup() {
  const button = $("#backup");
  button.disabled = true;
  try {
    const backup = await api("/api/backup");
    const file = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    downloadFile(file, "protez-lab-yedek-" + today + ".json");
  } catch {
    notify("Yedek indirilemedi. Yeniden deneyin.");
  } finally {
    button.disabled = demo || !ready || !!loadFailure;
  }
}

for (const node of document.querySelectorAll("[data-icon]")) node.innerHTML = svg(node.dataset.icon);
const options = Object.entries(statuses).map(([key, label]) => '<option value="' + key + '">' + label + "</option>").join("");
$("#status-filter").insertAdjacentHTML("beforeend", '<option value="temporary">Geçici içeren işler</option>' + options);
$("#form-status").innerHTML = options;
$("#type-select").innerHTML = '<option value="">Seçilmedi</option>' + types.map((type) =>
  "<option>" + type + "</option>").join("") + '<option value="__custom">Diğer</option>';
controls.type.addEventListener("change", () => {
  setCustomType();
  if (temporaryTypes.has(controls.type.value)) {
    controls.temporary.checked = true;
    startTemporaryWorkflow();
  } else {
    renderTemporaryWorkflow();
  }
});
controls.temporary.addEventListener("change", () => {
  if (controls.temporary.checked) startTemporaryWorkflow();
  else renderTemporaryWorkflow();
});
controls.status.addEventListener("change", () => selectJobStage(controls.status.value));
$("#temporary-next").addEventListener("click", (event) => {
  if (saving) return;
  selectJobStage(event.currentTarget.dataset.stage);
  if ($("#temporary-flow").hidden) controls.status.focus();
});
$("#temporary-revise").addEventListener("click", () => {
  if (saving) return;
  selectJobStage("gecici_duzeltme");
  controls.doctorNotes.focus();
});
form.addEventListener("submit", saveJob);
dialog.addEventListener("cancel", (event) => { if (saving) event.preventDefault(); });
dialog.addEventListener("close", () => { dialogSource?.focus(); if (!demo) render(); });
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.matches("[data-new]")) openJob(null);
  if (button.matches("[data-job]")) openJob(Number(button.dataset.job));
  if (button.matches("[data-close]") && !saving) dialog.close();
  if (button.matches("[data-day]")) {
    agendaDay = button.dataset.day;
    renderCalendar();
  }
  if (button.matches("[data-metric]")) {
    const key = button.dataset.metric;
    metricFilter = metricFilter === key ? "" : key;
    $("#status-filter").value = Object.hasOwn(statuses, metricFilter) ? metricFilter : "";
    pageLimit = 10;
    render();
  }
});
$("#status-filter").addEventListener("change", () => {
  metricFilter = "";
  pageLimit = 10;
  render();
});
$("#search").addEventListener("input", () => { pageLimit = 10; renderJobs(); });
$("#more-jobs").addEventListener("click", () => { pageLimit += 10; renderJobs(); });
$("#export").addEventListener("click", exportCsv);
$("#backup").addEventListener("click", downloadBackup);
$("#menu-toggle").addEventListener("click", () => setMenu($("#nav-overlay").hidden, true));
$("#nav-overlay").addEventListener("click", () => setMenu(false, true));
$("#sidebar").addEventListener("keydown", (event) => { if (event.key === "Escape") setMenu(false, true); });
$("#sidebar nav").addEventListener("click", () => setMenu(false, true));
$("#demo-toggle").addEventListener("click", () => toggleDemo(!demo));
$("#exit-demo").addEventListener("click", () => toggleDemo(false));
$("#retry").addEventListener("click", () => refresh());
$("#previous-month").addEventListener("click", () => changeMonth(-1));
$("#next-month").addEventListener("click", () => changeMonth(1));
$("#current-month").addEventListener("click", () => {
  today = todayString();
  calendarMonth = today.slice(0, 7);
  agendaDay = today;
  renderCalendar();
});
window.addEventListener("hashchange", updatePage);
window.addEventListener("focus", () => { if (!demo && !saving) refresh(true); });
setInterval(() => { if (!demo && !document.hidden && !saving) refresh(true); }, 45000);
if (new URLSearchParams(location.search).get("demo") === "1") toggleDemo(true);
updatePage();
if (!demo) refresh();
