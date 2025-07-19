import Link from 'next/link';
import { ArrowLeft, CheckSquare, Clock, Target, TrendingUp, Palette } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: '/admin', label: 'Overview', icon: TrendingUp },
    { href: '/admin/checklist', label: 'Checklist', icon: CheckSquare },
    { href: '/admin/rhythm', label: 'Operating Rhythm', icon: Clock },
    { href: '/admin/actions', label: 'Action Logger', icon: Target },
    { href: '/admin/scoring', label: 'Scoring System', icon: TrendingUp },
    { href: '/admin/appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <Link 
            href="/"
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-xl font-bold text-card-foreground mt-4">
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your app configuration
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-muted-foreground hover:text-card-foreground hover:bg-accent transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <p>X God Tracker Admin</p>
            <p>Version 1.0</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Configuration Management</h2>
              <p className="text-muted-foreground">
                Modify app settings and data without code changes
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 