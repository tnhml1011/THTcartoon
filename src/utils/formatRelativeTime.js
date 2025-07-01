export default function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  if (diffMin < 1) return 'Vừa xong';
  if (diffHour < 1) return `${diffMin} phút trước`;
  if (diffDay < 1) return `${diffHour} giờ trước`;
  if (diffWeek < 1) return `${diffDay} ngày trước`;
  if (diffMonth < 1) return `${diffWeek} tuần trước`;
  if (diffYear < 1) return `${diffMonth} tháng trước`;
  return `${diffYear} năm trước`;
} 