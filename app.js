"use strict";

// Standard 25-day cytisine course (Desmoxan / Recigar / Tabex leaflet)
const BASE_PHASES = [
  { from: 1,  to: 3,  intervalMin: 120, pills: 6, label: "1 pill every 2 hours",   short: "every 2 h" },
  { from: 4,  to: 12, intervalMin: 150, pills: 5, label: "1 pill every 2.5 hours", short: "every 2.5 h" },
  { from: 13, to: 16, intervalMin: 180, pills: 4, label: "1 pill every 3 hours",   short: "every 3 h" },
  { from: 17, to: 20, intervalMin: 300, pills: 3, label: "1 pill every 5 hours",   short: "every 5 h" },
  { from: 21, to: 25, intervalMin: 480, pills: 2, label: "1–2 pills a day",        short: "1–2 a day" },
];
// 75-day mode (CITISILONG Arm C): the standard 25 days, then 50 maintenance days
// at 1.5 mg every 12 h — shown in trials to reduce relapse in the first months.
const MAINTENANCE_PHASE =
  { from: 26, to: 75, intervalMin: 720, pills: 2, label: "Maintenance — 1 pill every 12 h", short: "every 12 h" };
const QUIT_DAY = 5;

function courseMode() {
  return state && state.mode === "75" ? "75" : "25";
}
function phases() {
  return courseMode() === "75" ? [...BASE_PHASES, MAINTENANCE_PHASE] : BASE_PHASES;
}
function totalDays() {
  return courseMode() === "75" ? 75 : 25;
}
function totalPills() {
  return phases().reduce((sum, p) => sum + p.pills * (p.to - p.from + 1), 0);
}

const GUIDANCE = {
  1: "First day. Keep smoking as usual for now — cytisine works by taking the nicotine receptors' seat, so cigarettes start feeling flat and unrewarding. Take a pill roughly every 2 hours while awake. Mild nausea or vivid dreams are common and usually pass.",
  2: "Cigarettes may already taste worse — that's the cytisine competing with nicotine. Start skipping the automatic ones (with coffee, after meals). Drink plenty of water; it helps with the mild side effects.",
  3: "Last day of the intensive phase. Aim to cut your smoking clearly (half or less of your usual). Notice which cigarettes you genuinely miss versus the ones that are pure reflex.",
  4: "Dose steps down to every 2.5 hours. Pick your quit moment — it must happen by tomorrow. Get rid of lighters, ashtrays, and remaining cigarettes tonight if you can.",
  5: "Quit day — from today you stop smoking completely. Smoking while on cytisine past this point can make you feel sick and undermines the treatment. Cravings will come in short waves (3–5 min): breathe, drink water, move. They pass whether you smoke or not.",
  6: "First full smoke-free day behind you. Withdrawal peaks around now: irritability, restlessness, trouble focusing. It's your brain recalibrating — not a sign anything is wrong. Sleep may be lighter for a few days.",
  7: "One week in. Cravings are still frequent but shorter. Your sense of smell and taste are already coming back. Keep hands and mouth busy — gum, toothpicks, water bottle.",
  8: "The worst of the physical withdrawal is usually behind you after 72 h smoke-free. What's left is mostly habit: the triggers (coffee, breaks, alcohol, stress). Change the routine around them.",
  9: "Cravings now come from situations, not chemistry. Spot your top 3 trigger moments and plan a replacement for each. A slip is not a relapse — if it happens, drop the cigarette and carry on with the course.",
  10: "Energy and breathing are improving. Some people feel a dip in mood around now — normal, temporary. Physical activity, even a 15-minute walk, noticeably blunts cravings.",
  11: "Double digits. The automatic gestures are fading. If you still get strong urges, check they're not actually hunger, boredom, or stress wearing a cigarette costume.",
  12: "Last day at 5 pills. Tomorrow the schedule relaxes to every 3 hours — a sign your body needs less and less support.",
  13: "Step down: 4 pills a day, every 3 hours. If you've been smoke-free since day 5, you've beaten the hardest week. Cravings should now be occasional, not constant.",
  14: "Two weeks. Circulation and lung function are measurably improving. The cough some people get around now is your airways cleaning themselves out — it fades.",
  15: "Halfway through the course. Most cravings are now just brief thoughts, not physical urges. Don't test yourself with 'just one' — that's how relapses start.",
  16: "Last day at 4 pills. Think about what you're doing with the money not spent on cigarettes — make it visible (a jar, a savings note).",
  17: "Step down: 3 pills a day, every 5 hours. Long gaps between pills and it feels fine — that's the point. Your dependence is unwinding.",
  18: "Watch out for the 'I've got this, one won't hurt' trap — it's the most common relapse cause at this stage. You quit; there's nothing to renegotiate.",
  19: "Sleep and mood should be back to normal or better. If stress is your main trigger, this is the week to lock in a replacement ritual that isn't food or scrolling.",
  20: "Last day at 3 pills. Tomorrow starts the final taper. You're doing the easy part now — the pills are just escorting you out.",
  21: "Final phase: 1–2 pills a day. Take 2 if you still feel occasional urges, 1 if you barely think about smoking. Either is fine.",
  22: "Cravings at this point are rare and brief — memories, not needs. Acknowledge them like an old song on the radio and move on.",
  23: "Three weeks smoke-free (if you quit on day 5). The habit loops are largely rewired. Keep avoiding 'just one' offers at parties — they're the last trap.",
  24: "Second-to-last day. Plan how you'll handle your first big stress or celebration without cigarettes — have the answer ready before it happens.",
  25: "Last pill day. After today you're done: no pills, no cigarettes, no schedule. If urges ever resurface weeks from now, they'll be short and rare — treat them like weather.",
};

const MAINTENANCE_GUIDANCE = {
  26: "Maintenance phase begins: 1 pill morning and evening (every 12 h) for the next 50 days. The hard part is behind you — this phase is about locking it in. A longer course is shown in trials to cut the chance of relapse in the first months.",
  75: "Final day of the extended course. 75 days — well past the window where most relapses happen. After today: no pills, no cigarettes, and a genuinely rewired brain. You did the whole thing.",
};
const MAINTENANCE_GENERIC = [
  "Maintenance: 1 pill morning and evening. Keep the twice-daily rhythm — it's an easy anchor and it's doing quiet work.",
  "Cravings this far out are rare and brief. The pill is just insurance while the new habit sets like concrete.",
  "You're smoke-free and past the danger zone. Keep sidestepping the 'just one' trap at social events.",
  "Long gaps between pills and you barely notice — that's exactly what recovery is supposed to feel like.",
  "Money saved is stacking up. If you haven't yet, make it visible — it's a strong reason to never restart.",
];

function guidanceFor(day) {
  if (day <= 25) return GUIDANCE[day] || "Keep following the schedule and stay smoke-free.";
  if (MAINTENANCE_GUIDANCE[day]) return MAINTENANCE_GUIDANCE[day];
  return MAINTENANCE_GENERIC[(day - 26) % MAINTENANCE_GENERIC.length];
}

function phaseFor(day) {
  return phases().find((p) => day >= p.from && day <= p.to);
}

// ---- State ----
// { start: "2026-08-13T09:00", wake: "08:00", log: ["2026-08-13T09:02:11.000Z", ...] }
//
// The pill log is ALSO written to an append-only journal under a separate key.
// The journal is only ever touched entry-by-entry (add / undo), never replaced
// wholesale, and survives course resets — so even if the main state gets
// clobbered, logged pills are recovered from it on next load.
const JOURNAL_KEY = "cytisinio-journal";

const journal = {
  load() {
    try {
      const j = JSON.parse(localStorage.getItem(JOURNAL_KEY));
      return Array.isArray(j) ? j : [];
    } catch {
      return [];
    }
  },
  add(iso) {
    const j = this.load();
    if (!j.includes(iso)) j.push(iso);
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(j));
  },
  remove(iso) {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(this.load().filter((t) => t !== iso)));
  },
};

const store = {
  load() {
    try {
      const s = JSON.parse(localStorage.getItem("cytisinio")) || null;
      if (!s) return null;
      if (!Array.isArray(s.log)) s.log = [];
      // Recover any journal entries from this course that the log is missing
      const d0 = new Date(s.start);
      d0.setHours(0, 0, 0, 0);
      const merged = new Set(s.log);
      for (const t of journal.load()) {
        if (new Date(t) >= d0) merged.add(t);
      }
      s.log = [...merged].sort();
      return s;
    } catch {
      return null;
    }
  },
  save(state) {
    localStorage.setItem("cytisinio", JSON.stringify(state));
  },
  clear() {
    // Intentionally leaves the journal in place — pill history is never destroyed.
    localStorage.removeItem("cytisinio");
  },
};

// Cravings and mood live in their own append-only stores, like the journal:
// they are personal journey data and survive a course reset, exactly as the
// pill journal does. clear() never touches them.
const CRAVINGS_KEY = "cytisinio-cravings";
const MOODS_KEY = "cytisinio-moods";

const CRAVING_TRIGGERS = ["Coffee", "After meal", "Stress", "Alcohol", "Boredom", "Social", "Phone", "Other"];

// 1 (rough) → 5 (great)
const MOOD_SCALE = [
  { score: 1, emoji: "😞", label: "Rough" },
  { score: 2, emoji: "😕", label: "Low" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😄", label: "Great" },
];

const cravings = {
  load() {
    try {
      const c = JSON.parse(localStorage.getItem(CRAVINGS_KEY));
      return Array.isArray(c) ? c : [];
    } catch {
      return [];
    }
  },
  add(entry) {
    const c = this.load();
    c.push(entry);
    c.sort((a, b) => (a.t < b.t ? -1 : 1));
    localStorage.setItem(CRAVINGS_KEY, JSON.stringify(c));
  },
  remove(iso) {
    localStorage.setItem(CRAVINGS_KEY, JSON.stringify(this.load().filter((e) => e.t !== iso)));
  },
};

const moods = {
  load() {
    try {
      return JSON.parse(localStorage.getItem(MOODS_KEY)) || {};
    } catch {
      return {};
    }
  },
  get(dayKey) {
    return this.load()[dayKey];
  },
  set(dayKey, score) {
    const m = this.load();
    if (score == null) delete m[dayKey];
    else m[dayKey] = score;
    localStorage.setItem(MOODS_KEY, JSON.stringify(m));
  },
};

let state = store.load();

// ---- Date helpers ----
function startDate() {
  return new Date(state.start);
}

function startOfDay(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

// Course day number for a given date (day 1 = calendar day of first pill)
function dayNumberFor(date) {
  const diff = startOfDay(date) - startOfDay(startDate());
  return Math.round(diff / 86400000) + 1;
}

function dateForDay(day) {
  const d = startOfDay(startDate());
  d.setDate(d.getDate() + (day - 1));
  return d;
}

// Percent of the course elapsed by time: from the first pill to the end of the
// last day. Continuous, clamped 0–100.
function timePercent(now) {
  const start = startDate().getTime();
  const end = dateForDay(totalDays());
  end.setHours(23, 59, 59, 999);
  const span = end.getTime() - start;
  if (span <= 0) return 0;
  return Math.max(0, Math.min(100, ((now.getTime() - start) / span) * 100));
}

function sameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

// Stable local-date key ("YYYY-MM-DD") used to index moods by calendar day
function dayKey(date) {
  const c = startOfDay(date);
  return `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, "0")}-${String(c.getDate()).padStart(2, "0")}`;
}

// Cravings logged on the same calendar day as `date`, ascending
function cravingsOn(date) {
  return cravings
    .load()
    .filter((c) => sameDay(new Date(c.t), date))
    .sort((a, b) => (a.t < b.t ? -1 : 1));
}

// Logged pills on the same calendar day as `date`, ascending
function logsOn(date) {
  return state.log
    .map((t) => new Date(t))
    .filter((t) => sameDay(t, date))
    .sort((a, b) => a - b);
}

// Planned pill times (Date objects) for a course day, ignoring the log
function plannedTimesFor(day) {
  const phase = phaseFor(day);
  if (!phase) return [];
  const base = dateForDay(day);
  let first;
  if (day === 1) {
    first = startDate(); // day 1 starts at the actual first pill
  } else {
    const [h, m] = state.wake.split(":").map(Number);
    first = new Date(base);
    first.setHours(h, m, 0, 0);
  }
  const times = [];
  const endOfDay = new Date(base);
  endOfDay.setHours(23, 59, 0, 0);
  for (let i = 0; i < phase.pills; i++) {
    const t = new Date(first.getTime() + i * phase.intervalMin * 60000);
    if (t > endOfDay) break; // late start on day 1: fewer pills, full schedule tomorrow
    times.push(t);
  }
  return times;
}

// Today's reality: logged pills + projected remaining ones.
// Projection anchors on the last logged pill; falls back to the planned times.
function todayPlan(now, day) {
  const phase = phaseFor(day);
  const taken = logsOn(now);
  const remaining = Math.max(0, phase.pills - taken.length);
  let next = null;
  const projected = [];
  if (remaining > 0) {
    if (taken.length > 0) {
      next = new Date(taken[taken.length - 1].getTime() + phase.intervalMin * 60000);
    } else {
      const planned = plannedTimesFor(day);
      next = planned.length ? planned[0] : null;
      if (next && next < now) next = now; // late start: just begin now
    }
    if (next) {
      for (let i = 0; i < remaining; i++) {
        projected.push(new Date(next.getTime() + i * phase.intervalMin * 60000));
      }
    }
  }
  return { taken, projected, next, remaining, total: phase.pills };
}

function fmtTime(d) {
  const fmt = (state && state.timeFmt) || "auto";
  if (fmt === "24") return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  if (fmt === "12") return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(d) {
  return d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
}

function fmtDelta(ms) {
  const min = Math.round(Math.abs(ms) / 60000);
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

function fmtCountdown(ms) {
  if (ms < -60000) return `due ${fmtDelta(ms)} ago`;
  if (ms < 60000) return "now";
  return `in ${fmtDelta(ms)}`;
}

// ---- Screens ----
const screens = {
  setup: document.getElementById("screen-setup"),
  main: document.getElementById("screen-main"),
  future: document.getElementById("screen-future"),
  done: document.getElementById("screen-done"),
  calendar: document.getElementById("screen-calendar"),
  guide: document.getElementById("screen-guide"),
};

let activeTab = "today"; // "today" | "calendar" | "guide"

function show(name) {
  Object.entries(screens).forEach(([k, el]) => (el.hidden = k !== name));
  // Tab bar: visible whenever a course exists (not during setup)
  const tabbar = document.getElementById("tabbar");
  tabbar.hidden = name === "setup";
  document.getElementById("btn-tab-today").classList.toggle("active", name === "main" || name === "future" || name === "done");
  document.getElementById("btn-tab-calendar").classList.toggle("active", name === "calendar");
  document.getElementById("btn-tab-guide").classList.toggle("active", name === "guide");
}

// ---- Render ----
let tickTimer = null;

function render() {
  clearInterval(tickTimer);

  if (state && activeTab === "guide") {
    show("guide");
    return;
  }

  if (state && activeTab === "calendar") {
    show("calendar");
    renderCalendar();
    return;
  }

  if (!state) {
    show("setup");
    const dt = document.getElementById("start-datetime");
    if (!dt.value) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      dt.value = now.toISOString().slice(0, 16);
    }
    return;
  }

  const now = new Date();
  const day = dayNumberFor(now);

  if (day < 1) {
    show("future");
    document.getElementById("future-info").textContent =
      `Your course starts on ${fmtDate(startDate())} at ${fmtTime(startDate())}. Come back then!`;
    return;
  }

  if (day > totalDays()) {
    show("done");
    const sub = document.getElementById("done-subtitle");
    if (sub) {
      sub.textContent =
        `${totalDays()} days done. You're a non-smoker now — the pills are finished, the habit is broken. ` +
        `Cravings from here on are just echoes: rare, short, and beatable.`;
    }
    return;
  }

  show("main");
  renderMain(now, day);
  tickTimer = setInterval(() => {
    // re-render fully when the day flips or every 30 s for the countdown
    if (!screens.main.hidden) renderMain(new Date(), dayNumberFor(new Date()));
  }, 30000);
}

function renderMain(now, day) {
  if (day < 1 || day > totalDays()) {
    render();
    return;
  }
  const phase = phaseFor(day);

  document.getElementById("day-title").textContent = `Day ${day} of ${totalDays()}`;
  document.getElementById("phase-label").textContent = phase.label;

  // Progress: by time, and by pills taken out of the whole course
  const tPct = timePercent(now);
  const taken = state.log.length;
  const total = totalPills();
  const pPct = total ? (taken / total) * 100 : 0;
  document.getElementById("time-pct").textContent = `${Math.round(tPct)}%`;
  document.getElementById("time-bar").style.width = `${tPct}%`;
  document.getElementById("pills-pct").textContent = `${taken} / ${total} · ${Math.round(pPct)}%`;
  document.getElementById("pills-bar").style.width = `${pPct}%`;

  // Quit banner
  const banner = document.getElementById("quit-banner");
  if (day < QUIT_DAY) {
    banner.hidden = false;
    banner.classList.remove("success");
    const daysLeft = QUIT_DAY - day;
    banner.textContent =
      daysLeft === 1
        ? "🚭 Tomorrow is quit day — your last cigarette is today."
        : `🚭 Quit day is day 5 — ${daysLeft} days to wind down smoking.`;
  } else if (day === QUIT_DAY) {
    banner.hidden = false;
    banner.classList.remove("success");
    banner.textContent = "🚭 Quit day. From today: zero cigarettes.";
  } else {
    banner.hidden = false;
    banner.classList.add("success");
    banner.textContent = `✨ Smoke-free for ${day - QUIT_DAY} day${day - QUIT_DAY === 1 ? "" : "s"} (since day 5)`;
  }

  // Today: logged + projected pills
  const plan = todayPlan(now, day);
  document.getElementById("taken-count").textContent = `${plan.taken.length}/${plan.total} taken`;

  const list = document.getElementById("today-times");
  list.innerHTML = "";
  plan.taken.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = fmtTime(t);
    li.classList.add("taken");
    list.appendChild(li);
  });
  plan.projected.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = fmtTime(t);
    if (i === 0) li.classList.add("next");
    list.appendChild(li);
  });

  // Next pill card
  const nextTimeEl = document.getElementById("next-pill-time");
  const countdownEl = document.getElementById("next-pill-countdown");
  if (plan.next) {
    nextTimeEl.textContent = fmtTime(plan.next);
    countdownEl.textContent = fmtCountdown(plan.next - now);
  } else if (day < totalDays()) {
    const tomorrow = plannedTimesFor(day + 1);
    nextTimeEl.textContent = tomorrow.length ? fmtTime(tomorrow[0]) : "–";
    countdownEl.textContent = `done for today · next tomorrow${tomorrow.length ? " " + fmtCountdown(tomorrow[0] - now).replace("now", "") : ""}`;
  } else {
    nextTimeEl.textContent = "Done!";
    countdownEl.textContent = "That was your last pill of the course. 🎉";
  }

  // Last logged pill + undo
  const lastEl = document.getElementById("last-taken");
  if (state.log.length > 0) {
    const last = new Date(state.log[state.log.length - 1]);
    lastEl.hidden = false;
    const when = sameDay(last, now) ? fmtTime(last) : `${fmtDate(last)} ${fmtTime(last)}`;
    lastEl.innerHTML = `Last pill logged at <strong>${when}</strong> · <button type="button" id="btn-undo" class="link-btn">undo</button>`;
  } else {
    lastEl.hidden = true;
    lastEl.innerHTML = "";
  }

  // Mood + cravings for today
  buildMoodPicker(document.getElementById("mood-picker"), dayKey(now));
  renderTodayCravings(now);

  // Guidance
  document.getElementById("day-guidance").textContent = guidanceFor(day);

  // Upcoming days
  const up = document.getElementById("upcoming");
  up.innerHTML = "";
  for (let d = day + 1; d <= Math.min(day + 5, totalDays()); d++) {
    const p = phaseFor(d);
    const li = document.createElement("li");
    const isQuit = d === QUIT_DAY;
    const isMaint = d === MAINTENANCE_PHASE.from;
    const isStep = phases().some((ph) => ph.from === d && d !== 1);
    if (isQuit || isStep) li.classList.add("milestone");
    const tag = isQuit ? " · QUIT DAY" : isMaint ? " · maintenance" : isStep ? " · new phase" : "";
    li.innerHTML =
      `<span class="u-day">Day ${d}${tag}</span>` +
      `<span class="u-date">${fmtDate(dateForDay(d))}</span>` +
      `<span class="u-dose">${p.pills}× · ${p.short}</span>`;
    up.appendChild(li);
  }
  if (day === totalDays()) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="u-day">🎉 Course complete tomorrow</span>`;
    up.appendChild(li);
  }
}

// Build (or rebuild) a mood picker into `container` for the given day key.
// Tapping the selected mood again clears it. Re-renders the calendar if it's live.
function buildMoodPicker(container, key) {
  container.innerHTML = "";
  const current = moods.get(key);
  MOOD_SCALE.forEach((m) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "mood-btn" + (current === m.score ? " selected" : "");
    b.innerHTML = `<span class="mood-emoji">${m.emoji}</span><span class="mood-lbl">${m.label}</span>`;
    b.addEventListener("click", () => {
      const next = moods.get(key) === m.score ? null : m.score;
      moods.set(key, next);
      buildMoodPicker(container, key);
      if (activeTab === "calendar" && !screens.calendar.hidden) renderCalendar();
    });
    container.appendChild(b);
  });
}

function renderTodayCravings(now) {
  const todays = cravingsOn(now);
  document.getElementById("craving-count").textContent = todays.length ? `${todays.length} today` : "none today";
  const ul = document.getElementById("today-cravings");
  ul.innerHTML = "";
  todays.forEach((c) => {
    const li = document.createElement("li");
    li.innerHTML =
      `<span class="cv-when">${fmtTime(new Date(c.t))}</span>` +
      `<span class="cv-trigger">${c.trigger || "—"}</span>` +
      `<button type="button" class="link-btn" data-craving="${c.t}">remove</button>`;
    ul.appendChild(li);
  });
}

// ---- Calendar / journey ----
function renderCalendar() {
  const now = new Date();
  const curDay = Math.max(1, Math.min(dayNumberFor(now), totalDays()));

  // Stats over fully-elapsed days (today excluded, since it's still in progress)
  let plannedDone = 0;
  let takenDone = 0;
  for (let d = 1; d < curDay; d++) {
    plannedDone += phaseFor(d).pills;
    takenDone += logsOn(dateForDay(d)).length;
  }
  const adherence = plannedDone ? Math.round((takenDone / plannedDone) * 100) : 100;
  const smokeFree = Math.max(0, curDay - QUIT_DAY);

  const courseStart = startOfDay(startDate());
  const allCravings = cravings.load().filter((c) => new Date(c.t) >= courseStart);
  const moodMap = moods.load();
  const moodScores = [];
  for (let d = 1; d <= curDay; d++) {
    const s = moodMap[dayKey(dateForDay(d))];
    if (s) moodScores.push(s);
  }
  const avgMood = moodScores.length ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length : null;
  const avgMoodEmoji = avgMood ? MOOD_SCALE[Math.round(avgMood) - 1].emoji : "—";

  const stats = document.getElementById("cal-stats");
  stats.innerHTML =
    `<div class="stat"><div class="stat-val">${state.log.length}</div><div class="stat-lbl">pills logged</div></div>` +
    `<div class="stat"><div class="stat-val">${adherence}%</div><div class="stat-lbl">on-time adherence</div></div>` +
    `<div class="stat"><div class="stat-val">${smokeFree}</div><div class="stat-lbl">smoke-free days</div></div>` +
    `<div class="stat"><div class="stat-val">${allCravings.length}</div><div class="stat-lbl">cravings logged</div></div>` +
    `<div class="stat"><div class="stat-val">${avgMoodEmoji}</div><div class="stat-lbl">average mood</div></div>` +
    `<div class="stat"><div class="stat-val">${moodScores.length}</div><div class="stat-lbl">days rated</div></div>`;

  // Day grid
  const grid = document.getElementById("cal-grid");
  grid.innerHTML = "";
  for (let d = 1; d <= totalDays(); d++) {
    const date = dateForDay(d);
    const planned = phaseFor(d).pills;
    const taken = logsOn(date).length;
    const cvCount = cravingsOn(date).length;
    const mood = moodMap[dayKey(date)];
    const isFuture = d > curDay;

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cal-cell";
    if (isFuture) cell.classList.add("future");
    else if (taken >= planned && planned > 0) cell.classList.add("full");
    else if (taken > 0) cell.classList.add("partial");
    else cell.classList.add("missed");
    if (d === curDay) cell.classList.add("today");
    if (d === QUIT_DAY) cell.classList.add("quit");

    cell.innerHTML =
      `<span class="cc-day">${d}</span>` +
      `<span class="cc-mood">${mood ? MOOD_SCALE[mood - 1].emoji : ""}</span>` +
      `<span class="cc-dose">${isFuture ? "" : taken + "/" + planned}</span>` +
      (cvCount ? `<span class="cc-craving">${cvCount}</span>` : "");

    if (!isFuture) cell.addEventListener("click", () => openDayDialog(d));
    grid.appendChild(cell);
  }

  renderMoodChart(curDay, moodMap);
  renderTriggerBreakdown(allCravings);
}

function renderMoodChart(curDay, moodMap) {
  const chart = document.getElementById("mood-chart");
  const empty = document.getElementById("mood-chart-empty");
  chart.innerHTML = "";
  let any = false;
  for (let d = 1; d <= curDay; d++) {
    const s = moodMap[dayKey(dateForDay(d))];
    if (s) any = true;
    const bar = document.createElement("div");
    bar.className = "mc-bar" + (s ? "" : " empty");
    bar.style.height = s ? `${(s / 5) * 100}%` : "3px";
    bar.title = s ? `Day ${d}: ${MOOD_SCALE[s - 1].label}` : `Day ${d}: not rated`;
    chart.appendChild(bar);
  }
  chart.hidden = !any;
  empty.hidden = any;
}

function renderTriggerBreakdown(list) {
  const ul = document.getElementById("trigger-breakdown");
  const empty = document.getElementById("trigger-empty");
  ul.innerHTML = "";
  const counts = {};
  list.forEach((c) => {
    const key = c.trigger || "Untagged";
    counts[key] = (counts[key] || 0) + 1;
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  ul.hidden = entries.length === 0;
  empty.hidden = entries.length !== 0;
  const max = entries.length ? entries[0][1] : 1;
  entries.forEach(([label, count]) => {
    const li = document.createElement("li");
    li.innerHTML =
      `<span class="tb-label">${label}</span>` +
      `<span class="tb-bar"><span class="tb-fill" style="width:${(count / max) * 100}%"></span></span>` +
      `<span class="tb-count">${count}</span>`;
    ul.appendChild(li);
  });
}

// ---- Day detail dialog ----
let dialogDay = null;

function openDayDialog(day) {
  dialogDay = day;
  renderDayDialog();
  document.getElementById("day-dialog").showModal();
}

function renderDayDialog() {
  const day = dialogDay;
  const date = dateForDay(day);
  const key = dayKey(date);
  const phase = phaseFor(day);
  const taken = logsOn(date);
  const dayCravings = cravingsOn(date);

  document.getElementById("day-dialog-title").textContent = `Day ${day} of ${totalDays()}`;
  document.getElementById("day-dialog-date").textContent =
    `${fmtDate(date)}${day === QUIT_DAY ? " · 🚭 quit day" : ""} · ${phase.label}`;

  const pills =
    `<div><p class="dd-label">Pills — ${taken.length}/${phase.pills} logged</p>` +
    (taken.length
      ? `<ul class="pill-times">${taken.map((t) => `<li class="taken">${fmtTime(t)}</li>`).join("")}</ul>`
      : `<p class="dd-empty">No pills logged this day.</p>`) +
    `</div>`;

  const mood =
    `<div><p class="dd-label">Mood</p><div id="dd-mood" class="mood-picker"></div></div>`;

  const crav =
    `<div><p class="dd-label">Cravings — ${dayCravings.length}</p>` +
    (dayCravings.length
      ? `<ul class="craving-list">${dayCravings
          .map(
            (c) =>
              `<li><span class="cv-when">${fmtTime(new Date(c.t))}</span>` +
              `<span class="cv-trigger">${c.trigger || "—"}</span>` +
              `<button type="button" class="link-btn" data-craving="${c.t}">remove</button></li>`
          )
          .join("")}</ul>`
      : `<p class="dd-empty">No cravings logged this day.</p>`) +
    `</div>`;

  document.getElementById("day-dialog-body").innerHTML = pills + mood + crav;
  buildMoodPicker(document.getElementById("dd-mood"), key);
}

// ---- Events ----
document.getElementById("setup-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const start = document.getElementById("start-datetime").value;
  const wake = document.getElementById("wake-time").value;
  const mode = document.getElementById("mode-select").value === "75" ? "75" : "25";
  if (!start) return;
  state = { start, wake, log: [], mode };
  store.save(state);
  render();
});

function logPillAt(date) {
  const iso = date.toISOString();
  if (!state.log.includes(iso)) {
    state.log.push(iso);
    state.log.sort();
  }
  journal.add(iso);
  store.save(state);
}

document.getElementById("btn-took").addEventListener("click", () => {
  logPillAt(new Date());
  render();
});

document.getElementById("btn-backfill-toggle").addEventListener("click", () => {
  const row = document.getElementById("backfill-row");
  row.hidden = !row.hidden;
});

document.getElementById("btn-backfill-add").addEventListener("click", () => {
  const value = document.getElementById("backfill-time").value;
  const m = value && value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return;
  const d = new Date();
  d.setHours(+m[1], +m[2], 0, 0);
  logPillAt(d);
  document.getElementById("backfill-row").hidden = true;
  document.getElementById("backfill-time").value = "";
  render();
});

// ---- Cravings ----
// Build the trigger chips once; each logs a craving with that trigger.
(function buildCravingChips() {
  const row = document.getElementById("craving-triggers");
  CRAVING_TRIGGERS.forEach((trigger) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = trigger;
    b.addEventListener("click", () => logCraving(trigger));
    row.appendChild(b);
  });
  const skip = document.createElement("button");
  skip.type = "button";
  skip.className = "chip plain";
  skip.textContent = "Just log it";
  skip.addEventListener("click", () => logCraving(null));
  row.appendChild(skip);
})();

function logCraving(trigger) {
  cravings.add({ t: new Date().toISOString(), trigger });
  document.getElementById("craving-triggers").hidden = true;
  render();
}

document.getElementById("btn-craving").addEventListener("click", () => {
  const row = document.getElementById("craving-triggers");
  row.hidden = !row.hidden;
});

// Remove buttons live inside re-rendered innerHTML → delegate from the list
document.getElementById("today-cravings").addEventListener("click", (e) => {
  const iso = e.target && e.target.getAttribute("data-craving");
  if (iso) {
    cravings.remove(iso);
    render();
  }
});

// Undo lives inside re-rendered innerHTML → delegate from the container
document.getElementById("last-taken").addEventListener("click", (e) => {
  if (e.target && e.target.id === "btn-undo") {
    const removed = state.log.pop();
    if (removed) journal.remove(removed);
    store.save(state);
    render();
  }
});

function openSettings() {
  document.getElementById("edit-start").value = state.start;
  document.getElementById("edit-wake").value = state.wake;
  document.getElementById("edit-timefmt").value = state.timeFmt || "auto";
  document.getElementById("edit-mode").value = courseMode();
  document.getElementById("settings-dialog").showModal();
}

document.getElementById("btn-close-settings").addEventListener("click", () => {
  document.getElementById("settings-dialog").close();
});

// Tap on the backdrop closes the dialog too
document.getElementById("settings-dialog").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) e.currentTarget.close();
});

document.getElementById("btn-close-day").addEventListener("click", () => {
  document.getElementById("day-dialog").close();
});

// Tap on the backdrop closes the day dialog too
document.getElementById("day-dialog").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) e.currentTarget.close();
});

// Removing a craving from inside the day dialog re-renders the dialog in place
document.getElementById("day-dialog-body").addEventListener("click", (e) => {
  const iso = e.target && e.target.getAttribute("data-craving");
  if (iso) {
    cravings.remove(iso);
    renderDayDialog();
    if (activeTab === "calendar" && !screens.calendar.hidden) renderCalendar();
  }
});

document.getElementById("btn-tab-today").addEventListener("click", () => {
  activeTab = "today";
  render();
});

document.getElementById("btn-tab-calendar").addEventListener("click", () => {
  activeTab = "calendar";
  render();
});

document.getElementById("btn-tab-guide").addEventListener("click", () => {
  activeTab = "guide";
  render();
});

document.getElementById("btn-settings").addEventListener("click", openSettings);
document.getElementById("btn-future-settings").addEventListener("click", openSettings);

document.getElementById("settings-form").addEventListener("submit", () => {
  const start = document.getElementById("edit-start").value;
  const wake = document.getElementById("edit-wake").value;
  const timeFmt = document.getElementById("edit-timefmt").value;
  const mode = document.getElementById("edit-mode").value === "75" ? "75" : "25";
  if (start && wake) {
    state = { ...state, start, wake, timeFmt, mode };
    store.save(state);
  }
  render();
});

document.getElementById("btn-export").addEventListener("click", (e) => {
  const backup = JSON.stringify(
    { state, journal: journal.load(), cravings: cravings.load(), moods: moods.load() },
    null,
    2
  );
  const btn = e.target;
  const done = () => {
    btn.textContent = "✅ Copied!";
    setTimeout(() => (btn.textContent = "📋 Copy backup (pills, cravings, mood)"), 2000);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(backup).then(done).catch(() => prompt("Copy your backup:", backup));
  } else {
    prompt("Copy your backup:", backup);
  }
});

document.getElementById("btn-reset").addEventListener("click", () => {
  if (confirm("Reset the course? Your start date and pill log will be erased.")) {
    store.clear();
    state = null;
    document.getElementById("settings-dialog").close();
    render();
  }
});

document.getElementById("btn-done-reset").addEventListener("click", () => {
  store.clear();
  state = null;
  render();
});

// Re-render when returning to the app (day/next-pill may have changed)
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && state) render();
});

// One-shot import: open the app as /#log=11:17,13:20,15:30 to backfill
// today's pills at those times. Idempotent (same time → same entry).
(function importFromHash() {
  if (!state || typeof location === "undefined" || !location.hash.startsWith("#log=")) return;
  for (const t of decodeURIComponent(location.hash.slice(5)).split(",")) {
    const m = t.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) continue;
    const d = new Date();
    d.setHours(+m[1], +m[2], 0, 0);
    logPillAt(d);
  }
  if (typeof history !== "undefined") history.replaceState(null, "", location.pathname);
})();

// ---- PWA ----
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

render();
