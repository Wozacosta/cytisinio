"use strict";

// Standard 25-day cytisine course (Desmoxan / Recigar / Tabex leaflet)
const BASE_PHASES = [
  { from: 1,  to: 3,  intervalMin: 120, pills: 6, label: "1 pill every 2 hours",   short: "every 2 h" },
  { from: 4,  to: 12, intervalMin: 150, pills: 5, label: "1 pill every 2.5 hours", short: "every 2.5 h" },
  { from: 13, to: 16, intervalMin: 180, pills: 4, label: "1 pill every 3 hours",   short: "every 3 h" },
  { from: 17, to: 20, intervalMin: 300, pills: 3, label: "1 pill every 5 hours",   short: "every 5 h" },
  { from: 21, to: 25, intervalMin: 480, pills: 2, label: "1–2 pills a day",        short: "1–2 a day" },
];
// Experimental 75-day schedule (CITISILONG Arm C): the standard 25 days, then
// 50 maintenance days at 1.5 mg every 12 h. The Phase IV trial is ongoing.
const MAINTENANCE_PHASE =
  { from: 26, to: 75, intervalMin: 720, pills: 2, label: "Experimental trial schedule — 1 pill every 12 h", short: "every 12 h" };
const QUIT_DAY = 5;

const NICOTINE_PRODUCTS = {
  cigarettes: { singular: "cigarette", plural: "cigarettes", badge: "Cigarettes" },
  pouches: { singular: "pouch", plural: "pouches", badge: "Pouches" },
  vape: { singular: "vape session", plural: "vape sessions", badge: "Vaping" },
  other: { singular: "nicotine use", plural: "nicotine uses", badge: "Nicotine" },
};

const NICOTINE_WIND_DOWN = {
  1: "Count each use without judgment. Do not increase above your usual pattern.",
  2: "Delay the first use and skip one of the easiest automatic uses.",
  3: "Stretch the gaps and make every use deliberate rather than automatic.",
  4: "Last runway day. Remove your remaining supply and prepare for zero nicotine tomorrow.",
  5: "Quit day: zero nicotine from today. If you slip, log it without judgment and continue.",
};

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
  26: "Experimental trial schedule begins: 1 pill morning and evening (every 12 h) for 50 more days. CITISILONG is still studying how this compares with the standard 25-day course.",
  75: "Final day of the experimental 75-day schedule. Keep using the habits and support that helped you, and keep logging any nicotine use honestly.",
};
const MAINTENANCE_GENERIC = [
  "Experimental maintenance schedule: 1 pill morning and evening. This extension is still being evaluated in a clinical trial.",
  "Keep noting cravings and triggers during the trial extension; that record can help you see what is changing over time.",
  "If you have stayed nicotine-free, protect that progress and keep sidestepping the 'just one' trap at social events.",
  "Long gaps between pills and you barely notice — that's exactly what recovery is supposed to feel like.",
  "Money saved is stacking up. If you haven't yet, make it visible — it's a strong reason to never restart.",
];

function guidanceFor(day) {
  if (state && state.nicotineProduct && state.nicotineProduct !== "cigarettes" && day <= QUIT_DAY) {
    return NICOTINE_WIND_DOWN[day] + " Follow the cytisine schedule in your package leaflet.";
  }
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
const APP_STATE_KEY = "cytisinio";
const DUPLICATE_PILL_WINDOW_MS = 60000;

function absoluteStart(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function localDateTimeInput(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

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
    clearCloudDeletion("journal", iso);
  },
  remove(iso) {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(this.load().filter((t) => t !== iso)));
    recordCloudDeletion("journal", iso);
  },
  clear() {
    this.load().forEach((iso) => recordCloudDeletion("journal", iso));
    localStorage.setItem(JOURNAL_KEY, "[]");
  },
};

const store = {
  load() {
    try {
      const s = JSON.parse(localStorage.getItem(APP_STATE_KEY)) || null;
      if (!s) return null;
      if (!Array.isArray(s.log)) s.log = [];
      const normalizedStart = absoluteStart(s.start);
      if (normalizedStart !== s.start) {
        s.start = normalizedStart;
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(s));
      }
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
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    queueCloudSave();
  },
  clear() {
    // Starting a new course keeps the separate journey history by default.
    localStorage.removeItem(APP_STATE_KEY);
    queueCloudSave();
  },
};

// Cravings and mood live in their own append-only stores, like the journal:
// they are personal journey data and survive a course reset, exactly as the
// pill journal does. clear() never touches them.
const CRAVINGS_KEY = "cytisinio-cravings";
const MOODS_KEY = "cytisinio-moods";
const NICOTINE_USES_KEY = "cytisinio-nicotine-uses";

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
    clearCloudDeletion("cravings", entry.t);
    queueCloudSave();
  },
  remove(iso) {
    localStorage.setItem(CRAVINGS_KEY, JSON.stringify(this.load().filter((e) => e.t !== iso)));
    recordCloudDeletion("cravings", iso);
    queueCloudSave();
  },
};

const nicotineUses = {
  load() {
    try {
      const entries = JSON.parse(localStorage.getItem(NICOTINE_USES_KEY));
      return Array.isArray(entries) ? entries : [];
    } catch {
      return [];
    }
  },
  add(iso) {
    const entries = this.load();
    entries.push(iso);
    entries.sort();
    localStorage.setItem(NICOTINE_USES_KEY, JSON.stringify(entries));
    clearCloudDeletion("nicotineUses", iso);
    queueCloudSave();
  },
  remove(iso) {
    const entries = this.load();
    const index = entries.lastIndexOf(iso);
    if (index >= 0) entries.splice(index, 1);
    localStorage.setItem(NICOTINE_USES_KEY, JSON.stringify(entries));
    recordCloudDeletion("nicotineUses", iso);
    queueCloudSave();
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
    if (score == null) {
      delete m[dayKey];
      recordCloudDeletion("moods", dayKey);
    } else {
      m[dayKey] = score;
      clearCloudDeletion("moods", dayKey);
    }
    localStorage.setItem(MOODS_KEY, JSON.stringify(m));
    queueCloudSave();
  },
};

let state = store.load();

// ---- Optional offline-first Dexie Cloud backup ----
// localStorage remains the immediate source of truth. Once explicitly enabled,
// the full portable backup is mirrored to a private Dexie Cloud singleton.
const CLOUD_ENABLED_KEY = "cytisinio-cloud-enabled";
const CLOUD_META_KEY = "cytisinio-cloud-meta";
const CLOUD_DEVICE_KEY = "cytisinio-cloud-device";
const CLOUD_DIRTY_KEY = "cytisinio-cloud-dirty";
const CLOUD_DELETIONS_KEY = "cytisinio-cloud-deletions";
const CLOUD_HISTORY_TYPES = ["journal", "cravings", "moods", "nicotineUses"];
let cloudSaveTimer = null;
let cloudDirtyRevision = 0;
let cloudSaveInFlight = null;
let cloudBusy = false;
let cloudConnecting = false;
let cloudReconciling = false;
let applyingCloudBackup = false;
let cloudSyncState = null;

function cloudEnabled() {
  return localStorage.getItem(CLOUD_ENABLED_KEY) === "1";
}

function cloudDeviceId() {
  let id = localStorage.getItem(CLOUD_DEVICE_KEY);
  if (!id) {
    id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(CLOUD_DEVICE_KEY, id);
  }
  return id;
}

function cloudMeta() {
  try {
    return JSON.parse(localStorage.getItem(CLOUD_META_KEY)) || {};
  } catch {
    return {};
  }
}

function setCloudMeta(next) {
  localStorage.setItem(CLOUD_META_KEY, JSON.stringify({ ...cloudMeta(), ...next }));
}

function emptyCloudDeletions() {
  return { journal: {}, cravings: {}, moods: {}, nicotineUses: {} };
}

function normalizeCloudDeletions(value) {
  const normalized = emptyCloudDeletions();
  if (!value || typeof value !== "object" || Array.isArray(value)) return normalized;
  CLOUD_HISTORY_TYPES.forEach((type) => {
    // Version 2 briefly used string arrays for tombstones. Keep accepting them
    // so an interrupted upgrade cannot strand a valid offline snapshot.
    if (Array.isArray(value[type])) {
      value[type].filter((item) => typeof item === "string").forEach((id) => {
        normalized[type][id] = { deleted: true, at: "" };
      });
    } else if (value[type] && typeof value[type] === "object") {
      Object.entries(value[type]).forEach(([id, marker]) => {
        if (!marker || typeof marker !== "object" || typeof marker.deleted !== "boolean") return;
        normalized[type][id] = {
          deleted: marker.deleted,
          at: typeof marker.at === "string" && !Number.isNaN(Date.parse(marker.at)) ? marker.at : "",
        };
      });
    }
  });
  return normalized;
}

function cloudDeletions() {
  try {
    return normalizeCloudDeletions(JSON.parse(localStorage.getItem(CLOUD_DELETIONS_KEY)));
  } catch {
    return emptyCloudDeletions();
  }
}

function recordCloudDeletion(type, id) {
  const deleted = cloudDeletions();
  deleted[type][id] = { deleted: true, at: new Date().toISOString() };
  localStorage.setItem(CLOUD_DELETIONS_KEY, JSON.stringify(deleted));
}

function clearCloudDeletion(type, id) {
  const deleted = cloudDeletions();
  // An explicit add is an operation too. Keeping its marker distinguishes a
  // genuine re-add from an old snapshot that simply never saw the deletion.
  deleted[type][id] = { deleted: false, at: new Date().toISOString() };
  localStorage.setItem(CLOUD_DELETIONS_KEY, JSON.stringify(deleted));
}

function queueCloudSave() {
  if (applyingCloudBackup) return;
  cloudDirtyRevision += 1;
  localStorage.setItem(CLOUD_DIRTY_KEY, "1");
  if (!cloudEnabled()) return;
  if (!window.cytisinioCloud) return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(() => saveCloudBackup(), 650);
}

function updateCloudUI(message, tone) {
  const status = document.getElementById("cloud-status");
  const dot = document.getElementById("cloud-dot");
  const enable = document.getElementById("btn-cloud-enable");
  const sync = document.getElementById("btn-cloud-sync");
  const disable = document.getElementById("btn-cloud-disable");
  const deleteCloud = document.getElementById("btn-cloud-delete");
  const accountTriggers = document.querySelectorAll(".cloud-account-trigger");
  if (!status || !dot || !enable || !sync || !disable || !deleteCloud) return;

  const cloud = window.cytisinioCloud;
  const user = cloud ? cloud.getUser() : { isLoggedIn: false };
  const enabled = cloudEnabled();
  status.textContent = message || (
    !cloud
      ? "Unavailable · manual backup still works"
      : !enabled
        ? "Off · data stays only on this device"
        : !user.isLoggedIn
          ? "Paused · sign in to resume syncing"
          : `Private sync on${user.email ? ` · ${user.email}` : ""}`
  );
  dot.className = `cloud-dot${tone ? ` ${tone}` : enabled && user.isLoggedIn ? " on" : ""}`;
  enable.hidden = enabled && user.isLoggedIn;
  enable.textContent = enabled ? "Sign in to resume" : "Enable cloud backup";
  sync.hidden = !(enabled && user.isLoggedIn);
  disable.hidden = !enabled;
  deleteCloud.hidden = !(enabled && user.isLoggedIn);
  enable.disabled = cloudBusy || !cloud;
  sync.disabled = cloudBusy;
  disable.disabled = cloudBusy;
  deleteCloud.disabled = cloudBusy;

  accountTriggers.forEach((button) => {
    const label = button.querySelector(".cloud-account-label");
    button.hidden = false;
    button.disabled = cloudBusy || !cloud;
    button.classList.toggle("paused", enabled && !user.isLoggedIn);
    button.classList.toggle("signed-out", !enabled);
    button.classList.toggle("syncing", enabled && user.isLoggedIn && cloudBusy);
    if (label) {
      label.textContent = !cloud
        ? "Unavailable"
        : user.isLoggedIn
        ? cloudBusy ? "Syncing" : "Signed in"
        : enabled ? "Resume cloud" : "Sign in";
    }
    const accountText = !cloud
      ? "Cloud backup is unavailable."
      : user.isLoggedIn
      ? `Cloud backup on${user.email ? ` · signed in as ${user.email}` : ""}. Open settings.`
      : enabled
        ? "Cloud backup paused. Sign in again."
        : "Sign in to restore or enable cloud backup.";
    button.setAttribute("aria-label", accountText);
    button.title = accountText;
  });
}

function mergeCloudDeletions(left, right) {
  const merged = emptyCloudDeletions();
  CLOUD_HISTORY_TYPES.forEach((type) => {
    const leftMarkers = left[type] || {};
    const rightMarkers = right[type] || {};
    const ids = new Set([...Object.keys(leftMarkers), ...Object.keys(rightMarkers)]);
    ids.forEach((id) => {
      const leftMarker = leftMarkers[id];
      const rightMarker = rightMarkers[id];
      if (!leftMarker) merged[type][id] = rightMarker;
      else if (!rightMarker) merged[type][id] = leftMarker;
      else merged[type][id] = rightMarker.at >= leftMarker.at ? rightMarker : leftMarker;
    });
  });
  return merged;
}

function mergeBackupData(left, right, { preferRightState = true } = {}) {
  const deleted = mergeCloudDeletions(left.deleted, right.deleted);
  const deletedIds = (type) => new Set(
    Object.entries(deleted[type]).filter(([, marker]) => marker.deleted).map(([id]) => id)
  );
  const deletedJournal = deletedIds("journal");
  const deletedCravings = deletedIds("cravings");
  const deletedMoods = deletedIds("moods");
  const deletedNicotine = deletedIds("nicotineUses");

  const journalEntries = [...new Set([...left.journal, ...right.journal])]
    .filter((iso) => !deletedJournal.has(iso))
    .sort();
  const nicotineEntries = [...new Set([...left.nicotineUses, ...right.nicotineUses])]
    .filter((iso) => !deletedNicotine.has(iso))
    .sort();
  const cravingMap = new Map();
  [...left.cravings, ...right.cravings].forEach((entry) => cravingMap.set(entry.t, entry));
  const cravingEntries = [...cravingMap.values()]
    .filter((entry) => !deletedCravings.has(entry.t))
    .sort((a, b) => a.t.localeCompare(b.t));
  const moodEntries = { ...left.moods, ...right.moods };
  deletedMoods.forEach((key) => delete moodEntries[key]);

  const preferredState = preferRightState ? right.state : left.state;
  let mergedState = preferredState ? { ...preferredState } : null;
  if (mergedState) {
    mergedState.log = [...new Set([
      ...(left.state ? left.state.log : []),
      ...(right.state ? right.state.log : []),
      ...journalEntries,
    ])]
      .filter((iso) => !deletedJournal.has(iso) && new Date(iso) >= startOfDay(new Date(mergedState.start)))
      .sort();
  }

  return {
    state: mergedState,
    journal: journalEntries,
    cravings: cravingEntries,
    moods: moodEntries,
    nicotineUses: nicotineEntries,
    deleted,
  };
}

function mergedCloudBackup(bundle) {
  if (!bundle || !Array.isArray(bundle.records)) return null;
  let merged = null;
  const records = [...bundle.records].sort((a, b) => String(a.updatedAt).localeCompare(String(b.updatedAt)));
  for (const record of records) {
    try {
      const clean = validateBackup(record.data, { allowNoCourse: true });
      merged = merged ? mergeBackupData(merged, clean) : clean;
    } catch {
      // One malformed legacy/device record must not hide the other valid copies.
    }
  }
  return merged;
}

function portableBackup(data) {
  return {
    app: "cytisinio",
    version: 3,
    exportedAt: new Date().toISOString(),
    ...data,
  };
}

async function persistCloudBackup(data, dirtyRevision) {
  const cloud = window.cytisinioCloud;
  const record = await cloud.save(portableBackup(data), cloudDeviceId());
  const user = cloud.getUser();
  setCloudMeta({ userId: user.userId, lastAppliedRevision: record.bundleRevision });
  if (dirtyRevision === cloudDirtyRevision) localStorage.removeItem(CLOUD_DIRTY_KEY);
  return record;
}

async function saveCloudBackup() {
  const cloud = window.cytisinioCloud;
  if (!cloudEnabled() || !cloud || !cloud.getUser().isLoggedIn || applyingCloudBackup) return;
  if (cloudReconciling) {
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(() => saveCloudBackup(), 650);
    return;
  }
  if (cloudSaveInFlight) return cloudSaveInFlight;

  cloudSaveInFlight = (async () => {
    try {
      cloudBusy = true;
      updateCloudUI("Saving locally, then syncing…", "busy");
      const remote = mergedCloudBackup(await cloud.read());
      // Read local state after the async cloud read. A user action that happens
      // while IndexedDB is being read must be included, never applied over.
      const local = validateBackup(createBackup(), { allowNoCourse: true });
      const dirtyRevision = cloudDirtyRevision;
      const merged = remote ? mergeBackupData(remote, local) : local;
      applyBackupData(merged, { keepTab: true });
      await persistCloudBackup(merged, dirtyRevision);
      updateCloudUI("Saved offline · syncing privately", "busy");
    } catch (error) {
      updateCloudUI(
        navigator.onLine ? "Could not sync · your device copy is safe" : "Offline · your device copy is safe",
        "error"
      );
    } finally {
      cloudBusy = false;
      cloudSaveInFlight = null;
      if (localStorage.getItem(CLOUD_DIRTY_KEY) === "1") {
        clearTimeout(cloudSaveTimer);
        cloudSaveTimer = setTimeout(() => saveCloudBackup(), 650);
      }
    }
  })();
  return cloudSaveInFlight;
}

function applyBackupData(imported, { keepTab = false } = {}) {
  applyingCloudBackup = true;
  try {
    if (imported.state) localStorage.setItem(APP_STATE_KEY, JSON.stringify(imported.state));
    else localStorage.removeItem(APP_STATE_KEY);
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(imported.journal));
    localStorage.setItem(CRAVINGS_KEY, JSON.stringify(imported.cravings));
    localStorage.setItem(MOODS_KEY, JSON.stringify(imported.moods));
    localStorage.setItem(NICOTINE_USES_KEY, JSON.stringify(imported.nicotineUses));
    localStorage.setItem(CLOUD_DELETIONS_KEY, JSON.stringify(imported.deleted));
    state = store.load();
    if (!keepTab) activeTab = "today";
    render();
  } finally {
    applyingCloudBackup = false;
  }
}

async function reconcileCloudBackup({ firstConnect = false } = {}) {
  const cloud = window.cytisinioCloud;
  if (!cloudEnabled() || !cloud || !cloud.getUser().isLoggedIn || cloudReconciling) return;
  cloudReconciling = true;
  try {
    cloudBusy = true;
    updateCloudUI("Checking cloud backup…", "busy");
    const remoteBundle = await cloud.sync();
    const remote = mergedCloudBackup(remoteBundle);
    const user = cloud.getUser();
    const meta = cloudMeta();

    if (!remote) {
      const local = validateBackup(createBackup(), { allowNoCourse: true });
      const hasLocalData = Boolean(
        local.state || local.journal.length || local.cravings.length ||
        Object.keys(local.moods).length || local.nicotineUses.length
      );
      if (hasLocalData) {
        const dirtyRevision = cloudDirtyRevision;
        await persistCloudBackup(local, dirtyRevision);
        updateCloudUI("Saved offline · syncing privately", "busy");
      }
      else {
        updateCloudUI("No cloud backup found for this account");
        if (firstConnect) alert("No Cytisinio backup was found for this account. You can start a new course below.");
      }
      return;
    }

    const sameAccount = meta.userId === user.userId;
    const alreadyApplied = meta.lastAppliedRevision === remoteBundle.revision;
    const hasLocalChanges = localStorage.getItem(CLOUD_DIRTY_KEY) === "1";
    if (alreadyApplied && !hasLocalChanges) {
      updateCloudUI("Synced privately", "on");
      return;
    }

    let preferRemoteState = !hasLocalChanges;
    if ((firstConnect || !sameAccount) && state) {
      preferRemoteState = confirm(
        "A cloud backup already exists for this account. Use its course settings on this device?\n\nYour pill, nicotine, craving, and mood histories will be merged either way. Choose Cancel to keep this device's course settings."
      );
    }

    const local = validateBackup(createBackup(), { allowNoCourse: true });
    const merged = preferRemoteState
      ? mergeBackupData(local, remote)
      : mergeBackupData(remote, local);
    applyBackupData(merged);
    if (hasLocalChanges || firstConnect || !sameAccount) {
      await persistCloudBackup(merged, cloudDirtyRevision);
    } else {
      setCloudMeta({ userId: user.userId, lastAppliedRevision: remoteBundle.revision });
    }
    updateCloudUI("Histories merged · cloud backup updated", "on");
  } catch (error) {
    updateCloudUI(
      navigator.onLine ? "Sync unavailable · your device copy is safe" : "Offline · your device copy is safe",
      "error"
    );
  } finally {
    cloudBusy = false;
    cloudReconciling = false;
  }
}

async function connectCloudBackup() {
  const cloud = window.cytisinioCloud;
  if (!cloud || cloudBusy) return;

  if (!cloudEnabled()) {
    const accepted = confirm(
      "Enable private cloud backup?\n\nYour course and journey data will be sent to Dexie Cloud and linked to the email account you sign in with. Cytisinio will keep working offline, and you can disconnect at any time."
    );
    if (!accepted) return;
  }

  try {
    cloudBusy = true;
    cloudConnecting = true;
    updateCloudUI("Waiting for email sign-in…", "busy");
    const user = cloud.getUser().isLoggedIn ? cloud.getUser() : await cloud.login();
    if (!user.isLoggedIn) throw new Error("Sign-in was not completed.");
    localStorage.setItem(CLOUD_ENABLED_KEY, "1");
    await reconcileCloudBackup({ firstConnect: cloudMeta().userId !== user.userId });
  } catch (error) {
    if (!cloud.getUser().isLoggedIn) localStorage.removeItem(CLOUD_ENABLED_KEY);
    updateCloudUI(
      error && error.name === "AbortError" ? "Cloud backup remains off" : "Sign-in was not completed · device data is safe",
      error && error.name === "AbortError" ? "" : "error"
    );
  } finally {
    cloudBusy = false;
    cloudConnecting = false;
    updateCloudUI();
  }
}

async function initCloudBackup() {
  const cloud = window.cytisinioCloud;
  if (!cloud) {
    updateCloudUI();
    return;
  }

  cloud.subscribe(({ type, value }) => {
    if (type === "sync") cloudSyncState = value;
    if (type === "sync" && cloudEnabled() && cloud.getUser().isLoggedIn && !cloudBusy) {
      if (value.phase === "offline" || value.status === "offline") updateCloudUI("Offline · changes are saved on this device", "busy");
      else if (value.phase === "error") updateCloudUI("Sync paused · your device copy is safe", "error");
      else if (value.phase === "in-sync") updateCloudUI("Synced privately", "on");
      else updateCloudUI("Syncing…", "busy");
    } else if (type === "user") {
      updateCloudUI();
    } else if (type === "sync-complete" && cloudEnabled() && !cloudConnecting && !cloudReconciling) {
      const meta = cloudMeta();
      if (meta.userId === cloud.getUser().userId) reconcileCloudBackup();
    }
  });

  try {
    await cloud.ready;
    updateCloudUI();
    if (cloudEnabled() && cloud.getUser().isLoggedIn) {
      await reconcileCloudBackup({ firstConnect: cloudMeta().userId !== cloud.getUser().userId });
    }
  } catch {
    updateCloudUI("Unavailable here · manual backup still works", "error");
  }
}

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

function nicotineUsesOn(date) {
  return nicotineUses.load().map((t) => new Date(t)).filter((t) => sameDay(t, date));
}

function nicotineProduct() {
  return NICOTINE_PRODUCTS[state.nicotineProduct] || NICOTINE_PRODUCTS.cigarettes;
}

function nicotineFreeStatus(now = new Date()) {
  const quitAt = dateForDay(QUIT_DAY);
  quitAt.setHours(0, 0, 0, 0);
  const postQuitUses = nicotineUses
    .load()
    .map((iso) => new Date(iso))
    .filter((date) => !Number.isNaN(date.getTime()) && date >= quitAt && date <= now)
    .sort((a, b) => a - b);
  const lastUse = postQuitUses[postQuitUses.length - 1] || null;
  const since = lastUse || quitAt;
  const days = now >= since ? Math.floor((now.getTime() - since.getTime()) / 86400000) : 0;
  return { days: Math.max(0, days), lastUse, since };
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
  track: document.getElementById("screen-track"),
  calendar: document.getElementById("screen-calendar"),
  guide: document.getElementById("screen-guide"),
};

let activeTab = "today"; // "today" | "track" | "calendar" | "guide"
let visibleScreen = null;

function show(name) {
  const screenChanged = visibleScreen !== name;
  Object.entries(screens).forEach(([k, el]) => (el.hidden = k !== name));
  // Tab bar: visible whenever a course exists (not during setup)
  const tabbar = document.getElementById("tabbar");
  tabbar.hidden = name === "setup";
  const tabStates = {
    "btn-tab-today": name === "main" || name === "future" || name === "done",
    "btn-tab-track": name === "track",
    "btn-tab-calendar": name === "calendar",
    "btn-tab-guide": name === "guide",
  };
  Object.entries(tabStates).forEach(([id, active]) => {
    const button = document.getElementById(id);
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  visibleScreen = name;
  if (screenChanged) window.scrollTo(0, 0);
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

  if (activeTab === "track") {
    show("track");
    renderTrack(now, Math.max(1, Math.min(day, totalDays())));
    return;
  }

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
      const streak = nicotineFreeStatus(now);
      const unit = streak.days === 1 ? "day" : "days";
      sub.textContent = streak.lastUse
        ? `${totalDays()}-day schedule complete. Your current logged nicotine-free streak is ${streak.days} ${unit}, counted from your last logged nicotine use.`
        : `${totalDays()}-day schedule complete. No nicotine use is logged after quit day; your current logged streak is ${streak.days} ${unit}.`;
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
  const roundedTimePct = Math.round(tPct);
  const roundedPillPct = Math.min(100, Math.round(pPct));
  document.getElementById("time-pct").textContent = `${roundedTimePct}%`;
  document.getElementById("time-bar").style.width = `${tPct}%`;
  document.getElementById("time-progress").setAttribute("aria-valuenow", String(roundedTimePct));
  document.getElementById("time-progress").setAttribute("aria-valuetext", `${roundedTimePct}% of course time elapsed`);
  document.getElementById("pills-pct").textContent = `${taken} / ${total} · ${roundedPillPct}%`;
  document.getElementById("pills-bar").style.width = `${Math.min(100, pPct)}%`;
  document.getElementById("pills-progress").setAttribute("aria-valuenow", String(roundedPillPct));
  document.getElementById("pills-progress").setAttribute("aria-valuetext", `${taken} of ${total} pills logged`);

  // Quit banner
  const banner = document.getElementById("quit-banner");
  if (day < QUIT_DAY) {
    banner.hidden = false;
    banner.classList.remove("success");
    const daysLeft = QUIT_DAY - day;
    banner.textContent =
      daysLeft === 1
        ? `🚭 Tomorrow is quit day — your last ${nicotineProduct().singular} is today.`
        : `🚭 Quit day is day 5 — ${daysLeft} days to wind down nicotine.`;
  } else {
    const streak = nicotineFreeStatus(now);
    banner.hidden = false;
    banner.classList.toggle("success", !streak.lastUse || streak.days > 0);
    if (streak.lastUse) {
      const unit = streak.days === 1 ? "day" : "days";
      banner.textContent = streak.days === 0
        ? "↩️ Nicotine use logged since quit day. Your nicotine-free streak restarts from the latest log."
        : `✨ ${streak.days} full ${unit} nicotine-free since your last logged nicotine use.`;
    } else if (day === QUIT_DAY) {
      banner.textContent = "🚭 Quit day. From today: zero nicotine.";
    } else {
      const unit = streak.days === 1 ? "day" : "days";
      banner.textContent = `✨ ${streak.days} full ${unit} with no nicotine use logged since quit day.`;
    }
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

  // Guidance
  document.getElementById("day-guidance").textContent = guidanceFor(day);
}

function renderTrack(now, day) {
  const tracksNicotine = Number(state.nicotineBaseline) > 0;
  document.getElementById("track-day-label").textContent =
    `Day ${day} · daily check-in${tracksNicotine ? " & nicotine wind-down" : ""}`;
  renderNicotineWindDown(now, day);
  buildMoodPicker(document.getElementById("mood-picker"), dayKey(now));
  renderTodayCravings(now);
}

function renderUpcoming(day) {
  const up = document.getElementById("upcoming");
  up.innerHTML = "";
  for (let d = day + 1; d <= Math.min(day + 5, totalDays()); d++) {
    const p = phaseFor(d);
    const li = document.createElement("li");
    const isQuit = d === QUIT_DAY;
    const isMaint = d === MAINTENANCE_PHASE.from;
    const isStep = phases().some((ph) => ph.from === d && d !== 1);
    if (isQuit || isStep) li.classList.add("milestone");
    const tag = isQuit ? " · QUIT DAY" : isMaint ? " · TRIAL EXTENSION" : isStep ? " · new phase" : "";
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

function renderNicotineWindDown(now, day) {
  const card = document.getElementById("nicotine-card");
  const baseline = Number(state.nicotineBaseline) || 0;
  card.hidden = !baseline;
  if (!baseline) return;

  const product = nicotineProduct();
  const entries = nicotineUsesOn(now);
  const count = entries.length;
  const noun = count === 1 ? product.singular : product.plural;
  document.getElementById("nicotine-product-badge").textContent = product.badge;
  document.getElementById("nicotine-today").textContent = `${count} ${noun} today · usual ${baseline}`;
  const nicotinePct = Math.min(100, Math.round((count / baseline) * 100));
  document.getElementById("nicotine-bar").style.width = `${nicotinePct}%`;
  document.getElementById("nicotine-progress").setAttribute("aria-valuenow", String(nicotinePct));
  document.getElementById("nicotine-progress").setAttribute("aria-valuetext", `${count} ${noun} logged today; usual daily amount ${baseline}`);
  document.getElementById("nicotine-plan").textContent =
    day <= QUIT_DAY
      ? NICOTINE_WIND_DOWN[day]
      : "Stay at zero nicotine. A craving is temporary; log the craving instead of feeding it.";

  const logButton = document.getElementById("btn-nicotine");
  logButton.textContent = day >= QUIT_DAY ? `Log a ${product.singular} slip` : `＋ Log a ${product.singular}`;

  const last = document.getElementById("last-nicotine");
  if (entries.length) {
    last.hidden = false;
    last.innerHTML = `Last logged at <strong>${fmtTime(entries[entries.length - 1])}</strong> · <button type="button" id="btn-undo-nicotine" class="link-btn">undo</button>`;
  } else {
    last.hidden = true;
    last.innerHTML = "";
  }
}

// Build (or rebuild) a mood picker into `container` for the given day key.
// Tapping the selected mood again clears it. Re-renders the calendar if it's live.
function buildMoodPicker(container, key) {
  container.innerHTML = "";
  container.setAttribute("role", "group");
  container.setAttribute("aria-label", "Mood rating");
  const current = moods.get(key);
  MOOD_SCALE.forEach((m) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "mood-btn" + (current === m.score ? " selected" : "");
    b.setAttribute("aria-pressed", String(current === m.score));
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
  let completedDoses = 0;
  for (let d = 1; d < curDay; d++) {
    const planned = phaseFor(d).pills;
    plannedDone += planned;
    completedDoses += Math.min(planned, logsOn(dateForDay(d)).length);
  }
  const doseCompletion = plannedDone ? Math.min(100, Math.round((completedDoses / plannedDone) * 100)) : 100;
  const smokeFree = nicotineFreeStatus(now).days;

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
    `<div class="stat"><div class="stat-val">${doseCompletion}%</div><div class="stat-lbl">past-day dose completion</div></div>` +
    `<div class="stat"><div class="stat-val">${smokeFree}</div><div class="stat-lbl">current logged nicotine-free streak</div></div>` +
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
  renderUpcoming(curDay);
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
  const nicotineProduct = document.getElementById("nicotine-product").value;
  const nicotineBaseline = Number(document.getElementById("nicotine-baseline").value) || null;
  if (!start) return;
  state = { start: absoluteStart(start), wake, log: [], mode, nicotineProduct, nicotineBaseline };
  store.save(state);
  render();
});

function logPillAt(date) {
  const timestamp = date.getTime();
  const duplicate = state.log.some((loggedAt) => Math.abs(new Date(loggedAt).getTime() - timestamp) < DUPLICATE_PILL_WINDOW_MS);
  if (duplicate) return false;
  const iso = date.toISOString();
  state.log.push(iso);
  state.log.sort();
  journal.add(iso);
  store.save(state);
  return true;
}

document.getElementById("btn-took").addEventListener("click", (event) => {
  const button = event.currentTarget;
  if (!logPillAt(new Date())) return;
  button.disabled = true;
  render();
  setTimeout(() => (button.disabled = false), 750);
});

document.getElementById("btn-backfill-toggle").addEventListener("click", () => {
  const row = document.getElementById("backfill-row");
  row.hidden = !row.hidden;
  document.getElementById("btn-backfill-toggle").setAttribute("aria-expanded", String(!row.hidden));
});

document.getElementById("btn-backfill-add").addEventListener("click", () => {
  const value = document.getElementById("backfill-time").value;
  const m = value && value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return;
  const d = new Date();
  d.setHours(+m[1], +m[2], 0, 0);
  logPillAt(d);
  document.getElementById("backfill-row").hidden = true;
  document.getElementById("btn-backfill-toggle").setAttribute("aria-expanded", "false");
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
  document.getElementById("btn-craving").setAttribute("aria-expanded", "false");
  render();
}

document.getElementById("btn-craving").addEventListener("click", () => {
  const row = document.getElementById("craving-triggers");
  row.hidden = !row.hidden;
  document.getElementById("btn-craving").setAttribute("aria-expanded", String(!row.hidden));
});

document.getElementById("btn-nicotine").addEventListener("click", () => {
  nicotineUses.add(new Date().toISOString());
  render();
});

document.getElementById("last-nicotine").addEventListener("click", (e) => {
  if (e.target && e.target.id === "btn-undo-nicotine") {
    const entries = nicotineUsesOn(new Date());
    const last = entries[entries.length - 1];
    if (last) nicotineUses.remove(last.toISOString());
    render();
  }
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
  document.getElementById("edit-start").value = localDateTimeInput(state.start);
  document.getElementById("edit-wake").value = state.wake;
  document.getElementById("edit-timefmt").value = state.timeFmt || "auto";
  document.getElementById("edit-mode").value = courseMode();
  document.getElementById("edit-nicotine-product").value = state.nicotineProduct || "cigarettes";
  document.getElementById("edit-nicotine-baseline").value = state.nicotineBaseline || "";
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

document.getElementById("btn-tab-track").addEventListener("click", () => {
  activeTab = "track";
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
document.querySelectorAll(".cloud-account-trigger").forEach((button) => {
  button.addEventListener("click", () => {
    const cloud = window.cytisinioCloud;
    if (cloudEnabled() && cloud && cloud.getUser().isLoggedIn) openSettings();
    else connectCloudBackup();
  });
});

document.getElementById("settings-form").addEventListener("submit", () => {
  const start = document.getElementById("edit-start").value;
  const wake = document.getElementById("edit-wake").value;
  const timeFmt = document.getElementById("edit-timefmt").value;
  const mode = document.getElementById("edit-mode").value === "75" ? "75" : "25";
  const nicotineProduct = document.getElementById("edit-nicotine-product").value;
  const nicotineBaseline = Number(document.getElementById("edit-nicotine-baseline").value) || null;
  if (start && wake) {
    state = { ...state, start: absoluteStart(start), wake, timeFmt, mode, nicotineProduct, nicotineBaseline };
    store.save(state);
  }
  render();
});

function createBackup() {
  return {
    app: "cytisinio",
    version: 3,
    exportedAt: new Date().toISOString(),
    state,
    journal: journal.load(),
    cravings: cravings.load(),
    moods: moods.load(),
    nicotineUses: nicotineUses.load(),
    deleted: cloudDeletions(),
  };
}

function validDateStrings(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && !Number.isNaN(Date.parse(item)));
}

function validateBackup(value, { allowNoCourse = false } = {}) {
  if (!value || typeof value !== "object" || (!allowNoCourse && (!value.state || typeof value.state !== "object"))) {
    throw new Error("This is not a Cytisinio backup.");
  }
  const importedState = value.state;
  if (importedState != null) {
    if (typeof importedState !== "object" || Array.isArray(importedState)) {
      throw new Error("The course data in this backup is invalid.");
    }
    const wakeMatch = typeof importedState.wake === "string" && importedState.wake.match(/^(\d{2}):(\d{2})$/);
    if (
      typeof importedState.start !== "string" ||
      Number.isNaN(Date.parse(importedState.start)) ||
      !wakeMatch ||
      Number(wakeMatch[1]) > 23 ||
      Number(wakeMatch[2]) > 59 ||
      !validDateStrings(importedState.log)
    ) {
      throw new Error("The course data in this backup is invalid.");
    }
  } else if (!allowNoCourse) {
    throw new Error("This backup does not contain an active course.");
  }

  const importedJournal = value.journal == null ? (importedState ? importedState.log : []) : value.journal;
  const importedCravings = value.cravings == null ? [] : value.cravings;
  const importedMoods = value.moods == null ? {} : value.moods;
  const importedNicotineUses = value.nicotineUses == null ? [] : value.nicotineUses;
  const importedDeleted = normalizeCloudDeletions(value.deleted);

  if (!validDateStrings(importedJournal) || !validDateStrings(importedNicotineUses)) {
    throw new Error("The activity history in this backup is invalid.");
  }
  if (
    !Array.isArray(importedCravings) ||
    !importedCravings.every(
      (entry) =>
        entry &&
        typeof entry.t === "string" &&
        !Number.isNaN(Date.parse(entry.t)) &&
        (entry.trigger == null || CRAVING_TRIGGERS.includes(entry.trigger))
    )
  ) {
    throw new Error("The craving history in this backup is invalid.");
  }
  if (
    !importedMoods ||
    typeof importedMoods !== "object" ||
    Array.isArray(importedMoods) ||
    !Object.entries(importedMoods).every(
      ([key, score]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && Number.isInteger(score) && score >= 1 && score <= 5
    )
  ) {
    throw new Error("The mood history in this backup is invalid.");
  }

  const cleanState = importedState
    ? {
        start: absoluteStart(importedState.start),
        wake: importedState.wake,
        log: [...importedState.log],
        mode: importedState.mode === "75" ? "75" : "25",
        timeFmt: ["auto", "12", "24"].includes(importedState.timeFmt) ? importedState.timeFmt : "auto",
        nicotineProduct: NICOTINE_PRODUCTS[importedState.nicotineProduct] ? importedState.nicotineProduct : "cigarettes",
        nicotineBaseline:
          Number.isInteger(Number(importedState.nicotineBaseline)) &&
          Number(importedState.nicotineBaseline) >= 1 &&
          Number(importedState.nicotineBaseline) <= 200
            ? Number(importedState.nicotineBaseline)
            : null,
      }
    : null;

  return {
    state: cleanState,
    journal: [...importedJournal],
    cravings: importedCravings.map((entry) => ({ t: entry.t, trigger: entry.trigger || null })),
    moods: { ...importedMoods },
    nicotineUses: [...importedNicotineUses],
    deleted: importedDeleted,
  };
}

document.getElementById("btn-export").addEventListener("click", (e) => {
  const backup = JSON.stringify(createBackup(), null, 2);
  const blob = new Blob([backup], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = e.currentTarget;
  link.href = url;
  link.download = `cytisinio-backup-${dayKey(new Date())}.json`;
  // Give mobile browsers time to claim the Blob before releasing its URL.
  setTimeout(() => {
    URL.revokeObjectURL(url);
    link.href = "#";
    link.removeAttribute("download");
  }, 1000);

  link.textContent = "✓ Downloaded";
  setTimeout(() => (link.innerHTML = '<span aria-hidden="true">↓</span> Download'), 2000);
});

document.getElementById("backup-import").addEventListener("change", async (e) => {
  const input = e.currentTarget;
  const file = input.files && input.files[0];
  if (!file) return;

  try {
    const imported = validateBackup(JSON.parse(await file.text()));
    if (!confirm("Restore this backup? Current course data on this device will be replaced.")) return;

    applyBackupData(imported);
    document.getElementById("settings-dialog").close();
    queueCloudSave();
    alert("Backup restored successfully.");
  } catch (error) {
    alert(error instanceof Error ? error.message : "This backup could not be restored.");
  } finally {
    input.value = "";
  }
});

document.querySelector(".backup-import-label").addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  document.getElementById("backup-import").click();
});

document.getElementById("btn-cloud-enable").addEventListener("click", connectCloudBackup);
document.getElementById("btn-cloud-sync").addEventListener("click", async () => {
  await reconcileCloudBackup();
});

document.getElementById("btn-cloud-disable").addEventListener("click", async () => {
  const cloud = window.cytisinioCloud;
  if (!cloud || cloudBusy) return;
  if (!confirm("Disconnect cloud backup on this device? Your local data and manual backups will remain.")) return;
  try {
    cloudBusy = true;
    clearTimeout(cloudSaveTimer);
    localStorage.removeItem(CLOUD_ENABLED_KEY);
    updateCloudUI("Disconnecting…", "busy");
    await cloud.logout();
    updateCloudUI("Off · data stays only on this device");
  } catch {
    updateCloudUI("Could not disconnect · try again", "error");
  } finally {
    cloudBusy = false;
    updateCloudUI();
  }
});

document.getElementById("btn-cloud-delete").addEventListener("click", async () => {
  const cloud = window.cytisinioCloud;
  if (!cloud || cloudBusy || !cloud.getUser().isLoggedIn) return;
  if (!navigator.onLine) {
    alert("Connect to the internet before deleting your cloud backup. Your local data is unchanged.");
    return;
  }
  if (!confirm("Permanently delete every Cytisinio backup from this cloud account and disconnect this device? Your local data will remain.")) return;
  let finalMessage = "";
  let finalTone = "";
  try {
    cloudBusy = true;
    clearTimeout(cloudSaveTimer);
    updateCloudUI("Deleting cloud backup…", "busy");
    await cloud.deleteAll();
    localStorage.removeItem(CLOUD_ENABLED_KEY);
    localStorage.removeItem(CLOUD_META_KEY);
    localStorage.setItem(CLOUD_DIRTY_KEY, "1");
    await cloud.logout();
    finalMessage = "Cloud backup deleted · local data remains";
  } catch {
    finalMessage = "Could not verify cloud deletion · local data is safe";
    finalTone = "error";
  } finally {
    cloudBusy = false;
    updateCloudUI(finalMessage, finalTone);
  }
});

document.getElementById("btn-reset").addEventListener("click", () => {
  if (confirm("Reset this course and permanently erase every pill log on this device? Mood, craving, and nicotine-use history will remain.")) {
    journal.clear();
    state = null;
    store.clear();
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
  if (document.hidden && localStorage.getItem(CLOUD_DIRTY_KEY) === "1") saveCloudBackup();
  else if (!document.hidden && state) render();
});
window.addEventListener("pagehide", () => {
  if (localStorage.getItem(CLOUD_DIRTY_KEY) === "1") saveCloudBackup();
});

// ---- PWA ----
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

render();
initCloudBackup();
