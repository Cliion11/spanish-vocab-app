"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import {
  spanishAlphabet,
  spanishPronunciationRules,
} from "@/data/spanishPronunciation";

function speakSpanish(text: string) {
  if (typeof window === "undefined") return;

  if (!("speechSynthesis" in window)) {
    alert("当前浏览器不支持语音播放。");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 0.82;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

const pronunciationSections = [
  {
    id: "vowels",
    title: "元音",
    description: "西语五个元音非常重要，读法稳定，建议最先熟悉。",
    itemIds: ["a", "e", "i", "o", "u"],
  },
  {
    id: "common-consonants",
    title: "常用辅音",
    description: "大部分日常单词都会反复遇到这些辅音。",
    itemIds: [
      "b",
      "c",
      "d",
      "f",
      "g",
      "h",
      "j",
      "l",
      "m",
      "n",
      "enye",
      "p",
      "q",
      "r",
      "s",
      "t",
      "v",
      "y",
      "z",
    ],
  },
  {
    id: "special-letters",
    title: "外来词与特殊字母",
    description: "这些字母较少见，但在外来词、地名、人名中会遇到。",
    itemIds: ["k", "w", "x"],
  },
];

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "clamp(18px, 4vw, 40px) clamp(14px, 3vw, 24px)",
    background:
      "radial-gradient(circle at 18% 18%, rgba(216, 167, 177, 0.32), transparent 30%), radial-gradient(circle at 82% 12%, rgba(158, 183, 216, 0.34), transparent 34%), radial-gradient(circle at 52% 88%, rgba(184, 203, 184, 0.38), transparent 42%), linear-gradient(135deg, #f8f3ea, #e7eef7)",
    backgroundAttachment: "fixed",
    color: "var(--text-main)",
  },

  shell: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },

  glassPanel: {
    borderRadius: "32px",
    border: "1px solid rgba(255,255,255,0.72)",
    background: "rgba(255,255,255,0.58)",
    boxShadow: "0 18px 50px rgba(70,80,100,0.10)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    padding: "28px",
  },

  backLink: {
    color: "var(--text-soft)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 800,
  },

  kicker: {
    marginTop: "32px",
    fontSize: "13px",
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: "var(--text-light)",
    fontWeight: 850,
  },

  title: {
    margin: "12px 0 0",
    fontSize: "48px",
    lineHeight: 1.05,
    fontWeight: 850,
    letterSpacing: "0.02em",
    color: "var(--text-main)",
  },

  description: {
    marginTop: "16px",
    maxWidth: "760px",
    color: "var(--text-soft)",
    fontSize: "17px",
    lineHeight: 1.7,
  },

  note: {
    marginTop: "18px",
    color: "var(--text-light)",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  buttonRow: {
    marginTop: "24px",
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },

  primaryButton: {
    border: "1px solid rgba(255,255,255,0.78)",
    borderRadius: "999px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(232,238,250,0.66))",
    color: "var(--text-main)",
    padding: "12px 18px",
    fontSize: "15px",
    fontWeight: 850,
    cursor: "pointer",
    boxShadow:
      "0 18px 44px rgba(80,95,130,0.14), inset 0 1px 0 rgba(255,255,255,0.9)",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },

  secondaryButton: {
    border: "1px solid rgba(255,255,255,0.68)",
    borderRadius: "999px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.36))",
    color: "var(--text-main)",
    padding: "12px 18px",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    textDecoration: "none",
    whiteSpace: "nowrap",
    boxShadow:
      "0 12px 30px rgba(70,80,100,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "16px",
    flexWrap: "wrap",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 850,
    letterSpacing: "-0.03em",
    color: "var(--text-main)",
  },

  sectionDescription: {
    marginTop: "8px",
    color: "var(--text-soft)",
    fontSize: "16px",
  },

rowList: {
  marginTop: "18px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
},

rowScroll: {
  width: "100%",
  paddingBottom: "2px",
},

soundRow: {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  display: "grid",
  gridTemplateColumns:
    "clamp(58px, 10vw, 120px) clamp(68px, 12vw, 130px) minmax(0, 1fr) clamp(120px, 26vw, 260px)",
  alignItems: "center",
  gap: "clamp(10px, 2vw, 20px)",
  borderRadius: "28px",
  border: "1px solid rgba(255,255,255,0.72)",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.62), rgba(255,255,255,0.36))",
  boxShadow: "0 16px 42px rgba(70,80,100,0.10)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  padding: "clamp(14px, 2vw, 22px)",
},

label: {
  margin: 0,
  fontSize: "12px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--text-light)",
  fontWeight: 850,
},

letter: {
  margin: "10px 0 0",
  fontSize: "clamp(30px, 5vw, 44px)",
  lineHeight: 1,
  fontWeight: 850,
  color: "var(--text-main)",
},

nameBadge: {
  display: "inline-flex",
  marginTop: "10px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.68)",
  color: "var(--text-main)",
  border: "1px solid rgba(255,255,255,0.72)",
  padding: "7px 12px",
  fontSize: "16px",
  fontWeight: 850,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.86)",
},

soundText: {
  margin: "10px 0 0",
  color: "var(--text-main)",
  fontSize: "clamp(14px, 1.6vw, 16px)",
  lineHeight: 1.7,
  fontWeight: 700,
  overflowWrap: "anywhere",
},

smallText: {
  margin: "8px 0 0",
  color: "var(--text-light)",
  fontSize: "clamp(12px, 1.4vw, 14px)",
  lineHeight: 1.6,
  overflowWrap: "anywhere",
},


exampleBox: {
  minWidth: 0,
  borderRadius: "22px",
  border: "1px solid rgba(255,255,255,0.72)",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.68), rgba(255,255,255,0.34))",
  padding: "clamp(12px, 1.8vw, 16px)",
  overflow: "hidden",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.78)",
},

exampleWord: {
  margin: "10px 0 0",
  color: "var(--text-main)",
  fontSize: "clamp(16px, 2.2vw, 24px)",
  fontWeight: 850,
  overflowWrap: "anywhere",
},

  exampleMeaning: {
    margin: "4px 0 0",
    color: "var(--text-soft)",
    fontSize: "14px",
  },

  miniButtonRow: {
    marginTop: "14px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  rulesGrid: {
    marginTop: "18px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
  },

  ruleCard: {
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,0.72)",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.62), rgba(255,255,255,0.36))",
    boxShadow: "0 16px 42px rgba(70,80,100,0.10)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    padding: "22px",
  },
};

export default function PronunciationPage() {
  return (
    <main style={styles.page}>
      <section style={styles.shell}>
        <header style={styles.glassPanel}>
          <Link href="/" style={styles.backLink}>
            ← 返回首页
          </Link>

          <p style={styles.kicker}>Spanish Pronunciation</p>

          <h1 style={styles.title}>西语发音表</h1>

          <p style={styles.description}>
            每一个音都拆成横向玻璃卡片栏。左边是字母，中间是发音说明，右边是例词和按钮。
          </p>

          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={() =>
                speakSpanish(
                  spanishAlphabet.map((item) => item.audioText).join(", "),
                )
              }
              style={styles.primaryButton}
            >
              连续播放字母名
            </button>

            <Link href="/study" style={styles.secondaryButton}>
              去学习单词
            </Link>
          </div>

          <p style={styles.note}>
            注：发音由浏览器 Web Speech API 提供，不同设备和浏览器的西语音色可能略有差异。
          </p>
        </header>

        {pronunciationSections.map((section) => {
          const items = section.itemIds
            .map((id) => spanishAlphabet.find((item) => item.id === id))
            .filter((item): item is (typeof spanishAlphabet)[number] =>
              Boolean(item),
            );

          return (
            <section key={section.id}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>{section.title}</h2>
                  <p style={styles.sectionDescription}>
                    {section.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    speakSpanish(items.map((item) => item.audioText).join(", "))
                  }
                  style={styles.secondaryButton}
                >
                  播放本组
                </button>
              </div>

              <div style={styles.rowList}>
                {items.map((item) => (
                  <div key={item.id} style={styles.rowScroll}>
                    <article style={styles.soundRow}>
                      <div>
                        <p style={styles.label}>字母</p>
                        <p style={styles.letter}>{item.letter}</p>
                      </div>

                      <div>
                        <p style={styles.label}>字母名</p>
                        <span style={styles.nameBadge}>{item.name}</span>
                      </div>

                      <div>
                        <p style={styles.label}>发音说明</p>
                        <p style={styles.soundText}>{item.sound}</p>
                        <p style={styles.smallText}>{item.note}</p>
                      </div>

                      <div style={styles.exampleBox}>
                        <p style={styles.label}>例词</p>
                        <p style={styles.exampleWord}>{item.example}</p>
                        <p style={styles.exampleMeaning}>
                          {item.exampleMeaning}
                        </p>

                        <div style={styles.miniButtonRow}>
                          <button
                            type="button"
                            onClick={() => speakSpanish(item.audioText)}
                            style={styles.primaryButton}
                          >
                            听字母
                          </button>

                          <button
                            type="button"
                            onClick={() => speakSpanish(item.exampleAudioText)}
                            style={styles.secondaryButton}
                          >
                            听例词
                          </button>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <section>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>常见发音规则</h2>
              <p style={styles.sectionDescription}>
                初学者最容易混淆的规则也用同样材质的卡片展示。
              </p>
            </div>
          </div>

          <div style={styles.rulesGrid}>
            {spanishPronunciationRules.map((rule) => (
              <article key={rule.id} style={styles.ruleCard}>
                <h3 style={{ margin: 0, fontSize: "22px", fontWeight: 950 }}>
                  {rule.title}
                </h3>

                <p style={styles.soundText}>{rule.content}</p>

                <div style={styles.exampleBox}>
                  <p style={styles.label}>例子</p>
                  <p style={styles.exampleWord}>{rule.examples}</p>
                </div>

                <div style={styles.miniButtonRow}>
                  <button
                    type="button"
                    onClick={() => speakSpanish(rule.examples)}
                    style={styles.secondaryButton}
                  >
                    听例子
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}