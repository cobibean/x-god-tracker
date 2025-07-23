import { z } from 'zod';
import { ConfigType, getSchema } from './config-schemas';
import { DEFAULT_CONFIGS } from './default-configs';
import { sql } from '@vercel/postgres';

export interface ConfigHistory {
  id: number;
  config_type: string;
  data: unknown;
  created_at: string;
}

export class ConfigManager {
  constructor() {
    // Initialize tables on first use
    this.initializeTables().catch(error => {
      console.error('Failed to initialize PostgreSQL tables:', error);
    });
  }
  
  private async initializeTables() {
    try {
      console.log('PostgreSQL: Initializing tables...');
      
      // Check if we can connect
      const testResult = await sql`SELECT 1 as test`;
      console.log('PostgreSQL: Connection successful', testResult);
      
      // Create configs table
      await sql`
        CREATE TABLE IF NOT EXISTS configs (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // Create config history table
      await sql`
        CREATE TABLE IF NOT EXISTS config_history (
          id SERIAL PRIMARY KEY,
          config_type TEXT NOT NULL,
          data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // Create indexes
      await sql`
        CREATE INDEX IF NOT EXISTS idx_configs_type ON configs(type)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_history_type ON config_history(config_type)
      `;
      
      console.log('PostgreSQL: Tables initialized successfully');
    } catch (error) {
      console.error('PostgreSQL: Failed to initialize tables:', error);
      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get configuration by type with validation
   */
  async getConfig<T>(type: ConfigType, schema: z.ZodSchema<T>): Promise<T> {
    try {
      console.log(`PostgreSQL: Getting config for ${type}`);
      
      const result = await sql`
        SELECT data FROM configs WHERE type = ${type}
      `;
      
      if (result.rows.length === 0) {
        console.log(`PostgreSQL: No config found for ${type}, using defaults`);
        // Return default config if not found
        const defaultConfig = DEFAULT_CONFIGS[type];
        await this.setConfig(type, defaultConfig as T, schema);
        return defaultConfig as T;
      }
      
      const parsed = result.rows[0].data;
      const validated = schema.parse(parsed);
      console.log(`PostgreSQL: Successfully retrieved config for ${type}`);
      return validated;
    } catch (error) {
      console.error(`PostgreSQL: Error getting config for ${type}:`, error);
      // Return default on error
      return DEFAULT_CONFIGS[type] as T;
    }
  }
  
  /**
   * Set configuration with validation and history tracking
   */
  async setConfig<T>(type: ConfigType, data: T, schema: z.ZodSchema<T>): Promise<void> {
    try {
      console.log(`PostgreSQL: Setting config for ${type}`);
      
      // Validate data
      const validated = schema.parse(data);
      
      // Save current config to history
      const current = await sql`
        SELECT data FROM configs WHERE type = ${type}
      `;
      
      if (current.rows.length > 0) {
        await sql`
          INSERT INTO config_history (config_type, data)
          VALUES (${type}, ${JSON.stringify(current.rows[0].data)})
        `;
      }
      
      // Update or insert config
      await sql`
        INSERT INTO configs (id, type, data, updated_at)
        VALUES (${type}, ${type}, ${JSON.stringify(validated)}, CURRENT_TIMESTAMP)
        ON CONFLICT (id) 
        DO UPDATE SET 
          data = EXCLUDED.data,
          updated_at = EXCLUDED.updated_at
      `;
      
      console.log(`PostgreSQL: Successfully saved config for ${type}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`PostgreSQL: Error setting config for ${type}:`, error);
      throw new Error(`Failed to save configuration: ${errorMessage}`);
    }
  }
  
  /**
   * Get configuration history
   */
  async getConfigHistory(type: ConfigType): Promise<ConfigHistory[]> {
    try {
      const result = await sql`
        SELECT id, config_type, data, created_at
        FROM config_history
        WHERE config_type = ${type}
        ORDER BY created_at DESC
        LIMIT 10
      `;
      
      return result.rows.map((row) => ({
        id: Number(row.id),
        config_type: String(row.config_type),
        data: row.data,
        created_at: new Date(row.created_at as string | Date).toISOString(),
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
      const result = await sql`
        SELECT type, data FROM configs
      `;
      
      const configs: Record<string, unknown> = {};
      for (const row of result.rows) {
        configs[row.type] = row.data;
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
      
      for (const [type, config] of Object.entries(data.configs)) {
        if (type in DEFAULT_CONFIGS) {
          const schema = getSchema(type as ConfigType);
          // Validate before importing
          const validated = schema.parse(config);
          
          await sql`
            INSERT INTO configs (id, type, data, updated_at)
            VALUES (${type}, ${type}, ${JSON.stringify(validated)}, CURRENT_TIMESTAMP)
            ON CONFLICT (id) 
            DO UPDATE SET 
              data = EXCLUDED.data,
              updated_at = EXCLUDED.updated_at
          `;
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error importing configs:', error);
      throw new Error(`Failed to import configurations: ${errorMessage}`);
    }
  }
  
  /**
   * Close database connection (no-op for PostgreSQL)
   */
  close(): void {
    // PostgreSQL connections are managed by the driver
  }
}

// Singleton instance
let configManager: ConfigManager | null = null;

export function getConfigManager(): ConfigManager {
  if (!configManager) {
    configManager = new ConfigManager();
  }
  return configManager;
} 