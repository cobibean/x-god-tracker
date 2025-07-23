import { NextRequest, NextResponse } from 'next/server';
import { getConfigManager } from '@/lib/db';
import { ConfigTypeSchema, getSchema } from '@/lib/config-schemas';
import { broadcastConfigChange } from '../stream/broadcaster';

interface RouteParams {
  params: Promise<{
    type: string;
  }>;
}

// GET /api/config/[type] - Get configuration
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Await params in Next.js 15+
    const { type } = await params;
    
    console.log(`GET /api/config/${type} - Request received`);
    console.log('Environment check:', {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      nodeEnv: process.env.NODE_ENV
    });
    
    // Validate config type
    const typeResult = ConfigTypeSchema.safeParse(type);
    if (!typeResult.success) {
      console.error(`Invalid config type: ${type}`, typeResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid configuration type',
          validationErrors: typeResult.error.flatten().formErrors 
        },
        { status: 400 }
      );
    }

    const configType = typeResult.data;
    const schema = getSchema(configType);
    
    console.log(`Attempting to get ConfigManager...`);
    const configManager = getConfigManager();
    console.log(`ConfigManager obtained successfully`);

    const config = await configManager.getConfig(configType, schema as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    
    console.log(`GET /api/config/${type} - Success`);
    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('GET /api/config Error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/config/[type] - Update configuration
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Await params in Next.js 15+
    const { type } = await params;
    
    console.log(`POST /api/config/${type} - Request received`);
    console.log('Environment check:', {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      nodeEnv: process.env.NODE_ENV
    });
    
    // Validate config type
    const typeResult = ConfigTypeSchema.safeParse(type);
    if (!typeResult.success) {
      console.error(`Invalid config type: ${type}`, typeResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid configuration type',
          validationErrors: typeResult.error.flatten().formErrors 
        },
        { status: 400 }
      );
    }

    const configType = typeResult.data;
    const schema = getSchema(configType);

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log(`POST /api/config/${type} - Body parsed:`, JSON.stringify(body).substring(0, 200) + '...');
    } catch (e) {
      console.error(`Failed to parse JSON body:`, e);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body' 
        },
        { status: 400 }
      );
    }

    // Validate configuration data
    const validationResult = schema.safeParse(body);
    if (!validationResult.success) {
      console.error(`Validation failed for ${type}:`, validationResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Configuration validation failed',
          validationErrors: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    
    console.log(`Attempting to get ConfigManager for save...`);
    const configManager = getConfigManager();
    console.log(`ConfigManager obtained successfully for save`);

    // Save configuration
    await configManager.setConfig(configType, validatedData, schema as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    console.log(`POST /api/config/${type} - Saved successfully`);

    // Broadcast change via Server-Sent Events
    await broadcastConfigChange(configType, validatedData);

    return NextResponse.json({
      success: true,
      data: validatedData,
    });
  } catch (error) {
    console.error('POST /api/config Error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to update configuration: ${errorMessage}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/config/[type] - Update configuration (alias for POST)
export async function PUT(request: NextRequest, params: RouteParams) {
  return POST(request, params);
}

// DELETE /api/config/[type] - Reset to defaults
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Await params in Next.js 15+
    const { type } = await params;
    
    // Validate config type
    const typeResult = ConfigTypeSchema.safeParse(type);
    if (!typeResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid configuration type',
          validationErrors: typeResult.error.flatten().formErrors 
        },
        { status: 400 }
      );
    }

    const configType = typeResult.data;
    const configManager = getConfigManager();

    // Reset to defaults
    await configManager.resetToDefaults(configType);

    // Get the default config to return and broadcast
    const schema = getSchema(configType);
    const defaultConfig = await configManager.getConfig(configType, schema as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    // Broadcast change via Server-Sent Events
    await broadcastConfigChange(configType, defaultConfig);

    return NextResponse.json({
      success: true,
      data: defaultConfig,
      message: 'Configuration reset to defaults',
    });
  } catch (error) {
    console.error('Error resetting config:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to reset configuration: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
} 