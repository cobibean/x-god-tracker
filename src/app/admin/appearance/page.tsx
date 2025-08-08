'use client';

import { useState } from 'react';
import { 
  Save, 
  Palette,
  Monitor,
  Sun,
  Moon,
  Smartphone,
  RotateCcw,
  Info,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getThemeVarsFor } from '@/lib/theme-utils';

export default function AppearanceAdmin() {
  const [theme, setTheme] = useState('system');
  const [primaryColor, setPrimaryColor] = useState('blue');
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [showInDevtoolbar, setShowInDevtoolbar] = useState(false);
  const [saving, setSaving] = useState(false);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const colors = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
    { value: 'gray', label: 'Gray', class: 'bg-gray-500' },
  ];

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // For now, just save to localStorage
      const settings = {
        theme,
        primaryColor,
        compactMode,
        animations,
        showInDevtoolbar,
      };
      
      localStorage.setItem('appearance-settings', JSON.stringify(settings));
      
      // Apply theme immediately
      applyTheme();
      // Notify provider to re-apply
      window.dispatchEvent(new Event('appearanceUpdated'));
      
      toast.success('Appearance settings saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error saving appearance settings');
    } finally {
      setSaving(false);
    }
  };

  const applyTheme = () => {
    const root = document.documentElement;
    
    // Apply theme
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDarkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    
    // Apply other settings
    // Primary color via CSS variables consumed by Tailwind
    const { primary, primaryFg } = getThemeVarsFor(primaryColor);
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--primary-foreground', primaryFg);
    
    if (compactMode) {
      root.classList.add('compact');
    } else {
      root.classList.remove('compact');
    }
    
    if (!animations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset appearance to defaults?')) {
      setTheme('system');
      setPrimaryColor('blue');
      setCompactMode(false);
      setAnimations(true);
      setShowInDevtoolbar(false);
      
      localStorage.removeItem('appearance-settings');
      applyTheme();
      window.dispatchEvent(new Event('appearanceUpdated'));
      
      toast.success('Reset to defaults successfully!');
    }
  };

  const previewChanges = () => {
    applyTheme();
    window.dispatchEvent(new Event('appearanceUpdated'));
    toast.success('Preview applied! Save to persist changes.');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Appearance</h1>
          <p className="text-muted-foreground mt-2">
            Customize the look and feel of your X God Tracker dashboard.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleResetToDefaults}
            className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground border border-border rounded-md hover:bg-accent transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>
          
          <button
            onClick={previewChanges}
            className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-md hover:bg-secondary/80 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-700 dark:text-blue-300 font-medium mb-1">Appearance Settings</p>
            <p className="text-blue-600 dark:text-blue-400 leading-relaxed">
              These settings control the visual appearance of your dashboard. Changes are applied immediately when you preview or save.
              Use &quot;System&quot; theme to automatically match your device&apos;s appearance.
            </p>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-card-foreground">Theme</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            return (
              <button
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className={`p-4 border-2 rounded-lg transition-all hover:border-primary/50 ${
                  theme === themeOption.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Icon className={`w-8 h-8 ${theme === themeOption.value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`font-medium ${theme === themeOption.value ? 'text-primary' : 'text-card-foreground'}`}>
                    {themeOption.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Color */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-card-foreground">Primary Color</h2>
        </div>
        
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => setPrimaryColor(color.value)}
              className={`relative p-3 rounded-lg transition-all hover:scale-105 ${
                primaryColor === color.value 
                  ? 'ring-2 ring-offset-2 ring-card-foreground' 
                  : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${color.class} mx-auto`}></div>
              <span className="text-xs text-muted-foreground mt-1 block">{color.label}</span>
              {primaryColor === color.value && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-card-foreground rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Interface Options */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Smartphone className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-card-foreground">Interface Options</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Compact Mode
              </label>
              <p className="text-xs text-muted-foreground">
                Reduces spacing and padding for more content density
              </p>
            </div>
            <input
              type="checkbox"
              checked={compactMode}
              onChange={(e) => setCompactMode(e.target.checked)}
              className="w-4 h-4 rounded border-border focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Enable Animations
              </label>
              <p className="text-xs text-muted-foreground">
                Smooth transitions and hover effects throughout the interface
              </p>
            </div>
            <input
              type="checkbox"
              checked={animations}
              onChange={(e) => setAnimations(e.target.checked)}
              className="w-4 h-4 rounded border-border focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">
                Show in Dev Toolbar
              </label>
              <p className="text-xs text-muted-foreground">
                Display appearance controls in the development toolbar
              </p>
            </div>
            <input
              type="checkbox"
              checked={showInDevtoolbar}
              onChange={(e) => setShowInDevtoolbar(e.target.checked)}
              className="w-4 h-4 rounded border-border focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Preview</h2>
        
        <div className="space-y-4 p-4 border border-border rounded-lg bg-background">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-card-foreground">Sample Card</h3>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
              Badge
            </span>
          </div>
          
          <p className="text-muted-foreground text-sm">
            This is how your content will look with the current appearance settings.
          </p>
          
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors">
              Primary Button
            </button>
            <button className="px-3 py-1.5 bg-muted text-muted-foreground rounded text-sm hover:bg-accent transition-colors">
              Secondary Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 