import React from 'react';
import { useDrag } from 'react-dnd';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TaskCard = ({ card, onClick, members, canDrag = true }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'card',
    item: { id: card.id, columnId: card.columnId },
    canDrag: canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getAssignedMembers = () => {
    return card.assignedTo?.map(memberId => 
      members.find(member => member.id === memberId)
    ).filter(Boolean) || [];
  };

  const getPriorityColor = () => {
    const colors = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-amber-600 bg-amber-100',
      low: 'text-green-600 bg-green-100'
    };
    return colors[card.priority] || 'text-slate-600 bg-slate-100';
  };

  const formatDueDate = (date) => {
    if (!date) return null;
    const dueDate = new Date(date);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600 bg-red-100' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-amber-600 bg-amber-100' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-blue-600 bg-blue-100' };
    return { text: `Due in ${diffDays} days`, color: 'text-slate-600 bg-slate-100' };
  };

  const dueDateInfo = formatDueDate(card.dueDate);
  const assignedMembers = getAssignedMembers();
  const completedTasks = card.checklist?.filter(item => item.completed).length || 0;
  const totalTasks = card.checklist?.length || 0;

  return (
    <div
      ref={canDrag ? drag : null}
      onClick={() => onClick(card)}
      className={`bg-card border border-border rounded-lg p-3 transition-all ${
        canDrag ? 'cursor-pointer hover:shadow-elevated' : 'cursor-default'
      } ${
        isDragging ? 'opacity-50 rotate-2' : (canDrag ? 'hover:-translate-y-1' : '')
      }`}
    >
      {/* Card Header */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-text-primary line-clamp-2">
          {card.title}
        </h4>
        
        {card.description && (
          <p className="text-xs text-text-secondary line-clamp-2">
            {card.description}
          </p>
        )}
      </div>

      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {card.labels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={{ 
                backgroundColor: label.color + '20', 
                color: label.color 
              }}
            >
              {label.name}
            </span>
          ))}
          {card.labels.length > 3 && (
            <span className="px-2 py-1 text-xs font-medium bg-muted text-text-secondary rounded-full">
              +{card.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2">
          {/* Priority */}
          {card.priority && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor()}`}>
              {card.priority}
            </span>
          )}

          {/* Checklist Progress */}
          {totalTasks > 0 && (
            <div className="flex items-center space-x-1">
              <Icon name="CheckSquare" size={12} className="text-text-secondary" />
              <span className="text-xs text-text-secondary">
                {completedTasks}/{totalTasks}
              </span>
            </div>
          )}

          {/* Comments Count */}
          {card.comments && card.comments.length > 0 && (
            <div className="flex items-center space-x-1">
              <Icon name="MessageCircle" size={12} className="text-text-secondary" />
              <span className="text-xs text-text-secondary">
                {card.comments.length}
              </span>
            </div>
          )}

          {/* Attachments Count */}
          {card.attachments && card.attachments.length > 0 && (
            <div className="flex items-center space-x-1">
              <Icon name="Paperclip" size={12} className="text-text-secondary" />
              <span className="text-xs text-text-secondary">
                {card.attachments.length}
              </span>
            </div>
          )}
        </div>

        {/* Assigned Members */}
        {assignedMembers.length > 0 && (
          <div className="flex -space-x-1">
            {assignedMembers.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="w-6 h-6 rounded-full border-2 border-card bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground"
                title={member.name}
              >
                {member.avatar ? (
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  member.name.split(' ').map(n => n[0]).join('').toUpperCase()
                )}
              </div>
            ))}
            {assignedMembers.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-medium text-text-secondary">
                +{assignedMembers.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Due Date */}
      {dueDateInfo && (
        <div className="mt-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${dueDateInfo.color}`}>
            <Icon name="Calendar" size={10} className="inline mr-1" />
            {dueDateInfo.text}
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;