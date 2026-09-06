import Dexie from "dexie";
import dexieCloud from "dexie-cloud-addon";

const DATABASE_URL = "https://z6osshblh.dexie.cloud";
const LEGACY_BACKUP_ID = "#current";
const DEVICE_BACKUP_PREFIX = "#device:";

const db = new Dexie("cytisinio", { addons: [dexieCloud] });

// Each device owns a private snapshot. Separate IDs prevent two offline devices
// from replacing one another's history; the app merges the snapshots after sync.
// IDs beginning with "#" are private per-user singleton IDs in Dexie Cloud.
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

function backupId(writerId) {
  return `${DEVICE_BACKUP_PREFIX}${writerId}`;
}

async function backupBundle() {
  const records = (await db.table("backups").toArray())
    .filter((record) => record.id === LEGACY_BACKUP_ID || record.id.startsWith(DEVICE_BACKUP_PREFIX))
    .sort((a, b) => String(a.updatedAt).localeCompare(String(b.updatedAt)));
  if (!records.length) return null;
  return {
    records,
    // A vector-like fingerprint converges even when device clocks do not.
    revision: [...records]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((record) => `${record.id}@${record.revision || record.updatedAt || "legacy"}`)
      .join("|"),
  };
}

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
    return backupBundle();
  },

  async save(data, writerId) {
    await ready;
    if (!publicUser().isLoggedIn) throw new Error("Sign in before saving a cloud backup.");
    const id = backupId(writerId);
    const previous = await db.table("backups").get(id);
    const record = {
      id,
      revision: (Number(previous && previous.revision) || 0) + 1,
      updatedAt: new Date().toISOString(),
      writerId,
      data,
    };
    await db.transaction("rw", db.table("backups"), async () => {
      await db.table("backups").put(record);
      // The first device on the new format absorbs the old singleton before it
      // is removed, so legacy users migrate without keeping a stale snapshot.
      await db.table("backups").delete(LEGACY_BACKUP_ID);
    });
    // The IndexedDB write above is the durable offline commit. Sync may finish
    // now or later when connectivity returns.
    db.cloud.sync().catch(() => {});
    return { ...record, bundleRevision: (await backupBundle()).revision };
  },

  async deleteAll() {
    await ready;
    if (!publicUser().isLoggedIn) throw new Error("Sign in before deleting cloud backups.");
    // Pull first so every device snapshot currently on the server is present
    // locally, then delete the complete private backup set and wait for sync.
    await db.cloud.sync({ purpose: "pull" });
    const table = db.table("backups");
    const records = (await table.toArray()).filter(
      (record) => record.id === LEGACY_BACKUP_ID || record.id.startsWith(DEVICE_BACKUP_PREFIX)
    );
    await db.transaction("rw", table, async () => {
      await table.bulkDelete(records.map((record) => record.id));
    });
    await db.cloud.sync();
    if (await backupBundle()) throw new Error("Cloud backup deletion could not be verified.");
  },

  async sync() {
    await ready;
    if (!publicUser().isLoggedIn) return null;
    await db.cloud.sync({ purpose: "pull" });
    return backupBundle();
  },
};
