"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LevelId = "a1" | "a2" | "b1";

type LevelStats = {
  totalReview: number;
  todayReview: number;
  learned: number;
  mastered: number;
  mistakes: number;
  due: number;
};

type LevelItem = {
  id: LevelId;
  label: string;
  title: string;
  description: string;
};

const levels: LevelItem[] = [
  {
    id: "a1",
    label: "A1",
    title: "DELE A1 基础词汇",
    description: "适合入门阶段，建立最常用的西语基础词汇。",
  },
  {
    id: "a2",
    label: "A2",
    title: "DELE A2 初级词汇",
    description: "扩展日常表达，适合完成 A1 后继续学习。",
  },
  {
    id: "b1",
    label: "B1",
    title: "DELE B1 中级词汇",
    description: "提升阅读和表达能力，进入更完整的语境学习。",
  },
];

const emptyStats: LevelStats = {
  totalReview: 0,
  todayReview: 0,
  learned: 0,
  mastered: 0,
  mistakes: 0,
  due: 0,
};

const defaultStats: Record<LevelId, LevelStats> = {
  a1: {
    totalReview: 15,
    todayReview: 2,
    learned: 4,
    mastered: 3,
    mistakes: 3,
    due: 1,
  },
  a2: emptyStats,
  b1: emptyStats,
};

function readNumber(key: string, fallback: number) {
  if (typeof window === "undefined") return fallback;

  const value = window.localStorage.getItem(key);
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export default function StudyPage() {
  const [stats, setStats] = useState<Record<LevelId, LevelStats>>(defaultStats);

  useEffect(() => {
    const nextStats: Record<LevelId, LevelStats> = {
      a1: {
        totalReview: readNumber("a1-total-review", defaultStats.a1.totalReview),
        todayReview: readNumber("a1-today-review", defaultStats.a1.todayReview),
        learned: readNumber("a1-learned", defaultStats.a1.learned),
        mastered: readNumber("a1-mastered", defaultStats.a1.mastered),
        mistakes: readNumber("a1-mistakes", defaultStats.a1.mistakes),
        due: readNumber("a1-due", defaultStats.a1.due),
      },
      a2: {
        totalReview: readNumber("a2-total-review", 0),
        todayReview: readNumber("a2-today-review", 0),
        learned: readNumber("a2-learned", 0),
        mastered: readNumber("a2-mastered", 0),
        mistakes: readNumber("a2-mistakes", 0),
        due: readNumber("a2-due", 0),
      },
      b1: {
        totalReview: readNumber("b1-total-review", 0),
        todayReview: readNumber("b1-today-review", 0),
        learned: readNumber("b1-learned", 0),
        mastered: readNumber("b1-mastered", 0),
        mistakes: readNumber("b1-mistakes", 0),
        due: readNumber("b1-due", 0),
      },
    };

    setStats(nextStats);
  }, []);

  function clearLevel(levelId: LevelId) {
    const keys = [
      `${levelId}-total-review`,
      `${levelId}-today-review`,
      `${levelId}-learned`,
      `${levelId}-mastered`,
      `${levelId}-mistakes`,
      `${levelId}-due`,
    ];

    keys.forEach((key) => window.localStorage.removeItem(key));

    setStats((current) => ({
      ...current,
      [levelId]: emptyStats,
    }));
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
          <Link href="/mistakes" className="nav-link">
            错题本
          </Link>
        </div>
      </nav>

      <section className="level-hero glass-card">
        <p className="eyebrow">Vocabulary Levels</p>
        <h1 className="section-title">选择你的西语词汇阶段</h1>
        <p className="section-desc">
          从 A1 基础词汇开始，用卡片学习、错题复习和轻量统计，
          稳定积累你的西语词汇量。
        </p>
      </section>

      <section className="level-page-grid">
        {levels.map((level) => {
          const itemStats = stats[level.id];

          return (
            <article key={level.id} className="level-panel glass-card">
              <div className="level-panel-top">
                <div>
                  <p className="level-kicker">{level.label}</p>
                  <h2>{level.title}</h2>
                </div>

                <div className="level-badge">{level.label}</div>
              </div>

              <p className="level-description">{level.description}</p>

              <div className="level-stat-grid">
                <div>
                  <strong>{itemStats.totalReview}</strong>
                  <span>总复习</span>
                </div>
                <div>
                  <strong>{itemStats.todayReview}</strong>
                  <span>今日复习</span>
                </div>
                <div>
                  <strong>{itemStats.learned}</strong>
                  <span>已学习</span>
                </div>
                <div>
                  <strong>{itemStats.mastered}</strong>
                  <span>已掌握</span>
                </div>
                <div>
                  <strong>{itemStats.mistakes}</strong>
                  <span>错题</span>
                </div>
                <div>
                  <strong>{itemStats.due}</strong>
                  <span>到期复习</span>
                </div>
              </div>

              <div className="level-actions">
                <Link href={`/study/${level.id}`} className="primary-button">
                  去学习
                </Link>

                <button type="button" onClick={() => clearLevel(level.id)}>
                  清空
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}