// Simple biome helper based on row index.
// You can tweak the thresholds and colors to your liking.

export function getBiomeForRow(rowIndex) {
  // Treat negative (starting) rows as 0
  const row = Math.max(0, rowIndex);

  if (row < 30) return "summer"; // default/green
  if (row < 60) return "autumn"; // yellow/orange/brown
  return "winter"; // snowy
}

