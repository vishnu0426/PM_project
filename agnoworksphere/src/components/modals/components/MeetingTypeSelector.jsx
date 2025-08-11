import React from 'react';
import Button from '../../ui/Button';
import Icon from '../../AppIcon';

const MeetingTypeSelector = ({ meetingTypes, onSelect, onQuickSchedule, onInstantMeeting }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {meetingTypes.map(type => (
        <div
          key={type.id}
          className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 ${type.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon name={type.icon} size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-medium text-gray-900">{type.name}</h5>
              <p className="text-xs text-gray-600 mt-1">{type.description}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <Icon name="Clock" size={12} />
                <span>{type.defaultDuration} min</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onQuickSchedule(type.id)}
              iconName="Calendar"
              className="flex-1 text-xs"
            >
              Schedule
            </Button>
            {type.id === 'standup' && (
              <Button
                size="sm"
                onClick={() => onInstantMeeting(type.id)}
                iconName="Video"
                className="bg-green-600 hover:bg-green-700 text-white text-xs"
              >
                Start Now
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MeetingTypeSelector;
