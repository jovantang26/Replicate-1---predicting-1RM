#!/usr/bin/env node

import { estimate1RM } from './calc';
import { saveSession, listSessions, loadSessions, Session } from './storage';
import { getWeeklySummaries, formatWeeklyTable, WeeklySummary } from './weekly';
import { computeRelativeStrength, classifyStrengthRatio } from './rel';
import { calculateAdjusted1RM, validateFatigueRecoveryScore } from './fatigue';

interface CliArgs {
  weight?: number;
  reps?: number;
  sets?: number;
  exerciseName?: string;
  exerciseType?: string;
  date?: string;
  bodyweight?: number | null;
  fatigue?: number | null;
  recovery?: number | null;
  json: boolean;
  save: boolean;
  list?: number; // undefined means --list was not provided, number means limit
  weekly: boolean; // true means --weekly was provided
  weeklyLimit?: number; // optional limit for weekly summaries
  rel: boolean; // true means --rel was provided
  fatigueTrend: boolean; // true means --fatigue-trend was provided
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  
  const json = args.includes('--json') || args.includes('-json');
  const save = args.includes('--save') || args.includes('-save');
  const listIndex = args.findIndex(arg => arg === '--list' || arg === '-list');
  const weeklyIndex = args.findIndex(arg => arg === '--weekly' || arg === '-weekly');
  const relIndex = args.findIndex(arg => arg === '--rel' || arg === '-rel');
  const fatigueTrendIndex = args.findIndex(arg => arg === '--fatigue-trend' || arg === '-fatigue-trend');
  
  // Handle --fatigue-trend command
  if (fatigueTrendIndex !== -1) {
    return { json, save: false, list: undefined, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: true };
  }
  
  // Handle --rel command
  if (relIndex !== -1) {
    return { json, save: false, list: undefined, weekly: false, weeklyLimit: undefined, rel: true, fatigueTrend: false };
  }
  
  // Handle --weekly command
  if (weeklyIndex !== -1) {
    let limit: number | undefined = undefined;
    
    // Check for --limit flag
    const limitIndex = args.findIndex(arg => arg === '--limit' || arg === '-limit');
    if (limitIndex !== -1 && limitIndex + 1 < args.length) {
      const nextArg = args[limitIndex + 1];
      const parsed = parseInt(nextArg, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = parsed;
      }
    }
    
    return { json, save: false, list: undefined, weekly: true, weeklyLimit: limit, rel: false, fatigueTrend: false };
  }
  
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
    
    return { json, save: false, list: limit, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: false };
  }
  
  // Handle calculation command (requires weight and reps)
  if (args.length < 2) {
    console.error('Usage: 1rm <weight> <reps> [--sets <n>] [--exercise <name>] [--equipment <type>] [--date <YYYY-MM-DD>] [--bw <weight>] [--fatigue <0-10>] [--recovery <0-10>] [--save] [--json]');
    console.error('   or: 1rm --list [n] [--json]');
    console.error('   or: 1rm --weekly [--limit <n>] [--json]');
    console.error('   or: 1rm --rel [--json]');
    console.error('   or: 1rm --fatigue-trend [--json]');
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

  let bodyweight: number | null | undefined = undefined;
  const bwIndex = args.findIndex(arg => arg === '--bw' || arg === '-bw');
  if (bwIndex !== -1 && bwIndex + 1 < args.length) {
    const bwValue = parseFloat(args[bwIndex + 1]);
    if (!isNaN(bwValue) && bwValue > 0) {
      bodyweight = bwValue;
    } else {
      bodyweight = null;
    }
  }

  let fatigue: number | null | undefined = undefined;
  const fatigueIndex = args.findIndex(arg => arg === '--fatigue' || arg === '-fatigue');
  if (fatigueIndex !== -1 && fatigueIndex + 1 < args.length) {
    const fatigueValue = parseFloat(args[fatigueIndex + 1]);
    if (validateFatigueRecoveryScore(fatigueValue)) {
      fatigue = fatigueValue;
    } else {
      console.error('Error: --fatigue must be a number between 0 and 10');
      process.exit(1);
    }
  }

  let recovery: number | null | undefined = undefined;
  const recoveryIndex = args.findIndex(arg => arg === '--recovery' || arg === '-recovery');
  if (recoveryIndex !== -1 && recoveryIndex + 1 < args.length) {
    const recoveryValue = parseFloat(args[recoveryIndex + 1]);
    if (validateFatigueRecoveryScore(recoveryValue)) {
      recovery = recoveryValue;
    } else {
      console.error('Error: --recovery must be a number between 0 and 10');
      process.exit(1);
    }
  }

  return { weight, reps, sets, exerciseName, exerciseType, date, bodyweight, fatigue, recovery, json, save, list: undefined, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: false };
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

function formatRelativeStrengthTable(sessions: Session[]): string {
  if (sessions.length === 0) {
    return 'No sessions found.';
  }

  const header = 'date        exercise      weight reps est1RM bw   rel  category';
  const separator = '-'.repeat(70);
  const rows = sessions.map(s => {
    const date = new Date(s.date).toISOString().split('T')[0];
    const exercise = s.exerciseName;
    const weight = s.weight.toString();
    const reps = s.reps.toString();
    const est1RM = s.estimated1RM.toString();
    const bw = s.bodyweight !== null && s.bodyweight !== undefined ? s.bodyweight.toString() : 'N/A';
    const rel = s.relativeStrength !== null && s.relativeStrength !== undefined 
      ? s.relativeStrength.toFixed(2) 
      : 'N/A';
    const category = s.strengthCategory || 'N/A';
    
    return `${date.padEnd(12)} ${exercise.padEnd(14)} ${weight.padStart(6)} ${reps.padStart(4)} ${est1RM.padStart(6)} ${bw.padStart(4)} ${rel.padStart(5)} ${category}`;
  });

  return [header, separator, ...rows].join('\n');
}

function formatFatigueTrendTable(sessions: Session[]): string {
  if (sessions.length === 0) {
    return 'No sessions found.';
  }

  const header = 'date        exercise      weight reps est1RM fatigue recovery adj1RM';
  const separator = '-'.repeat(75);
  const rows = sessions.map(s => {
    const date = new Date(s.date).toISOString().split('T')[0];
    const exercise = s.exerciseName;
    const weight = s.weight.toString();
    const reps = s.reps.toString();
    const est1RM = s.estimated1RM.toString();
    const fatigue = s.fatigue !== null && s.fatigue !== undefined ? s.fatigue.toString() : 'N/A';
    const recovery = s.recovery !== null && s.recovery !== undefined ? s.recovery.toString() : 'N/A';
    const adj1RM = s.adjusted1RM !== null && s.adjusted1RM !== undefined ? s.adjusted1RM.toString() : 'N/A';
    
    return `${date.padEnd(12)} ${exercise.padEnd(14)} ${weight.padStart(6)} ${reps.padStart(4)} ${est1RM.padStart(6)} ${fatigue.padStart(7)} ${recovery.padStart(8)} ${adj1RM.padStart(6)}`;
  });

  return [header, separator, ...rows].join('\n');
}

function main() {
  try {
    const args = parseArgs();

    // Handle --fatigue-trend command
    if (args.fatigueTrend) {
      const sessions = listSessions();
      
      if (args.json) {
        console.log(JSON.stringify(sessions, null, 2));
      } else {
        console.log(formatFatigueTrendTable(sessions));
      }
      return;
    }

    // Handle --rel command
    if (args.rel) {
      const sessions = listSessions();
      
      if (args.json) {
        console.log(JSON.stringify(sessions, null, 2));
      } else {
        console.log(formatRelativeStrengthTable(sessions));
      }
      return;
    }

    // Handle --weekly command
    if (args.weekly) {
      const allSessions = loadSessions();
      let summaries = getWeeklySummaries(allSessions);
      
      // Apply limit if specified
      if (args.weeklyLimit !== undefined && args.weeklyLimit > 0) {
        summaries = summaries.slice(0, args.weeklyLimit);
      }
      
      if (args.json) {
        console.log(JSON.stringify(summaries, null, 2));
      } else {
        console.log(formatWeeklyTable(summaries));
      }
      return;
    }

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

    const { weight, reps, sets, exerciseName, exerciseType, date, bodyweight, fatigue, recovery } = args;
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
      // Compute relative strength if bodyweight is provided
      const relativeStrength = computeRelativeStrength(estimated1RM, bodyweight);
      const strengthCategory = classifyStrengthRatio(relativeStrength);
      
      // Compute adjusted 1RM if fatigue/recovery are provided
      const adjusted1RM = calculateAdjusted1RM(estimated1RM, recovery, fatigue);
      
      session = {
        date: sessionDate,
        exerciseName: exerciseName!,
        exerciseType: exerciseType!,
        sets: sets!,
        weight,
        reps,
        estimated1RM,
        method: 'epley',
        bodyweight: bodyweight !== undefined ? bodyweight : null,
        relativeStrength,
        strengthCategory,
        fatigue: fatigue !== undefined ? fatigue : null,
        recovery: recovery !== undefined ? recovery : null,
        adjusted1RM
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

