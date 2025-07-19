import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const beatsPath = join(process.cwd(), 'public', 'beats');
    const files = await readdir(beatsPath);
    
    // Filter for audio files
    const audioFiles = files.filter(file => 
      file.toLowerCase().endsWith('.mp3') || 
      file.toLowerCase().endsWith('.wav') || 
      file.toLowerCase().endsWith('.ogg') ||
      file.toLowerCase().endsWith('.m4a')
    );
    
    return NextResponse.json({ 
      success: true, 
      files: audioFiles.map(file => `/beats/${file}`)
    });
  } catch (error) {
    console.error('Error reading beats directory:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Could not read beats directory',
      files: []
    });
  }
} 