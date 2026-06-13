"use client";

import { useEffect, useMemo, useState } from "react";
import { a1Words } from "@/data/a1Words";
import { a2Words } from "@/data/a2Words";
import { b1Words } from "@/data/b1Words";

type Level = "a1" | "a2" | "b1";

type WordProgress = {
  reviewCount: number;
  lastRating: string;
  inMistakeBook: boolean;
  nextReviewAt?: string;
};

type StudyStats = {
  totalReviews: number;
  todayReviews: number;
  todayDate?: string;
  studyDates?: string[];
  masteredWords: string[];
  words: Record<string, WordProgress>;
};

const decks = [
  { level: "a1" as const, label: "A1", words: a1Words },
  { level: "a2" as const, label: "A2", words: a2Words },
  { level: "b1" as const, label: "B1", words: b1Words },
];

function createEmptyStats(): StudyStats {
  return {
    totalReviews: 0,
    todayReviews: 0,
    todayDate: "",
    studyDates: [],
    masteredWords: [],
    words: {},
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
    const raw = JSON.parse(saved) as Partial<StudyStats>;

    return {
      totalReviews: raw.totalReviews ?? 0,
      todayReviews: raw.todayReviews ?? 0,
      todayDate: raw.todayDate ?? "",
      studyDates: raw.studyDates ?? [],
      masteredWords: raw.masteredWords ?? [],
      words: raw.words ?? {},
    };
  } catch {
    return createEmptyStats();
  }
}

function formatNextReviewTime(nextReviewAt?: string) {
  if (!nextReviewAt) {
    return "暂无";
  }

  return new Date(nextReviewAt).toLocaleString();
}

export default function MistakesPage() {
  const [selectedLevel, setSelectedLevel] = useState<Level>("a1");
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

  const selectedDeck =
    decks.find((deck) => deck.level === selectedLevel) ?? decks[0];

  const selectedStats = statsMap[selectedLevel];

  const mistakeWords = useMemo(() => {
    return selectedDeck.words.filter((word) => {
      return selectedStats.words[word.id]?.inMistakeBook;
    });
  }, [selectedDeck.words, selectedStats.words]);

  const totalMistakes = decks.reduce((sum, deck) => {
    const stats = statsMap[deck.level];

    const count = deck.words.filter((word) => {
      return stats.words[word.id]?.inMistakeBook;
    }).length;

    return sum + count;
  }, 0);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div>
          <a href="/" className="text-sm text-emerald-300 hover:text-emerald-200">
            ← 返回首页
          </a>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Mistake Book
          </p>

          <h1 className="mt-3 text-4xl font-bold">错题本</h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            自动收集你选择“忘记”或“困难”的单词。你可以查看错题，也可以进入专项训练模式。
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/mistakes/study"
              className="rounded-full border border-white/20 bg-white/15 px-6 py-3 font-semibold text-white shadow-xl backdrop-blur-3xl transition hover:scale-105 hover:bg-white/25"
            >
              开始错题训练
            </a>

            <a
              href={`/study/${selectedLevel}`}
              className="rounded-full border border-white/20 bg-black/20 px-6 py-3 font-semibold text-white shadow-xl backdrop-blur-3xl transition hover:scale-105 hover:bg-white/10"
            >
              返回当前词书学习
            </a>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-3xl">
            <p className="text-sm text-slate-400">全部错题</p>
            <p className="mt-2 text-4xl font-bold">{totalMistakes}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-3xl">
            <p className="text-sm text-slate-400">当前词书</p>
            <p className="mt-2 text-4xl font-bold">{selectedDeck.label}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-3xl">
            <p className="text-sm text-slate-400">当前错题</p>
            <p className="mt-2 text-4xl font-bold">{mistakeWords.length}</p>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          {decks.map((deck) => (
            <button
              key={deck.level}
              onClick={() => setSelectedLevel(deck.level)}
              className={`rounded-full border px-5 py-3 font-semibold shadow-xl backdrop-blur-3xl transition hover:scale-105 ${
                selectedLevel === deck.level
                  ? "border-emerald-200/60 bg-emerald-100/70 text-emerald-950"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {deck.label}
            </button>
          ))}
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-3xl">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{selectedDeck.label} 错题</h2>
              <p className="mt-1 text-sm text-slate-400">
                共 {mistakeWords.length} 个错题
              </p>
            </div>

            <a
              href="/mistakes/study"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white shadow-xl backdrop-blur-3xl transition hover:bg-white/20"
            >
              训练 →
            </a>
          </div>

          {mistakeWords.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-slate-300 backdrop-blur-3xl">
              当前词书还没有错题。去学习页选择“忘记”或“困难”后，这里会自动出现。
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {mistakeWords.map((word) => {
                const progress = selectedStats.words[word.id];

                return (
                  <article
                    key={word.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-3xl"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">
                          {selectedDeck.label} · {word.pos}
                          {word.gender ? ` · ${word.gender}` : ""}
                        </p>

                        <h3 className="mt-2 text-3xl font-bold">{word.word}</h3>
                      </div>

                      <span className="rounded-full bg-rose-100/70 px-3 py-1 text-sm font-semibold text-rose-950">
                        {progress.lastRating}
                      </span>
                    </div>

                    <p className="mt-4 text-xl font-semibold">{word.chinese}</p>

                    <div className="mt-4 rounded-xl bg-white/10 p-4">
                      <p>{word.exampleEs}</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {word.exampleZh}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-slate-400">已复习</p>
                        <p className="mt-1 font-semibold">
                          {progress.reviewCount} 次
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-slate-400">下次复习</p>
                        <p className="mt-1 font-semibold">
                          {formatNextReviewTime(progress.nextReviewAt)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}