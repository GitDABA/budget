// netlify-prebuild.js - Fix case sensitivity issues for Netlify deployment
const fs = require('fs');
const path = require('path');

// Components that need lowercase versions for import statements
const componentsToFix = [
  // List of specific components that are causing issues
  { src: 'Button.tsx', dest: 'button.tsx' },
  { src: 'AnimatedContainer.tsx', dest: 'animatedContainer.tsx' },
  { src: 'AnimatedPieChart.tsx', dest: 'animatedPieChart.tsx' },
  { src: 'TransactionsList.tsx', dest: 'transactionsList.tsx' },
  { src: 'Skeleton.tsx', dest: 'skeleton.tsx' }
];

// UI Components directory
const uiComponentsDir = path.join(__dirname, 'src', 'components', 'ui');

// Create lowercase versions of the components
try {
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
  
  console.log('Prebuild script completed successfully!');
} catch (error) {
  console.error('Error in prebuild script:', error);
  process.exit(1);
}
