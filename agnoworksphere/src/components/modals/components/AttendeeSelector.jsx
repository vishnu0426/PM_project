import React, { useState } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Icon from '../../AppIcon';

const AttendeeSelector = ({ organizationMembers, selectedAttendees, onAttendeesChange }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = organizationMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAttendeeToggle = (memberId) => {
    const newAttendees = selectedAttendees.includes(memberId)
      ? selectedAttendees.filter(id => id !== memberId)
      : [...selectedAttendees, memberId];
    onAttendeesChange(newAttendees);
  };

  const handleSelectAll = () => {
    onAttendeesChange(organizationMembers.map(m => m.id));
  };

  const handleSelectNone = () => {
    onAttendeesChange([]);
  };

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'text-purple-600 bg-purple-50';
      case 'admin':
        return 'text-blue-600 bg-blue-50';
      case 'developer':
        return 'text-green-600 bg-green-50';
      case 'designer':
        return 'text-pink-600 bg-pink-50';
      case 'pm':
      case 'project manager':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Meeting Attendees</label>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSelectAll}
            className="text-xs text-blue-600"
          >
            Select All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSelectNone}
            className="text-xs text-gray-600"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Search */}
      <Input
        type="text"
        placeholder="Search team members..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        iconName="Search"
        size="sm"
      />

      {/* Selected Count */}
      {selectedAttendees.length > 0 && (
        <div className="text-sm text-gray-600">
          {selectedAttendees.length} attendee{selectedAttendees.length !== 1 ? 's' : ''} selected
        </div>
      )}

      {/* Members List */}
      <div className="max-h-48 overflow-y-auto space-y-2">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            {searchQuery ? 'No members found' : 'No team members available'}
          </div>
        ) : (
          filteredMembers.map(member => {
            const isSelected = selectedAttendees.includes(member.id);
            return (
              <div
                key={member.id}
                className={`
                  p-3 border rounded-lg cursor-pointer transition-colors
                  ${isSelected 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                  }
                `}
                onClick={() => handleAttendeeToggle(member.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by parent click
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{member.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                    {member.email && (
                      <p className="text-sm text-gray-600 truncate">{member.email}</p>
                    )}
                  </div>
                  
                  {/* Availability Indicator */}
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-xs text-gray-500">
                      {member.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Select Options */}
      <div className="pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600 mb-2">Quick select:</div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const developers = organizationMembers
                .filter(m => m.role.toLowerCase().includes('developer'))
                .map(m => m.id);
              onAttendeesChange([...new Set([...selectedAttendees, ...developers])]);
            }}
            className="text-xs"
          >
            + All Developers
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const managers = organizationMembers
                .filter(m => m.role.toLowerCase().includes('manager') || m.role.toLowerCase().includes('pm'))
                .map(m => m.id);
              onAttendeesChange([...new Set([...selectedAttendees, ...managers])]);
            }}
            className="text-xs"
          >
            + All Managers
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const designers = organizationMembers
                .filter(m => m.role.toLowerCase().includes('designer'))
                .map(m => m.id);
              onAttendeesChange([...new Set([...selectedAttendees, ...designers])]);
            }}
            className="text-xs"
          >
            + All Designers
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendeeSelector;
