/**
 * Saajnika Luxury Boutique — Date Formatting & Clean Data Utilities
 * Formats timestamps cleanly across client storefront and atelier admin portals.
 */

export interface DateFormatOptions {
  includeTime?: boolean;
  style?: 'short' | 'medium' | 'long' | 'full';
}

/**
 * Safely parse any date value into a valid Date object or null
 */
export const safeParseDate = (dateVal: string | number | Date | null | undefined): Date | null => {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Format a date string cleanly (e.g. "25 Oct 2026" or "25 October 2026")
 * Never displays "Invalid Date".
 */
export const formatDate = (
  dateVal: string | number | Date | null | undefined,
  style: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string => {
  const d = safeParseDate(dateVal);
  if (!d) return 'Recent';

  const styleMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { day: 'numeric', month: 'short' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' },
  };

  try {
    return d.toLocaleDateString('en-IN', styleMap[style] || styleMap.medium);
  } catch {
    return 'Recent';
  }
};

/**
 * Format date with time (e.g. "25 Oct 2026, 04:30 PM")
 */
export const formatDateTime = (
  dateVal: string | number | Date | null | undefined
): string => {
  const d = safeParseDate(dateVal);
  if (!d) return 'Recently';

  try {
    const dateStr = d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return 'Recently';
  }
};

/**
 * Human-friendly relative time (e.g. "Just now", "25m ago", "Today, 14:30", "Yesterday")
 */
export const formatRelativeTime = (
  dateVal: string | number | Date | null | undefined
): string => {
  const d = safeParseDate(dateVal);
  if (!d) return 'Recently';

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) {
    const isToday = now.getDate() === d.getDate() && now.getMonth() === d.getMonth();
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    return isToday ? `Today, ${timeStr}` : `Yesterday, ${timeStr}`;
  }
  if (diffSec < 172800) {
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `Yesterday, ${timeStr}`;
  }

  return formatDate(d, 'medium');
};

/**
 * Calculates a clean guaranteed delivery date range from today
 */
export const getEstimatedDeliveryString = (daysToAdd: number = 3): string => {
  const target = new Date();
  target.setDate(target.getDate() + daysToAdd);
  return target.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};
