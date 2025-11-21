#!/usr/bin/env node

import { estimate1RM } from './calc';
import { saveSession, listSessions, loadSessions, Session } from './storage';
import { getWeeklySummaries, formatWeeklyTable, WeeklySummary } from './weekly';
import { computeRelativeStrength, classifyStrengthRatio } from './rel';
import { calculateAdjusted1RM, validateFatigueRecoveryScore } from './fatigue';
import { trainModel, predict, loadModel } from './model';
import { computeTrend, TrendPoint } from './trend';
import * as fs from 'fs';
import * as path from 'path';

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
<<<<<<< HEAD
  help: boolean; // true means --help was provided
  version: boolean; // true means --version was provided
  train: boolean; // true means --train was provided
  predict: boolean; // true means --predict was provided
=======
>>>>>>> feat/chunk-6-long-term-trends
  trend: boolean; // true means --trend was provided
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  
  const json = args.includes('--json') || args.includes('-json');
  const save = args.includes('--save') || args.includes('-save');
  const listIndex = args.findIndex(arg => arg === '--list' || arg === '-list');
  const weeklyIndex = args.findIndex(arg => arg === '--weekly' || arg === '-weekly');
  const relIndex = args.findIndex(arg => arg === '--rel' || arg === '-rel');
  const fatigueTrendIndex = args.findIndex(arg => arg === '--fatigue-trend' || arg === '-fatigue-trend');
<<<<<<< HEAD
  const helpIndex = args.findIndex(arg => arg === '--help' || arg === '-help' || arg === '-h');
  const versionIndex = args.findIndex(arg => arg === '--version' || arg === '-version' || arg === '-v');
  const trainIndex = args.findIndex(arg => arg === '--train' || arg === '-train');
  const predictIndex = args.findIndex(arg => arg === '--predict' || arg === '-predict');
  const trendIndex = args.findIndex(arg => arg === '--trend' || arg === '-trend');
  
  // Handle --help command
  if (helpIndex !== -1) {
    return { json: false, save: false, list: undefined, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: false, help: true, version: false, train: false, predict: false, trend: false };
  }
  
  // Handle --version command
  if (versionIndex !== -1) {
    return { json: false, save: false, list: undefined, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: false, help: false, version: true, train: false, predict: false, trend: false };
  }
  
  // Handle --train command
  if (trainIndex !== -1) {
    return { json, save: false, list: undefined, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: false, help: false, version: false, train: true, predict: false, trend: false };
  }
  
  // Handle --predict command
  if (predictIndex !== -1) {
    return { json, save: false, list: undefined, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: false, help: false, version: false, train: false, predict: true, trend: false };
  }
  
  // Handle --trend command
  if (trendIndex !== -1) {
    return { json, save: false, list: undefined, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: false, help: false, version: false, train: false, predict: false, trend: true };
=======
  const trendIndex = args.findIndex(arg => arg === '--trend' || arg === '-trend');
  
  // Handle --trend command
  if (trendIndex !== -1) {
    return { json, save: false, list: undefined, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: false, trend: true };
>>>>>>> feat/chunk-6-long-term-trends
  }
  
  // Handle --fatigue-trend command
  if (fatigueTrendIndex !== -1) {
<<<<<<< HEAD
    return { json, save: false, list: undefined, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: true, help: false, version: false, train: false, predict: false, trend: false };
=======
    return { json, save: false, list: undefined, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: true, trend: false };
>>>>>>> feat/chunk-6-long-term-trends
  }
  
  // Handle --rel command
  if (relIndex !== -1) {
<<<<<<< HEAD
    return { json, save: false, list: undefined, weekly: false, weeklyLimit: undefined, rel: true, fatigueTrend: false, help: false, version: false, train: false, predict: false, trend: false };
=======
    return { json, save: false, list: undefined, weekly: false, weeklyLimit: undefined, rel: true, fatigueTrend: false, trend: false };
>>>>>>> feat/chunk-6-long-term-trends
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
    
<<<<<<< HEAD
    return { json, save: false, list: undefined, weekly: true, weeklyLimit: limit, rel: false, fatigueTrend: false, help: false, version: false, train: false, predict: false, trend: false };
=======
    return { json, save: false, list: undefined, weekly: true, weeklyLimit: limit, rel: false, fatigueTrend: false, trend: false };
>>>>>>> feat/chunk-6-long-term-trends
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
    
<<<<<<< HEAD
    return { json, save: false, list: limit, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: false, help: false, version: false, train: false, predict: false, trend: false };
=======
    return { json, save: false, list: limit, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: false, trend: false };
>>>>>>> feat/chunk-6-long-term-trends
  }
  
  // Handle calculation command (requires weight and reps)
  if (args.length < 2) {
<<<<<<< HEAD
    console.error('Usage: 1rm <weight> <reps> [options]');
    console.error('   or: 1rm --help                     # Show detailed help');
    console.error('   or: 1rm --version                  # Show version info');
    console.error('   or: 1rm --list [n] [--json]        # List sessions');
    console.error('   or: 1rm --weekly [--limit n] [--json]  # Weekly summaries');
    console.error('   or: 1rm --rel [--json]             # Relative strength');
    console.error('   or: 1rm --fatigue-trend [--json]   # Fatigue trends');
    console.error('   or: 1rm --trend [--json]           # Long-term trends');
    console.error('   or: 1rm --train                    # Train ML model');
    console.error('   or: 1rm --predict [--json]         # Predict with ML');
    console.error('');
    console.error('Run "1rm --help" for detailed usage information.');
=======
    console.error('Usage: 1rm <weight> <reps> [--sets <n>] [--exercise <name>] [--equipment <type>] [--date <YYYY-MM-DD>] [--bw <weight>] [--fatigue <0-10>] [--recovery <0-10>] [--save] [--json]');
    console.error('   or: 1rm --list [n] [--json]');
    console.error('   or: 1rm --weekly [--limit <n>] [--json]');
    console.error('   or: 1rm --rel [--json]');
    console.error('   or: 1rm --fatigue-trend [--json]');
    console.error('   or: 1rm --trend [--json]');
>>>>>>> feat/chunk-6-long-term-trends
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

<<<<<<< HEAD
  return { weight, reps, sets, exerciseName, exerciseType, date, bodyweight, fatigue, recovery, json, save, list: undefined, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: false, help: false, version: false, train: false, predict: false, trend: false };
}

function showHelp(): void {
  console.log('1RM Calculator - Complete Strength Training Analysis Tool');
  console.log('');
  console.log('USAGE:');
  console.log('  Basic calculation:');
  console.log('    1rm <weight> <reps> [options]');
  console.log('');
  console.log('CALCULATION OPTIONS:');
  console.log('  --sets <n>              Number of sets performed');
  console.log('  --exercise <name>       Exercise name (e.g., bench_press, squat)');
  console.log('  --equipment <type>      Equipment type (barbell, dumbbell, machine, cable)');
  console.log('  --date <YYYY-MM-DD>     Date of session (default: today)');
  console.log('  --bw <weight>           Bodyweight for relative strength calculation');
  console.log('  --fatigue <0-10>        Fatigue level (0=fresh, 10=exhausted)');
  console.log('  --recovery <0-10>       Recovery level (0=poor, 10=excellent)');
  console.log('  --save                  Save session to history');
  console.log('  --json                  Output in JSON format');
  console.log('');
  console.log('ANALYSIS COMMANDS:');
  console.log('  --list [n]              List recent sessions (default: 5)');
  console.log('  --weekly [--limit n]    Show weekly summaries');
  console.log('  --rel                   Show relative strength analysis');
  console.log('  --fatigue-trend         Show fatigue and recovery trends');
  console.log('  --trend                 Show long-term strength trends with moving averages');
  console.log('');
  console.log('MACHINE LEARNING:');
  console.log('  --train                 Train prediction model on saved sessions');
  console.log('  --predict               Predict 1RM using trained model');
  console.log('');
  console.log('UTILITY:');
  console.log('  --help, -h              Show this help message');
  console.log('  --version, -v           Show version information');
  console.log('');
  console.log('EXAMPLES:');
  console.log('  1rm 225 5                                    # Calculate 1RM for 225lbs x 5 reps');
  console.log('  1rm 225 5 --sets 3 --exercise bench_press --equipment barbell --bw 180 --save');
  console.log('  1rm --list 10                               # Show last 10 sessions');
  console.log('  1rm --weekly --json                         # Weekly summaries in JSON');
  console.log('  1rm --rel                                   # Relative strength analysis');
  console.log('  1rm --train                                 # Train ML model');
  console.log('  1rm --predict --json                       # Predict using ML model');
  console.log('');
  console.log('For more information, visit: https://github.com/jovantang26/Replicate-1---predicting-1RM');
}

function showVersion(): void {
  try {
    const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    console.log(`1RM Calculator v${packageJson.version}`);
    console.log(`Description: ${packageJson.description}`);
    console.log('');
    console.log('Features:');
    console.log('  ✅ Chunk 1: Basic 1RM calculation (Epley formula)');
    console.log('  ✅ Chunk 2: Session storage and history');
    console.log('  ✅ Chunk 3: Weekly summaries and progress tracking');
    console.log('  ✅ Chunk 4: Bodyweight tracking and relative strength');
    console.log('  ✅ Chunk 5: Fatigue and recovery analysis');
    console.log('  ✅ Chunk 6: Long-term trend analysis with moving averages');
    console.log('  ✅ Chunk 7: Machine learning model training and prediction');
    console.log('  ✅ Chunk 8: Final integration and polish');
  } catch (error) {
    console.log('1RM Calculator v0.1.0');
    console.log('Error reading version information');
  }
=======
  return { weight, reps, sets, exerciseName, exerciseType, date, bodyweight, fatigue, recovery, json, save, list: undefined, weekly: false, weeklyLimit: undefined, rel: false, fatigueTrend: false, trend: false };
>>>>>>> feat/chunk-6-long-term-trends
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

function formatTrendTable(trendPoints: TrendPoint[]): string {
  if (trendPoints.length === 0) {
    return 'No trend data found.';
  }

  const header = 'Week   est1RM   MA3     MA5     Delta';
  const separator = '-'.repeat(40);
  const rows = trendPoints.map(point => {
    const week = point.week.toString().padStart(4);
    const est1RM = point.est1RM.toFixed(1).padStart(7);
    const ma3 = point.ma3 !== null ? point.ma3.toFixed(1).padStart(7) : 'N/A'.padStart(7);
    const ma5 = point.ma5 !== null ? point.ma5.toFixed(1).padStart(7) : 'N/A'.padStart(7);
    const delta = point.delta !== null ? (point.delta >= 0 ? '+' : '') + point.delta.toFixed(1).padStart(6) : 'N/A'.padStart(7);
    
    return `${week}   ${est1RM}   ${ma3}   ${ma5}   ${delta}`;
  });

  return [header, separator, ...rows].join('\n');
}

function main() {
  try {
    const args = parseArgs();

<<<<<<< HEAD
    // Handle --help command
    if (args.help) {
      showHelp();
      return;
    }

    // Handle --version command
    if (args.version) {
      showVersion();
      return;
    }

    // Handle --train command
    if (args.train) {
      console.log('🤖 Training machine learning model...');
      const allSessions = loadSessions();
      
      if (allSessions.length < 10) {
        console.log('❌ Error: Need at least 10 sessions to train model');
        console.log(`   Currently have ${allSessions.length} sessions`);
        console.log('   Save more sessions with --save to build training dataset');
        return;
      }

      const model = trainModel(allSessions);
      console.log('✅ Model training completed successfully!');
      console.log(`📊 Training Statistics:`);
      console.log(`   • Sessions used: ${model.sessionCount}`);
      console.log(`   • Features: ${model.features.join(', ')}`);
      console.log(`   • Training date: ${new Date(model.trainingDate).toLocaleDateString()}`);
      console.log('');
      console.log('💡 Use --predict to make predictions with the trained model');
      return;
    }

    // Handle --predict command
    if (args.predict) {
      const model = loadModel();
      if (!model) {
        console.log('❌ Error: No trained model found');
        console.log('   Run --train first to create a model');
        return;
      }

      console.log('🔮 Making 1RM predictions using trained model...');
      
      // Get recent sessions to use as prediction base
      const recentSessions = loadSessions().slice(0, 5);
      if (recentSessions.length === 0) {
        console.log('❌ Error: No sessions found to base predictions on');
        console.log('   Save some sessions first with --save');
        return;
      }

      const predictions = recentSessions.map(session => {
        const predicted1RM = predict(model, {
          weight: session.weight,
          reps: session.reps,
          sets: session.sets || 3,
          bodyweight: session.bodyweight,
          relativeStrength: session.relativeStrength,
          fatigue: session.fatigue,
          recovery: session.recovery
        });
        
        return {
          exercise: session.exerciseName || 'unknown',
          actual1RM: session.estimated1RM,
          predicted1RM: predicted1RM,
          difference: predicted1RM - session.estimated1RM,
          date: session.date
        };
      });
      
      if (args.json) {
        console.log(JSON.stringify(predictions, null, 2));
      } else {
        console.log('📈 1RM Predictions vs Actual:');
        console.log('');
        console.log('Exercise             Actual    Predicted  Difference');
        console.log('-'.repeat(55));
        predictions.forEach(pred => {
          const diff = pred.difference >= 0 ? `+${pred.difference.toFixed(1)}` : pred.difference.toFixed(1);
          console.log(`${pred.exercise.padEnd(20)} ${pred.actual1RM.toFixed(1).padStart(8)} ${pred.predicted1RM.toFixed(1).padStart(10)} ${diff.padStart(10)}`);
        });
        console.log('');
        console.log(`📊 Model info: ${predictions.length} predictions, trained on ${model.sessionCount} sessions`);
      }
      return;
    }

=======
>>>>>>> feat/chunk-6-long-term-trends
    // Handle --trend command
    if (args.trend) {
      const allSessions = loadSessions();
      const weeklySummaries = getWeeklySummaries(allSessions);
      const trendPoints = computeTrend(weeklySummaries);
      
      if (args.json) {
        console.log(JSON.stringify(trendPoints, null, 2));
      } else {
<<<<<<< HEAD
        // Sort in descending order for display (most recent first)
        const displayPoints = [...trendPoints].sort((a, b) => b.week - a.week);
        console.log(formatTrendTable(displayPoints));
=======
        console.log(formatTrendTable(trendPoints));
>>>>>>> feat/chunk-6-long-term-trends
      }
      return;
    }

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

