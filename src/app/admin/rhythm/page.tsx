'use client';

import { useState, useEffect } from 'react';
import { useAdminConfig } from '@/lib/config-context';
import { RhythmBlock } from '@/lib/config-schemas';
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
  Clock,
  RotateCcw,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SortableBlockProps {
  block: RhythmBlock;
  onEdit: (block: RhythmBlock) => void;
  onDelete: (blockId: string) => void;
  onToggleEnabled: (blockId: string) => void;
}

function SortableBlock({ block, onEdit, onDelete, onToggleEnabled }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center space-x-3 p-4 rounded-lg border transition-all ${
        block.enabled 
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

      {/* Block Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{block.emoji}</span>
          <div>
            <span className={`font-medium ${block.enabled ? 'text-card-foreground' : 'text-muted-foreground'}`}>
              {block.name}
            </span>
            <div className="text-sm text-muted-foreground">
              {block.duration} minutes • Order: {block.order}
            </div>
          </div>
        </div>
      </div>

      {/* Duration Display */}
      <div className="text-right">
        <div className={`text-lg font-mono font-bold ${block.enabled ? 'text-primary' : 'text-muted-foreground'}`}>
          {block.duration}m
        </div>
        <div className="text-xs text-muted-foreground">duration</div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggleEnabled(block.id)}
          className={`p-1.5 rounded-md transition-colors ${
            block.enabled 
              ? 'text-green-500 hover:bg-green-500/10' 
              : 'text-muted-foreground hover:bg-accent'
          }`}
          title={block.enabled ? 'Hide block' : 'Show block'}
        >
          {block.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        
        <button
          onClick={() => onEdit(block)}
          className="p-1.5 rounded-md text-blue-500 hover:bg-blue-500/10 transition-colors"
          title="Edit block"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onDelete(block.id)}
          className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete block"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface BlockFormProps {
  block?: RhythmBlock;
  onSave: (block: Partial<RhythmBlock>) => void;
  onCancel: () => void;
}

function BlockForm({ block, onSave, onCancel }: BlockFormProps) {
  const [formData, setFormData] = useState({
    name: block?.name || '',
    duration: block?.duration || 15,
    emoji: block?.emoji || '⏰',
    enabled: block?.enabled ?? true,
  });

  const commonEmojis = ['⏰', '🔥', '⚓', '⚡', '🏃', '☀️', '💬', '📝', '🎯', '✨', '🚀', '💪', '🧠', '📊'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Block name is required');
      return;
    }
    if (formData.duration < 1 || formData.duration > 180) {
      toast.error('Duration must be between 1 and 180 minutes');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-1">
            Block Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-card-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Enter block name..."
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-card-foreground mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-card-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            min="1"
            max="180"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-card-foreground mb-2">
          Emoji
        </label>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={formData.emoji}
            onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
            className="w-20 px-3 py-2 border border-border rounded-md bg-background text-card-foreground text-center text-xl focus:ring-2 focus:ring-primary focus:border-primary"
            maxLength={4}
          />
          <span className="text-sm text-muted-foreground">or choose:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {commonEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, emoji }))}
              className={`p-2 text-xl rounded-md border transition-colors hover:bg-accent ${
                formData.emoji === emoji ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
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
          Block enabled
        </label>
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{block ? 'Update' : 'Create'} Block</span>
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

export default function OperatingRhythmAdmin() {
  const { config, saveConfig, loading, error } = useAdminConfig('rhythm');
  const [blocks, setBlocks] = useState<RhythmBlock[]>([]);
  const [editingBlock, setEditingBlock] = useState<RhythmBlock | null>(null);
  const [showNewBlockForm, setShowNewBlockForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize local state from config
  useEffect(() => {
    if (config && 'blocks' in config) {
      setBlocks([...config.blocks].sort((a, b) => a.order - b.order));
    }
  }, [config]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const success = await saveConfig({
        blocks,
      });
      
      if (success) {
        toast.success('Operating rhythm configuration saved!');
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
      setBlocks((items) => {
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

  const handleCreateBlock = (blockData: Partial<RhythmBlock>) => {
    const newBlock: RhythmBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: blockData.name!,
      duration: blockData.duration!,
      emoji: blockData.emoji!,
      order: blocks.length,
      enabled: blockData.enabled ?? true,
    };
    
    setBlocks(prev => [...prev, newBlock]);
    setShowNewBlockForm(false);
    toast.success('Timer block created!');
  };

  const handleUpdateBlock = (blockData: Partial<RhythmBlock>) => {
    if (!editingBlock) return;
    
    setBlocks(prev => prev.map(block => 
      block.id === editingBlock.id 
        ? { ...block, ...blockData }
        : block
    ));
    setEditingBlock(null);
    toast.success('Timer block updated!');
  };

  const handleDeleteBlock = (blockId: string) => {
    if (confirm('Are you sure you want to delete this timer block?')) {
      setBlocks(prev => prev.filter(block => block.id !== blockId));
      toast.success('Timer block deleted!');
    }
  };

  const handleToggleEnabled = (blockId: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, enabled: !block.enabled }
        : block
    ));
  };

  const handleResetToDefaults = async () => {
    if (confirm('Are you sure you want to reset to default timer blocks? This will remove all custom blocks.')) {
      try {
        const response = await fetch('/api/config/rhythm', { method: 'DELETE' });
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

  const getTotalDuration = () => {
    return blocks.filter(b => b.enabled).reduce((sum, block) => sum + block.duration, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading operating rhythm configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Operating Rhythm</h1>
          <p className="text-muted-foreground mt-2">
            Manage your daily execution timer blocks. Drag to reorder blocks.
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
          <div className="text-2xl font-bold text-card-foreground">{blocks.length}</div>
          <div className="text-sm text-muted-foreground">Total Blocks</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-500">{blocks.filter(b => b.enabled).length}</div>
          <div className="text-sm text-muted-foreground">Active Blocks</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">{getTotalDuration()}</div>
          <div className="text-sm text-muted-foreground">Total Minutes</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-500">{Math.round(getTotalDuration() / 60 * 10) / 10}</div>
          <div className="text-sm text-muted-foreground">Total Hours</div>
        </div>
      </div>

      {/* Timer Blocks */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-card-foreground">Timer Blocks</h2>
          <button
            onClick={() => setShowNewBlockForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Block</span>
          </button>
        </div>

        {/* New Block Form */}
        {showNewBlockForm && (
          <div className="mb-6">
            <BlockForm
              onSave={handleCreateBlock}
              onCancel={() => setShowNewBlockForm(false)}
            />
          </div>
        )}

        {/* Edit Block Form */}
        {editingBlock && (
          <div className="mb-6">
            <BlockForm
              block={editingBlock}
              onSave={handleUpdateBlock}
              onCancel={() => setEditingBlock(null)}
            />
          </div>
        )}

        {/* Block List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onEdit={setEditingBlock}
                  onDelete={handleDeleteBlock}
                  onToggleEnabled={handleToggleEnabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Empty State */}
        {blocks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No timer blocks configured</p>
              <p className="text-sm">Add your first timer block to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 