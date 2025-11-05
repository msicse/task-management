export function formatMinutesDisplay(minutes) {
  const minutesFloat = Number(minutes) || 0;
  if (minutesFloat === 0) return '0 min';
  if (minutesFloat < 1) return `${minutesFloat.toFixed(2)} min`;
  return `${Math.round(minutesFloat)} min`;
}

export function exactTooltip(minutes) {
  const minutesFloat = Number(minutes) || 0;
  const seconds = minutesFloat * 60;
  if (minutesFloat === 0) return '0s';
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

export function exactVerbose(minutes) {
  const minutesFloat = Number(minutes) || 0;
  const seconds = minutesFloat * 60;
  if (minutesFloat === 0) return '0 minutes';
  if (seconds < 60) {
    return `${minutesFloat.toFixed(4)} minutes (${seconds.toFixed(2)} seconds)`;
  }
  const mins = Math.floor(minutesFloat);
  const secs = Math.round(seconds % 60);
  return `${mins} minutes ${secs} seconds`;
}
