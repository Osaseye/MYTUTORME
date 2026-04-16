const fs = require('fs');
const path = require('path');

function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = findFiles(path.resolve('./src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // import removal
  content = content.replace(/import\s*\{\s*useTourStore\s*\}\s*from\s+[^;]+;?\r?\n?/g, '');
  content = content.replace(/import\s*TourManager\s*from\s+[^;]+;?\r?\n?/g, '');
  
  // hook instantiations
  content = content.replace(/[ \t]*const\s+\{\s*startTour\s*\}\s*=\s*useTourStore\(\);\r?\n?/g, '');

  let beforeEffect = "";
  let previous = content;
  // Multiple replacements for useEffect because it spans multiple lines. Let's do a more robust approach.
  content = content.replace(/\s*useEffect\(\(\)\s*=>\s*\{\s*startTour\([\s\S]*?\}\s*,\s*\[startTour\]\);\r?\n?/g, '');

  content = content.replace(/\s+data-tour-target="[^"]*"/g, '');

  content = content.replace(/\s*<TourManager\s*\/>\r?\n?/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Cleaned: ' + file);
  }
});

