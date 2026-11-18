import { ReminderCheckpoint, ReminderInterval, ReminderStatus } from '../types';

export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function getTimezoneAbbreviation(): string {
  try {
    const date = new Date();
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
    }).format(date);
    const parts = formatted.split(' ');
    return parts[parts.length - 1] || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function formatEventDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    const tzAbbr = getTimezoneAbbreviation();
    const dateStr = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} at ${timeStr} ${tzAbbr}`;
  } catch {
    return isoString;
  }
}

export function getRelativeDeadline(isoString: string): {
  label: string;
  urgency: 'critical' | 'warning' | 'normal' | 'past';
  hoursRemaining: number;
} {
  const target = new Date(isoString).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return { label: 'Submissions Closed', urgency: 'past', hoursRemaining: 0 };
  }

  const hoursRemaining = diffMs / (1000 * 60 * 60);
  const daysRemaining = Math.floor(hoursRemaining / 24);

  if (hoursRemaining < 24) {
    const hrs = Math.floor(hoursRemaining);
    return {
      label: `Closes in ${hrs}h`,
      urgency: 'critical',
      hoursRemaining,
    };
  }

  if (hoursRemaining < 48) {
    const hrs = Math.floor(hoursRemaining);
    return {
      label: `Closes in ${hrs}h`,
      urgency: 'warning',
      hoursRemaining,
    };
  }

  if (daysRemaining <= 7) {
    return {
      label: `Closes in ${daysRemaining}d`,
      urgency: 'normal',
      hoursRemaining,
    };
  }

  return {
    label: `Closes in ${daysRemaining}d`,
    urgency: 'normal',
    hoursRemaining,
  };
}

export function getCountdownParts(isoString: string): {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  isPast: boolean;
} {
  const target = new Date(isoString).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00', isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    isPast: false,
  };
}

export function generateReminderCheckpoints(
  deadlineIso: string,
  savedAtIso: string,
  isApplied: boolean
): ReminderCheckpoint[] {
  const deadline = new Date(deadlineIso).getTime();
  const savedAt = new Date(savedAtIso).getTime();
  const now = Date.now();

  const intervals: { id: string; label: string; interval: ReminderInterval; offsetMs: number }[] = [
    { id: '14d', label: '2 weeks before deadline', interval: '14d', offsetMs: 14 * 24 * 60 * 60 * 1000 },
    { id: '7d', label: '1 week before deadline', interval: '7d', offsetMs: 7 * 24 * 60 * 60 * 1000 },
    { id: '3d', label: '3 days before deadline', interval: '3d', offsetMs: 3 * 24 * 60 * 60 * 1000 },
    { id: '24h', label: '1 day before deadline', interval: '24h', offsetMs: 24 * 60 * 60 * 1000 },
    { id: '3h', label: 'A few hours before (3 hours prior)', interval: '3h', offsetMs: 3 * 60 * 60 * 1000 },
  ];

  return intervals.map(({ id, label, interval, offsetMs }) => {
    const checkpointTime = deadline - offsetMs;
    const targetDate = new Date(checkpointTime).toISOString();

    let status: ReminderStatus = 'scheduled';

    if (isApplied) {
      status = 'cancelled';
    } else if (checkpointTime < savedAt) {
      // Saved with less time than this checkpoint interval!
      status = 'passed_before_save';
    } else if (checkpointTime <= now) {
      status = 'sent';
    } else {
      status = 'scheduled';
    }

    return {
      id,
      label,
      interval,
      targetDate,
      status,
    };
  });
}
