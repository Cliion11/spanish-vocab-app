type SpeakSpanishOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
};

let cachedSpanishVoice: SpeechSynthesisVoice | null = null;

function getVoices() {
  if (typeof window === "undefined") return [];
  if (!("speechSynthesis" in window)) return [];

  return window.speechSynthesis.getVoices();
}

function scoreSpanishVoice(
  voice: SpeechSynthesisVoice,
  preferredLang: string
) {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  const preferred = preferredLang.toLowerCase();

  let score = 0;

  if (lang.startsWith("es")) score += 10;
  if (lang === preferred) score += 8;

  if (name.includes("google")) score += 20;
  if (name.includes("spanish") || name.includes("español")) score += 5;

  if (lang === "es-es") score += 4;
  if (lang === "es-mx") score += 3;
  if (lang === "es-us") score += 2;

  return score;
}

export function pickSpanishVoice(preferredLang = "es-ES") {
  if (typeof window === "undefined") return null;
  if (!("speechSynthesis" in window)) return null;

  const voices = getVoices();
  const spanishVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("es")
  );

  if (spanishVoices.length === 0) {
    return null;
  }

  const bestVoice = spanishVoices
    .map((voice) => ({
      voice,
      score: scoreSpanishVoice(voice, preferredLang),
    }))
    .sort((a, b) => b.score - a.score)[0]?.voice;

  cachedSpanishVoice = bestVoice ?? spanishVoices[0];

  return cachedSpanishVoice;
}

export function stopSpanishSpeech() {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
}

export function speakSpanish(text: string, options: SpeakSpanishOptions = {}) {
  if (typeof window === "undefined") return;

  if (!("speechSynthesis" in window)) {
    alert("当前浏览器不支持语音播放。");
    return;
  }

  const lang = options.lang ?? "es-ES";

  stopSpanishSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = options.rate ?? 0.82;
  utterance.pitch = options.pitch ?? 1;

  const voice = cachedSpanishVoice ?? pickSpanishVoice(lang);

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }

  window.speechSynthesis.speak(utterance);
}
