"use client";

import { useEffect, useMemo, useState } from "react";
import { a1Words } from "@/data/a1Words";
import { a2Words } from "@/data/a2Words";
import { b1Words } from "@/data/b1Words";

type WordProgress = {
  reviewCount: number;
  lastRating: string;
  inMistakeBook: boolean;
};

type StudyStats = {
  totalReviews: number;
  todayReviews: number;
  masteredWords: string[];
  words: Record<string, WordProgress>;
};

const decks = [
  { level: "a1", label: "A1", words: a1Words },
  { level: "a2", label: "A2", words: a2Words },
  { level: "b1", label: "B1", words: b1Words },
];

function loadStats(level: string): StudyStats {
  if (typeof window === "undefined") {
    return {
      totalReviews: 0,
      todayReviews: 0,
      masteredWords: [],
      words: {},
    };
  }

  const saved = window.localStorage.getItem(`spanish-vocab-${level}-progress`);

  if (!saved) {
    return {
      totalReviews: 0,
      todayReviews: 0,
      masteredWords: [],
      words: {},
    };
  }

  try {
    return JSON.parse(saved) as StudyStats;
  } catch {
    return {
      totalReviews: 0,
      todayReviews: 0,
      masteredWords: [],
      words: {},
    };
  }
}

export default function MistakesPage() {
  const [selectedLevel, setSelectedLevel] = useState("a1");
  const [statsMap, setStatsMap] = useState<Record<string, StudyStats>>({});

  useEffect(() => {
    const nextStatsMap: Record<string, StudyStats> = {};

    for (const deck of decks) {
      nextStatsMap[deck.level] = loadStats(deck.level);
    }

    setStatsMap(nextStatsMap);
  }, []);

  const selectedDeck = decks.find((deck) => deck.level === selectedLevel) ?? decks[0];
  const selectedStats = statsMap[selectedDeck.level];

  const mistakeWords = useMemo(() => {
    if (!selectedStats) {
      return [];
    }

    return selectedDeck.words.filter((word) => {
      return selectedStats.words[word.id]?.inMistakeBook;
    });
  }, [selectedDeck, selectedStats]);

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
          <div className="mt-8 flex flex-wrap gap-4">
  <a
    href="/mistakes/study"
    className="rounded-full border border-white/20 bg-white/15 px-6 py-3 font-semibold text-white shadow-xl backdrop-blur-3xl transition hover:scale-105 hover:bg-white/25"
  >
    开始错题训练
  </a>

  <a
    href="/"
    className="rounded-full border border-white/20 bg-black/20 px-6 py-3 font-semibold text-white shadow-xl backdrop-blur-3xl transition hover:scale-105 hover:bg-white/10"
  >
    返回首页
  </a>
</div>

          <p className="mt-3 max-w-2xl text-slate-400">
            自动收集你选择“忘记”或“困难”的单词。后面我们会把这里接入专项复习。
          </p>
        </div>

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
              href={`/study/${selectedDeck.level}`}
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white shadow-xl backdrop-blur-3xl transition hover:bg-white/20"
            >
              返回学习
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
                      <p className="mt-1 text-sm text-slate-300">{word.exampleZh}</p>
                    </div>

                    <p className="mt-4 text-sm text-slate-400">
                      已复习 {progress.reviewCount} 次
                    </p>
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