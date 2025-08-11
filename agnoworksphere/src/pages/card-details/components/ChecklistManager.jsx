import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { generateAIChecklist, getSuggestedItems } from '../../../utils/aiChecklistService';

const ChecklistManager = ({ card, onChecklistChange, canEdit, hasChanged = false }) => {
  const [newItemText, setNewItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const checklist = card.checklist || [];
  const completedCount = checklist.filter(item => item.completed).length;
  const progressPercentage = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;
  const aiGeneratedCount = checklist.filter(item => item.aiGenerated).length;

  const handleAddItem = () => {
    if (newItemText.trim()) {
      const newItem = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: newItemText.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        aiGenerated: false,
        position: checklist.length
      };
      onChecklistChange([...checklist, newItem]);
      setNewItemText('');
      setIsAddingItem(false);
    }
  };

  const handleGenerateAIChecklist = async () => {
    if (!card.title) {
      alert('Card title is required for AI checklist generation');
      return;
    }

    setIsGeneratingAI(true);

    try {
      const result = await generateAIChecklist(
        card.title,
        card.description || '',
        card.priority || 'medium',
        'general'
      );

      if (result.success && result.items.length > 0) {
        // Add AI-generated items to existing checklist
        const updatedChecklist = [...checklist, ...result.items];
        onChecklistChange(updatedChecklist);
      } else {
        alert('Failed to generate AI checklist. Please try again.');
      }
    } catch (error) {
      console.error('AI checklist generation failed:', error);
      alert('AI checklist generation failed. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddSuggestedItem = (suggestedText) => {
    const newItem = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: suggestedText,
      completed: false,
      createdAt: new Date().toISOString(),
      aiGenerated: true,
      confidence: 80,
      position: checklist.length
    };
    onChecklistChange([...checklist, newItem]);
    setShowSuggestions(false);
  };

  const handleToggleItem = (itemId) => {
    const updatedChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onChecklistChange(updatedChecklist);
  };

  const handleDeleteItem = (itemId) => {
    const updatedChecklist = checklist.filter(item => item.id !== itemId);
    onChecklistChange(updatedChecklist);
  };

  const handleEditItem = (itemId, newText) => {
    if (newText.trim()) {
      const updatedChecklist = checklist.map(item =>
        item.id === itemId ? { ...item, text: newText.trim() } : item
      );
      onChecklistChange(updatedChecklist);
    }
    setEditingItemId(null);
    setEditingText('');
  };

  const startEditing = (item) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditingText('');
  };

  const handleKeyPress = (e, action, ...args) => {
    if (e.key === 'Enter') {
      action(...args);
    } else if (e.key === 'Escape') {
      if (action === handleAddItem) {
        setIsAddingItem(false);
        setNewItemText('');
      } else {
        cancelEditing();
      }
    }
  };

  return (
    <div className="bg-surface/50 rounded-xl p-6 border border-border/30 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="CheckSquare" size={16} className="text-primary" />
          </div>
          <h4 className="text-lg font-semibold text-text-primary">Checklist</h4>
          {hasChanged && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded-md">
              <Icon name="Edit" size={12} />
              <span>Modified</span>
            </div>
          )}
          {checklist.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary bg-muted px-3 py-1 rounded-full font-medium">
                {completedCount}/{checklist.length}
              </span>
              {aiGeneratedCount > 0 && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-primary/10 rounded-full">
                  <Icon name="Zap" size={12} className="text-primary" />
                  <span className="text-sm text-primary font-medium">{aiGeneratedCount} AI</span>
                </div>
              )}
            </div>
          )}
        </div>
        {canEdit && !isAddingItem && (
          <div className="flex items-center space-x-2">
            {checklist.length === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateAIChecklist}
                disabled={isGeneratingAI}
                className="text-primary"
              >
                {isGeneratingAI ? (
                  <>
                    <Icon name="Loader2" size={14} className="animate-spin mr-1" />
                    <span className="text-xs">Generating...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Zap" size={14} className="mr-1" />
                    <span className="text-xs">AI Checklist</span>
                  </>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingItem(true)}
            >
              <Icon name="Plus" size={16} />
            </Button>
          </div>
        )}
      </div>

      {checklist.length > 0 && (
        <div className="space-y-3">
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-success to-success/80 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary font-medium">
              {Math.round(progressPercentage)}% complete
            </span>
            <span className="text-text-secondary">
              {completedCount} of {checklist.length} tasks
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {checklist.map((item) => (
          <div key={item.id} className="group flex items-start space-x-4 p-4 rounded-lg border border-border/20 hover:border-border/40 hover:bg-muted/30 transition-all">
            <button
              onClick={() => canEdit && handleToggleItem(item.id)}
              className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                item.completed
                  ? 'bg-success border-success text-white shadow-sm' :'border-border hover:border-primary hover:bg-primary/5'
              } ${!canEdit ? 'cursor-default' : 'hover:scale-105'}`}
              disabled={!canEdit}
            >
              {item.completed && <Icon name="Check" size={14} />}
            </button>

            <div className="flex-1 min-w-0">
              {editingItemId === item.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, handleEditItem, item.id, editingText)}
                    className="w-full p-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                  />
                  <div className="flex items-center space-x-2">
                    <Button size="sm" onClick={() => handleEditItem(item.id, editingText)}>
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelEditing}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-start justify-between">
                    <div
                      className={`text-sm cursor-pointer flex-1 ${
                        item.completed ? 'line-through text-text-secondary' : 'text-text-primary'
                      } ${canEdit ? 'hover:bg-muted rounded px-2 py-1 -mx-2 -my-1' : ''}`}
                      onClick={() => canEdit && startEditing(item)}
                    >
                      {item.text}
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      {item.aiGenerated && (
                        <div className="flex items-center space-x-1">
                          <Icon name="Zap" size={12} className="text-primary" />
                          {item.confidence && (
                            <span className="text-xs text-text-secondary">
                              {item.confidence}%
                            </span>
                          )}
                        </div>
                      )}
                      {canEdit && editingItemId !== item.id && (
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-destructive transition-all duration-200 p-1 rounded hover:bg-destructive/10 flex items-center justify-center"
                          title="Delete checklist item"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  {item.aiGenerated && (
                    <div className="text-xs text-text-secondary pl-2">
                      AI generated
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isAddingItem && (
          <div className="space-y-2 p-2 border border-border rounded-md">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleAddItem)}
              placeholder="Add an item..."
              className="w-full p-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={handleAddItem}>
                Add
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setIsAddingItem(false);
                  setNewItemText('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {checklist.length === 0 && !isAddingItem && (
          <div className="text-text-secondary text-sm italic">No checklist items</div>
        )}
      </div>
    </div>
  );
};

export default ChecklistManager;