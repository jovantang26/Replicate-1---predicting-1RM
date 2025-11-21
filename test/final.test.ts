import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import * as path from 'path';

describe('Final Integration Tests', () => {
  const cliPath = path.resolve(__dirname, '..', 'dist', 'index.js');

  it('should show help message', () => {
    const output = execSync(`node "${cliPath}" --help`, { encoding: 'utf-8' });
    
    expect(output).toContain('1RM Calculator - Complete Strength Training Analysis Tool');
    expect(output).toContain('USAGE:');
    expect(output).toContain('CALCULATION OPTIONS:');
    expect(output).toContain('ANALYSIS COMMANDS:');
    expect(output).toContain('MACHINE LEARNING:');
    expect(output).toContain('UTILITY:');
    expect(output).toContain('EXAMPLES:');
  });

  it('should show version information', () => {
    const output = execSync(`node "${cliPath}" --version`, { encoding: 'utf-8' });
    
    expect(output).toContain('1RM Calculator v1.0.0');
    expect(output).toContain('Complete strength training analysis tool');
    expect(output).toContain('Features:');
    expect(output).toContain('✅ Chunk 1: Basic 1RM calculation');
    expect(output).toContain('✅ Chunk 2: Session storage');
    expect(output).toContain('✅ Chunk 3: Weekly summaries');
    expect(output).toContain('✅ Chunk 4: Bodyweight tracking');
    expect(output).toContain('✅ Chunk 5: Fatigue and recovery');
    expect(output).toContain('✅ Chunk 6: Long-term trend analysis');
    expect(output).toContain('✅ Chunk 7: Machine learning');
    expect(output).toContain('✅ Chunk 8: Final integration');
  });

  it('should handle basic 1RM calculation', () => {
    const output = execSync(`node "${cliPath}" 225 5`, { encoding: 'utf-8' });
    
    expect(output).toContain('Estimated 1RM');
    expect(output).toContain('263'); // Expected 1RM for 225x5
  });

  it('should show improved usage message when no arguments provided', () => {
    try {
      execSync(`node "${cliPath}"`, { encoding: 'utf-8' });
    } catch (error: any) {
      const output = error.stdout || error.message;
      expect(output).toContain('Usage: 1rm <weight> <reps> [options]');
      expect(output).toContain('1rm --help');
      expect(output).toContain('1rm --version');
      expect(output).toContain('1rm --train');
      expect(output).toContain('1rm --predict');
      expect(output).toContain('Run "1rm --help" for detailed usage information');
    }
  });

  it('should handle trend command with no data', () => {
    const output = execSync(`node "${cliPath}" --trend`, { encoding: 'utf-8' });
    expect(output).toContain('No trend data found');
  });

  it('should handle train command with insufficient data', () => {
    const output = execSync(`node "${cliPath}" --train`, { encoding: 'utf-8' });
    expect(output).toContain('🤖 Training machine learning model');
    expect(output).toContain('Need at least 10 sessions to train model');
  });

  it('should handle predict command with no model', () => {
    const output = execSync(`node "${cliPath}" --predict`, { encoding: 'utf-8' });
    expect(output).toContain('❌ Error: No trained model found');
    expect(output).toContain('Run --train first to create a model');
  });

  it('should support short flags for help and version', () => {
    const helpOutput = execSync(`node "${cliPath}" -h`, { encoding: 'utf-8' });
    expect(helpOutput).toContain('1RM Calculator - Complete Strength Training Analysis Tool');

    const versionOutput = execSync(`node "${cliPath}" -v`, { encoding: 'utf-8' });
    expect(versionOutput).toContain('1RM Calculator v1.0.0');
  });
});
