import { Session, isChestExercise } from './storage';
import { estimate1RM } from './calc';

export interface WeeklySummary {
  week: number;
  startDate: string;
  endDate: string;
  topWeight: number;
  reps: number;
  estimated1RM: number;
}

/**
 * Gets ISO week number from a date
 * ISO weeks start on Monday, week 1 is the week containing Jan 4
 */
function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  
  // Get Thursday of the week (ISO week belongs to the year of its Thursday)
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const thursday = new Date(d);
  thursday.setDate(diff + 3);
  
  // January 4 is always in week 1
  const jan4 = new Date(thursday.getFullYear(), 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const week1Start = new Date(jan4);
  week1Start.setDate(jan4.getDate() - jan4Day + 1);
  
  const thursdayDay = thursday.getDay() || 7;
  const weekStart = new Date(thursday);
  weekStart.setDate(thursday.getDate() - thursdayDay + 1);
  
  const diffTime = weekStart.getTime() - week1Start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7) + 1;
  
  return weekNumber;
}

/**
 * Gets the Monday (start) of the ISO week for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d);
  monday.setDate(diff);
  return monday;
}

/**
 * Gets the Sunday (end) of the ISO week for a given date
 */
function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Formats a date range as "Oct 20–26"
 */
function formatDateRange(start: Date, end: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonth = months[start.getMonth()];
  const startDay = start.getDate();
  const endDay = end.getDate();
  
  // If same month, show "Oct 20–26"
  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${startDay}–${endDay}`;
  }
  
  // If different months, show "Oct 30–Nov 5"
  const endMonth = months[end.getMonth()];
  return `${startMonth} ${startDay}–${endMonth} ${endDay}`;
}

/**
 * Gets weekly summaries from sessions, grouped by ISO week
 * Only includes chest exercise sessions (all variations: bench, incline, smith, flyes, machine, dips)
 */
export function getWeeklySummaries(sessions: Session[]): WeeklySummary[] {
  // Chunk 6 Fix: Filter for ALL chest exercises, not just flat barbell bench
  const chestSessions = sessions.filter(isChestExercise);
  
  if (chestSessions.length === 0) {
    return [];
  }
  
  // Group by ISO week
  const weekMap = new Map<number, Session[]>();
  
  for (const session of chestSessions) {
    const date = new Date(session.date);
    const week = getISOWeek(date);
    
    if (!weekMap.has(week)) {
      weekMap.set(week, []);
    }
    weekMap.get(week)!.push(session);
  }
  
  // For each week, find the top set
  const summaries: WeeklySummary[] = [];
  
  for (const [week, weekSessions] of weekMap.entries()) {
    // Find the top set: heaviest weight, tie-break by lowest reps
    let topSet = weekSessions[0];
    
    for (const session of weekSessions) {
      if (session.weight > topSet.weight) {
        topSet = session;
      } else if (session.weight === topSet.weight && session.reps < topSet.reps) {
        topSet = session;
      }
    }
    
    // Get week start and end dates (use the date of the top set)
    const topSetDate = new Date(topSet.date);
    const weekStart = getWeekStart(topSetDate);
    const weekEnd = getWeekEnd(topSetDate);
    
    // Calculate estimated 1RM
    const estimated1RM = estimate1RM(topSet.weight, topSet.reps);
    
    summaries.push({
      week,
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      topWeight: topSet.weight,
      reps: topSet.reps,
      estimated1RM
    });
  }
  
  // Sort by week number descending (most recent first)
  summaries.sort((a, b) => b.week - a.week);
  
  return summaries;
}

/**
 * Formats weekly summaries as a table
 */
export function formatWeeklyTable(summaries: WeeklySummary[]): string {
  if (summaries.length === 0) {
    return 'No weekly summaries available.';
  }
  
  const header = 'Week | Date Range     | Top Weight | Reps | est1RM';
  const separator = '--------------------------------------------------';
  const rows = summaries.map(s => {
    const dateRange = formatDateRange(new Date(s.startDate), new Date(s.endDate));
    return `${s.week.toString().padStart(4)} | ${dateRange.padEnd(13)} | ${s.topWeight.toString().padStart(10)} | ${s.reps.toString().padStart(4)} | ${s.estimated1RM.toString().padStart(6)}`;
  });
  
  return [header, separator, ...rows].join('\n');
}

