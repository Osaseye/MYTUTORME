const fs = require('fs');
const glob = require('glob');

const files = fs.readdirSync('src', { recursive: true })
    .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
    .map(f => 'src/' + f)
    .filter(f => !f.includes('Tour') && !f.includes('tourStore'));

let updated = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Remove data-tour-target
    content = content.replace(/\s?data-tour-target="[^"]+"/g, '');
    
    // Remove useTourStore import
    content = content.replace(/^import\s+\{([^}]+useTourStore[^}]+)\}\s+from\s+['"][^'"]+['"];\n?/gm, '');
    
    // Remove const { startTour } = useTourStore()
    content = content.replace(/^\s*const\s+\{\s*startTour\s*\}\s*=\s*useTourStore\(\);\n?/gm, '');
    
    // Remove useEffect calling startTour with steps declaration
    content = content.replace(/\s*useEffect\(\(\)\s*=>\s*\{[\s\S]*?startTour\([^)]+\);[\s\S]*?\},?\s*\[startTour\]\);\n?/g, '');
    
    // Some pages just have startTour call without steps array inside the effect
    content = content.replace(/\s*useEffect\(\(\)\s*=>\s*\{[\s\S]*?startTour\(['"][^'"]+['"]\);[\s\S]*?\},?\s*\[startTour\]\);\n?/g, '');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
        updated++;
    }
});
