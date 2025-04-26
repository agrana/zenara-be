import { format, formatDistanceToNow, formatDistance } from "date-fns";

export function formatDateTime(date: Date): string {
  return format(date, "MMM dd, yyyy h:mm a");
}

export function formatDateRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatTimeSpent(startTime: Date, endTime: Date | null): string {
  if (!endTime) return "0 min";
  
  return formatDistance(startTime, endTime, { includeSeconds: false });
}
