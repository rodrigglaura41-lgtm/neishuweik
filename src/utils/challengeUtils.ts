import { VocabLevel } from '@/data/vocabulario';

export type MiniGameType = 'multiple-choice' | 'matching' | 'true-false' | 'word-builder';

export interface QuestionSpec {
  type: MiniGameType;
  wordIndices: number[];
  isCorrect?: boolean;
  wrongEmojiIdx?: number;
}

/** Fisher-Yates shuffle — pure, returns a new array */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Returns n random elements from arr without mutation */
export function randomSample<T>(arr: T[], n: number): T[] {
  return shuffle([...arr]).slice(0, n);
}

/**
 * Split a Namtrik word into displayable tokens.
 * Multi-word → split on spaces.
 * Single word → split into 3-char groups.
 */
export function tokenizeNamtrik(namtrik: string): string[] {
  if (namtrik.includes(' ')) return namtrik.split(' ').filter(Boolean);
  const chunks: string[] = [];
  let i = 0;
  while (i < namtrik.length) { chunks.push(namtrik.slice(i, i + 3)); i += 3; }
  return chunks.filter(Boolean);
}

/** Generate a set of 5 random questions for a vocabulary level */
export function generateQuestions(level: VocabLevel): QuestionSpec[] {
  const words = level.palabras;
  const types: MiniGameType[] = ['multiple-choice', 'matching', 'true-false', 'word-builder'];
  const extra = types[Math.floor(Math.random() * 4)];
  const shuffledTypes = shuffle([...types, extra]);

  return shuffledTypes.map<QuestionSpec>(type => {
    if (type === 'matching') {
      const sampled = randomSample(words, 3);
      return { type, wordIndices: sampled.map(w => words.indexOf(w)) };
    }
    if (type === 'word-builder') {
      const qualifiers = words.filter(w => {
        const t = tokenizeNamtrik(w.namtrik);
        return t.length >= 2 && t.length <= 6;
      });
      const pool = qualifiers.length >= 3 ? qualifiers : words;
      const word = pool[Math.floor(Math.random() * pool.length)];
      return { type, wordIndices: [words.indexOf(word)] };
    }
    if (type === 'true-false') {
      const targetIdx = Math.floor(Math.random() * words.length);
      const isCorrect = Math.random() < 0.5;
      let wrongEmojiIdx = targetIdx;
      if (!isCorrect) while (wrongEmojiIdx === targetIdx) wrongEmojiIdx = Math.floor(Math.random() * words.length);
      return { type, wordIndices: [targetIdx], isCorrect, wrongEmojiIdx };
    }
    // multiple-choice
    return { type, wordIndices: [Math.floor(Math.random() * words.length)] };
  });
}
