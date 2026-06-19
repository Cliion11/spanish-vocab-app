import type { CloudProgressPayload } from "@/lib/cloudProgress";

const LEVEL_IDS = ["a1", "a2", "b1", "b2", "c1"] as const;

const EXACT_KEYS = [
  "mistakes",
  "daily-goal",
  "auto-speak",
  "speech-rate",
  "study-streak",
  "last-study-date",
];

function isManagedProgressKey(key: string) {
  if (EXACT_KEYS.includes(key)) return true;

  return LEVEL_IDS.some((level) => key.startsWith(`${level}-`));
}

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function collectLocalStorageSnapshot() {
  if (typeof window === "undefined") {
    return {};
  }

  const snapshot: Record<string, string> = {};

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key) continue;
    if (!isManagedProgressKey(key)) continue;

    const value = window.localStorage.getItem(key);

    if (value !== null) {
      snapshot[key] = value;
    }
  }

  return snapshot;
}

export function restoreLocalStorageSnapshot(snapshot: Record<string, string>) {
  if (typeof window === "undefined") {
    return 0;
  }

  let restoredCount = 0;

  Object.entries(snapshot).forEach(([key, value]) => {
    if (!isManagedProgressKey(key)) return;

    window.localStorage.setItem(key, value);
    restoredCount += 1;
  });

  return restoredCount;
}

export function collectLocalProgressPayload(): CloudProgressPayload {
  const snapshot = collectLocalStorageSnapshot();

  return {
    progress: {
      version: 1,
      savedAt: new Date().toISOString(),
      localStorage: snapshot,
    },
    mistakes: safeJsonParse<unknown[]>(
      typeof window === "undefined" ? null : window.localStorage.getItem("mistakes"),
      [],
    ),
    settings: {
      dailyGoal: typeof window === "undefined" ? null : window.localStorage.getItem("daily-goal"),
      autoSpeak: typeof window === "undefined" ? null : window.localStorage.getItem("auto-speak"),
      speechRate: typeof window === "undefined" ? null : window.localStorage.getItem("speech-rate"),
    },
    stats: {
      studyStreak: typeof window === "undefined" ? null : window.localStorage.getItem("study-streak"),
      lastStudyDate: typeof window === "undefined" ? null : window.localStorage.getItem("last-study-date"),
    },
  };
}

export function restoreCloudProgressToLocal(data: {
  progress?: Record<string, unknown> | null;
}) {
  const snapshot = data.progress?.localStorage;

  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return 0;
  }

  return restoreLocalStorageSnapshot(snapshot as Record<string, string>);
}
