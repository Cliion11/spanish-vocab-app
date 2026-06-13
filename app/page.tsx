"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [streak, setStreak] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(20);

  useEffect(() => {
    const storedStreak = Number(window.localStorage.getItem("study-streak"));
    const storedDailyGoal = Number(window.localStorage.getItem("daily-goal"));

    setStreak(Number.isFinite(storedStreak) ? storedStreak : 0);
    setDailyGoal(Number.isFinite(storedDailyGoal) ? storedDailyGoal : 20);
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
          <p className="eyebrow">Monet Glass Learning</p>

          <h1 className="home-title">
            用更轻的方式，
            <br />
            记住西语单词。
          </h1>

          <p className="home-subtitle">
            每天几分钟，用 DELE 分级词库、发音播放、错题本和轻量复习，
            慢慢建立你的西班牙语词汇量。
          </p>

          <div className="home-actions">
            <Link href="/study" className="primary-button">
              开始今日学习
            </Link>

            <Link href="/mistakes" className="glass-button">
              查看错题本
            </Link>
          </div>

          <div className="home-mini-grid">
            <div className="home-mini-item">
              <strong>A1-B1</strong>
              <span>DELE 分级词库</span>
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