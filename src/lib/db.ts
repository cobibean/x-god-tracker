import Database from 'better-sqlite3';
import { z } from 'zod';
import path from 'path';
import { ConfigType, getSchema } from './config-schemas';
import { DEFAULT_CONFIGS } from './default-configs';

// Database path
const DB_PATH = path.join(process.cwd(), 'config.db');

// Initialize database
let db: Database.Database | null = null;

function getDatabase() {
  if (!db) {
    try {
      console.log('Initializing database at:', DB_PATH);
      db = new Database(DB_PATH);
      
      // Enable WAL mode for better concurrency
      db.pragma('journal_mode = WAL');
      
      // Create tables if they don't exist
      initializeTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
  return db;
}

function initializeTables() {
  const db = getDatabase();
  
  // Main configs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS configs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Config history for backup/restore
  db.exec(`
    CREATE TABLE IF NOT EXISTS config_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_type TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_configs_type ON configs(type);
    CREATE INDEX IF NOT EXISTS idx_history_type ON config_history(config_type);
  `);
}

export interface ConfigHistory {
  id: number;
  config_type: string;
  data: unknown;
  created_at: string;
}

export class ConfigManager {
  private db: Database.Database;
  
  constructor() {
    try {
      this.db = getDatabase();
    } catch (error) {
      console.error('ConfigManager: Failed to get database instance:', error);
      throw new Error('Failed to initialize ConfigManager: Database connection failed');
    }
  }
  
  /**
   * Get configuration by type with validation
   */
  async getConfig<T>(type: ConfigType, schema: z.ZodSchema<T>): Promise<T> {
    try {
      const stmt = this.db.prepare('SELECT data FROM configs WHERE type = ?');
      const result = stmt.get(type) as { data: string } | undefined;
      
      if (!result) {
        // Return default config if not found
        const defaultConfig = DEFAULT_CONFIGS[type];
        await this.setConfig(type, defaultConfig as T, schema);
        return defaultConfig as T;
      }
      
      const parsed = JSON.parse(result.data);
      const validated = schema.parse(parsed);
      return validated;
    } catch (error) {
      console.error(`Error getting config for ${type}:`, error);
      // Return default on error
      return DEFAULT_CONFIGS[type] as T;
    }
  }
  
  /**
   * Set configuration with validation and history tracking
   */
  async setConfig<T>(type: ConfigType, data: T, schema: z.ZodSchema<T>): Promise<void> {
    try {
      // Validate data
      const validated = schema.parse(data);
      const dataJson = JSON.stringify(validated);
      
      // Start transaction
      const transaction = this.db.transaction(() => {
        // Save to history before updating
        const currentStmt = this.db.prepare('SELECT data FROM configs WHERE type = ?');
        const current = currentStmt.get(type) as { data: string } | undefined;
        
        if (current) {
          const historyStmt = this.db.prepare(`
            INSERT INTO config_history (config_type, data)
            VALUES (?, ?)
          `);
          historyStmt.run(type, current.data);
        }
        
        // Update or insert config
        const upsertStmt = this.db.prepare(`
          INSERT OR REPLACE INTO configs (id, type, data, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `);
        upsertStmt.run(type, type, dataJson);
      });
      
      transaction();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error setting config for ${type}:`, error);
      throw new Error(`Failed to save configuration: ${errorMessage}`);
    }
  }
  
  /**
   * Get configuration history
   */
  async getConfigHistory(type: ConfigType): Promise<ConfigHistory[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT id, config_type, data, created_at
        FROM config_history
        WHERE config_type = ?
        ORDER BY created_at DESC
        LIMIT 10
      `);
      
      const results = stmt.all(type) as ConfigHistory[];
      return results.map(row => ({
        ...row,
        data: JSON.parse(row.data as string),
      }));
    } catch (error) {
      console.error(`Error getting history for ${type}:`, error);
      return [];
    }
  }
  
  /**
   * Reset configuration to defaults
   */
  async resetToDefaults(type: ConfigType): Promise<void> {
    const schema = getSchema(type);
    const defaultConfig = DEFAULT_CONFIGS[type];
    await this.setConfig(type, defaultConfig, schema);
  }
  
  /**
   * Export all configurations
   */
  async exportConfigs(): Promise<Record<string, unknown>> {
    try {
      const stmt = this.db.prepare('SELECT type, data FROM configs');
      const results = stmt.all() as { type: string; data: string }[];
      
      const configs: Record<string, unknown> = {};
      for (const row of results) {
        configs[row.type] = JSON.parse(row.data);
      }
      
      return {
        version: '1.0',
        exported_at: new Date().toISOString(),
        configs,
      };
    } catch (error) {
      console.error('Error exporting configs:', error);
      throw new Error('Failed to export configurations');
    }
  }
  
  /**
   * Import configurations with validation
   */
  async importConfigs(data: { configs?: Record<string, unknown> }): Promise<void> {
    try {
      if (!data.configs || typeof data.configs !== 'object') {
        throw new Error('Invalid import format');
      }
      
      const transaction = this.db.transaction(() => {
        for (const [type, config] of Object.entries(data.configs!)) {
          if (type in DEFAULT_CONFIGS) {
            const schema = getSchema(type as ConfigType);
            // Validate before importing
            schema.parse(config);
            
            const dataJson = JSON.stringify(config);
            const upsertStmt = this.db.prepare(`
              INSERT OR REPLACE INTO configs (id, type, data, updated_at)
              VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            `);
            upsertStmt.run(type, type, dataJson);
          }
        }
      });
      
      transaction();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error importing configs:', error);
      throw new Error(`Failed to import configurations: ${errorMessage}`);
    }
  }
  
  /**
   * Clean up old history entries
   */
  async cleanupHistory(keepDays: number = 30): Promise<void> {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM config_history
        WHERE created_at < datetime('now', '-${keepDays} days')
      `);
      stmt.run();
    } catch (error) {
      console.error('Error cleaning up history:', error);
    }
  }
  
  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}

// Singleton instance
let configManager: ConfigManager | null = null;

export function getConfigManager(): ConfigManager {
  if (!configManager) {
    try {
      configManager = new ConfigManager();
    } catch (error) {
      console.error('getConfigManager: Failed to create ConfigManager instance:', error);
      throw error;
    }
  }
  return configManager;
}

// Initialize database on module load
initializeTables(); 