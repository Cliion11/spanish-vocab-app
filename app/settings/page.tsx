"use client";

import { useEffect, useMemo, useState } from "react";

type Level = "a1" | "a2" | "b1";

type WordProgress = {
  reviewCount?: number;
  lastRating?: string;
  inMistakeBook?: boolean;
  nextReviewAt?: string;
};

type StudyStats = {
  totalReviews?: number;
  todayReviews?: number;
  todayDate?: string;
  studyDates?: string[];
  masteredWords?: string[];
  words?: Record<string, WordProgress>;
};

const decks = [
  {
    level: "a1" as const,
    label: "A1",
    title: "DELE A1 基础词汇",
  },
  {
    level: "a2" as const,
    label: "A2",
    title: "DELE A2 初级词汇",
  },
  {
    level: "b1" as const,
    label: "B1",
    title: "DELE B1 中级词汇",
  },
];

const neutralButton =
  "rounded-full border border-white/20 bg-white/15 px-5 py-3 font-semibold text-white shadow-xl backdrop-blur-3xl transition hover:scale-105 hover:bg-white/25";

const dangerButton =
  "rounded-full border border-rose-200/30 bg-rose-100/70 px-5 py-3 font-semibold text-rose-950 shadow-xl backdrop-blur-3xl transition hover:scale-105 hover:bg-rose-50/80";

function getStorageKey(level: Level) {
  return `spanish-vocab-${level}-progress`;
}

function readStats(level: Level): StudyStats {
  if (typeof window === "undefined") {
    return {};
  }

  const saved = window.localStorage.getItem(getStorageKey(level));

  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved) as StudyStats;
  } catch {
    return {};
  }
}

function countMistakes(stats: StudyStats) {
  return Object.values(stats.words ?? {}).filter(
    (progress) => progress.inMistakeBook,
  ).length;
}

function countStudiedWords(stats: StudyStats) {
  return Object.keys(stats.words ?? {}).length;
}

function countDueWords(stats: StudyStats) {
  return Object.values(stats.words ?? {}).filter((progress) => {
    if (!progress.nextReviewAt) {
      return false;
    }

    const time = new Date(progress.nextReviewAt).getTime();

    if (Number.isNaN(time)) {
      return false;
    }

    return time <= Date.now();
  }).length;
}

export default function SettingsPage() {
  const [statsMap, setStatsMap] = useState<Record<Level, StudyStats>>({
    a1: {},
    a2: {},
    b1: {},
  });

  const [message, setMessage] = useState("");

  function refreshStats() {
    setStatsMap({
      a1: readStats("a1"),
      a2: readStats("a2"),
      b1: readStats("b1"),
    });
  }

  useEffect(() => {
    refreshStats();
  }, []);

  const summary = useMemo(() => {
    let totalReviews = 0;
    let todayReviews = 0;
    let masteredWords = 0;
    let mistakeWords = 0;

    for (const deck of decks) {
      const stats = statsMap[deck.level];

      totalReviews += stats.totalReviews ?? 0;
      todayReviews += stats.todayReviews ?? 0;
      masteredWords += stats.masteredWords?.length ?? 0;
      mistakeWords += countMistakes(stats);
    }

    return {
      totalReviews,
      todayReviews,
      masteredWords,
      mistakeWords,
    };
  }, [statsMap]);

  function resetLevel(level: Level) {
    const confirmed = window.confirm(
      `确定要清空 ${level.toUpperCase()} 的学习数据吗？这个操作不能撤销。`,
    );

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem(getStorageKey(level));
    refreshStats();
    setMessage(`已清空 ${level.toUpperCase()} 学习数据。`);
  }

  function resetAll() {
    const confirmed = window.confirm(
      "确定要清空 A1 / A2 / B1 全部学习数据吗？这个操作不能撤销。",
    );

    if (!confirmed) {
      return;
    }

    for (const deck of decks) {
      window.localStorage.removeItem(getStorageKey(deck.level));
    }

    refreshStats();
    setMessage("已清空全部学习数据。");
  }

  async function copyBackup() {
    const backup = {
      exportedAt: new Date().toISOString(),
      data: {
        a1: window.localStorage.getItem(getStorageKey("a1")),
        a2: window.localStorage.getItem(getStorageKey("a2")),
        b1: window.localStorage.getItem(getStorageKey("b1")),
      },
    };

    try {
      await window.navigator.clipboard.writeText(JSON.stringify(backup, null, 2));
      setMessage("已复制本地学习数据备份。");
    } catch {
      setMessage("复制失败，浏览器可能没有授权剪贴板访问。");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div>
          <a href="/" className="text-sm text-emerald-300 hover:text-emerald-200">
            ← 返回首页
          </a>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Settings
          </p>

          <h1 className="mt-3 text-4xl font-bold">数据管理</h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            当前学习数据保存在浏览器 LocalStorage 中。这里可以查看、备份或清空本地进度。
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-3xl">
            <p className="text-sm text-slate-400">总复习</p>
            <p className="mt-2 text-4xl font-bold">{summary.totalReviews}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-3xl">
            <p className="text-sm text-slate-400">今日复习</p>
            <p className="mt-2 text-4xl font-bold">{summary.todayReviews}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-3xl">
            <p className="text-sm text-slate-400">已掌握</p>
            <p className="mt-2 text-4xl font-bold">{summary.masteredWords}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-3xl">
            <p className="text-sm text-slate-400">错题数</p>
            <p className="mt-2 text-4xl font-bold">{summary.mistakeWords}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-3xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">词书数据</h2>
              <p className="mt-2 text-slate-400">
                每个词书的数据独立保存，可以单独清空。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={refreshStats} className={neutralButton}>
                刷新数据
              </button>

              <button onClick={copyBackup} className={neutralButton}>
                复制备份
              </button>

              <button onClick={resetAll} className={dangerButton}>
                清空全部
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {decks.map((deck) => {
              const stats = statsMap[deck.level];
              const studiedCount = countStudiedWords(stats);
              const mistakeCount = countMistakes(stats);
              const dueCount = countDueWords(stats);

              return (
                <article
                  key={deck.level}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-3xl"
                >
                  <span className="rounded-full bg-emerald-100/70 px-3 py-1 text-sm font-bold text-emerald-950">
                    {deck.label}
                  </span>

                  <h3 className="mt-4 text-xl font-bold">{deck.title}</h3>

                  <div className="mt-5 grid gap-3 text-sm">
                    <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                      <span className="text-slate-400">总复习</span>
                      <span className="font-semibold">
                        {stats.totalReviews ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                      <span className="text-slate-400">今日复习</span>
                      <span className="font-semibold">
                        {stats.todayReviews ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                      <span className="text-slate-400">已学习词数</span>
                      <span className="font-semibold">{studiedCount}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                      <span className="text-slate-400">已掌握</span>
                      <span className="font-semibold">
                        {stats.masteredWords?.length ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                      <span className="text-slate-400">错题</span>
                      <span className="font-semibold">{mistakeCount}</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                      <span className="text-slate-400">已到期复习</span>
                      <span className="font-semibold">{dueCount}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href={`/study/${deck.level}`} className={neutralButton}>
                      去学习
                    </a>

                    <button
                      onClick={() => resetLevel(deck.level)}
                      className={dangerButton}
                    >
                      清空
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {message && (
          <p className="rounded-2xl border border-emerald-200/20 bg-emerald-100/20 p-4 font-semibold text-emerald-100 backdrop-blur-3xl">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}