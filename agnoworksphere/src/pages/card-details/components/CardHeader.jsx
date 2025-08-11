import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CardHeader = ({ card, onTitleChange, onClose, onDelete, canEdit, canDelete, hasChanged = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);

  const handleSave = () => {
    onTitleChange(title);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(card.title);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex items-start justify-between p-8 border-b border-border/50 bg-gradient-to-r from-surface to-muted/20">
      <div className="flex items-start space-x-4 flex-1">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mt-1">
          <Icon name="Square" size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full text-2xl font-bold bg-transparent border-2 border-primary/20 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary rounded-lg px-4 py-3 transition-all"
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
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <h1
                  className={`text-2xl font-bold text-text-primary leading-tight ${canEdit ? 'cursor-pointer hover:bg-muted/50 rounded-lg px-3 py-2 -mx-3 -my-2 transition-colors' : ''}`}
                  onClick={() => canEdit && setIsEditing(true)}
                >
                  {card.title}
                </h1>
                {hasChanged && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded-md">
                    <Icon name="Edit" size={12} />
                    <span>Modified</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <Icon name="List" size={14} />
                  <span>in list <span className="font-semibold text-text-primary">{card.columnTitle}</span></span>
                </div>
                <span className="w-1 h-1 bg-text-secondary rounded-full"></span>
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={14} />
                  <span>Created {new Date(card.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 ml-6">
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 p-3"
          >
            <Icon name="Trash2" size={18} />
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onClose} className="p-3">
          <Icon name="X" size={20} />
        </Button>
      </div>
    </div>
  );
};

export default CardHeader;