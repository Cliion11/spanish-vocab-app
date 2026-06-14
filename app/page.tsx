"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function getTodayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Home() {
  const [streak, setStreak] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(20);
  const [isCompletedToday, setIsCompletedToday] = useState(false);

  useEffect(() => {
    const storedStreak = Number(window.localStorage.getItem("study-streak"));
    const storedDailyGoal = Number(window.localStorage.getItem("daily-goal"));
    const lastStudyDate = window.localStorage.getItem("last-study-date");

    setStreak(Number.isFinite(storedStreak) ? storedStreak : 0);
    setDailyGoal(Number.isFinite(storedDailyGoal) ? storedDailyGoal : 20);
    setIsCompletedToday(lastStudyDate === getTodayKey());
  }, []);

  return (
    <main className="page-shell home-shell">
      <nav className="top-nav">
        <Link href="/" className="logo">
          <span className="logo-mark">E</span>
          <span>Spanish Vocab</span>
        </Link>

        <div className="nav-links">
          <Link href="/study" className="nav-link">
            开始学习
          </Link>

          <Link href="/mistakes" className="nav-link">
            错题本
          </Link>

          <Link href="/review" className="nav-link">
            错题复习
          </Link>

          <Link href="/settings" className="nav-link">
            设置
          </Link>
        </div>
      </nav>

      <section className="home-center">
        <div className="glass-card home-card">
          <p className="eyebrow">
            {isCompletedToday ? "Today Completed" : "Monet Glass Learning"}
          </p>

          <h1 className="home-title">轻·西语</h1>

<p className="home-subtitle">
  用更轻的方式，记住西语单词。每天几分钟，用 DELE
  分级词库、发音播放、错题本和轻量复习，慢慢建立你的西班牙语词库。
</p>

          <div className="home-actions">
            <Link href="/study" className="primary-button">
              {isCompletedToday ? "继续学习其他等级" : "开始今日学习"}
            </Link>

            <Link href="/mistakes" className="glass-button">
              查看错题本
            </Link>
          </div>

          <div className="home-mini-grid">
            <div className="home-mini-item">
              <strong>{isCompletedToday ? "✓" : "未完成"}</strong>
              <span>今日状态</span>
            </div>

            <div className="home-mini-item">
              <strong>{dailyGoal}</strong>
              <span>今日目标单词</span>
            </div>

            <div className="home-mini-item">
              <strong>{streak}</strong>
              <span>连续学习天数</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}