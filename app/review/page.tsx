"use client";

import { speakSpanish } from "@/lib/speech";
import Link from "next/link";
import { useEffect, useState } from "react";

type LevelId = "a1" | "a2" | "b1" | "b2" | "c1";

type MistakeItem = {
  id: string;
  level: LevelId;
  word: string;
  meaning: string;
  type: string;
  example: string;
  translation: string;
  count: number;
  createdAt: string;
  updatedAt: string;
};

const levelNames: Record<LevelId, string> = {
  a1: "A1 基础词汇",
  a2: "A2 初级词汇",
  b1: "B1 中级词汇",
  b2: "B2 高阶词汇",
  c1: "C1 高级词汇",
};

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

function saveMistakes(mistakes: MistakeItem[]) {
  window.localStorage.setItem("mistakes", JSON.stringify(mistakes));
}

export default function ReviewPage() {
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const storedMistakes = readMistakes();
    setMistakes(storedMistakes);
  }, []);

  const currentWord = mistakes[index];
  const total = mistakes.length;
  const progress =
    total === 0 || isCompleted ? 100 : Math.round(((index + 1) / total) * 100);

  function goNext(nextMistakes: MistakeItem[]) {
    saveMistakes(nextMistakes);
    setMistakes(nextMistakes);
    setShowAnswer(false);

    if (nextMistakes.length === 0) {
      setIsCompleted(true);
      setIndex(0);
      return;
    }

    if (index >= nextMistakes.length - 1) {
      setIsCompleted(true);
      setIndex(0);
      return;
    }

    setIndex(index + 1);
  }

  function handleKnown() {
    const nextMistakes = mistakes.filter((item) => item.id !== currentWord.id);
    setFeedback("已从错题本移除");
    goNext(nextMistakes);
  }

  function handleUnclear() {
    setFeedback("已保留在错题本，稍后继续复习");

    if (index >= mistakes.length - 1) {
      setIsCompleted(true);
      setShowAnswer(false);
      return;
    }

    setIndex(index + 1);
    setShowAnswer(false);
  }

  function handleUnknown() {
    const now = new Date().toISOString();

    const nextMistakes = mistakes.map((item) =>
      item.id === currentWord.id
        ? {
            ...item,
            count: item.count + 1,
            updatedAt: now,
          }
        : item
    );

    setFeedback("错误次数已更新");
    goNext(nextMistakes);
  }

  function restartReview() {
    const storedMistakes = readMistakes();
    setMistakes(storedMistakes);
    setIndex(0);
    setShowAnswer(false);
    setIsCompleted(false);
    setFeedback("");
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
            返回学习
          </Link>
          <Link href="/mistakes" className="nav-link">
            错题本
          </Link>
        </div>
      </nav>

      <section className="study-session">
        <div className="study-header glass-card">
          <div>
            <p className="eyebrow">Mistake Review</p>
            <h1>错题复习</h1>
          </div>

          <div className="study-count">
            {total === 0 ? 0 : isCompleted ? total : index + 1}
            <span>/ {total}</span>
          </div>
        </div>

        <div className="progress-shell">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {total === 0 ? (
          <article className="empty-state glass-card">
            <div className="empty-icon">✓</div>
            <h2>没有需要复习的错题</h2>
            <p>去学习页选择“不认识”的单词，会自动进入错题本。</p>

            <Link href="/study" className="primary-button">
              去学习
            </Link>
          </article>
        ) : isCompleted ? (
          <article className="complete-card glass-card">
            <div className="complete-icon">✓</div>

            <p className="eyebrow">Review Complete</p>

            <h2>错题复习完成</h2>

            <p className="complete-desc">
              本轮错题复习结束。已经掌握的词会从错题本移除，
              仍然模糊或不认识的词会继续保留。
            </p>

            <div className="complete-actions">
              <button
                type="button"
                className="primary-button"
                onClick={restartReview}
              >
                再复习一轮
              </button>

              <Link href="/mistakes" className="glass-button">
                查看错题本
              </Link>

              <Link href="/study" className="glass-button">
                返回学习
              </Link>
            </div>

            {feedback && <p className="study-feedback">{feedback}</p>}
          </article>
        ) : (
          <article className="word-card study-word-card">
            <div className="word-display">
              <p className="word-meta">
                {levelNames[currentWord.level]} · {currentWord.type}
              </p>

              <h2 className="word">{currentWord.word}</h2>

              <button
                type="button"
                className="audio-under-button"
                aria-label={`播放 ${currentWord.word} 的发音`}
                onClick={() => speakSpanish(currentWord.word)}
              >
                🔊 播放发音
              </button>
            </div>

            {!showAnswer ? (
              <>
                <p className="study-hint">
                  先回忆这个错题的意思，再显示答案。
                </p>

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

                <div className="study-actions">
                  <button type="button" onClick={handleUnknown}>
                    不认识
                  </button>

                  <button type="button" onClick={handleUnclear}>
                    模糊
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleKnown}
                  >
                    认识
                  </button>
                </div>
              </>
            )}

            {feedback && <p className="study-feedback">{feedback}</p>}
          </article>
        )}
      </section>
    </main>
  );
}