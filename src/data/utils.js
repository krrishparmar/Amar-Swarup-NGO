// Tier utility functions — no hardcoded data

export function getTierInfo(tier) {
  const tiers = {
    seedling: { label: '🌱 Seedling', min: 0, max: 10, color: '#4ade80' },
    recycler: { label: '♻️ Recycler', min: 11, max: 50, color: '#38bdf8' },
    guardian: { label: '🌍 Earth Guardian', min: 51, max: 150, color: '#c084fc' },
    champion: { label: '⚡ Eco Champion', min: 151, max: 500, color: '#f59e0b' },
  };
  return tiers[tier] || tiers.seedling;
}

export function getTierProgress(totalKg) {
  if (totalKg <= 10) return { current: totalKg, max: 10, next: 'Recycler' };
  if (totalKg <= 50) return { current: totalKg - 10, max: 40, next: 'Earth Guardian' };
  if (totalKg <= 150) return { current: totalKg - 50, max: 100, next: 'Eco Champion' };
  return { current: totalKg, max: totalKg, next: null };
}
