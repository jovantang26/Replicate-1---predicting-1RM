#!/usr/bin/env node

import { estimate1RM } from './calc';
import { saveSession, listSessions, Session } from './storage';

interface CliArgs {
  weight?: number;
  reps?: number;
  sets?: number;
  exerciseName?: string;
  exerciseType?: string;
  date?: string;
  json: boolean;
  save: boolean;
  list?: number; // undefined means --list was not provided, number means limit
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  
  const json = args.includes('--json') || args.includes('-json');
  const save = args.includes('--save') || args.includes('-save');
  const listIndex = args.findIndex(arg => arg === '--list' || arg === '-list');
  
  // Handle --list command
  if (listIndex !== -1) {
    let limit: number = 5; // default to 5
    
    // Check if there's a number after --list
    if (listIndex + 1 < args.length) {
      const nextArg = args[listIndex + 1];
      const parsed = parseInt(nextArg, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = parsed;
      }
    }
    
    return { json, save: false, list: limit };
  }
  
  // Handle calculation command (requires weight and reps)
  if (args.length < 2) {
    console.error('Usage: 1rm <weight> <reps> [--sets <n>] [--exercise <name>] [--equipment <type>] [--date <YYYY-MM-DD>] [--save] [--json]');
    console.error('   or: 1rm --list [n] [--json]');
    process.exit(1);
  }

  const weight = parseFloat(args[0]);
  const reps = parseInt(args[1], 10);

  if (isNaN(weight) || isNaN(reps)) {
    console.error('Error: weight and reps must be valid numbers');
    process.exit(1);
  }

  // Parse optional flags
  let sets: number | undefined;
  let exerciseName: string | undefined;
  let exerciseType: string | undefined;
  let date: string | undefined;

  const setsIndex = args.findIndex(arg => arg === '--sets' || arg === '-sets');
  if (setsIndex !== -1 && setsIndex + 1 < args.length) {
    const setsValue = parseInt(args[setsIndex + 1], 10);
    if (!isNaN(setsValue) && setsValue >= 1) {
      sets = setsValue;
    }
  }

  const exerciseIndex = args.findIndex(arg => arg === '--exercise' || arg === '-exercise');
  if (exerciseIndex !== -1 && exerciseIndex + 1 < args.length) {
    exerciseName = args[exerciseIndex + 1];
  }

  const equipmentIndex = args.findIndex(arg => arg === '--equipment' || arg === '-equipment');
  if (equipmentIndex !== -1 && equipmentIndex + 1 < args.length) {
    exerciseType = args[equipmentIndex + 1];
  }

  const dateIndex = args.findIndex(arg => arg === '--date' || arg === '-date');
  if (dateIndex !== -1 && dateIndex + 1 < args.length) {
    date = args[dateIndex + 1];
  }

  return { weight, reps, sets, exerciseName, exerciseType, date, json, save, list: undefined };
}

function formatSessionTable(sessions: Session[]): string {
  if (sessions.length === 0) {
    return 'No sessions found.';
  }

  const header = 'Date                  Exercise            Equipment    Sets    Weight    Reps    1RM';
  const separator = '-'.repeat(90);
  const rows = sessions.map(s => {
    const date = new Date(s.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${date.padEnd(20)} ${s.exerciseName.padEnd(18)} ${s.exerciseType.padEnd(11)} ${s.sets.toString().padStart(4)} ${s.weight.toString().padStart(7)} ${s.reps.toString().padStart(7)} ${s.estimated1RM.toString().padStart(7)}`;
  });

  return [header, separator, ...rows].join('\n');
}

function main() {
  try {
    const args = parseArgs();

    // Handle --list command
    if (args.list !== undefined) {
      const sessions = listSessions(args.list);

      if (args.json) {
        console.log(JSON.stringify(sessions, null, 2));
      } else {
        console.log(formatSessionTable(sessions));
      }
      return;
    }

    // Handle calculation command
    if (args.weight === undefined || args.reps === undefined) {
      console.error('Error: weight and reps are required for calculation');
      process.exit(1);
    }

    const { weight, reps, sets, exerciseName, exerciseType, date } = args;
    const estimated1RM = estimate1RM(weight, reps);

    // Validate required fields if saving
    if (args.save) {
      if (sets === undefined || sets < 1) {
        console.error('Error: --sets is required and must be >= 1 when using --save');
        process.exit(1);
      }
      if (!exerciseName) {
        console.error('Error: --exercise is required when using --save');
        process.exit(1);
      }
      if (!exerciseType) {
        console.error('Error: --equipment is required when using --save');
        process.exit(1);
      }
    }

    // Parse date or use current date
    let sessionDate: string;
    if (date) {
      // Try to parse the date
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        console.error('Error: Invalid date format. Use YYYY-MM-DD or ISO format');
        process.exit(1);
      }
      sessionDate = parsedDate.toISOString();
    } else {
      sessionDate = new Date().toISOString();
    }

    // Create full session object (only if saving, otherwise minimal for output)
    let session: Session | null = null;
    if (args.save) {
      session = {
        date: sessionDate,
        exerciseName: exerciseName!,
        exerciseType: exerciseType!,
        sets: sets!,
        weight,
        reps,
        estimated1RM,
        method: 'epley'
      };
      saveSession(session);
    }

    // Output result
    if (args.json) {
      if (session) {
        // Output full session if saved
        console.log(JSON.stringify(session, null, 2));
      } else {
        // Output minimal result if not saved
        const result = {
          weight,
          reps,
          estimated1RM,
          method: 'epley'
        };
        console.log(JSON.stringify(result, null, 2));
      }
    } else {
      console.log(`Estimated 1RM: ${estimated1RM} lb`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unexpected error occurred');
    }
    process.exit(1);
  }
}

main();

