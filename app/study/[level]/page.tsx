"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  levelNames,
  wordBank,
  type LevelId,
  type WordItem,
} from "../../../lib/words";



type MistakeItem = WordItem & {
  id: string;
  level: LevelId;
  count: number;
  createdAt: string;
  updatedAt: string;
};

type SessionResult = {
  known: number;
  unclear: number;
  unknown: number;
};


function isLevelId(value: unknown): value is LevelId {
  return value === "a1" || value === "a2" || value === "b1" || value === "b2" || value === "c1";
}

function readNumber(key: string) {
  if (typeof window === "undefined") return 0;

  const value = window.localStorage.getItem(key);
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function writeNumber(key: string, value: number) {
  window.localStorage.setItem(key, String(value));
}
function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getYesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return getDateKey(date);
}

function recordStudyStreak() {
  if (typeof window === "undefined") return;

  const today = getDateKey();
  const yesterday = getYesterdayKey();

  const lastStudyDate = window.localStorage.getItem("last-study-date");
  const currentStreak = readNumber("study-streak");

  if (lastStudyDate === today) {
    return;
  }

  if (lastStudyDate === yesterday) {
    writeNumber("study-streak", currentStreak + 1);
  } else {
    writeNumber("study-streak", 1);
  }

  window.localStorage.setItem("last-study-date", today);
}
function readDailyGoal(totalWords: number) {
  if (typeof window === "undefined") {
    return Math.min(20, totalWords);
  }

  const value = Number(window.localStorage.getItem("daily-goal"));

  const dailyGoal =
    Number.isFinite(value) && value > 0 ? value : 20;

  return Math.min(dailyGoal, totalWords);
}
function getTodayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createSeed(text: string) {
  let hash = 0;

  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash) || 1;
}

function createSeededRandom(seed: number) {
  let value = seed;

  return function random() {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function getDailyWords(
  level: LevelId,
  allWords: WordItem[],
  dailyGoal: number
) {
  const safeDailyGoal = Math.min(dailyGoal, allWords.length);
  const todayKey = getTodayKey();
  const seed = createSeed(
    `${level}-${todayKey}-${safeDailyGoal}-${allWords.length}`
  );
  const random = createSeededRandom(seed);

  return allWords
    .map((word) => ({
      word,
      order: random(),
    }))
    .sort((a, b) => a.order - b.order)
    .slice(0, safeDailyGoal)
    .map((item) => item.word);
}

function speakSpanish(text: string) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  const storedRate = Number(window.localStorage.getItem("speech-rate"));

  utterance.lang = "es-ES";
  utterance.rate =
    Number.isFinite(storedRate) && storedRate >= 0.6 && storedRate <= 1.2
      ? storedRate
      : 0.82;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const spanishVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith("es")
  );

  if (spanishVoice) {
    utterance.voice = spanishVoice;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function readMistakes(): MistakeItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem("mistakes");
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addMistake(level: LevelId, word: WordItem) {
  const mistakes = readMistakes();

  const existingIndex = mistakes.findIndex(
    (item) => item.level === level && item.word === word.word
  );

  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    mistakes[existingIndex] = {
      ...mistakes[existingIndex],
      count: mistakes[existingIndex].count + 1,
      updatedAt: now,
    };
  } else {
    mistakes.push({
      ...word,
      id: `${level}-${word.word}`,
      level,
      count: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  window.localStorage.setItem("mistakes", JSON.stringify(mistakes));
}

export default function StudyLevelPage() {
  const params = useParams();
  const rawLevel = params.level;
  const level = Array.isArray(rawLevel) ? rawLevel[0] : rawLevel;

  const safeLevel: LevelId = isLevelId(level) ? level : "a1";
const allWords = useMemo(() => wordBank[safeLevel], [safeLevel]);
const [dailyGoal, setDailyGoal] = useState(20);

useEffect(() => {
  setDailyGoal(readDailyGoal(allWords.length));
}, [allWords.length]);

const words = useMemo(() => {
  return getDailyWords(safeLevel, allWords, dailyGoal);
}, [safeLevel, allWords, dailyGoal]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastFeedback, setLastFeedback] = useState("");
  const [showCheckInCard, setShowCheckInCard] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionResult, setSessionResult] = useState<SessionResult>({
    known: 0,
    unclear: 0,
    unknown: 0,
  });

  const currentWord = words[index];
  const progress = isCompleted
    ? 100
    : Math.round(((index + 1) / words.length) * 100);

  useEffect(() => {
    if (isCompleted) return;

    const autoSpeak = window.localStorage.getItem("auto-speak");

    if (autoSpeak === "false") {
      return;
    }

    const timer = window.setTimeout(() => {
      speakSpanish(currentWord.word);
    }, 450);

    return () => {
      window.clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [currentWord.word, isCompleted]);
  useEffect(() => {
  function handleShortcut(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    const tagName = target?.tagName?.toLowerCase();

    if (tagName === "input" || tagName === "textarea" || tagName === "select") {
      return;
    }

    if (isCompleted) {
      return;
    }

    const key = event.key.toLowerCase();

    if (key === "r") {
      event.preventDefault();
      speakSpanish(currentWord.word);
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();

      if (!showAnswer) {
        setShowAnswer(true);
      }

      return;
    }

    if (!showAnswer) {
      return;
    }

    if (key === "1") {
      event.preventDefault();
      handleAnswer("unknown");
      return;
    }

    if (key === "2") {
      event.preventDefault();
      handleAnswer("unclear");
      return;
    }

    if (key === "3") {
      event.preventDefault();
      handleAnswer("known");
    }
  }

  window.addEventListener("keydown", handleShortcut);

  return () => {
    window.removeEventListener("keydown", handleShortcut);
  };
}, [currentWord.word, showAnswer, isCompleted]);

  function handleAnswer(result: "known" | "unclear" | "unknown") {
    const totalReviewKey = `${safeLevel}-total-review`;
    const todayReviewKey = `${safeLevel}-today-review`;
    const learnedKey = `${safeLevel}-learned`;
    const masteredKey = `${safeLevel}-mastered`;
    const mistakesKey = `${safeLevel}-mistakes`;
    const dueKey = `${safeLevel}-due`;

    writeNumber(totalReviewKey, readNumber(totalReviewKey) + 1);
    writeNumber(todayReviewKey, readNumber(todayReviewKey) + 1);
    writeNumber(learnedKey, Math.max(readNumber(learnedKey), index + 1));

    if (result === "known") {
      writeNumber(masteredKey, readNumber(masteredKey) + 1);
      setSessionResult((current) => ({
        ...current,
        known: current.known + 1,
      }));
      setLastFeedback("¡Bien! 已记录为掌握");
    }

    if (result === "unclear") {
      writeNumber(dueKey, readNumber(dueKey) + 1);
      setSessionResult((current) => ({
        ...current,
        unclear: current.unclear + 1,
      }));
      setLastFeedback("已加入稍后复习");
    }

    if (result === "unknown") {
      writeNumber(mistakesKey, readNumber(mistakesKey) + 1);
      writeNumber(dueKey, readNumber(dueKey) + 1);
      addMistake(safeLevel, currentWord);
      setSessionResult((current) => ({
        ...current,
        unknown: current.unknown + 1,
      }));
      setLastFeedback("已加入错题本");
    }

    if (index + 1 >= words.length) {
  recordStudyStreak();
  setIsCompleted(true);
  setShowAnswer(false);
  return;
}

    setIndex(index + 1);
    setShowAnswer(false);
  }

  function restartSession() {
    setIndex(0);
    setShowAnswer(false);
    setLastFeedback("");
    setIsCompleted(false);
    setSessionResult({
      known: 0,
      unclear: 0,
      unknown: 0,
    });
  }
function openCheckInCard() {
  setShowCheckInCard(true);
}

function closeCheckInCard() {
  setShowCheckInCard(false);
}

function getTodayLabel() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

  return (
    <main className="page-shell">
      <nav className="top-nav">
        <Link href="/" className="logo">
          <span className="logo-mark">西</span>
          <span>Spanish Vocab</span>
        </Link>

        <div className="nav-links">
          <Link href="/study" className="nav-link">
            返回等级
          </Link>
          <Link href="/mistakes" className="nav-link">
            错题本
          </Link>
        </div>
      </nav>

      <section className="study-session">
        <div className="study-header glass-card">
          <div>
            <p className="eyebrow">Study Session</p>
            <h1>{levelNames[safeLevel]}</h1>
<p className="daily-session-note">今日随机学习 {words.length} 个词</p>
          </div>

          <div className="study-count">
            {isCompleted ? words.length : index + 1}
            <span>/ {words.length}</span>
          </div>
        </div>

        <div className="progress-shell">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {isCompleted ? (
          <article className="complete-card glass-card">
            <div className="complete-icon">✓</div>

            <p className="eyebrow">Session Complete</p>

            <h2>这一轮完成了</h2>

            <p className="complete-desc">
              你已经完成 {levelNames[safeLevel]} 的本轮学习。建议先复习错题，
              再开始下一轮。
            </p>

            <div className="complete-stats">
              <div>
                <strong>{sessionResult.known}</strong>
                <span>认识</span>
              </div>
              <div>
                <strong>{sessionResult.unclear}</strong>
                <span>模糊</span>
              </div>
              <div>
                <strong>{sessionResult.unknown}</strong>
                <span>不认识</span>
              </div>
            </div>

            <div className="complete-actions">
  <button
  type="button"
  className="primary-button checkin-button"
  onClick={openCheckInCard}
>
  打卡
</button>

  <button type="button" onClick={restartSession}>
    再学一轮
  </button>

  <Link href="/review" className="glass-button">
    复习错题
  </Link>

  <Link href="/study" className="glass-button">
    返回等级
  </Link>
</div>

{lastFeedback && <p className="study-feedback">{lastFeedback}</p>}
          </article>
        ) : (
          <article className="word-card study-word-card">
  <div className="word-display">
  <p className="word-meta">{currentWord.type}</p>

  <h2 className="word">{currentWord.word}</h2>

  <button
    type="button"
    className="audio-under-button"
    aria-label={`播放 ${currentWord.word} 的发音`}
    onClick={() => speakSpanish(currentWord.word)}
  >
   🎵
  </button>
</div>

  {!showAnswer ? (
              <>
                <p className="study-hint">
  先在心里回忆它的意思，再显示答案。
</p>

<p className="shortcut-hint">空格显示答案 · R 播放发音</p>

                <div className="study-actions study-actions-main">
  <button
    type="button"
    className="primary-button"
    onClick={() => setShowAnswer(true)}
  >
    显示答案
  </button>
</div>
              </>
            ) : (
              <>
                <div className="meaning">{currentWord.meaning}</div>

                <p className="example">{currentWord.example}</p>
                <p className="translation">{currentWord.translation}</p>
                <p className="shortcut-hint">1 认识 · 2 模糊 · 3 不认识 · R 播放发音</p>

              <div className="study-actions">
  <button
    type="button"
    className="primary-button"
    onClick={() => handleAnswer("known")}
  >
    认识
  </button>

  <button type="button" onClick={() => handleAnswer("unclear")}>
    模糊
  </button>

  <button type="button" onClick={() => handleAnswer("unknown")}>
    不认识
  </button>
</div>
              </>
            )}

            {lastFeedback && <p className="study-feedback">{lastFeedback}</p>}
          </article>
        )}
      </section>
      {showCheckInCard && (
      <div className="checkin-overlay" onClick={closeCheckInCard}>
        <div
          className="checkin-card"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="checkin-card-top">
            <p className="checkin-date">{getTodayLabel()}</p>
          </div>

          <h2 className="checkin-brand">EWords</h2>

          <div className="checkin-info">
            <div className="checkin-info-row">
              <span className="checkin-info-label">Today</span>
              <span className="checkin-info-value">{words.length} words</span>
            </div>
            <div className="checkin-info-row">
              <span className="checkin-info-label">Streak</span>
              <span className="checkin-info-value">
                {readNumber("study-streak")} days
              </span>
            </div>

            <div className="checkin-info-row">
              <span className="checkin-info-label">Level</span>
              <span className="checkin-info-value">
                {levelNames[safeLevel]}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="checkin-continue-button"
            onClick={closeCheckInCard}
              >
            <span className="checkin-continue-icon">↗</span>
            <span>Continue</span>
          </button>
        </div>
      </div>
    )}
    </main>
  );
}