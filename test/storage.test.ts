import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { loadSessions, saveSession, listSessions, Session } from '../src/storage';

// Use a temporary directory for tests
const TEST_DATA_DIR = path.resolve(__dirname, '..', 'test-data');
const TEST_SESSIONS_FILE = path.resolve(TEST_DATA_DIR, 'sessions.json');

// Mock the storage module's file path
// We'll need to use a different approach - override the module's internal paths
// For simplicity, we'll test with the actual data directory but clean it up

describe('storage', () => {
  const originalDataDir = path.resolve(__dirname, '..', 'data');
  const originalSessionsFile = path.resolve(originalDataDir, 'sessions.json');
  const backupSessionsFile = path.resolve(originalDataDir, 'sessions.json.backup');

  beforeEach(() => {
    // Backup existing file if it exists
    if (fs.existsSync(originalSessionsFile)) {
      fs.copyFileSync(originalSessionsFile, backupSessionsFile);
      fs.unlinkSync(originalSessionsFile);
    }
    // Remove data directory if it exists
    if (fs.existsSync(originalDataDir)) {
      fs.rmSync(originalDataDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up test data
    if (fs.existsSync(originalSessionsFile)) {
      fs.unlinkSync(originalSessionsFile);
    }
    if (fs.existsSync(originalDataDir)) {
      fs.rmSync(originalDataDir, { recursive: true, force: true });
    }
    // Restore backup if it existed
    if (fs.existsSync(backupSessionsFile)) {
      fs.copyFileSync(backupSessionsFile, originalSessionsFile);
      fs.unlinkSync(backupSessionsFile);
    }
  });

  describe('loadSessions', () => {
    it('should return empty array if file is missing', () => {
      const sessions = loadSessions();
      expect(sessions).toEqual([]);
    });

    it('should return empty array and reinitialize if file is corrupt', () => {
      // Create corrupt JSON file
      fs.mkdirSync(originalDataDir, { recursive: true });
      fs.writeFileSync(originalSessionsFile, 'not valid json{', 'utf-8');

      const sessions = loadSessions();
      expect(sessions).toEqual([]);

      // Verify file was reinitialized
      const content = fs.readFileSync(originalSessionsFile, 'utf-8');
      expect(JSON.parse(content)).toEqual([]);
    });

    it('should return empty array if file contains non-array data', () => {
      fs.mkdirSync(originalDataDir, { recursive: true });
      fs.writeFileSync(originalSessionsFile, '{"not": "an array"}', 'utf-8');

      const sessions = loadSessions();
      expect(sessions).toEqual([]);

      // Verify file was reinitialized
      const content = fs.readFileSync(originalSessionsFile, 'utf-8');
      expect(JSON.parse(content)).toEqual([]);
    });

    it('should load valid sessions from file', () => {
      const testSessions: Session[] = [
        {
          date: '2025-11-10T00:00:00.000Z',
          weight: 225,
          reps: 5,
          estimated1RM: 263,
          method: 'epley'
        }
      ];

      fs.mkdirSync(originalDataDir, { recursive: true });
      fs.writeFileSync(originalSessionsFile, JSON.stringify(testSessions, null, 2), 'utf-8');

      const sessions = loadSessions();
      expect(sessions).toEqual(testSessions);
    });
  });

  describe('saveSession', () => {
    it('should create file and directory on first save', () => {
      const session: Session = {
        date: '2025-11-10T00:00:00.000Z',
        weight: 225,
        reps: 5,
        estimated1RM: 263,
        method: 'epley'
      };

      expect(fs.existsSync(originalSessionsFile)).toBe(false);
      saveSession(session);
      expect(fs.existsSync(originalSessionsFile)).toBe(true);

      const sessions = loadSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0]).toEqual(session);
    });

    it('should append to existing sessions', () => {
      const session1: Session = {
        date: '2025-11-10T00:00:00.000Z',
        weight: 225,
        reps: 5,
        estimated1RM: 263,
        method: 'epley'
      };

      const session2: Session = {
        date: '2025-11-11T00:00:00.000Z',
        weight: 250,
        reps: 3,
        estimated1RM: 275,
        method: 'epley'
      };

      saveSession(session1);
      saveSession(session2);

      const sessions = loadSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions[0]).toEqual(session1);
      expect(sessions[1]).toEqual(session2);
    });
  });

  describe('listSessions', () => {
    it('should return empty array if no sessions exist', () => {
      const sessions = listSessions();
      expect(sessions).toEqual([]);
    });

    it('should return all sessions in reverse chronological order', () => {
      const session1: Session = {
        date: '2025-11-10T00:00:00.000Z',
        weight: 225,
        reps: 5,
        estimated1RM: 263,
        method: 'epley'
      };

      const session2: Session = {
        date: '2025-11-11T00:00:00.000Z',
        weight: 250,
        reps: 3,
        estimated1RM: 275,
        method: 'epley'
      };

      const session3: Session = {
        date: '2025-11-12T00:00:00.000Z',
        weight: 275,
        reps: 2,
        estimated1RM: 293,
        method: 'epley'
      };

      saveSession(session1);
      saveSession(session2);
      saveSession(session3);

      const sessions = listSessions();
      expect(sessions).toHaveLength(3);
      // Most recent first
      expect(sessions[0]).toEqual(session3);
      expect(sessions[1]).toEqual(session2);
      expect(sessions[2]).toEqual(session1);
    });

    it('should respect limit parameter', () => {
      const sessions: Session[] = [
        { date: '2025-11-10T00:00:00.000Z', weight: 200, reps: 5, estimated1RM: 233, method: 'epley' },
        { date: '2025-11-11T00:00:00.000Z', weight: 225, reps: 5, estimated1RM: 263, method: 'epley' },
        { date: '2025-11-12T00:00:00.000Z', weight: 250, reps: 5, estimated1RM: 292, method: 'epley' },
        { date: '2025-11-13T00:00:00.000Z', weight: 275, reps: 5, estimated1RM: 321, method: 'epley' },
        { date: '2025-11-14T00:00:00.000Z', weight: 300, reps: 5, estimated1RM: 350, method: 'epley' }
      ];

      sessions.forEach(s => saveSession(s));

      const limited = listSessions(3);
      expect(limited).toHaveLength(3);
      // Most recent 3
      expect(limited[0].weight).toBe(300);
      expect(limited[1].weight).toBe(275);
      expect(limited[2].weight).toBe(250);
    });

    it('should handle limit larger than available sessions', () => {
      const session: Session = {
        date: '2025-11-10T00:00:00.000Z',
        weight: 225,
        reps: 5,
        estimated1RM: 263,
        method: 'epley'
      };

      saveSession(session);

      const sessions = listSessions(10);
      expect(sessions).toHaveLength(1);
    });
  });

  describe('CLI integration', () => {
    const cliPath = path.resolve(__dirname, '..', 'dist', 'index.js');

    beforeEach(() => {
      // Ensure dist is built
      if (!fs.existsSync(cliPath)) {
        throw new Error('CLI not built. Run npm run build first.');
      }
    });

    it('should list sessions in text format', () => {
      // Save some test sessions
      saveSession({
        date: '2025-11-10T00:00:00.000Z',
        weight: 225,
        reps: 5,
        estimated1RM: 263,
        method: 'epley'
      });
      saveSession({
        date: '2025-11-11T00:00:00.000Z',
        weight: 250,
        reps: 3,
        estimated1RM: 275,
        method: 'epley'
      });

      const output = execSync(`node "${cliPath}" --list 2`, { encoding: 'utf-8' });
      
      // Should contain header and data rows
      expect(output).toContain('Date');
      expect(output).toContain('Weight');
      expect(output).toContain('Reps');
      expect(output).toContain('1RM');
      expect(output).toContain('250');
      expect(output).toContain('225');
    });

    it('should list sessions in JSON format', () => {
      // Save some test sessions
      saveSession({
        date: '2025-11-10T00:00:00.000Z',
        weight: 225,
        reps: 5,
        estimated1RM: 263,
        method: 'epley'
      });
      saveSession({
        date: '2025-11-11T00:00:00.000Z',
        weight: 250,
        reps: 3,
        estimated1RM: 275,
        method: 'epley'
      });
      saveSession({
        date: '2025-11-12T00:00:00.000Z',
        weight: 275,
        reps: 2,
        estimated1RM: 293,
        method: 'epley'
      });

      const output = execSync(`node "${cliPath}" --list 3 --json`, { encoding: 'utf-8' });
      const parsed = JSON.parse(output);
      
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(3);
      
      // Verify structure
      parsed.forEach((session: Session) => {
        expect(session).toHaveProperty('date');
        expect(session).toHaveProperty('weight');
        expect(session).toHaveProperty('reps');
        expect(session).toHaveProperty('estimated1RM');
        expect(session).toHaveProperty('method');
        expect(session.method).toBe('epley');
      });
      
      // Verify most recent first
      expect(parsed[0].weight).toBe(275);
      expect(parsed[1].weight).toBe(250);
      expect(parsed[2].weight).toBe(225);
    });

    it('should save session when --save flag is used', () => {
      // Clear any existing sessions
      if (fs.existsSync(originalSessionsFile)) {
        fs.unlinkSync(originalSessionsFile);
      }

      execSync(`node "${cliPath}" 225 5 --save`, { encoding: 'utf-8' });
      
      const sessions = loadSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].weight).toBe(225);
      expect(sessions[0].reps).toBe(5);
      expect(sessions[0].estimated1RM).toBe(263);
      expect(sessions[0].method).toBe('epley');
      expect(sessions[0].date).toBeDefined();
    });
  });
});

