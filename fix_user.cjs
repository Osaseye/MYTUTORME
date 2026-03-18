const fs = require('fs');
const path = 'src/features/admin/pages/UserManagementPage.tsx';

let content = fs.readFileSync(path, 'utf8');

// Replace standard sections with empty state
content = content.replace(
  /<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">[\s\S]*?<\/div>$/,
  `<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Empty State */}
                <div className="lg:col-span-3">
                    <Card className="flex flex-col items-center justify-center p-12 text-center text-slate-500 min-h-[400px]">
                        <span className="material-symbols-outlined text-5xl mb-4 text-slate-300">group_off</span>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No users found</h3>
                        <p className="text-sm max-w-sm">No applications are currently pending review, and there are no users matching your criteria.</p>
                    </Card>
                </div>
            </div>
        </div>
    );
};`
);

fs.writeFileSync(path, content);
console.log('Fixed UserManagementPage.tsx');
