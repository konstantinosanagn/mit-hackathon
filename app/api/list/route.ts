import { NextRequest, NextResponse } from 'next/server';

declare global {
  var activeSandbox: any;
  var sandboxData: any;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '.';
    
    if (!global.activeSandbox) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active sandbox',
        },
        { status: 400 }
      );
    }

    console.log(`[list] Listing files in path: ${path}`);

    // Use the sandbox to list files
    const result = await global.activeSandbox.runCode(`
import os
import json

def list_directory(path):
    try:
        # Change to the app directory first
        os.chdir('/home/user/app')
        
        # Resolve the target path
        if path == '.' or path == '':
            target_path = '.'
        else:
            target_path = path.lstrip('/')
        
        # Ensure we're not going outside the app directory
        if target_path.startswith('..'):
            return {"error": "Access denied"}
        
        # List directory contents
        entries = os.listdir(target_path)
        
        files = []
        folders = []
        
        for entry in entries:
            entry_path = os.path.join(target_path, entry)
            full_path = os.path.join('/home/user/app', entry_path)
            
            if os.path.isdir(full_path):
                folders.append({
                    "name": entry,
                    "path": entry_path,
                    "type": "folder"
                })
            else:
                # Get file stats
                stat = os.stat(full_path)
                files.append({
                    "name": entry,
                    "path": entry_path,
                    "type": "file",
                    "size": stat.st_size,
                    "lastModified": stat.st_mtime
                })
        
        # Sort folders first, then files
        folders.sort(key=lambda x: x["name"].lower())
        files.sort(key=lambda x: x["name"].lower())
        
        return {
            "files": files,
            "folders": folders,
            "path": target_path
        }
        
    except Exception as e:
        return {"error": str(e)}

result = list_directory('${path}')
print(json.dumps(result))
    `);

    const output = result.logs.stdout.join('\n');
    
    try {
      // Try to parse the JSON output
      const data = JSON.parse(output);
      
      if (data.error) {
        return NextResponse.json(
          {
            success: false,
            error: data.error,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        files: data.files || [],
        folders: data.folders || [],
        path: data.path,
      });
    } catch (parseError) {
      // If JSON parsing fails, return the raw output
      return NextResponse.json({
        success: true,
        files: [],
        folders: [],
        path: path,
        rawOutput: output,
      });
    }
  } catch (error) {
    console.error('[list] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
