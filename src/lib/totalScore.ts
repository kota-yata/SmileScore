export const computeTotalScore = (scores: number[]): number => {
  let total = 0;
  for (const score of scores) {
    if (score < 91) {
      total += score;
      continue;
    }
    const sub = score - 90;
    const squared = 90 + (sub ** 2) / 10;
    total += squared;
  };
  total = Math.round(total / 3);
  return total;
};
