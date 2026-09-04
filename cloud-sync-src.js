import Dexie from "dexie";
import dexieCloud from "dexie-cloud-addon";

const DATABASE_URL = "https://z6osshblh.dexie.cloud";
const BACKUP_ID = "#current";

const db = new Dexie("cytisinio", { addons: [dexieCloud] });

// One private singleton is enough for a personal backup. IDs beginning with
// "#" are private per-user singleton IDs in Dexie Cloud.
db.version(1).stores({
  backups: "id,updatedAt",
});

db.cloud.configure({
  databaseUrl: DATABASE_URL,
  requireAuth: false,
  socialAuth: false,
  tryUseServiceWorker: false,
  largeStringThreshold: Infinity,
});

const listeners = new Set();
const ready = db.open();

function publicUser(user = db.cloud.currentUser.value) {
  return {
    isLoggedIn: Boolean(user && user.isLoggedIn),
    userId: user && user.userId ? user.userId : null,
    email: user && user.email ? user.email : null,
  };
}

function emit(type, value) {
  for (const listener of listeners) {
    try {
      listener({ type, value });
    } catch {
      // A UI listener must never interrupt the database or sync engine.
    }
  }
}

db.cloud.currentUser.subscribe((user) => emit("user", publicUser(user)));
db.cloud.syncState.subscribe((syncState) =>
  emit("sync", {
    status: syncState.status,
    phase: syncState.phase,
    error: syncState.error ? syncState.error.message : null,
  })
);
db.cloud.events.syncComplete.subscribe(() => emit("sync-complete", null));

window.cytisinioCloud = {
  databaseUrl: DATABASE_URL,
  ready,

  subscribe(listener) {
    listeners.add(listener);
    listener({ type: "user", value: publicUser() });
    listener({ type: "sync", value: db.cloud.syncState.value });
    return () => listeners.delete(listener);
  },

  getUser() {
    return publicUser();
  },

  async login() {
    await ready;
    await db.cloud.login();
    return publicUser();
  },

  async logout() {
    await ready;
    // localStorage remains untouched, so forcing logout cannot erase the
    // device's Cytisinio history even if a pending cloud change exists.
    await db.cloud.logout({ force: true });
  },

  async read() {
    await ready;
    return (await db.table("backups").get(BACKUP_ID)) || null;
  },

  async save(data, writerId) {
    await ready;
    if (!publicUser().isLoggedIn) throw new Error("Sign in before saving a cloud backup.");
    const record = {
      id: BACKUP_ID,
      updatedAt: new Date().toISOString(),
      writerId,
      data,
    };
    await db.table("backups").put(record);
    // The IndexedDB write above is the durable offline commit. Sync may finish
    // now or later when connectivity returns.
    db.cloud.sync().catch(() => {});
    return record;
  },

  async sync() {
    await ready;
    if (!publicUser().isLoggedIn) return null;
    await db.cloud.sync({ purpose: "pull" });
    return (await db.table("backups").get(BACKUP_ID)) || null;
  },
};
