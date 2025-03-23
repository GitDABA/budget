// netlify-prebuild.js - Fix case sensitivity issues for Netlify deployment
const fs = require('fs');
const path = require('path');

// Components that need lowercase versions for import statements
const componentsToFix = [
  // List of specific components that are causing issues
  { src: 'Button.tsx', dest: 'button.tsx' },
  { src: 'AnimatedContainer.tsx', dest: 'animatedcontainer.tsx' },
  { src: 'AnimatedPieChart.tsx', dest: 'animatedpiechart.tsx' },
  { src: 'TransactionsList.tsx', dest: 'transactionslist.tsx' },
  { src: 'Skeleton.tsx', dest: 'skeleton.tsx' }
];

// UI Components directory
const uiComponentsDir = path.join(__dirname, 'src', 'components', 'ui');
const componentsDir = path.join(__dirname, 'src', 'components');

// Create lowercase versions of the components
try {
  // Step 1: Create lowercase versions of files
  componentsToFix.forEach(({ src, dest }) => {
    const srcPath = path.join(uiComponentsDir, src);
    const destPath = path.join(uiComponentsDir, dest);
    
    // Check if source file exists and destination doesn't already exist
    if (fs.existsSync(srcPath)) {
      // If the destination already exists with the exact same name (macOS case-insensitive)
      // just log that we're skipping it
      if (src.toLowerCase() === dest.toLowerCase() && fs.existsSync(destPath)) {
        console.log(`Skipping ${src} as ${dest} already exists (case-insensitive filesystem)`);
        return;
      }
      
      console.log(`Creating ${dest} from ${src}`);
      fs.copyFileSync(srcPath, destPath);
    } else {
      console.log(`Warning: Source file ${src} not found`);
    }
  });
  
  // Step 2: Fix imports in all TSX/TS files in the components directory
  function fixImportsInDir(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(directory, file.name);
      
      if (file.isDirectory()) {
        // Recursively check subdirectories
        fixImportsInDir(filePath);
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        // Fix imports in TSX/TS files
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Replace imports for each component
        componentsToFix.forEach(({ src, dest }) => {
          const componentName = src.replace('.tsx', '');
          const destName = dest.replace('.tsx', '');
          
          // Fix imports with ./ui/ComponentName path
          const regex1 = new RegExp(`from ['"]\.\/ui\/${componentName}['"]`, 'g');
          if (regex1.test(content)) {
            content = content.replace(regex1, `from './ui/${destName}'`);
            modified = true;
          }
          
          // Fix imports with ./ComponentName path (within ui directory)
          const regex2 = new RegExp(`from ['"]\.\/${componentName}['"]`, 'g');
          if (regex2.test(content)) {
            content = content.replace(regex2, `from './${destName}'`);
            modified = true;
          }
        });
        
        if (modified) {
          console.log(`Fixed imports in ${filePath}`);
          fs.writeFileSync(filePath, content, 'utf8');
        }
      }
    }
  }
  
  // Run the import fixer on the components directory
  fixImportsInDir(componentsDir);
  
  console.log('Prebuild script completed successfully!');
} catch (error) {
  console.error('Error in prebuild script:', error);
  process.exit(1);
}
