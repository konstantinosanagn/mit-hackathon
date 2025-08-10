#!/usr/bin/env node

/**
 * Script to fix common ESLint issues
 * Run with: node scripts/fix-common-issues.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files with unused imports that can be safely removed
const filesToFix = [
  {
    file: 'app/page.tsx',
    fixes: [
      // Remove unused destructured variables
      {
        pattern: /const \{[^}]*setShowHomeScreen[^}]*\} = useHomeScreen\(\);/,
        replacement: (match) => {
          // Remove unused variables from destructuring
          const cleaned = match
            .replace(/,\s*setShowHomeScreen/g, '')
            .replace(/,\s*setHomeScreenFading/g, '')
            .replace(/,\s*setHomeUrlInput/g, '')
            .replace(/,\s*setHomeContextInput/g, '')
            .replace(/,\s*showStyleSelector/g, '')
            .replace(/,\s*setShowStyleSelector/g, '')
            .replace(/,\s*setSelectedStyle/g, '')
            .replace(/,\s*showLoadingBackground/g, '')
            .replace(/,\s*setShowLoadingBackground/g, '')
            .replace(/,\s*urlScreenshot/g, '')
            .replace(/,\s*setUrlScreenshot/g, '')
            .replace(/,\s*isCapturingScreenshot/g, '')
            .replace(/,\s*setIsCapturingScreenshot/g, '')
            .replace(/,\s*screenshotError/g, '')
            .replace(/,\s*setScreenshotError/g, '')
            .replace(/,\s*isPreparingDesign/g, '')
            .replace(/,\s*setIsPreparingDesign/g, '')
            .replace(/,\s*targetUrl/g, '')
            .replace(/,\s*setTargetUrl/g, '')
            .replace(/,\s*loadingStage/g, '')
            .replace(/,\s*setLoadingStage/g, '')
            .replace(/,\s*captureUrlScreenshot/g, '')
            .replace(/,\s*clearHomeScreenStates/g, '');
          return cleaned;
        }
      }
    ]
  },
  {
    file: 'components/ChatPanel.tsx',
    fixes: [
      // Remove unused imports
      {
        pattern: /import \{ motion \} from 'framer-motion';/,
        replacement: '// import { motion } from \'framer-motion\'; // Unused import'
      },
      {
        pattern: /import \{ Textarea \} from '@\/components\/ui\/textarea';/,
        replacement: '// import { Textarea } from \'@/components/ui/textarea\'; // Unused import'
      },
      {
        pattern: /import \{ Prism as SyntaxHighlighter \} from 'react-syntax-highlighter';/,
        replacement: '// import { Prism as SyntaxHighlighter } from \'react-syntax-highlighter\'; // Unused import'
      },
      {
        pattern: /import \{ vscDarkPlus \} from 'react-syntax-highlighter\/dist\/esm\/styles\/prism';/,
        replacement: '// import { vscDarkPlus } from \'react-syntax-highlighter/dist/esm/styles/prism\'; // Unused import'
      }
    ]
  }
];

function fixFile(filePath, fixes) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    fixes.forEach(fix => {
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

function main() {
  console.log('🔧 Fixing common ESLint issues...\n');

  filesToFix.forEach(({ file, fixes }) => {
    fixFile(file, fixes);
  });

  console.log('\n✨ Done! Run "npm run lint" to check remaining issues.');
  console.log('💡 Some issues may need manual review, especially hook dependencies.');
}

// Run the script if called directly
main();
