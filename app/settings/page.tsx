"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SettingsState = {
  dailyGoal: number;
  autoSpeak: boolean;
  speechRate: number;
};

const defaultSettings: SettingsState = {
  dailyGoal: 20,
  autoSpeak: true,
  speechRate: 0.82,
};

const levels = ["a1", "a2", "b1"];
const statKeys = [
  "total-review",
  "today-review",
  "learned",
  "mastered",
  "mistakes",
  "due",
];

function readBoolean(value: string | null, fallback: boolean) {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function readNumber(value: string | null, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedDailyGoal = readNumber(
      window.localStorage.getItem("daily-goal"),
      defaultSettings.dailyGoal
    );

    const storedAutoSpeak = readBoolean(
      window.localStorage.getItem("auto-speak"),
      defaultSettings.autoSpeak
    );

    const storedSpeechRate = readNumber(
      window.localStorage.getItem("speech-rate"),
      defaultSettings.speechRate
    );

    setSettings({
      dailyGoal: storedDailyGoal,
      autoSpeak: storedAutoSpeak,
      speechRate: storedSpeechRate,
    });
  }, []);

  function updateSetting<Key extends keyof SettingsState>(
    key: Key,
    value: SettingsState[Key]
  ) {
    const nextSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(nextSettings);

    if (key === "dailyGoal") {
      window.localStorage.setItem("daily-goal", String(value));
    }

    if (key === "autoSpeak") {
      window.localStorage.setItem("auto-speak", String(value));
    }

    if (key === "speechRate") {
      window.localStorage.setItem("speech-rate", String(value));
    }

    setMessage("设置已保存");
  }

  function clearMistakes() {
    const confirmed = window.confirm("确定要清空错题本吗？");

    if (!confirmed) return;

    window.localStorage.removeItem("mistakes");
    setMessage("错题本已清空");
  }

  function clearStats() {
    const confirmed = window.confirm("确定要清空所有学习统计吗？错题本不会被清空。");

    if (!confirmed) return;

    levels.forEach((level) => {
      statKeys.forEach((key) => {
        window.localStorage.removeItem(`${level}-${key}`);
      });
    });

    setMessage("学习统计已清空");
  }

  function resetAll() {
    const confirmed = window.confirm(
      "确定要重置所有本地数据吗？这会清空错题本、学习统计和设置。"
    );

    if (!confirmed) return;

    window.localStorage.removeItem("mistakes");

    levels.forEach((level) => {
      statKeys.forEach((key) => {
        window.localStorage.removeItem(`${level}-${key}`);
      });
    });

    window.localStorage.removeItem("daily-goal");
    window.localStorage.removeItem("auto-speak");
    window.localStorage.removeItem("speech-rate");

    setSettings(defaultSettings);
    setMessage("所有本地数据已重置");
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
          <Link href="/mistakes" className="nav-link">
            错题本
          </Link>
        </div>
      </nav>

      <section className="settings-hero glass-card">
        <p className="eyebrow">Preferences</p>
        <h1 className="section-title">学习设置</h1>
        <p className="section-desc">
          调整每日学习目标、发音播放和本地学习数据。当前数据保存在浏览器本地。
        </p>
      </section>

      <section className="settings-grid">
        <article className="settings-panel glass-card">
          <h2>学习偏好</h2>

          <div className="setting-row">
            <div>
              <strong>每日目标</strong>
              <span>建议保持轻量，避免一开始目标过高。</span>
            </div>

            <select
              value={settings.dailyGoal}
              onChange={(event) =>
                updateSetting("dailyGoal", Number(event.target.value))
              }
            >
              <option value={10}>10 个单词</option>
              <option value={20}>20 个单词</option>
              <option value={30}>30 个单词</option>
              <option value={50}>50 个单词</option>
            </select>
          </div>

          <div className="setting-row">
            <div>
              <strong>自动播放发音</strong>
              <span>进入新单词时自动播放一次西语发音。</span>
            </div>

            <button
              type="button"
              className={settings.autoSpeak ? "toggle is-on" : "toggle"}
              onClick={() => updateSetting("autoSpeak", !settings.autoSpeak)}
            >
              {settings.autoSpeak ? "已开启" : "已关闭"}
            </button>
          </div>

          <div className="setting-row setting-row-stack">
            <div>
              <strong>发音语速</strong>
              <span>当前语速：{settings.speechRate.toFixed(2)}x</span>
            </div>

            <input
              type="range"
              min="0.6"
              max="1.2"
              step="0.02"
              value={settings.speechRate}
              onChange={(event) =>
                updateSetting("speechRate", Number(event.target.value))
              }
            />
          </div>
        </article>

        <article className="settings-panel glass-card">
          <h2>数据管理</h2>

          <p className="settings-note">
            这些数据目前保存在浏览器 localStorage 中。换浏览器或清理浏览器数据后，
            学习记录可能会丢失。
          </p>

          <div className="settings-actions">
            <button type="button" onClick={clearMistakes}>
              清空错题本
            </button>

            <button type="button" onClick={clearStats}>
              清空学习统计
            </button>

            <button type="button" className="danger-button" onClick={resetAll}>
              重置全部数据
            </button>
          </div>

          {message && <p className="settings-message">{message}</p>}
        </article>
      </section>
    </main>
  );
}