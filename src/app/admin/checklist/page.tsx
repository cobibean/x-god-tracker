'use client';

import { useState, useEffect } from 'react';
import { useAdminConfig } from '@/lib/config-context';
import { ChecklistTask, Category } from '@/lib/config-schemas';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  GripVertical,
  Eye,
  EyeOff,
  Palette,
  RotateCcw,
  Download,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import { HexColorPicker } from 'react-colorful';

interface SortableTaskProps {
  task: ChecklistTask;
  categories: Record<string, Category>;
  onEdit: (task: ChecklistTask) => void;
  onDelete: (taskId: string) => void;
  onToggleEnabled: (taskId: string) => void;
}

function SortableTask({ task, categories, onEdit, onDelete, onToggleEnabled }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const category = categories[task.category];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center space-x-3 p-4 rounded-lg border transition-all ${
        task.enabled 
          ? 'border-border bg-card hover:border-primary/50' 
          : 'border-border/50 bg-muted/30 opacity-60'
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-card-foreground"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${task.enabled ? 'text-card-foreground' : 'text-muted-foreground'}`}>
            {task.text}
          </span>
          {category && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${category.bgColor} text-${category.color} border border-${category.color}/20`}>
              {category.name}
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Order: {task.order} • Category: {task.category}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggleEnabled(task.id)}
          className={`p-1.5 rounded-md transition-colors ${
            task.enabled 
              ? 'text-green-500 hover:bg-green-500/10' 
              : 'text-muted-foreground hover:bg-accent'
          }`}
          title={task.enabled ? 'Hide task' : 'Show task'}
        >
          {task.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-md text-blue-500 hover:bg-blue-500/10 transition-colors"
          title="Edit task"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface TaskFormProps {
  task?: ChecklistTask;
  categories: Record<string, Category>;
  onSave: (task: Partial<ChecklistTask>) => void;
  onCancel: () => void;
}

function TaskForm({ task, categories, onSave, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    text: task?.text || '',
    category: task?.category || Object.keys(categories)[0] || '',
    enabled: task?.enabled ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      toast.error('Task text is required');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <div>
        <label className="block text-sm font-medium text-card-foreground mb-1">
          Task Text
        </label>
        <input
          type="text"
          value={formData.text}
          onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-card-foreground focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="Enter task description..."
          maxLength={200}
        />
        <div className="text-xs text-muted-foreground mt-1">
          {formData.text.length}/200 characters
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-card-foreground mb-1">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-card-foreground focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {Object.entries(categories).map(([key, category]) => (
            <option key={key} value={key}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="enabled"
          checked={formData.enabled}
          onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
          className="rounded border-border focus:ring-2 focus:ring-primary"
        />
        <label htmlFor="enabled" className="text-sm text-card-foreground">
          Task enabled
        </label>
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{task ? 'Update' : 'Create'} Task</span>
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-accent transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>
    </form>
  );
}

interface CategoryManagerProps {
  categories: Record<string, Category>;
  onUpdateCategories: (categories: Record<string, Category>) => void;
}

function CategoryManager({ categories, onUpdateCategories }: CategoryManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ key: string; category: Category } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const tailwindColors = [
    'blue-500', 'green-500', 'yellow-500', 'red-500', 'purple-500',
    'pink-500', 'indigo-500', 'cyan-500', 'orange-500', 'emerald-500',
    'slate-500', 'gray-500', 'zinc-500', 'stone-500', 'amber-500'
  ];

  const handleUpdateCategory = (key: string, updates: Partial<Category>) => {
    const updatedCategories = {
      ...categories,
      [key]: { ...categories[key], ...updates }
    };
    onUpdateCategories(updatedCategories);
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">Categories</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 transition-colors"
          >
            <Palette className="w-4 h-4" />
            <span>Manage Categories</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(categories).map(([key, category]) => (
            <div key={key} className="flex items-center space-x-2 p-2 border border-border rounded-md">
              <div className={`w-3 h-3 rounded-full bg-${category.color}`}></div>
              <span className="text-sm text-card-foreground">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">Manage Categories</h3>
        <button
          onClick={() => setIsEditing(false)}
          className="flex items-center space-x-2 px-3 py-1.5 bg-muted text-muted-foreground border border-border rounded-md hover:bg-accent transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Done</span>
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(categories).map(([key, category]) => (
          <div key={key} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
            <div className={`w-4 h-4 rounded-full bg-${category.color} border border-${category.color}/20`}></div>
            
            <input
              type="text"
              value={category.name}
              onChange={(e) => handleUpdateCategory(key, { name: e.target.value })}
              className="flex-1 px-2 py-1 border border-border rounded bg-background text-card-foreground text-sm focus:ring-1 focus:ring-primary focus:border-primary"
              maxLength={50}
            />

            <div className="relative">
              <button
                onClick={() => setShowColorPicker(showColorPicker === key ? null : key)}
                className={`p-2 rounded-md border border-${category.color}/20 bg-${category.color}/10 hover:bg-${category.color}/20 transition-colors`}
              >
                <Palette className={`w-4 h-4 text-${category.color}`} />
              </button>
              
              {showColorPicker === key && (
                <div className="absolute top-full right-0 mt-1 p-2 bg-card border border-border rounded-lg shadow-lg z-10">
                  <div className="grid grid-cols-5 gap-1">
                    {tailwindColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          handleUpdateCategory(key, { 
                            color: color,
                            bgColor: `${color.split('-')[0]}-${color.split('-')[1]}/5`
                          });
                          setShowColorPicker(null);
                        }}
                        className={`w-6 h-6 rounded border-2 bg-${color} ${
                          category.color === color ? 'border-card-foreground' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChecklistAdmin() {
  const { config, saveConfig, loading, error } = useAdminConfig('checklist');
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [editingTask, setEditingTask] = useState<ChecklistTask | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize local state from config
  useEffect(() => {
    if (config && 'tasks' in config && 'categories' in config) {
      setTasks([...config.tasks].sort((a, b) => a.order - b.order));
      setCategories(config.categories);
    }
  }, [config]);

  // Auto-save changes
  const handleSave = async () => {
    try {
      setSaving(true);
      const success = await saveConfig({
        tasks,
        categories,
      });
      
      if (success) {
        toast.success('Checklist configuration saved!');
      } else {
        toast.error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update order values
        return newItems.map((item, index) => ({
          ...item,
          order: index,
        }));
      });
    }
  };

  const handleCreateTask = (taskData: Partial<ChecklistTask>) => {
    const newTask: ChecklistTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: taskData.text!,
      category: taskData.category!,
      order: tasks.length,
      enabled: taskData.enabled ?? true,
    };
    
    setTasks(prev => [...prev, newTask]);
    setShowNewTaskForm(false);
    toast.success('Task created!');
  };

  const handleUpdateTask = (taskData: Partial<ChecklistTask>) => {
    if (!editingTask) return;
    
    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? { ...task, ...taskData }
        : task
    ));
    setEditingTask(null);
    toast.success('Task updated!');
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted!');
    }
  };

  const handleToggleEnabled = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, enabled: !task.enabled }
        : task
    ));
  };

  const handleResetToDefaults = async () => {
    if (confirm('Are you sure you want to reset to default tasks? This will remove all custom tasks.')) {
      try {
        const response = await fetch('/api/config/checklist', { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
          toast.success('Reset to defaults successfully!');
        } else {
          toast.error('Failed to reset configuration');
        }
      } catch (error) {
        console.error('Reset error:', error);
        toast.error('Error resetting configuration');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading checklist configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Daily Checklist</h1>
          <p className="text-muted-foreground mt-2">
            Manage your daily tasks and categories. Drag to reorder tasks.
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
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-card-foreground">{tasks.length}</div>
          <div className="text-sm text-muted-foreground">Total Tasks</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-500">{tasks.filter(t => t.enabled).length}</div>
          <div className="text-sm text-muted-foreground">Active Tasks</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-muted-foreground">{tasks.filter(t => !t.enabled).length}</div>
          <div className="text-sm text-muted-foreground">Hidden Tasks</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-500">{Object.keys(categories).length}</div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
      </div>

      {/* Categories Management */}
      <div className="bg-card border border-border rounded-lg p-6">
        <CategoryManager 
          categories={categories}
          onUpdateCategories={setCategories}
        />
      </div>

      {/* Add New Task */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-card-foreground">Tasks</h2>
          <button
            onClick={() => setShowNewTaskForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        {/* New Task Form */}
        {showNewTaskForm && (
          <div className="mb-6">
            <TaskForm
              categories={categories}
              onSave={handleCreateTask}
              onCancel={() => setShowNewTaskForm(false)}
            />
          </div>
        )}

        {/* Edit Task Form */}
        {editingTask && (
          <div className="mb-6">
            <TaskForm
              task={editingTask}
              categories={categories}
              onSave={handleUpdateTask}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        )}

        {/* Task List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {tasks.map((task) => (
                <SortableTask
                  key={task.id}
                  task={task}
                  categories={categories}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                  onToggleEnabled={handleToggleEnabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No tasks configured</p>
              <p className="text-sm">Add your first task to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 