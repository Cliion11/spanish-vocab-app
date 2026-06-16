export type Level = "A1" | "A2" | "B1" | "B2" | "C1";

export type Word = {
  id: string;
  word: string;
  level: Level;
  pos: string;
  gender?: "m" | "f";
  chinese: string;
  exampleEs: string;
  exampleZh: string;
};

export const a1Words: Word[] = [
  {
    id: "a1-001",
    word: "hola",
    level: "A1",
    pos: "interjection",
    chinese: "你好",
    exampleEs: "Hola, ¿cómo estás?",
    exampleZh: "你好，你怎么样？",
  },
  {
    id: "a1-002",
    word: "gracias",
    level: "A1",
    pos: "interjection",
    chinese: "谢谢",
    exampleEs: "Muchas gracias por tu ayuda.",
    exampleZh: "非常感谢你的帮助。",
  },
  {
    id: "a1-003",
    word: "casa",
    level: "A1",
    pos: "noun",
    gender: "f",
    chinese: "房子；家",
    exampleEs: "Vivo en una casa pequeña.",
    exampleZh: "我住在一座小房子里。",
  },
  {
    id: "a1-004",
    word: "libro",
    level: "A1",
    pos: "noun",
    gender: "m",
    chinese: "书",
    exampleEs: "Leo un libro en español.",
    exampleZh: "我读一本西班牙语书。",
  },
  {
    id: "a1-005",
    word: "comer",
    level: "A1",
    pos: "verb",
    chinese: "吃",
    exampleEs: "Quiero comer algo.",
    exampleZh: "我想吃点东西。",
  },
];
