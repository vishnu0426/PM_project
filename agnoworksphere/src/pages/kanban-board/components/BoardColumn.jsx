import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import TaskCard from './TaskCard';

const BoardColumn = ({
  column,
  cards,
  onCardMove,
  onCardClick,
  onAddCard,
  onEditColumn,
  onDeleteColumn,
  members,
  canCreateCards = true,
  canEditColumns = true,
  canDeleteColumns = true,
  canDragCards = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);

  const [{ isOver }, drop] = useDrop({
    accept: 'card',
    drop: (item) => {
      if (item.columnId !== column.id) {
        onCardMove(item.id, item.columnId, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleTitleSave = () => {
    if (columnTitle.trim() && columnTitle !== column.title) {
      onEditColumn(column.id, { title: columnTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setColumnTitle(column.title);
      setIsEditing(false);
    }
  };

  const getColumnColor = () => {
    const colors = {
      'todo': 'border-slate-300 bg-slate-50',
      'in-progress': 'border-blue-300 bg-blue-50',
      'review': 'border-amber-300 bg-amber-50',
      'done': 'border-emerald-300 bg-emerald-50'
    };
    return colors[column.status] || 'border-slate-300 bg-slate-50';
  };

  return (
    <div
      ref={drop}
      className={`flex flex-col w-80 min-w-80 bg-surface rounded-lg border-2 transition-colors ${
        isOver ? 'border-primary bg-primary/5' : getColumnColor()
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2 flex-1">
          {isEditing ? (
            <input
              type="text"
              value={columnTitle}
              onChange={(e) => setColumnTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyPress}
              className="flex-1 px-2 py-1 text-sm font-semibold bg-transparent border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          ) : (
            <h3
              className={`text-sm font-semibold text-text-primary transition-colors ${
                canEditColumns ? 'cursor-pointer hover:text-primary' : 'cursor-default'
              }`}
              onClick={canEditColumns ? () => setIsEditing(true) : undefined}
            >
              {column.title}
            </h3>
          )}
          <span className="px-2 py-1 text-xs font-medium bg-muted text-text-secondary rounded-full">
            {cards.length}
          </span>
          {/* Debug: Show column ID type */}
          <span
            className="text-xs px-1"
            title={`Column ID: ${column.id}`}
            style={{ color: column.id.startsWith('col-') ? '#ef4444' : '#10b981' }}
          >
            {column.id.startsWith('col-') ? '🔧' : '✅'}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          {canCreateCards && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddCard(column.id)}
              className="h-6 w-6"
            >
              <Icon name="Plus" size={14} />
            </Button>
          )}
          {canDeleteColumns && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteColumn(column.id)}
              className="h-6 w-6 text-destructive hover:text-destructive"
            >
              <Icon name="Trash2" size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 p-2 space-y-2 max-h-96 overflow-y-auto">
        {cards.map((card) => (
          <TaskCard
            key={card.id}
            card={card}
            onClick={() => onCardClick(card)}
            members={members}
            canDrag={canDragCards}
          />
        ))}
        
        {cards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon name="Plus" size={24} className="text-text-secondary mb-2" />
            <p className="text-sm text-text-secondary">No cards yet</p>
            {canCreateCards && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddCard(column.id)}
                className="mt-2"
              >
                Add first card
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardColumn;