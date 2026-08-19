export const FACES = [
  { id: "fox", emoji: "🦊", name: "Fox" },
  { id: "cat", emoji: "🐱", name: "Cat" },
  { id: "wolf", emoji: "🐺", name: "Wolf" },
  { id: "panda", emoji: "🐼", name: "Panda" },
  { id: "frog", emoji: "🐸", name: "Frog" },
  { id: "tiger", emoji: "🐯", name: "Tiger" },
  { id: "owl", emoji: "🦉", name: "Owl" },
  { id: "dragon", emoji: "🐲", name: "Dragon" },
  { id: "alien", emoji: "👽", name: "Alien" },
  { id: "robot", emoji: "🤖", name: "Robot" },
  { id: "devil", emoji: "😈", name: "Devil" },
  { id: "angel", emoji: "😇", name: "Angel" },
  { id: "cool", emoji: "😎", name: "Cool" },
  { id: "crown", emoji: "👑", name: "Crown" },
  { id: "fire", emoji: "🔥", name: "Fire" },
  { id: "spade", emoji: "♠️", name: "Spade" }
];

export const CHAT_EMOJIS = ["😂", "🔥", "👏", "😎", "💀", "😭", "🤝", "🃏", "💪", "👀", "🤑", "😅", "❤️", "🎉", "🤔", "😤", "🥳", "😱", "🫡", "✨"];

export const PARTY_LINES = [
  "wait I'm so bad 😭",
  "deal me in!!",
  "this is not real money right 😂",
  "gg even if I fold",
  "who's bringing snacks",
  "I came here to talk ngl",
  "🔥🔥🔥",
  "party table energy",
  "oops that was a vibe fold",
  "brb grabbing drinks",
  "we are so back",
  "lmaooo",
  "nice cards?? I can't even see",
  "just here for the chat"
];

export function faceById(id) {
  return FACES.find((f) => f.id === id) || FACES[0];
}

export function isEmojiOnly(text) {
  const t = String(text || "").trim();
  if (!t) return false;
  if (CHAT_EMOJIS.includes(t)) return true;
  return /^[\p{Extended_Pictographic}\uFE0F\u200D]{1,8}$/u.test(t);
}
