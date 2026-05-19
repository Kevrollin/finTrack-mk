export function formatKsh(value, { minimumFractionDigits = 2, maximumFractionDigits = 2 } = {}) {
  const numeric = Number(value || 0)
  return `KSh ${numeric.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`
}