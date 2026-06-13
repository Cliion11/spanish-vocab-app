"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { a1Words } from "@/data/a1Words";
import { a2Words } from "@/data/a2Words";
import { b1Words } from "@/data/b1Words";

type Level = "a1" | "a2" | "b1";

type WordProgress = {
  reviewCount: number;
  lastRating: string;
  inMistakeBook: boolean;
  nextReviewAt: string;
};

type StudyStats = {
  totalReviews: number;
  todayReviews: number;
  todayDate: string;
  studyDates: string[];
  masteredWords: string[];
  words: Record<string, WordProgress>;
};

const reviewButtons = [
  {
    label: "忘记",
    className:
      "bg-rose-100/70 text-rose-950 shadow-rose-100/40 hover:bg-rose-50/80",
  },
  {
    label: "困难",
    className:
      "bg-amber-100/70 text-amber-950 shadow-amber-100/40 hover:bg-amber-50/80",
  },
  {
    label: "良好",
    className:
      "bg-emerald-100/70 text-emerald-950 shadow-emerald-100/40 hover:bg-emerald-50/80",
  },
  {
    label: "简单",
    className:
      "bg-sky-100/70 text-sky-950 shadow-sky-100/40 hover:bg-sky-50/80",
  },
];

const glassButtonBase =
  "relative overflow-hidden rounded-full border border-white/30 px-5 py-3 font-semibold shadow-xl backdrop-blur-3xl transition duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100";

const neutralGlassButton =
  "relative overflow-hidden rounded-full border border-white/20 bg-white/15 px-6 py-3 font-semibold text-white shadow-xl backdrop-blur-3xl transition duration-300 hover:bg-white/25 hover:scale-105";

function getTodayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createDefaultStats(): StudyStats {
  return {
    totalReviews: 0,
    todayReviews: 0,
    todayDate: getTodayKey(),
    studyDates: [],
    masteredWords: [],
    words: {},
  };
}

function getValidLevel(value: unknown): Level {
  if (value === "a1" || value === "a2" || value === "b1") {
    return value;
  }

  return "a1";
}

function getWordsByLevel(level: Level) {
  if (level === "a2") return a2Words;
  if (level === "b1") return b1Words;
  return a1Words;
}

function getNextReviewAt(rating: string): string {
  const nextDate = new Date();

  if (rating === "忘记") {
    nextDate.setMinutes(nextDate.getMinutes() + 5);
  }

  if (rating === "困难") {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  if (rating === "良好") {
    nextDate.setDate(nextDate.getDate() + 3);
  }

  if (rating === "简单") {
    nextDate.setDate(nextDate.getDate() + 7);
  }

  return nextDate.toISOString();
}

function getDefaultProgress(): WordProgress {
  return {
    reviewCount: 0,
    lastRating: "暂无",
    inMistakeBook: false,
    nextReviewAt: "",
  };
}

function normalizeStats(value: unknown): StudyStats {
  const today = getTodayKey();

  if (!value || typeof value !== "object") {
    return createDefaultStats();
  }

  const raw = value as Partial<StudyStats>;
  const normalizedWords: Record<string, WordProgress> = {};

  if (raw.words && typeof raw.words === "object") {
    for (const [wordId, progress] of Object.entries(raw.words)) {
      normalizedWords[wordId] = {
        reviewCount: progress.reviewCount ?? 0,
        lastRating: progress.lastRating ?? "暂无",
        inMistakeBook: progress.inMistakeBook ?? false,
        nextReviewAt: progress.nextReviewAt ?? "",
      };
    }
  }

  return {
    totalReviews: raw.totalReviews ?? 0,
    todayReviews: raw.todayDate === today ? raw.todayReviews ?? 0 : 0,
    todayDate: today,
    studyDates: raw.studyDates ?? [],
    masteredWords: raw.masteredWords ?? [],
    words: normalizedWords,
  };
}

function isDue(nextReviewAt: string) {
  if (!nextReviewAt) {
    return true;
  }

  const nextTime = new Date(nextReviewAt).getTime();

  if (Number.isNaN(nextTime)) {
    return true;
  }

  return nextTime <= Date.now();
}

function formatNextReviewTime(nextReviewAt: string) {
  if (!nextReviewAt) {
    return "暂无";
  }

  return new Date(nextReviewAt).toLocaleString();
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

export default function StudyPage() {
  const params = useParams();
  const levelParam = Array.isArray(params.level)
    ? params.level[0]
    : params.level;

  const level = getValidLevel(levelParam);
  const words = getWordsByLevel(level);
  const storageKey = `spanish-vocab-${level}-progress`;

  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [message, setMessage] = useState("");
  const [autoNext, setAutoNext] = useState(false);
  const [lockedWordId, setLockedWordId] = useState<string | null>(null);
  const [reviewedWordId, setReviewedWordId] = useState<string | null>(null);
  const [stats, setStats] = useState<StudyStats>(createDefaultStats);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);

    if (!saved) {
      setStats(createDefaultStats());
      setIndex(0);
      return;
    }

    try {
      setStats(normalizeStats(JSON.parse(saved)));
      setIndex(0);
    } catch {
      setStats(createDefaultStats());
      setIndex(0);
    }
  }, [storageKey]);

  const dueWords = useMemo(() => {
    return words.filter((item) => {
      const progress = stats.words[item.id];

      if (!progress) {
        return true;
      }

      return isDue(progress.nextReviewAt);
    });
  }, [words, stats.words]);

  const lockedWord = lockedWordId
    ? words.find((item) => item.id === lockedWordId)
    : undefined;

  const word = lockedWord ?? dueWords[index % dueWords.length];

  const mistakeCount = Object.values(stats.words).filter(
    (progress) => progress.inMistakeBook,
  ).length;

  const streak = getStudyStreak(stats.studyDates);
  const hasReviewedCurrentWord = reviewedWordId === word?.id;

  function saveStats(nextStats: StudyStats) {
    setStats(nextStats);
    window.localStorage.setItem(storageKey, JSON.stringify(nextStats));
  }

  function nextWord() {
    const wasLocked = lockedWordId !== null;

    setShowAnswer(false);
    setMessage("");
    setLockedWordId(null);
    setReviewedWordId(null);

    if (dueWords.length === 0) {
      return;
    }

    setIndex((currentIndex) =>
      wasLocked
        ? currentIndex % dueWords.length
        : (currentIndex + 1) % dueWords.length,
    );
  }

  if (!word) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-white">
        <section className="max-w-xl rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            DELE {level.toUpperCase()}
          </p>

          <h1 className="mt-4 text-3xl font-bold">今日复习已完成 🎉</h1>

          <p className="mt-4 text-slate-300">
            当前没有到期需要复习的单词。你可以稍后回来，或者切换到其他词书继续学习。
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-3xl">
            <p className="text-sm text-slate-400">连续学习</p>
            <p className="mt-2 text-3xl font-bold">{streak} 天</p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/" className={neutralGlassButton}>
              返回首页
            </a>

            <a href="/mistakes" className={neutralGlassButton}>
              查看错题本
            </a>
          </div>
        </section>
      </main>
    );
  }

  const currentProgress = stats.words[word.id] ?? getDefaultProgress();

  function speak() {
    if (!("speechSynthesis" in window)) {
      alert("当前浏览器不支持语音朗读。");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = "es-ES";
    utterance.rate = 0.85;

    window.speechSynthesis.speak(utterance);
  }

  function review(rating: string) {
    if (hasReviewedCurrentWord) {
      return;
    }

    const today = getTodayKey();
    const shouldAddToMistakeBook = rating === "忘记" || rating === "困难";
    const shouldMaster = rating === "良好" || rating === "简单";

    const previousProgress = stats.words[word.id] ?? getDefaultProgress();

    const nextMasteredWords = shouldMaster
      ? Array.from(new Set([...stats.masteredWords, word.id]))
      : stats.masteredWords;

    const nextStudyDates = Array.from(new Set([...stats.studyDates, today]));

    const nextStats: StudyStats = {
      totalReviews: stats.totalReviews + 1,
      todayReviews: stats.todayDate === today ? stats.todayReviews + 1 : 1,
      todayDate: today,
      studyDates: nextStudyDates,
      masteredWords: nextMasteredWords,
      words: {
        ...stats.words,
        [word.id]: {
          reviewCount: previousProgress.reviewCount + 1,
          lastRating: rating,
          inMistakeBook:
            previousProgress.inMistakeBook || shouldAddToMistakeBook,
          nextReviewAt: getNextReviewAt(rating),
        },
      },
    };

    setLockedWordId(word.id);
    setReviewedWordId(word.id);
    saveStats(nextStats);
    setMessage(`你选择了：${rating}`);

    if (autoNext) {
      window.setTimeout(() => {
        setShowAnswer(false);
        setMessage("");
        setLockedWordId(null);
        setReviewedWordId(null);
      }, 500);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto flex max-w-3xl flex-col gap-8">
        <div>
          <a href="/" className="text-sm text-emerald-300 hover:text-emerald-200">
            ← 返回首页
          </a>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            DELE {level.toUpperCase()}
          </p>

          <h1 className="mt-3 text-3xl font-bold">今日学习</h1>

          <p className="mt-2 text-slate-400">
            当前到期 {dueWords.length} 个 / 总计 {words.length} 个
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-3xl">
              <p className="text-xs text-slate-300">今日学习</p>
              <p className="mt-2 text-2xl font-bold">{stats.todayReviews}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-3xl">
              <p className="text-xs text-slate-300">总复习</p>
              <p className="mt-2 text-2xl font-bold">{stats.totalReviews}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-3xl">
              <p className="text-xs text-slate-300">已掌握</p>
              <p className="mt-2 text-2xl font-bold">
                {stats.masteredWords.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-3xl">
              <p className="text-xs text-slate-300">错题数</p>
              <p className="mt-2 text-2xl font-bold">{mistakeCount}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-3xl">
              <p className="text-xs text-slate-300">连续学习</p>
              <p className="mt-2 text-2xl font-bold">{streak} 天</p>
            </div>
          </div>

          <label className="mt-5 inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-slate-100 shadow-xl backdrop-blur-3xl transition hover:bg-white/15">
            <input
              type="checkbox"
              checked={autoNext}
              onChange={(event) => setAutoNext(event.target.checked)}
              className="h-4 w-4 accent-white"
            />
            选择后自动跳下一个单词
          </label>
        </div>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">西班牙语单词</p>

              <h2 className="mt-3 text-6xl font-bold tracking-tight">
                {word.word}
              </h2>
            </div>

            <button onClick={speak} className={neutralGlassButton}>
              播放发音
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-3xl">
              <p className="text-xs text-slate-400">本词复习次数</p>
              <p className="mt-2 text-xl font-bold">
                {currentProgress.reviewCount}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-3xl">
              <p className="text-xs text-slate-400">上次选择</p>
              <p className="mt-2 text-xl font-bold">
                {currentProgress.lastRating}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-3xl">
              <p className="text-xs text-slate-400">错题本</p>
              <p className="mt-2 text-xl font-bold">
                {currentProgress.inMistakeBook ? "已加入" : "未加入"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-3xl">
              <p className="text-xs text-slate-400">下次复习</p>
              <p className="mt-2 text-sm font-bold">
                {formatNextReviewTime(currentProgress.nextReviewAt)}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-3xl">
            {showAnswer ? (
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-slate-300">中文释义</p>
                  <p className="mt-2 text-2xl font-bold">{word.chinese}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-300">词性</p>
                  <p className="mt-2">
                    {word.pos}
                    {word.gender ? ` · ${word.gender}` : ""}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-300">例句</p>
                  <p className="mt-2 text-lg">{word.exampleEs}</p>
                  <p className="mt-1 text-slate-300">{word.exampleZh}</p>
                </div>
              </div>
            ) : (
              <p className="text-lg text-slate-200">
                先看单词，尝试回忆中文意思。想好后点击“显示答案”。
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            {!showAnswer && (
              <button
                onClick={() => setShowAnswer(true)}
                className={neutralGlassButton}
              >
                显示答案
              </button>
            )}

            {showAnswer &&
              reviewButtons.map((button) => (
                <button
                  key={button.label}
                  disabled={hasReviewedCurrentWord}
                  onClick={() => review(button.label)}
                  className={`${glassButtonBase} ${button.className}`}
                >
                  {button.label}
                </button>
              ))}

            <button onClick={nextWord} className={neutralGlassButton}>
              下一个词
            </button>
          </div>

          {message && (
            <p className="mt-4 font-semibold text-emerald-200">
              {message}
              {!autoNext && "，请点击“下一个词”继续。"}
            </p>
          )}
        </article>
      </section>
    </main>
  );
}