"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type LevelId = "a1" | "a2" | "b1";

type WordItem = {
  word: string;
  meaning: string;
  type: string;
  example: string;
  translation: string;
};

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

const levelNames: Record<LevelId, string> = {
  a1: "DELE A1 基础词汇",
  a2: "DELE A2 初级词汇",
  b1: "DELE B1 中级词汇",
};

const wordBank: Record<LevelId, WordItem[]> = {
  a1: [
    {
      word: "hola",
      meaning: "你好",
      type: "interj.",
      example: "Hola, ¿cómo estás?",
      translation: "你好，你怎么样？",
    },
    {
      word: "gracias",
      meaning: "谢谢",
      type: "interj.",
      example: "Muchas gracias por tu ayuda.",
      translation: "非常感谢你的帮助。",
    },
    {
      word: "por favor",
      meaning: "请",
      type: "loc.",
      example: "Un café, por favor.",
      translation: "请给我一杯咖啡。",
    },
    {
      word: "perdón",
      meaning: "对不起；不好意思",
      type: "interj.",
      example: "Perdón, no entiendo.",
      translation: "不好意思，我不明白。",
    },
    {
      word: "sí",
      meaning: "是；对",
      type: "adv.",
      example: "Sí, quiero aprender español.",
      translation: "是的，我想学习西班牙语。",
    },
    {
      word: "no",
      meaning: "不；没有",
      type: "adv.",
      example: "No tengo tiempo hoy.",
      translation: "我今天没有时间。",
    },
    {
      word: "casa",
      meaning: "房子；家",
      type: "n. f.",
      example: "Mi casa está cerca de la escuela.",
      translation: "我家在学校附近。",
    },
    {
      word: "escuela",
      meaning: "学校",
      type: "n. f.",
      example: "La escuela está abierta.",
      translation: "学校开着。",
    },
    {
      word: "amigo",
      meaning: "朋友",
      type: "n. m.",
      example: "Mi amigo vive en Madrid.",
      translation: "我的朋友住在马德里。",
    },
    {
      word: "familia",
      meaning: "家庭；家人",
      type: "n. f.",
      example: "Mi familia es muy grande.",
      translation: "我的家人很多。",
    },
    {
      word: "agua",
      meaning: "水",
      type: "n. f.",
      example: "Quiero un vaso de agua.",
      translation: "我想要一杯水。",
    },
    {
      word: "café",
      meaning: "咖啡",
      type: "n. m.",
      example: "Tomo café por la mañana.",
      translation: "我早上喝咖啡。",
    },
    {
      word: "pan",
      meaning: "面包",
      type: "n. m.",
      example: "Compro pan en la tienda.",
      translation: "我在商店买面包。",
    },
    {
      word: "libro",
      meaning: "书",
      type: "n. m.",
      example: "Leo un libro en español.",
      translation: "我读一本西班牙语书。",
    },
    {
      word: "día",
      meaning: "天；日子",
      type: "n. m.",
      example: "Hoy es un buen día.",
      translation: "今天是个好日子。",
    },
    {
      word: "noche",
      meaning: "夜晚",
      type: "n. f.",
      example: "Buenas noches.",
      translation: "晚安。",
    },
    {
      word: "comer",
      meaning: "吃",
      type: "v.",
      example: "Vamos a comer juntos.",
      translation: "我们一起吃饭吧。",
    },
    {
      word: "beber",
      meaning: "喝",
      type: "v.",
      example: "Quiero beber agua.",
      translation: "我想喝水。",
    },
    {
      word: "hablar",
      meaning: "说话；交谈",
      type: "v.",
      example: "Quiero hablar contigo.",
      translation: "我想和你说话。",
    },
    {
      word: "vivir",
      meaning: "居住；生活",
      type: "v.",
      example: "Vivo en China.",
      translation: "我住在中国。",
    },
  ],

  a2: [
    {
      word: "viajar",
      meaning: "旅行",
      type: "v.",
      example: "Me gusta viajar en verano.",
      translation: "我喜欢在夏天旅行。",
    },
    {
      word: "trabajar",
      meaning: "工作",
      type: "v.",
      example: "Trabajo en una oficina.",
      translation: "我在办公室工作。",
    },
    {
      word: "aprender",
      meaning: "学习",
      type: "v.",
      example: "Aprendo español todos los días.",
      translation: "我每天学习西班牙语。",
    },
    {
      word: "entender",
      meaning: "理解；明白",
      type: "v.",
      example: "No entiendo esta palabra.",
      translation: "我不明白这个单词。",
    },
    {
      word: "comprar",
      meaning: "买",
      type: "v.",
      example: "Quiero comprar una chaqueta.",
      translation: "我想买一件夹克。",
    },
    {
      word: "vender",
      meaning: "卖",
      type: "v.",
      example: "Esta tienda vende frutas.",
      translation: "这家商店卖水果。",
    },
    {
      word: "ciudad",
      meaning: "城市",
      type: "n. f.",
      example: "Madrid es una ciudad grande.",
      translation: "马德里是一座大城市。",
    },
    {
      word: "calle",
      meaning: "街道",
      type: "n. f.",
      example: "La calle es muy tranquila.",
      translation: "这条街很安静。",
    },
    {
      word: "tienda",
      meaning: "商店",
      type: "n. f.",
      example: "Voy a la tienda.",
      translation: "我去商店。",
    },
    {
      word: "precio",
      meaning: "价格",
      type: "n. m.",
      example: "El precio es muy alto.",
      translation: "价格很高。",
    },
    {
      word: "dinero",
      meaning: "钱",
      type: "n. m.",
      example: "No tengo mucho dinero.",
      translation: "我没有很多钱。",
    },
    {
      word: "tiempo",
      meaning: "时间；天气",
      type: "n. m.",
      example: "No tengo tiempo ahora.",
      translation: "我现在没有时间。",
    },
    {
      word: "ayer",
      meaning: "昨天",
      type: "adv.",
      example: "Ayer estudié español.",
      translation: "昨天我学习了西班牙语。",
    },
    {
      word: "mañana",
      meaning: "明天；早晨",
      type: "n. f. / adv.",
      example: "Mañana voy al trabajo.",
      translation: "明天我去工作。",
    },
    {
      word: "cansado",
      meaning: "累的",
      type: "adj.",
      example: "Estoy cansado después del trabajo.",
      translation: "下班后我很累。",
    },
    {
      word: "contento",
      meaning: "高兴的",
      type: "adj.",
      example: "Estoy contento con mi progreso.",
      translation: "我对自己的进步很高兴。",
    },
  ],

  b1: [
    {
      word: "aunque",
      meaning: "虽然；即使",
      type: "conj.",
      example: "Aunque llueve, voy a salir.",
      translation: "虽然下雨，我还是要出门。",
    },
    {
      word: "sin embargo",
      meaning: "然而；不过",
      type: "loc.",
      example: "Es difícil; sin embargo, quiero intentarlo.",
      translation: "这很难，不过我想试试。",
    },
    {
      word: "por eso",
      meaning: "因此；所以",
      type: "loc.",
      example: "Estoy cansado, por eso voy a descansar.",
      translation: "我很累，所以我要休息。",
    },
    {
      word: "lograr",
      meaning: "实现；达成",
      type: "v.",
      example: "Quiero lograr mi objetivo.",
      translation: "我想实现我的目标。",
    },
    {
      word: "mejorar",
      meaning: "改善；提高",
      type: "v.",
      example: "Necesito mejorar mi español.",
      translation: "我需要提高我的西语。",
    },
    {
      word: "decidir",
      meaning: "决定",
      type: "v.",
      example: "Tengo que decidir hoy.",
      translation: "我今天必须做决定。",
    },
    {
      word: "explicar",
      meaning: "解释",
      type: "v.",
      example: "¿Puedes explicarlo otra vez?",
      translation: "你可以再解释一遍吗？",
    },
    {
      word: "recordar",
      meaning: "记得；回忆",
      type: "v.",
      example: "No puedo recordar su nombre.",
      translation: "我想不起他的名字。",
    },
    {
      word: "costumbre",
      meaning: "习惯；风俗",
      type: "n. f.",
      example: "Es una costumbre muy antigua.",
      translation: "这是一个很古老的习俗。",
    },
    {
      word: "consejo",
      meaning: "建议",
      type: "n. m.",
      example: "Gracias por tu consejo.",
      translation: "谢谢你的建议。",
    },
    {
      word: "cambio",
      meaning: "变化；改变",
      type: "n. m.",
      example: "Este cambio es importante.",
      translation: "这个变化很重要。",
    },
    {
      word: "éxito",
      meaning: "成功",
      type: "n. m.",
      example: "El éxito requiere paciencia.",
      translation: "成功需要耐心。",
    },
    {
      word: "fracaso",
      meaning: "失败",
      type: "n. m.",
      example: "El fracaso también enseña.",
      translation: "失败也会教会人东西。",
    },
    {
      word: "desarrollo",
      meaning: "发展",
      type: "n. m.",
      example: "El desarrollo personal es importante.",
      translation: "个人发展很重要。",
    },
    {
      word: "relación",
      meaning: "关系",
      type: "n. f.",
      example: "Tenemos una buena relación.",
      translation: "我们关系很好。",
    },
    {
      word: "experiencia",
      meaning: "经验；经历",
      type: "n. f.",
      example: "Fue una experiencia interesante.",
      translation: "那是一次有趣的经历。",
    },
  ],
};

function isLevelId(value: unknown): value is LevelId {
  return value === "a1" || value === "a2" || value === "b1";
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
  const words = useMemo(() => wordBank[safeLevel], [safeLevel]);

  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastFeedback, setLastFeedback] = useState("");
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
                className="primary-button"
                onClick={restartSession}
              >
                再学一轮
              </button>

              <Link href="/mistakes" className="glass-button">
                复习错题
              </Link>

              <Link href="/study" className="glass-button">
                返回等级
              </Link>
            </div>
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
                <p className="shortcut-hint">1 不认识 · 2 模糊 · 3 认识 · R 播放发音</p>

                <div className="study-actions">
                  <button type="button" onClick={() => handleAnswer("unknown")}>
                    不认识
                  </button>

                  <button type="button" onClick={() => handleAnswer("unclear")}>
                    模糊
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => handleAnswer("known")}
                  >
                    认识
                  </button>
                </div>
              </>
            )}

            {lastFeedback && <p className="study-feedback">{lastFeedback}</p>}
          </article>
        )}
      </section>
    </main>
  );
}