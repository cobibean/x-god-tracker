'use client';

import { useConfig } from '@/lib/config-context';
import Link from 'next/link';
import { CheckSquare, Clock, Target, TrendingUp, Settings, AlertCircle, Download, Upload } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminOverview() {
  const { configs, loading, error } = useConfig();
  const [exporting, setExporting] = useState(false);

  const configStats = [
    {
      title: 'Daily Checklist',
      href: '/admin/checklist',
      icon: CheckSquare,
      count: configs.checklist?.tasks?.filter(t => t.enabled).length || 0,
      total: configs.checklist?.tasks?.length || 0,
      description: 'Active tasks configured',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Operating Rhythm',
      href: '/admin/rhythm',
      icon: Clock,
      count: configs.rhythm?.blocks?.filter(b => b.enabled).length || 0,
      total: configs.rhythm?.blocks?.length || 0,
      description: 'Timer blocks configured',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Action Logger',
      href: '/admin/actions',
      icon: Target,
      count: configs.actions?.actions?.filter(a => a.enabled).length || 0,
      total: configs.actions?.actions?.length || 0,
      description: 'Action types configured',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Scoring System',
      href: '/admin/scoring',
      icon: TrendingUp,
      count: Object.keys(configs.scoring?.rules || {}).length,
      total: 5, // Fixed number of scoring rules
      description: 'Scoring rules configured',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const exportConfig = async () => {
    try {
      setExporting(true);
      const response = await fetch('/api/config/export');
      
      if (!response.ok) {
        throw new Error('Failed to export configuration');
      }
      
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `xgod-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Configuration exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export configuration');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-card-foreground">Overview</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage your X God Tracker configuration
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <span className="text-destructive font-medium">Configuration Error</span>
          </div>
          <p className="text-destructive/80 mt-1">{error}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={exportConfig}
            disabled={exporting}
            className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Exporting...' : 'Export Config'}</span>
          </button>
          
          <Link
            href="/admin/backup"
            className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground border border-border rounded-md hover:bg-accent transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import Config</span>
          </Link>
          
          <Link
            href="/"
            className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground border border-border rounded-md hover:bg-accent transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>View Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Configuration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {configStats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="group bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-card-foreground">
                  {stat.count}
                  <span className="text-lg text-muted-foreground">/{stat.total}</span>
                </div>
              </div>
            </div>
            
            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {stat.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {stat.description}
            </p>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${stat.color.replace('text-', 'bg-')}`}
                  style={{ width: `${stat.total > 0 ? (stat.count / stat.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">System Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Configuration System</span>
            <span className="flex items-center space-x-2 text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Real-time Updates</span>
            <span className="flex items-center space-x-2 text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Active</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Database</span>
            <span className="flex items-center space-x-2 text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 