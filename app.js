"use strict";

const $ = (selector) => document.querySelector(selector);
const apiOrigin = $('meta[name="protez-api-origin"]').content;
const deleteWaitMs = 4000;
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
const temporaryPendingStages = new Set(["kabul", "tasarim", "gecici", "gecici_basildi", "gecici_prova", "gecici_goruldu", "gecici_duzeltme"]);
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
  geciprova: ["Geçici provalar", "Geçici provalar", "Geçici prova teslim tarihlerini ve hekim onayı bekleyen işleri takip edin."],
  takvim: ["Teslimat takvimi", "Teslimat takvimi", "Bitim ve prova tarihlerini gün gün görün."],
  arsiv: ["Tamamlanan işler", "Tamamlanan işler", "Teslim edilen protez işlerine ve ayrıntılarına ulaşın."],
  kilavuz: ["Nasıl kullanılır", "Nasıl kullanılır?", "İş kaydından teslimata kadar Orilab'ı kullanmayı öğrenin."]
};
const scheduleKinds = {
  final: { label: "Bitim", dayLabel: "Bitim", abbr: "B" },
  temporary: { label: "Geçici prova", dayLabel: "Geçici", abbr: "G" },
  trial: { label: "Prova", dayLabel: "Prova", abbr: "P" }
};
const icons = {
  tooth: '<path d="M12 5.8c-1.4-.3-2.2-1.7-4.6-1.5C3.5 4.7 3 8.6 4.6 12c1.1 2.5 1.1 6.4 3.1 6.8 1.8.4 1.6-5.1 4.3-5.1s2.5 5.5 4.3 5.1c2-.4 2-4.3 3.1-6.8C21 8.6 20.5 4.7 16.6 4.3c-2.4-.2-3.2 1.2-4.6 1.5Z"/><path d="M10.2 5.3c1.7 1.2 3 1.7 4.3 1.3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M8 11h8m-8 5h6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18m-13 5h2m4 0h2"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9m-9 4h4"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3h.01"/>',
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
const shortMonth = new Intl.DateTimeFormat("tr-TR", { month: "short", timeZone: "UTC" });
const timeFormat = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" });
const asDate = (date) => new Date(date + "T12:00:00Z");
const displayDate = (date) => date ? shortDate.format(asDate(date)) : "—";
const dateOnly = (date) => date.toISOString().slice(0, 10);
const openStatus = (job) => job.status !== "teslim";
const hasTemporary = (job) => job.temporary || temporaryStages.has(job.status) || temporaryTypes.has(job.type);
const pendingTemporary = (job) => hasTemporary(job) && temporaryPendingStages.has(job.status);
const trialIsLate = (job) =>
  job.trial && job.trial < today && pendingTemporary(job) && job.status !== "gecici_prova" && job.status !== "gecici_goruldu";
const typeName = (job) => job.type || "İş türü girilmedi";
const jobDescription = (job) => {
  const description = (job.patientCode || "").trim();
  return /^PL[\s-]*\d+$/i.test(description) ? "" : description;
};
const jobTitle = (job) => jobDescription(job) || job.type || "İş kaydı";

let today = todayString();
let calendarMonth = today.slice(0, 7);
let agendaDay = today;
let selectedPage = "panom";
let jobs = [];
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
let mutationPending = false;
let deleteDeadline = null;
let deleteTimeout;
let toastTimeout;
let dialogSource;

const form = $("#job-form");
const dialog = $("#job-dialog");
const controls = form.elements;
const sortActive = (a, b) => (a.due || "9999").localeCompare(b.due || "9999") || b.id - a.id;
const sortTemporary = (a, b) => (a.trial || "9999").localeCompare(b.trial || "9999") || sortActive(a, b);

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
  if (quiet && dialog.open) showConnection();
  else render();
}

function showConnection() {
  const state = loadFailure ? "error" : ready ? "online" : "loading";
  const connection = $("#connection");
  connection.dataset.state = state;
  connection.lastElementChild.textContent = { error: "Bağlantı sorunu", online: "Çevrimiçi", loading: "Bağlanıyor" }[state];
  $("#load-error").hidden = !loadFailure || selectedPage === "kilavuz";
  $("#load-error-text").textContent = loadFailure;
  $(".new-button").disabled = !ready || !!loadFailure;
  $("#backup").disabled = !ready || !!loadFailure;
}

function renderMetrics() {
  const active = jobs.filter(openStatus);
  const todayJobs = active.filter((job) => job.due === today);
  const overdue = active.filter((job) => job.due && job.due < today);
  const tiles = [
    ["active", "Aktif işler", active.length, "Teslimat bekleyen işler", "clipboard", "mint"],
    ["tasarim", "Tasarımda", active.filter((job) => job.status === "tasarim").length, "Tasarım aşamasında", "design", "rose"],
    ["kazima", "Kazımada", active.filter((job) => job.status === "kazima").length, "Kazıma aşamasında", "mill", "cyan"],
    ["uretim", "Üretimde", active.filter((job) => job.status === "uretim").length, "Üretim aşamasındaki işler", "tool", "blue"],
    ["today", "Bugün bitim", todayJobs.length, overdue.length ? overdue.length + " geciken iş de var" : "Bugüne planlanan bitimler", "clock", "amber"],
    ["hazir", "Teslime hazır", active.filter((job) => job.status === "hazir").length, "Teslim için bekleyen işler", "circled", "purple"],
    ["geciprova", "Geçici provalar", active.filter(pendingTemporary).length, "Planlama ve hekim onayı", "calendar", "rose"]
  ];
  const oldFocus = document.activeElement?.dataset.metric;
  $("#metrics").innerHTML = tiles.map(([key, label, count, hint, glyph, color]) => {
    const content = '<span><span class="metric-label">' + label + '</span><strong class="metric-number">' +
      (ready ? count : "—") + '</strong></span>' + icon(glyph, "metric-icon " + color) + '<span class="metric-note">' + hint + "</span>";
    if (key === "geciprova") return '<a class="metric" href="#geciprova">' + content + "</a>";
    return '<button class="metric" type="button" data-metric="' + key + '" aria-pressed="' + (metricFilter === key) + '"' +
      (!ready ? " disabled" : "") + ">" + content + "</button>";
  }).join("");
  if (oldFocus) $("#metrics").querySelector('[data-metric="' + oldFocus + '"]')?.focus({ preventScroll: true });
}

function filteredJobs() {
  const query = $("#search").value.trim().toLocaleLowerCase("tr-TR");
  const stage = $("#status-filter").value;
  const archive = selectedPage === "arsiv";
  const temporaryView = selectedPage === "geciprova";
  let list = jobs.filter(archive ? (job) => !openStatus(job) : openStatus);
  if (temporaryView) list = list.filter(pendingTemporary);
  if (metricFilter === "today") list = list.filter((job) => job.due === today);
  if (stage === "temporary") list = list.filter(hasTemporary);
  else if (stage) list = list.filter((job) => job.status === stage);
  if (query) {
    list = list.filter((job) => [jobDescription(job), job.clinic, job.type, job.owner, job.assistant].some(
      (value) => (value || "").toLocaleLowerCase("tr-TR").includes(query)
    ));
  }
  if (archive) return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return list.sort(temporaryView ? sortTemporary : sortActive);
}

function renderJobs() {
  const list = filteredJobs();
  const visible = list.slice(0, pageLimit);
  const temporaryView = selectedPage === "geciprova";
  const dateLabel = temporaryView ? "Geçici prova" : "Bitim";
  const focusedJob = $("#jobs").contains(document.activeElement) ? document.activeElement.dataset.job : null;
  $("#jobs").innerHTML = visible.map((job) => {
    const date = temporaryView ? job.trial : job.due;
    const late = temporaryView ? trialIsLate(job) : openStatus(job) && job.due && job.due < today;
    let otherDate = "";
    if (temporaryView && job.due) otherDate = "Bitim · " + displayDate(job.due);
    if (!temporaryView && openStatus(job) && hasTemporary(job) && job.trial) {
      otherDate = "Geçici prova · " + displayDate(job.trial);
    }
    return '<tr class="job-row"><td><span class="cell-main case">' + escapeHtml(jobTitle(job)) +
      '</span></td><td><span class="cell-main">' + escapeHtml(typeName(job)) + '</span>' +
      (job.clinic ? '<span class="cell-sub">' + escapeHtml(job.clinic) + '</span>' : '') +
      (job.owner ? '<span class="cell-sub">Teknisyen · ' + escapeHtml(job.owner) + '</span>' : '') +
      (job.assistant ? '<span class="cell-sub">Asistan · ' + escapeHtml(job.assistant) + '</span>' : '') +
      '</td><td><span class="cell-main date-cell' + (late ? " date-late" : "") + '" data-label="' + dateLabel + '">' +
      (temporaryView && !date ? "Planlanmadı" : displayDate(date)) + '</span>' +
      (otherDate ? '<span class="cell-sub">' + otherDate + '</span>' : '') +
      '</td><td><span class="badge status-' + job.status + '">' + statuses[job.status] +
      '</span></td><td><button class="open-job" type="button" data-job="' + job.id + '" aria-label="' + escapeHtml(jobTitle(job)) +
      ' ayrıntısını aç">' + icon("chevron") + '</button></td></tr>';
  }).join("");
  const empty = $("#table-empty");
  empty.hidden = !!list.length;
  if (!list.length) {
    const hasFilter = !!($("#search").value || $("#status-filter").value || metricFilter);
    const title = !ready ? (loadFailure ? "Kayıtlar yüklenemedi" : "Kayıtlar yükleniyor") : hasFilter ? "Eşleşen iş bulunamadı" :
      selectedPage === "arsiv" ? "Henüz teslim edilen iş yok" : temporaryView ? "Bekleyen geçici prova yok" : "Henüz kayıt yok";
    const hint = hasFilter ? "Aramayı veya aşama filtresini değiştirin." : selectedPage === "arsiv" ? "Teslim edildi aşamasındaki işler burada görünür." :
      temporaryView ? "Geçici olarak işaretlenen ve onay bekleyen işler burada görünür." : "Laboratuvara gelen ilk işi kaydedin.";
    empty.innerHTML = icon("clipboard", "empty-icon mint") + "<strong>" + title + "</strong>" +
      (ready ? "<p>" + hint + "</p>" : "") +
      (ready && !loadFailure && !hasFilter && selectedPage !== "arsiv" ? '<button type="button" class="secondary" data-new>' + icon("plus") + " Yeni iş kaydı</button>" : "");
  }
  $("#result-count").textContent = list.length > visible.length ? visible.length + " / " + list.length + " kayıt" : list.length + " kayıt";
  $("#more-jobs").hidden = list.length <= visible.length;
  $("#export").disabled = !list.length;
  if (focusedJob) $("#jobs").querySelector('[data-job="' + focusedJob + '"]')?.focus({ preventScroll: true });
}

function jobSchedule(job) {
  return [
    { job, date: job.due, kind: "final" },
    { job, date: job.trial, kind: hasTemporary(job) ? "temporary" : "trial" }
  ].filter((entry) => entry.date);
}

function deadlineButton({ job, date, kind }, indicator = "") {
  const day = asDate(date);
  const title = jobTitle(job);
  const description = [indicator, job.clinic, job.type !== title ? job.type : ""].filter(Boolean).join(" · ");
  return '<button type="button" class="deadline" data-job="' + job.id + '" data-schedule-kind="' + kind +
    '"><span class="date-tile"><strong>' + day.getUTCDate() + "</strong><small>" + shortMonth.format(day) +
    '</small></span><span class="deadline-copy"><span class="cell-main">' + escapeHtml(title) +
    '</span><span class="deadline-kind calendar-' + kind + '">' + scheduleKinds[kind].label + "</span>" +
    (description ? '<span class="cell-sub">' + escapeHtml(description) + "</span>" : "") +
    "</span>" + icon("chevron") + "</button>";
}

function renderDeadlines() {
  const scheduled = jobs.filter(openStatus).flatMap(jobSchedule).filter(
    (entry) => entry.kind === "final" || (entry.kind === "temporary" && pendingTemporary(entry.job))
  );
  const upcoming = scheduled.filter((entry) => entry.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || b.job.id - a.job.id).slice(0, 5);
  const late = scheduled.filter((entry) => entry.kind === "temporary" && trialIsLate(entry.job))
    .sort((a, b) => b.date.localeCompare(a.date) || b.job.id - a.job.id)[0];
  if (late) upcoming.push(late);
  $("#deadline-list").innerHTML = upcoming.length ? upcoming.map(
    (entry) => deadlineButton(entry, entry.date === today ? "Bugün" : entry.date < today ? "Gecikti" : "")
  ).join("") : '<p class="small-empty">Yaklaşan bitim veya geçici prova teslimi yok.</p>';
}

function renderCalendar() {
  const first = asDate(calendarMonth + "-01");
  const year = first.getUTCFullYear();
  const monthIndex = first.getUTCMonth();
  const length = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  const monthDays = new Map();
  for (const job of jobs) {
    if (!openStatus(job)) continue;
    for (const entry of jobSchedule(job)) {
      if (!entry.date.startsWith(calendarMonth)) continue;
      if (!monthDays.has(entry.date)) monthDays.set(entry.date, []);
      monthDays.get(entry.date).push(entry);
    }
  }
  $("#month-title").textContent = monthFormat.format(first);
  const weekdays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => '<span class="weekday">' + day + "</span>");
  const blank = '<span class="calendar-blank" aria-hidden="true"></span>';
  const days = Array(offset).fill(blank);
  for (let day = 1; day <= length; day++) {
    const date = calendarMonth + "-" + String(day).padStart(2, "0");
    const entries = monthDays.get(date) || [];
    const labels = [];
    const counts = [];
    for (const [kind, { label, dayLabel, abbr }] of Object.entries(scheduleKinds)) {
      const count = entries.filter((entry) => entry.kind === kind).length;
      if (!count) continue;
      labels.push(count + " " + label.toLocaleLowerCase("tr-TR"));
      counts.push('<span class="day-count calendar-' + kind + '" aria-hidden="true">' + count +
        ' <span class="day-count-label">' + dayLabel + '</span><span class="day-count-abbr">' + abbr + '</span></span>');
    }
    const description = labels.length ? labels.join(", ") : "Planlanmış iş yok";
    days.push('<button type="button" class="calendar-day" data-day="' + date + '" aria-pressed="' + (date === agendaDay) +
      '"' + (date === today ? ' aria-current="date"' : "") + ' aria-label="' + longDate.format(asDate(date)) + ", " +
      description + '"><span class="day-num">' + day + "</span>" + counts.join("") + "</button>");
  }
  while (days.length % 7) days.push(blank);
  const focusedDay = document.activeElement?.dataset.day;
  $("#calendar-grid").innerHTML = weekdays.concat(days).join("");
  if (focusedDay) $("#calendar-grid").querySelector('[data-day="' + focusedDay + '"]')?.focus({ preventScroll: true });
  $("#agenda-title").textContent = longDate.format(asDate(agendaDay));
  const entries = monthDays.get(agendaDay) || [];
  $("#agenda-list").innerHTML = entries.length ? entries.map((entry) => deadlineButton(entry)).join("") :
    '<p class="small-empty">Bu gün için planlanmış bitim veya prova yok.</p>';
}

function render() {
  today = todayString();
  $("#today").dateTime = today;
  $("#today").textContent = longDate.format(asDate(today));
  showConnection();
  $("#metrics").hidden = selectedPage !== "panom";
  const content = $("#content-grid");
  content.hidden = selectedPage === "kilavuz";
  content.classList.toggle("full", selectedPage !== "panom");
  $("#deadlines").hidden = selectedPage !== "panom";
  $("#job-panel").hidden = selectedPage === "takvim" || selectedPage === "kilavuz";
  $("#calendar-panel").hidden = selectedPage !== "takvim";
  $("#guide-panel").hidden = selectedPage !== "kilavuz";
  if (selectedPage === "panom") {
    renderMetrics();
    renderDeadlines();
  }
  if (selectedPage === "takvim") renderCalendar();
  else if (selectedPage !== "kilavuz") renderJobs();
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
  const archive = selectedPage === "arsiv";
  const temporaryView = selectedPage === "geciprova";
  $("#jobs-title").textContent = archive ? "Teslim edilen işler" : temporaryView ? "Bekleyen geçici provalar" : "İş kayıtları";
  $("#jobs-subtitle").textContent = archive ? "Aşaması teslim edildi olan kayıtlar" :
    temporaryView ? "Prova teslim tarihine göre sıralanır" : "Laboratuvarınızdaki işlerin güncel durumu";
  $("#job-date-heading").textContent = temporaryView ? "Geçici prova teslimi" : "Bitim";
  const statusFilter = $("#status-filter");
  const options = temporaryView ? temporaryStatusOptions : '<option value="temporary">Geçici içeren işler</option>' + activeStatusOptions;
  statusFilter.innerHTML = '<option value="">Tüm aşamalar</option>' + options;
  statusFilter.hidden = archive;
  statusFilter.parentElement.hidden = archive;
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
  const temporary = hasTemporary({ temporary: controls.temporary.checked, status: stage, type: controls.type.value });
  $("#trial-date-label").textContent = temporary ? "Geçici prova teslim tarihi" : "Prova tarihi";
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

function updateDeleteCountdown() {
  clearTimeout(deleteTimeout);
  const confirming = deleteDeadline !== null;
  const remaining = confirming ? deleteDeadline - performance.now() : 0;
  const seconds = Math.ceil(remaining / 1000);
  const waiting = remaining > 0;
  const enabled = confirming && !waiting && !mutationPending && editVersion !== null;
  $("#delete-confirm").disabled = !enabled;
  $("#delete-countdown").textContent = mutationPending ? "Siliniyor…" : waiting ? seconds + " saniye bekleyin." : "Silme onayı hazır.";
  const status = $("#delete-status");
  const message = enabled ? "Silme onayı hazır. Sil düğmesi kullanılabilir." : "";
  if (status.textContent !== message) status.textContent = message;
  if (waiting) {
    deleteTimeout = setTimeout(updateDeleteCountdown, remaining - (seconds - 1) * 1000);
  }
}

function syncJobActions() {
  const confirming = deleteDeadline !== null;
  const stale = editId !== null && editVersion === null;
  $("#delete-confirmation").hidden = !confirming;
  $("#delete-job").hidden = editId === null || confirming;
  $("#delete-job").disabled = mutationPending || stale;
  $("#delete-job").setAttribute("aria-expanded", String(confirming));
  $("#delete-cancel").disabled = mutationPending;
  $("#save-job").disabled = mutationPending || stale || confirming;
  const fields = $("#job-edit-fields");
  fields.hidden = confirming;
  fields.inert = mutationPending || confirming;
  for (const button of dialog.querySelectorAll("[data-close]")) button.disabled = mutationPending;
  updateDeleteCountdown();
}

function cancelDeleteConfirmation() {
  if (mutationPending || deleteDeadline === null) return;
  deleteDeadline = null;
  syncJobActions();
  showFormError("");
  $("#delete-job").focus();
}

function startDeleteConfirmation() {
  if (!dialog.open || mutationPending || editVersion === null || deleteDeadline !== null) return;
  deleteDeadline = performance.now() + deleteWaitMs;
  syncJobActions();
  showFormError("");
  $("#delete-confirm-title").focus();
}

function invalidateEdit(message) {
  const wasConfirming = deleteDeadline !== null;
  editVersion = null;
  deleteDeadline = null;
  syncJobActions();
  showFormError(message);
  if (wasConfirming && !mutationPending) dialog.querySelector("[data-close]").focus();
}

async function openJob(id, source) {
  if (!ready || loadFailure || dialog.open || mutationPending) return;
  const job = id === null ? null : jobs.find((entry) => entry.id === id);
  if (!job && id !== null) return;
  const token = ++modalToken;
  dialogSource = source;
  editId = id;
  editVersion = job?.version ?? null;
  deleteDeadline = null;
  syncJobActions();
  submissionKey = job ? "" : crypto.randomUUID();
  form.reset();
  showFormError("");
  const title = $("#dialog-title");
  title.textContent = job ? jobTitle(job) : "Yeni iş kaydı";
  $("#save-job").lastElementChild.textContent = job ? "Değişiklikleri kaydet" : "İşi kaydet";
  const recordMeta = $("#record-meta");
  recordMeta.hidden = true;
  recordMeta.replaceChildren();
  if (job) {
    for (const field of ["clinic", "received", "due", "trial", "status", "owner", "assistant", "teeth", "units", "shade", "notes", "doctorNotes"]) {
      controls[field].value = job[field] ?? "";
    }
    controls.patientCode.value = jobDescription(job);
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
  if (!job) return;
  try {
    const record = await api("/api/jobs/" + id);
    if (token !== modalToken || !dialog.open) return;
    if (!mutationPending && editVersion !== null && record.version !== editVersion) {
      invalidateEdit("Bu kayıt güncellendi. Son sürümü görmek için kapatıp yeniden açın.");
      refresh(true);
    }
    const entries = record.history || [];
    recordMeta.innerHTML = '<details><summary>Aşama geçmişi</summary><ul>' + entries.map((entry) =>
      "<li>" + statuses[entry.status] + " · " + timeFormat.format(new Date(entry.at)) + "</li>").join("") + "</ul></details>";
    recordMeta.hidden = !entries.length;
  } catch (error) {
    if (token === modalToken && dialog.open) {
      recordMeta.textContent = "Aşama geçmişi şu anda görüntülenemiyor.";
      recordMeta.hidden = false;
      if (error.status === 404 && !mutationPending && editVersion !== null) {
        invalidateEdit("Bu iş kaydı artık mevcut değil. Pencereyi kapatın.");
        refresh(true);
      }
    }
  }
}

async function saveJob(event) {
  event.preventDefault();
  if (mutationPending || deleteDeadline !== null || (editId !== null && editVersion === null)) return;
  const data = Object.fromEntries(new FormData(form));
  data.type = data.type === "__custom" ? data.customType : data.type;
  delete data.customType;
  const existing = jobs.find((job) => job.id === editId);
  if (!data.patientCode && existing && !jobDescription(existing)) {
    data.patientCode = existing.patientCode;
  }
  data.temporary = hasTemporary({ temporary: controls.temporary.checked, status: data.status, type: data.type });
  data.units = data.units ? Number(data.units) : null;
  data.version = editVersion;
  if (editId === null) data.submissionKey = submissionKey;
  for (const field of ["clinic", "patientCode", "owner", "assistant", "type", "teeth", "shade", "notes", "doctorNotes"]) {
    data[field] = (data[field] || "").trim();
  }
  showFormError("");
  const id = editId;
  mutationPending = true;
  syncJobActions();
  try {
    const saved = await api("/api/jobs" + (id === null ? "" : "/" + id), {
      method: id === null ? "POST" : "PUT", body: JSON.stringify(data)
    });
    snapshotSequence++;
    jobs = [...jobs.filter((job) => job.id !== saved.id), saved];
    loadFailure = "";
    dialog.close();
    notify(id === null ? "İş kaydedildi." : "İş güncellendi.");
    refresh(true);
  } catch (error) {
    if (id !== null && (error.status === 409 || error.status === 404)) {
      invalidateEdit(error.message);
      await refresh(true);
    } else {
      showFormError(error instanceof TypeError ? "Bağlantı kurulamadı. Tekrar deneyin." : error.message);
    }
  } finally {
    mutationPending = false;
    syncJobActions();
  }
}

function finishJobDeletion(id, message) {
  snapshotSequence++;
  jobs = jobs.filter((job) => job.id !== id);
  jobsTag = "";
  loadFailure = "";
  dialog.close();
  notify(message);
  refresh(true);
}

async function deleteJob() {
  if (!dialog.open || mutationPending || editVersion === null || deleteDeadline === null || performance.now() < deleteDeadline) return;
  const id = editId;
  mutationPending = true;
  syncJobActions();
  showFormError("");
  try {
    const result = await api("/api/jobs/" + id, {
      method: "DELETE", body: JSON.stringify({ version: editVersion })
    });
    if (result?.deleted !== true) throw new Error("İş silinemedi. Tekrar deneyin.");
    finishJobDeletion(id, "İş silindi.");
  } catch (error) {
    if (error.status === 404) {
      finishJobDeletion(id, "İş kaydı artık mevcut değil.");
    } else if (error.status === 409) {
      invalidateEdit("Bu kayıt güncellendi. Son sürümü görmek için kapatıp yeniden açın.");
      await refresh(true);
    } else {
      showFormError(error instanceof TypeError ? "Bağlantı kurulamadı. Silmeyi tekrar deneyin." : error.message);
    }
  } finally {
    mutationPending = false;
    syncJobActions();
    if (dialog.open) {
      const next = editVersion === null ? dialog.querySelector("[data-close]") : $("#delete-confirm");
      next.focus();
    }
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
  const columns = ["İş tanımı", "Klinik / Hekim", "İş türü", "Giriş", "Bitim tarihi", "Geçici prova teslim tarihi", "Prova tarihi", "Aşama", "Teknisyen", "Asistan", "Diş / Bölge", "Adet", "Renk", "Geçici", "Üretim notları", "Hekim notları"];
  const cells = (job) => {
    const temporary = hasTemporary(job);
    return [jobDescription(job), job.clinic, job.type, job.received, job.due, temporary ? job.trial : "", temporary ? "" : job.trial,
      statuses[job.status], job.owner, job.assistant, job.teeth, job.units, job.shade, temporary ? "Evet" : "Hayır", job.notes, job.doctorNotes];
  };
  const quote = (value) => {
    let cell = String(value ?? "");
    if (/^[\s\uFEFF]*[=+\-@]|^[\t\r\n]/.test(cell)) cell = "'" + cell;
    return '"' + cell.replaceAll('"', '""') + '"';
  };
  const content = "\uFEFF" + [columns, ...filteredJobs().map(cells)].map((row) => row.map(quote).join(";")).join("\r\n");
  downloadFile(new Blob([content], { type: "text/csv;charset=utf-8" }), "orilab-isleri-" + today + ".csv");
}

async function downloadBackup() {
  const button = $("#backup");
  button.disabled = true;
  try {
    const backup = await api("/api/backup");
    const file = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    downloadFile(file, "orilab-yedek-" + today + ".json");
  } catch {
    notify("Yedek indirilemedi. Yeniden deneyin.");
  } finally {
    button.disabled = !ready || !!loadFailure;
  }
}

for (const node of document.querySelectorAll("[data-icon]")) node.innerHTML = svg(node.dataset.icon);
const renderStatusOption = ([key, label]) => '<option value="' + key + '">' + label + "</option>";
const statusEntries = Object.entries(statuses);
const activeStatusOptions = statusEntries.filter(([key]) => key !== "teslim").map(renderStatusOption).join("");
const temporaryStatusOptions = statusEntries.filter(([key]) => temporaryPendingStages.has(key)).map(renderStatusOption).join("");
$("#form-status").innerHTML = statusEntries.map(renderStatusOption).join("");
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
  if (mutationPending || deleteDeadline !== null) return;
  selectJobStage(event.currentTarget.dataset.stage);
  if ($("#temporary-flow").hidden) controls.status.focus();
});
$("#temporary-revise").addEventListener("click", () => {
  if (mutationPending || deleteDeadline !== null) return;
  selectJobStage("gecici_duzeltme");
  controls.doctorNotes.focus();
});
form.addEventListener("submit", saveJob);
$("#delete-job").addEventListener("click", startDeleteConfirmation);
$("#delete-cancel").addEventListener("click", cancelDeleteConfirmation);
$("#delete-confirm").addEventListener("click", deleteJob);
$("#delete-confirm").addEventListener("keydown", (event) => {
  if (event.repeat && (event.key === "Enter" || event.key === " ")) event.preventDefault();
});
dialog.addEventListener("cancel", (event) => {
  if (mutationPending || deleteDeadline !== null) event.preventDefault();
  cancelDeleteConfirmation();
});
dialog.addEventListener("close", () => {
  if (dialog.open) return;
  editId = null;
  editVersion = null;
  deleteDeadline = null;
  syncJobActions();
  const sourceJob = dialogSource?.dataset.job;
  const sourceKind = dialogSource?.dataset.scheduleKind;
  const sourceList = dialogSource?.closest("#jobs, #deadline-list, #agenda-list");
  render();
  const sourceSelector = '[data-job="' + sourceJob + '"]' + (sourceKind ? '[data-schedule-kind="' + sourceKind + '"]' : "");
  const source = dialogSource?.isConnected ? dialogSource : sourceJob && sourceList?.querySelector(sourceSelector);
  dialogSource = null;
  (source || $(".new-button")).focus();
});
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.matches("[data-new]")) openJob(null, button);
  if (button.matches("[data-job]")) openJob(Number(button.dataset.job), button);
  if (button.matches("[data-close]") && !mutationPending) dialog.close();
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
window.addEventListener("focus", () => { if (!mutationPending) refresh(true); });
setInterval(() => { if (!document.hidden && !mutationPending) refresh(true); }, 45000);
updatePage();
refresh();
