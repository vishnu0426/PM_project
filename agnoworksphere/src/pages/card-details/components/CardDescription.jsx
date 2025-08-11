import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CardDescription = ({ card, onDescriptionChange, canEdit, hasChanged = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(card.description || '');

  const handleSave = () => {
    onDescriptionChange(description);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDescription(card.description || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-surface/50 rounded-xl p-6 border border-border/30 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="AlignLeft" size={16} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Description</h3>
        </div>
        {hasChanged && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded-md">
            <Icon name="Edit" size={12} />
            <span>Modified</span>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a more detailed description..."
            className="w-full min-h-[140px] p-4 border-2 border-border/30 rounded-lg resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-surface"
            autoFocus
          />
          <div className="flex items-center space-x-3">
            <Button size="sm" onClick={handleSave} className="px-6">
              <Icon name="Check" size={16} className="mr-2" />
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel} className="px-6">
              <Icon name="X" size={16} className="mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="pl-2">
          {card.description ? (
            <div
              className={`text-text-primary whitespace-pre-wrap leading-relaxed ${canEdit ? 'cursor-pointer hover:bg-muted/50 rounded-lg p-3 -m-3 transition-colors' : ''}`}
              onClick={() => canEdit && setIsEditing(true)}
            >
              {card.description}
            </div>
          ) : (
            <div
              className={`text-text-secondary italic py-8 text-center border-2 border-dashed border-border/30 rounded-lg ${canEdit ? 'cursor-pointer hover:bg-muted/30 hover:border-primary/30 transition-colors' : ''}`}
              onClick={() => canEdit && setIsEditing(true)}
            >
              <Icon name="Plus" size={20} className="mx-auto mb-2 text-text-secondary" />
              <p>Add a more detailed description...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardDescription;