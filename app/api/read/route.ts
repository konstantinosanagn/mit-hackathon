import { NextRequest, NextResponse } from 'next/server';

declare global {
  var activeSandbox: any;
  var sandboxData: any;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json(
        {
          success: false,
          error: 'Path parameter is required',
        },
        { status: 400 }
      );
    }
    
    if (!global.activeSandbox) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active sandbox',
        },
        { status: 400 }
      );
    }

    console.log(`[read] Reading file: ${path}`);

    // Use the sandbox to read the file
    const result = await global.activeSandbox.runCode(`
import os

def read_file(file_path):
    try:
        # Change to the app directory first
        os.chdir('/home/user/app')
        
        # Resolve the target path
        if file_path.startswith('/'):
            file_path = file_path[1:]
        
        # Ensure we're not going outside the app directory
        if file_path.startswith('..'):
            return {"error": "Access denied"}
        
        full_path = os.path.join('/home/user/app', file_path)
        
        # Check if file exists
        if not os.path.exists(full_path):
            return {"error": "File not found"}
        
        # Check if it's a file (not directory)
        if not os.path.isfile(full_path):
            return {"error": "Path is not a file"}
        
        # Read file content
        with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        return {
            "content": content,
            "path": file_path,
            "size": len(content)
        }
        
    except Exception as e:
        return {"error": str(e)}

result = read_file('${path}')
print(result)
    `);

    const output = result.logs.stdout.join('\n');
    
    try {
      // Try to parse the output (it might be a string representation of a dict)
      let data;
      if (output.startsWith('{') && output.endsWith('}')) {
        // It's a dict string, try to evaluate it safely
        data = eval(output);
      } else {
        // It's just the content
        data = { content: output };
      }
      
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
        content: data.content || output,
        path: data.path || path,
        size: data.size || output.length,
      });
    } catch (parseError) {
      // If parsing fails, return the raw output as content
      return NextResponse.json({
        success: true,
        content: output,
        path: path,
        size: output.length,
      });
    }
  } catch (error) {
    console.error('[read] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
