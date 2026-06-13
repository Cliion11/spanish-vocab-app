"use client";

import { useEffect, useMemo, useState } from "react";
import { a1Words } from "@/data/a1Words";
import { a2Words } from "@/data/a2Words";
import { b1Words } from "@/data/b1Words";

type Level = "a1" | "a2" | "b1";

type WordProgress = {
  reviewCount?: number;
  lastRating?: string;
  inMistakeBook?: boolean;
  nextReviewAt?: string;
};

type StudyStats = {
  totalReviews: number;
  todayReviews: number;
  todayDate: string;
  studyDates: string[];
  masteredWords: string[];
  words: Record<string, WordProgress>;
};

const decks = [
  {
    level: "a1" as const,
    label: "A1",
    title: "DELE A1 基础词汇",
    description: "适合零基础入门，学习日常问候、家庭、数字、时间等核心词汇。",
    words: a1Words,
  },
  {
    level: "a2" as const,
    label: "A2",
    title: "DELE A2 初级词汇",
    description: "覆盖购物、旅行、饮食、城市生活等常见表达。",
    words: a2Words,
  },
  {
    level: "b1" as const,
    label: "B1",
    title: "DELE B1 中级词汇",
    description: "适合日常交流、基础观点表达和简单叙述。",
    words: b1Words,
  },
];

function getTodayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createEmptyStats(): StudyStats {
  return {
    totalReviews: 0,
    todayReviews: 0,
    todayDate: getTodayKey(),
    studyDates: [],
    masteredWords: [],
    words: {},
  };
}

function normalizeStats(value: unknown): StudyStats {
  const today = getTodayKey();

  if (!value || typeof value !== "object") {
    return createEmptyStats();
  }

  const raw = value as Partial<StudyStats>;

  return {
    totalReviews: raw.totalReviews ?? 0,
    todayReviews: raw.todayDate === today ? raw.todayReviews ?? 0 : 0,
    todayDate: today,
    studyDates: raw.studyDates ?? [],
    masteredWords: raw.masteredWords ?? [],
    words: raw.words ?? {},
  };
}

function loadStats(level: Level): StudyStats {
  if (typeof window === "undefined") {
    return createEmptyStats();
  }

  const saved = window.localStorage.getItem(`spanish-vocab-${level}-progress`);

  if (!saved) {
    return createEmptyStats();
  }

  try {
    return normalizeStats(JSON.parse(saved));
  } catch {
    return createEmptyStats();
  }
}

function isDue(nextReviewAt?: string) {
  if (!nextReviewAt) {
    return true;
  }

  const time = new Date(nextReviewAt).getTime();

  if (Number.isNaN(time)) {
    return true;
  }

  return time <= Date.now();
}

function getDateKeyOffset(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStudyStreak(studyDates: string[]) {
  const dateSet = new Set(studyDates);
  let streak = 0;

  for (let offset = 0; offset < 365; offset += 1) {
    const dateKey = getDateKeyOffset(offset);

    if (!dateSet.has(dateKey)) {
      break;
    }

    streak += 1;
  }

  return streak;
}

export default function Home() {
  const [statsMap, setStatsMap] = useState<Record<Level, StudyStats>>({
    a1: createEmptyStats(),
    a2: createEmptyStats(),
    b1: createEmptyStats(),
  });

  useEffect(() => {
    setStatsMap({
      a1: loadStats("a1"),
      a2: loadStats("a2"),
      b1: loadStats("b1"),
    });
  }, []);

  const deckCards = useMemo(() => {
    return decks.map((deck) => {
      const stats = statsMap[deck.level];

      const studiedWords = deck.words.filter((word) => stats.words[word.id]);

      const newWords = deck.words.filter((word) => !stats.words[word.id]);

      const dueReviewWords = deck.words.filter((word) => {
        const progress = stats.words[word.id];

        if (!progress) {
          return false;
        }

        return isDue(progress.nextReviewAt);
      });

      const mistakeCount = deck.words.filter((word) => {
        return stats.words[word.id]?.inMistakeBook;
      }).length;

      const masteredCount = stats.masteredWords.filter((id) => {
        return deck.words.some((word) => word.id === id);
      }).length;

      const availableCount = newWords.length + dueReviewWords.length;

      const masteryPercent =
        deck.words.length === 0
          ? 0
          : Math.round((masteredCount / deck.words.length) * 100);

      return {
        ...deck,
        stats,
        studiedCount: studiedWords.length,
        newCount: newWords.length,
        dueReviewCount: dueReviewWords.length,
        mistakeCount,
        masteredCount,
        availableCount,
        masteryPercent,
      };
    });
  }, [statsMap]);

  const totalAvailable = deckCards.reduce(
    (sum, deck) => sum + deck.availableCount,
    0,
  );

  const totalTodayReviews = deckCards.reduce(
    (sum, deck) => sum + deck.stats.todayReviews,
    0,
  );

  const totalMistakes = deckCards.reduce(
    (sum, deck) => sum + deck.mistakeCount,
    0,
  );

  const totalMastered = deckCards.reduce(
    (sum, deck) => sum + deck.masteredCount,
    0,
  );

  const allStudyDates = Array.from(
    new Set(deckCards.flatMap((deck) => deck.stats.studyDates)),
  );

  const totalStreak = getStudyStreak(allStudyDates);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Spanish Vocabulary App
          </p>

          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            开源西班牙语背单词网站
          </h1>

          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            面向中文学习者，参考 CEFR / DELE 学习路径，提供分级词书、发音、例句、错题本和间隔复习。
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/study/a1"
              className="rounded-full border border-white/20 bg-white/15 px-6 py-3 font-semibold text-white shadow-xl backdrop-blur-3xl transition hover:scale-105 hover:bg-white/25"
            >
              开始今日学习
            </a>

            <a
              href="/mistakes"
              className="rounded-full border border-white/20 bg-black/20 px-6 py-3 font-semibold text-white shadow-xl backdrop-blur-3xl transition hover:scale-105 hover:bg-white/10"
            >
              查看错题本
            </a>
           <a
  href="/settings"
  className="rounded-full border border-white/20 bg-black/20 px-6 py-3 font-semibold text-white shadow-xl backdrop-blur-3xl transition hover:scale-105 hover:bg-white/10"
>
  数据管理
</a>
          </div>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-3xl">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Today
            </p>

            <h2 className="mt-3 text-3xl font-bold">今日任务总览</h2>

            <p className="mt-2 text-slate-400">
              根据本地学习记录统计当前到期复习、新词、错题和连续学习天数。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-3xl">
              <p className="text-sm text-slate-400">今日已学</p>
              <p className="mt-2 text-4xl font-bold">{totalTodayReviews}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-3xl">
              <p className="text-sm text-slate-400">当前可学</p>
              <p className="mt-2 text-4xl font-bold">{totalAvailable}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-3xl">
              <p className="text-sm text-slate-400">已掌握</p>
              <p className="mt-2 text-4xl font-bold">{totalMastered}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-3xl">
              <p className="text-sm text-slate-400">错题总数</p>
              <p className="mt-2 text-4xl font-bold">{totalMistakes}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-3xl">
              <p className="text-sm text-slate-400">连续学习</p>
              <p className="mt-2 text-4xl font-bold">{totalStreak} 天</p>
            </div>
          </div>
        </section>

        <section id="decks">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">词书列表</h2>
              <p className="mt-2 text-slate-400">
                每个词书都有独立的学习进度、错题本和复习调度。
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {deckCards.map((deck) => (
              <a
                key={deck.level}
                href={`/study/${deck.level}`}
                className="block rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-3xl transition hover:-translate-y-1 hover:bg-white/10"
              >
                <div className="mb-4 inline-flex rounded-full bg-emerald-100/70 px-3 py-1 text-sm font-bold text-emerald-950">
                  {deck.label}
                </div>

                <h3 className="mb-3 text-xl font-bold">{deck.title}</h3>

                <p className="mb-6 min-h-20 text-sm leading-6 text-slate-400">
                  {deck.description}
                </p>

                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                    <span className="text-slate-400">总词数</span>
                    <span className="font-semibold">{deck.words.length}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                    <span className="text-slate-400">到期复习</span>
                    <span className="font-semibold">{deck.dueReviewCount}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                    <span className="text-slate-400">新词</span>
                    <span className="font-semibold">{deck.newCount}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                    <span className="text-slate-400">今日已学</span>
                    <span className="font-semibold">
                      {deck.stats.todayReviews}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                    <span className="text-slate-400">已掌握</span>
                    <span className="font-semibold">
                      {deck.masteredCount} / {deck.words.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                    <span className="text-slate-400">错题</span>
                    <span className="font-semibold">{deck.mistakeCount}</span>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>掌握进度</span>
                    <span>{deck.masteryPercent}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-200/80"
                      style={{ width: `${deck.masteryPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
                  <span>
                    {deck.availableCount > 0
                      ? `当前可学 ${deck.availableCount} 个`
                      : "今日复习已完成"}
                  </span>
                  <span>进入 →</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}