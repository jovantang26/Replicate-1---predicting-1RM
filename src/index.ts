#!/usr/bin/env node

import { estimate1RM } from './calc';
import { saveSession, listSessions, Session } from './storage';

interface CliArgs {
  weight?: number;
  reps?: number;
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
    console.error('Usage: 1rm <weight> <reps> [--save] [--json]');
    console.error('   or: 1rm --list [n] [--json]');
    process.exit(1);
  }

  const weight = parseFloat(args[0]);
  const reps = parseInt(args[1], 10);

  if (isNaN(weight) || isNaN(reps)) {
    console.error('Error: weight and reps must be valid numbers');
    process.exit(1);
  }

  return { weight, reps, json, save, list: undefined };
}

function formatSessionTable(sessions: Session[]): string {
  if (sessions.length === 0) {
    return 'No sessions found.';
  }

  const header = 'Date                  Weight    Reps    1RM';
  const separator = '-'.repeat(50);
  const rows = sessions.map(s => {
    const date = new Date(s.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${date.padEnd(20)} ${s.weight.toString().padStart(7)} ${s.reps.toString().padStart(7)} ${s.estimated1RM.toString().padStart(7)}`;
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

    const { weight, reps } = args;
    const estimated1RM = estimate1RM(weight, reps);

    // Create session object
    const session: Session = {
      date: new Date().toISOString(),
      weight,
      reps,
      estimated1RM,
      method: 'epley'
    };

    // Save if requested
    if (args.save) {
      saveSession(session);
    }

    // Output result
    if (args.json) {
      const result = {
        weight,
        reps,
        estimated1RM,
        method: 'epley'
      };
      console.log(JSON.stringify(result, null, 2));
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

