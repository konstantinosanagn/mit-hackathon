#!/usr/bin/env node

/**
 * Script to fix all ESLint issues automatically
 * Run with: node scripts/fix-eslint-issues.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Comprehensive fixes for all ESLint issues
const fixes = [
  // API Routes - Remove unused imports and variables
  {
    file: 'app/api/apply-ai-code-stream/route.ts',
    fixes: [
      {
        pattern: /} catch \(e\) {/g,
        replacement: '} catch {'
      }
    ]
  },
  {
    file: 'app/api/create-ai-sandbox/route.ts',
    fixes: [
      {
        pattern: /} catch \(error\) {/g,
        replacement: '} catch {'
      }
    ]
  },
  {
    file: 'app/api/create-zip/route.ts',
    fixes: [
      {
        pattern: /import.*request.*from.*'next\/server'/g,
        replacement: '// import { request } from \'next/server\'; // Unused import'
      },
      {
        pattern: /const result = .*;/g,
        replacement: '// const result = ...; // Unused variable'
      }
    ]
  },
  {
    file: 'app/api/detect-and-install-packages/route.ts',
    fixes: [
      {
        pattern: /const parts = .*;/g,
        replacement: '// const parts = ...; // Unused variable'
      }
    ]
  },
  {
    file: 'app/api/generate-ai-code-stream/route.ts',
    fixes: [
      {
        pattern: /const fileContent = .*;/g,
        replacement: '// const fileContent = ...; // Unused variable'
      }
    ]
  },
  {
    file: 'app/api/get-sandbox-files/route.ts',
    fixes: [
      {
        pattern: /import.*SandboxState.*from.*'@\/types\/sandbox'/g,
        replacement: '// import { SandboxState } from \'@/types/sandbox\'; // Unused import'
      },
      {
        pattern: /const componentRef = .*;/g,
        replacement: '// const componentRef = ...; // Unused variable'
      }
    ]
  },
  {
    file: 'app/api/install-packages/route.ts',
    fixes: [
      {
        pattern: /const packageList = .*;/g,
        replacement: '// const packageList = ...; // Unused variable'
      }
    ]
  },
  {
    file: 'app/api/run-command/route.ts',
    fixes: [
      {
        pattern: /import.*Sandbox.*from.*'@\/types\/sandbox'/g,
        replacement: '// import { Sandbox } from \'@/types/sandbox\'; // Unused import'
      }
    ]
  },
  {
    file: 'app/api/sandbox-logs/route.ts',
    fixes: [
      {
        pattern: /import.*request.*from.*'next\/server'/g,
        replacement: '// import { request } from \'next/server\'; // Unused import'
      }
    ]
  },
  {
    file: 'app/api/scrape-url-enhanced/route.ts',
    fixes: [
      {
        pattern: /const html = .*;/g,
        replacement: '// const html = ...; // Unused variable'
      }
    ]
  },
  
  // Components - Remove unused variables and imports
  {
    file: 'components/ChatPanel.tsx',
    fixes: [
      {
        pattern: /const ChatMessageComponent = memo\(\(\{ message, index \}: \{ message: ChatMessage; index: number \}\) => {/g,
        replacement: 'const ChatMessageComponent = memo(({ message }: { message: ChatMessage; index: number }) => {'
      }
    ]
  },
  {
    file: 'components/HMRErrorDetector.tsx',
    fixes: [
      {
        pattern: /} catch \(error\) {/g,
        replacement: '} catch {'
      }
    ]
  },
  {
    file: 'components/HomeScreen.tsx',
    fixes: [
      {
        pattern: /const \{ homeUrlInput, homeContextInput, .* \} = props;/g,
        replacement: 'const { /* homeUrlInput, homeContextInput, */ ...props } = props;'
      }
    ]
  },
  
  // Lib files - Remove unused variables
  {
    file: 'lib/edit-intent-analyzer.ts',
    fixes: [
      {
        pattern: /const fileInfo = .*;/g,
        replacement: '// const fileInfo = ...; // Unused variable'
      },
      {
        pattern: /const lowerPrompt = .*;/g,
        replacement: '// const lowerPrompt = ...; // Unused variable'
      },
      {
        pattern: /function resolveImportPath.*{/g,
        replacement: '// function resolveImportPath(...) { // Unused function'
      }
    ]
  },
  {
    file: 'lib/file-parser.ts',
    fixes: [
      {
        pattern: /const path = .*;/g,
        replacement: '// const path = ...; // Unused variable'
      }
    ]
  },
  {
    file: 'lib/file-search-executor.ts',
    fixes: [
      {
        pattern: /} catch \(e\) {/g,
        replacement: '} catch {'
      }
    ]
  }
];

// Workspace page - Remove unused destructured variables
const workspaceFixes = [
  'sandboxFiles',
  'fileStructure', 
  'updateStatus',
  'log',
  'displayStructure',
  'fetchSandboxFiles',
  'restartViteServer',
  'clearChatHistory',
  'setCodeApplicationState',
  'codeDisplayRef',
  'showHomeScreen',
  'setShowHomeScreen',
  'homeScreenFading',
  'setHomeScreenFading',
  'homeUrlInput',
  'homeContextInput',
  'showStyleSelector',
  'setShowStyleSelector',
  'selectedStyle',
  'showLoadingBackground',
  'setShowLoadingBackground',
  'setIsCapturingScreenshot',
  'closeHomeScreen',
  'clearHomeScreenStates',
  'expandedFolders',
  'setExpandedFolders',
  'selectedFile',
  'setSelectedFile',
  'toggleFolder',
  'handleFileClick',
  'getFileIcon',
  'handleNewProjectClick'
];

function fixFile(filePath, fileFixes) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    fileFixes.forEach(fix => {
      if (fix.pattern.test(content)) {
        content = content.replace(fix.pattern, fix.replacement);
        modified = true;
        console.log(`✅ Fixed pattern in ${filePath}`);
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

function fixWorkspacePage() {
  try {
    const filePath = 'app/workspace/page.tsx';
    const fullPath = path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Find the useSandbox destructuring
    const useSandboxMatch = content.match(/const \{([^}]+)\} = useSandbox\(\);/);
    if (useSandboxMatch) {
      const variables = useSandboxMatch[1].split(',').map(v => v.trim());
      const usedVars = variables.filter(v => !workspaceFixes.includes(v));
      const newDestructuring = `const {${usedVars.join(', ')}} = useSandbox();`;
      
      content = content.replace(useSandboxMatch[0], newDestructuring);
      modified = true;
      console.log(`✅ Fixed useSandbox destructuring in ${filePath}`);
    }

    // Find the useHomeScreen destructuring
    const useHomeScreenMatch = content.match(/const \{([^}]+)\} = useHomeScreen\(\);/);
    if (useHomeScreenMatch) {
      const variables = useHomeScreenMatch[1].split(',').map(v => v.trim());
      const usedVars = variables.filter(v => !workspaceFixes.includes(v));
      const newDestructuring = `const {${usedVars.join(', ')}} = useHomeScreen();`;
      
      content = content.replace(useHomeScreenMatch[0], newDestructuring);
      modified = true;
      console.log(`✅ Fixed useHomeScreen destructuring in ${filePath}`);
    }

    // Find the useFileExplorer destructuring
    const useFileExplorerMatch = content.match(/const \{([^}]+)\} = useFileExplorer\(\);/);
    if (useFileExplorerMatch) {
      const variables = useFileExplorerMatch[1].split(',').map(v => v.trim());
      const usedVars = variables.filter(v => !workspaceFixes.includes(v));
      const newDestructuring = `const {${usedVars.join(', ')}} = useFileExplorer();`;
      
      content = content.replace(useFileExplorerMatch[0], newDestructuring);
      modified = true;
      console.log(`✅ Fixed useFileExplorer destructuring in ${filePath}`);
    }

    // Remove unused function
    content = content.replace(/const handleNewProjectClick = .*?};/gs, '// const handleNewProjectClick = ...; // Unused function');

    // Remove unused style parameter
    content = content.replace(/const handleModelChange = \(model: string, style: string\) => {/g, 'const handleModelChange = (model: string) => {');

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing workspace page:`, error.message);
  }
}

function main() {
  console.log('🔧 Fixing all ESLint issues...\n');

  // Apply general fixes
  fixes.forEach(({ file, fixes: fileFixes }) => {
    fixFile(file, fileFixes);
  });

  // Fix workspace page specifically
  fixWorkspacePage();

  console.log('\n✨ Done! Run "npm run lint" to check remaining issues.');
  console.log('💡 Some hook dependency issues may need manual review.');
}

// Run the script if called directly
main();
