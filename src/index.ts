#!/usr/bin/env node

import { estimate1RM } from './calc';

interface CliArgs {
  weight: number;
  reps: number;
  json: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: 1rm <weight> <reps> [--json]');
    process.exit(1);
  }

  const weight = parseFloat(args[0]);
  const reps = parseInt(args[1], 10);
  const json = args.includes('--json');

  if (isNaN(weight) || isNaN(reps)) {
    console.error('Error: weight and reps must be valid numbers');
    process.exit(1);
  }

  return { weight, reps, json };
}

function main() {
  try {
    const { weight, reps, json } = parseArgs();
    const estimated1RM = estimate1RM(weight, reps);

    if (json) {
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

