"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LevelId = "a1" | "a2" | "b1";

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
};

function readMistakes() {
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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "未知时间";
  }

  return date.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);

  useEffect(() => {
    const storedMistakes = readMistakes();
    setMistakes(storedMistakes);
  }, []);

  function removeMistake(id: string) {
    const nextMistakes = mistakes.filter((item) => item.id !== id);
    setMistakes(nextMistakes);
    saveMistakes(nextMistakes);
  }

  function clearMistakes() {
    const confirmed = window.confirm("确定要清空所有错题吗？");

    if (!confirmed) return;

    setMistakes([]);
    window.localStorage.removeItem("mistakes");
  }

  return (
    <main className="page-shell">
      <nav className="top-nav">
        <Link href="/" className="logo">
          <span className="logo-mark">西</span>
          <span>Spanish Vocab</span>
        </Link>

        <div className="nav-links">
          <Link href="/" className="nav-link">
            首页
          </Link>
          <Link href="/study" className="nav-link">
            继续学习
          </Link>
        </div>
      </nav>

      <section className="mistakes-hero glass-card">
        <div>
          <p className="eyebrow">Mistake Review</p>
          <h1 className="section-title">错题本</h1>
          <p className="section-desc">
            这里会自动收集你在学习时选择“不认识”的单词，
            帮你优先复习真正薄弱的词汇。
          </p>
        </div>

        <div className="mistakes-summary">
          <strong>{mistakes.length}</strong>
          <span>个错题</span>
        </div>
      </section>

      {mistakes.length === 0 ? (
        <section className="empty-state glass-card">
          <div className="empty-icon">✓</div>
          <h2>目前没有错题</h2>
          <p>
            去学习页遇到不认识的单词时，点击“不认识”，它就会自动出现在这里。
          </p>

          <Link href="/study" className="primary-button">
            开始学习
          </Link>
        </section>
      ) : (
        <>
          <div className="mistakes-toolbar">
            <p>
              建议先复习出现次数最多、最近更新的错题。错题不是失败记录，
              它是下一轮记忆的入口。
            </p>

            <button type="button" onClick={clearMistakes}>
              清空错题本
            </button>
          </div>

          <section className="mistake-card-list">
            {mistakes.map((item) => (
              <article key={item.id} className="mistake-card glass-card">
                <div className="mistake-card-main">
                  <div className="mistake-card-top">
                    <div>
                      <p className="level-kicker">
                        {levelNames[item.level]} · {item.type}
                      </p>

                      <h2 className="mistake-word">{item.word}</h2>
                    </div>

                    <div className="mistake-count">
                      <strong>{item.count}</strong>
                      <span>次</span>
                    </div>
                  </div>

                  <div className="mistake-meaning">{item.meaning}</div>

                  <p className="mistake-example">{item.example}</p>
                  <p className="mistake-translation">{item.translation}</p>

                  <div className="mistake-meta">
                    最近加入：{formatDate(item.updatedAt)}
                  </div>
                </div>

                <div className="mistake-card-actions">
                  <Link href={`/study/${item.level}`} className="primary-button">
                    复习这个等级
                  </Link>

                  <button type="button" onClick={() => removeMistake(item.id)}>
                    移除
                  </button>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}