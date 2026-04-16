const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles('./src').filter(f => f.endsWith('.ts') || f.endsWith('.tsx')).filter(f => !f.includes('Tour') && !f.includes('tourStore'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Remove data-tour-target
    content = content.replace(/\s?data-tour-target="[^"]+"/g, '');
    
    // Remove useTourStore import
    content = content.replace(/import\s+\{?[^}]*useTourStore[^}]*\}?\s+from\s+['"][^'"]+tourStore['"];?\r?\n?/g, '');
    
    // Remove const { startTour } = useTourStore()
    content = content.replace(/const\s+\{\s*startTour\s*\}\s*=\s*useTourStore\(\);\r?\n?/g, '');
    
    // Remove useEffect calling startTour
    content = content.replace(/useEffect\(\(\)\s*=>\s*\{[\s\S]*?startTour\([\s\S]*?\},?\s*\[startTour\]\);\r?\n?/g, '');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
