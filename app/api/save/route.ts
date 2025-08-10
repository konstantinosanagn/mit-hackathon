import { NextRequest, NextResponse } from 'next/server';

declare global {
  var activeSandbox: any;
  var sandboxData: any;
}

export async function POST(request: NextRequest) {
  try {
    const { path, content } = await request.json();
    
    if (!path) {
      return NextResponse.json(
        {
          success: false,
          error: 'Path parameter is required',
        },
        { status: 400 }
      );
    }
    
    if (content === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content parameter is required',
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

    console.log(`[save] Saving file: ${path}`);

    // Use the sandbox to save the file
    const result = await global.activeSandbox.runCode(`
import os

def save_file(file_path, content):
    try:
        # Change to the app directory first
        os.chdir('/home/user/app')
        
        # Resolve the target path
        if file_path.startswith('/'):
            file_path = file_path[1:]
        
        # Ensure we're not going outside the app directory
        if file_path.startswith('..'):
            return {"error": "Access denied"}
        
        # Create directory if it doesn't exist
        dir_path = os.path.dirname(file_path)
        if dir_path and not os.path.exists(dir_path):
            os.makedirs(dir_path, exist_ok=True)
        
        full_path = os.path.join('/home/user/app', file_path)
        
        # Write file content
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return {
            "success": True,
            "path": file_path,
            "size": len(content)
        }
        
    except Exception as e:
        return {"error": str(e)}

result = save_file('${path}', '''${content.replace(/'/g, "\\'")}''')
print(result)
    `);

    const output = result.logs.stdout.join('\n');
    
    try {
      // Try to parse the output
      let data;
      if (output.startsWith('{') && output.endsWith('}')) {
        data = eval(output);
      } else {
        data = { success: true, path, size: content.length };
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
        path: data.path || path,
        size: data.size || content.length,
        message: 'File saved successfully',
      });
    } catch (parseError) {
      // If parsing fails, assume success
      return NextResponse.json({
        success: true,
        path: path,
        size: content.length,
        message: 'File saved successfully',
      });
    }
  } catch (error) {
    console.error('[save] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
