// Rename component files with consistent lowercase naming
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Components to rename
const componentsToRename = [
  { src: 'AnimatedContainer.tsx', dest: 'animatedcontainer.tsx' },
  { src: 'AnimatedPieChart.tsx', dest: 'animatedpiechart.tsx' },
  { src: 'TransactionsList.tsx', dest: 'transactionslist.tsx' }
];

// UI Components directory
const uiComponentsDir = path.join(__dirname, 'src', 'components', 'ui');

try {
  // First, let's make sure we won't have case conflicts by forcefully removing any lowercase versions
  componentsToRename.forEach(({ src, dest }) => {
    const srcPath = path.join(uiComponentsDir, src);
    const destPath = path.join(uiComponentsDir, dest);
    
    // Delete any existing lowercase versions first to avoid conflicts
    const lowercaseVersion = path.join(uiComponentsDir, src.toLowerCase());
    if (fs.existsSync(lowercaseVersion) && lowercaseVersion !== srcPath) {
      console.log(`Removing lowercase duplicate: ${lowercaseVersion}`);
      fs.unlinkSync(lowercaseVersion);
    }
    
    if (fs.existsSync(srcPath)) {
      console.log(`Renaming ${src} to ${dest}`);
      // On case-insensitive file systems, we need to use a temporary name first
      const tempName = `${src}-temp-${Date.now()}.tsx`;
      const tempPath = path.join(uiComponentsDir, tempName);
      
      // Two-step rename to work on case-insensitive file systems
      fs.renameSync(srcPath, tempPath);
      fs.renameSync(tempPath, destPath);
    } else {
      console.log(`Warning: Source file ${src} not found`);
    }
  });
  
  // Update imports in all TSX/TS files in the components directory
  const componentsDir = path.join(__dirname, 'src', 'components');
  
  function updateImportsInDir(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(directory, file.name);
      
      if (file.isDirectory()) {
        // Recursively check subdirectories
        updateImportsInDir(filePath);
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        // Update imports in TSX/TS files
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Replace imports for each component
        componentsToRename.forEach(({ src, dest }) => {
          const componentName = src.replace('.tsx', '');
          const destName = dest.replace('.tsx', '');
          
          // Fix imports with ./ui/ComponentName path
          const regex1 = new RegExp(`from ['"]\\.\\/ui\\/${componentName}['"]`, 'g');
          if (regex1.test(content)) {
            content = content.replace(regex1, `from './ui/${destName}'`);
            modified = true;
          }
          
          // Fix imports with ./ComponentName path (within ui directory)
          const regex2 = new RegExp(`from ['"]\\.\\/AnimatedContainer['"]`, 'g');
          if (regex2.test(content)) {
            content = content.replace(regex2, `from './animatedcontainer'`);
            modified = true;
          }
          
          // Fix imports with ./ComponentName path (within ui directory)
          const regex3 = new RegExp(`from ['"]\\.\\/AnimatedPieChart['"]`, 'g');
          if (regex3.test(content)) {
            content = content.replace(regex3, `from './animatedpiechart'`);
            modified = true;
          }
          
          // Fix imports with ./ComponentName path (within ui directory)
          const regex4 = new RegExp(`from ['"]\\.\\/TransactionsList['"]`, 'g');
          if (regex4.test(content)) {
            content = content.replace(regex4, `from './transactionslist'`);
            modified = true;
          }
        });
        
        if (modified) {
          console.log(`Updated imports in ${filePath}`);
          fs.writeFileSync(filePath, content, 'utf8');
        }
      }
    }
  }
  
  // Run the import updater on the components directory
  updateImportsInDir(componentsDir);
  
  console.log('Component renaming completed successfully!');
} catch (error) {
  console.error('Error renaming components:', error);
  process.exit(1);
}
