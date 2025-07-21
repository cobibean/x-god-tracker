import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';

export default function PlaybookPage() {
    let markdown = '';
    let error = '';

    try {
        // Path to playbook file in project root
        const filePath = path.join(process.cwd(), 'distribution_relationship_playbook.md');
        
        // Check if file exists first to avoid throwing during static generation
        if (fs.existsSync(filePath)) {
            markdown = fs.readFileSync(filePath, 'utf-8');
        } else {
            error = 'Playbook file not found. Please ensure distribution_relationship_playbook.md exists in the project root.';
        }
    } catch (err) {
        error = 'Could not load the playbook file. Please ensure distribution_relationship_playbook.md exists in the project root.';
        console.warn('Playbook loading error:', err);
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-destructive mb-4">Playbook Not Found</h1>
                    <p className="text-muted-foreground">{error}</p>
                    <p className="text-sm text-muted-foreground mt-4">
                        Expected location: <code>./distribution_relationship_playbook.md</code>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12">
            <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
        </div>
    );
} 