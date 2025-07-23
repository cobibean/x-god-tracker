import { NextRequest, NextResponse } from 'next/server';
import { getConfigManager } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Health check requested');
    
    const healthCheck = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      postgresUrlPreview: process.env.POSTGRES_URL ? `${process.env.POSTGRES_URL.substring(0, 20)}...` : 'Not set',
      configManager: 'Not tested'
    };
    
    // Test ConfigManager initialization
    try {
      console.log('Testing ConfigManager initialization...');
      const configManager = getConfigManager();
      healthCheck.configManager = 'OK';
      console.log('ConfigManager test passed');
    } catch (error) {
      console.error('ConfigManager test failed:', error);
      healthCheck.configManager = `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return NextResponse.json({
      success: true,
      health: healthCheck
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 