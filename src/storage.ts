import * as fs from 'fs';
import * as path from 'path';

export interface Session {
  date: string;
  exerciseName: string;
  exerciseType: string;
  sets: number;
  weight: number;
  reps: number;
  estimated1RM: number;
  method: string; // "epley"
  bodyweight?: number | null;
  relativeStrength?: number | null;
  strengthCategory?: string | undefined; // e.g., novice/intermediate/advanced/elite
}

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const SESSIONS_FILE = path.resolve(DATA_DIR, 'sessions.json');

/**
 * Loads all sessions from the sessions.json file.
 * Returns an empty array if the file is missing or corrupt.
 */
export function loadSessions(): Session[] {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) {
      return [];
    }

    const content = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    const sessions = JSON.parse(content);

    // Validate that it's an array
    if (!Array.isArray(sessions)) {
      // Corrupt file - reinitialize
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }

    return sessions;
  } catch (error) {
    // File is corrupt or unreadable - reinitialize
    try {
      ensureDataDir();
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
    } catch {
      // Ignore write errors
    }
    return [];
  }
}

/**
 * Saves a session to the sessions.json file, appending it to the existing array.
 * Creates the file and directory if they don't exist.
 */
export function saveSession(session: Session): void {
  ensureDataDir();

  const sessions = loadSessions();
  sessions.push(session);

  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
}

/**
 * Returns the most recent sessions, limited by the optional limit parameter.
 * Sessions are returned in reverse chronological order (most recent first).
 */
export function listSessions(limit?: number): Session[] {
  const sessions = loadSessions();

  // Sort by date descending (most recent first)
  const sorted = sessions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (limit !== undefined && limit > 0) {
    return sorted.slice(0, limit);
  }

  return sorted;
}

/**
 * Ensures the data directory exists, creating it if necessary.
 */
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

