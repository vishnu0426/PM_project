import React, { useState, useEffect } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Icon from '../../AppIcon';
import MeetingTypeSelector from './MeetingTypeSelector';
import AttendeeSelector from './AttendeeSelector';
import CalendarIntegration from './CalendarIntegration';

const MeetingScheduler = ({ projectData, tasks, organizationMembers }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMeetings, setActiveMeetings] = useState([]);
  const [schedulingMeeting, setSchedulingMeeting] = useState(null);
  const [meetingForm, setMeetingForm] = useState({
    type: 'kickoff',
    title: '',
    description: '',
    duration: 60,
    attendees: [],
    date: '',
    time: '',
    agenda: [],
    recurring: false,
    recurringPattern: 'weekly'
  });

  const meetingTypes = [
    {
      id: 'kickoff',
      name: 'Project Kickoff',
      icon: 'Rocket',
      color: 'bg-green-500',
      defaultDuration: 90,
      description: 'Initial project planning and team alignment',
      suggestedAgenda: [
        'Project overview and objectives',
        'Team introductions and roles',
        'Timeline and milestones review',
        'Communication protocols',
        'Next steps and action items'
      ]
    },
    {
      id: 'standup',
      name: 'Daily Standup',
      icon: 'Users',
      color: 'bg-blue-500',
      defaultDuration: 15,
      description: 'Quick daily sync on progress and blockers',
      suggestedAgenda: [
        'What did you accomplish yesterday?',
        'What will you work on today?',
        'Any blockers or impediments?'
      ]
    },
    {
      id: 'sprint-review',
      name: 'Sprint Review',
      icon: 'Eye',
      color: 'bg-purple-500',
      defaultDuration: 60,
      description: 'Review completed work and gather feedback',
      suggestedAgenda: [
        'Demo completed features',
        'Review sprint goals achievement',
        'Stakeholder feedback',
        'Retrospective discussion'
      ]
    },
    {
      id: 'planning',
      name: 'Sprint Planning',
      icon: 'Calendar',
      color: 'bg-orange-500',
      defaultDuration: 120,
      description: 'Plan upcoming sprint tasks and commitments',
      suggestedAgenda: [
        'Review product backlog',
        'Estimate task complexity',
        'Assign tasks to team members',
        'Define sprint goals'
      ]
    },
    {
      id: 'retrospective',
      name: 'Retrospective',
      icon: 'RotateCcw',
      color: 'bg-indigo-500',
      defaultDuration: 60,
      description: 'Reflect on process and identify improvements',
      suggestedAgenda: [
        'What went well?',
        'What could be improved?',
        'Action items for next sprint',
        'Process adjustments'
      ]
    },
    {
      id: 'custom',
      name: 'Custom Meeting',
      icon: 'Settings',
      color: 'bg-gray-500',
      defaultDuration: 60,
      description: 'Custom meeting for specific project needs',
      suggestedAgenda: []
    }
  ];

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' }
  ];

  const recurringOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  useEffect(() => {
    // Load existing meetings for this project
    loadProjectMeetings();
  }, [projectData.id]);

  const loadProjectMeetings = async () => {
    try {
      // This would fetch from your API
      const meetings = [
        {
          id: 'meeting-1',
          type: 'kickoff',
          title: 'Project Kickoff Meeting',
          date: '2024-01-15',
          time: '10:00',
          duration: 90,
          attendees: ['john-doe', 'jane-smith'],
          status: 'scheduled',
          meetingUrl: 'https://meet.google.com/abc-defg-hij'
        }
      ];
      setActiveMeetings(meetings);
    } catch (error) {
      console.error('Failed to load meetings:', error);
    }
  };

  const handleMeetingTypeSelect = (type) => {
    const meetingType = meetingTypes.find(mt => mt.id === type);
    setMeetingForm(prev => ({
      ...prev,
      type: type,
      title: meetingType.name,
      duration: meetingType.defaultDuration,
      agenda: meetingType.suggestedAgenda.map(item => ({ text: item, completed: false }))
    }));
  };

  const handleQuickSchedule = async (type) => {
    const meetingType = meetingTypes.find(mt => mt.id === type);
    const now = new Date();
    const defaultDate = now.toISOString().split('T')[0];
    const defaultTime = `${String(now.getHours() + 1).padStart(2, '0')}:00`;

    const quickMeeting = {
      type: type,
      title: `${projectData.name} - ${meetingType.name}`,
      description: meetingType.description,
      duration: meetingType.defaultDuration,
      attendees: organizationMembers.map(m => m.id),
      date: defaultDate,
      time: defaultTime,
      agenda: meetingType.suggestedAgenda.map(item => ({ text: item, completed: false }))
    };

    try {
      const meeting = await scheduleMeeting(quickMeeting);
      setActiveMeetings(prev => [...prev, meeting]);
      
      // Send notifications
      await sendMeetingNotifications(meeting);
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    }
  };

  const handleStartInstantMeeting = async (type) => {
    try {
      const meetingType = meetingTypes.find(mt => mt.id === type);
      const instantMeeting = {
        type: 'instant',
        title: `Instant ${meetingType.name}`,
        duration: meetingType.defaultDuration,
        attendees: organizationMembers.map(m => m.id),
        startTime: new Date().toISOString()
      };

      const meetingUrl = await createInstantMeeting(instantMeeting);
      
      // Send instant notifications
      await sendInstantMeetingNotifications(meetingUrl, instantMeeting);
      
      // Open meeting in new tab
      window.open(meetingUrl, '_blank');
    } catch (error) {
      console.error('Failed to start instant meeting:', error);
    }
  };

  const scheduleMeeting = async (meetingData) => {
    // This would integrate with your calendar API
    const meeting = {
      id: `meeting-${Date.now()}`,
      ...meetingData,
      status: 'scheduled',
      meetingUrl: await generateMeetingUrl(meetingData),
      createdAt: new Date().toISOString()
    };

    // Save to database
    await saveMeetingToDatabase(meeting);
    
    return meeting;
  };

  const generateMeetingUrl = async (meetingData) => {
    // This would integrate with video conferencing APIs
    // For demo purposes, returning a mock URL
    return `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`;
  };

  const createInstantMeeting = async (meetingData) => {
    // Create instant meeting room
    return await generateMeetingUrl(meetingData);
  };

  const sendMeetingNotifications = async (meeting) => {
    // Send email notifications with calendar invites
    const notifications = meeting.attendees.map(attendeeId => ({
      type: 'meeting_scheduled',
      recipient: attendeeId,
      meeting: meeting,
      calendarInvite: generateCalendarInvite(meeting)
    }));

    await Promise.all(notifications.map(sendNotification));
  };

  const sendInstantMeetingNotifications = async (meetingUrl, meeting) => {
    // Send instant push notifications
    const notifications = meeting.attendees.map(attendeeId => ({
      type: 'instant_meeting',
      recipient: attendeeId,
      meetingUrl: meetingUrl,
      meeting: meeting
    }));

    await Promise.all(notifications.map(sendInstantNotification));
  };

  const generateCalendarInvite = (meeting) => {
    // Generate .ics file content
    const startDate = new Date(`${meeting.date}T${meeting.time}`);
    const endDate = new Date(startDate.getTime() + meeting.duration * 60000);
    
    return {
      title: meeting.title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      description: meeting.description,
      location: meeting.meetingUrl,
      attendees: meeting.attendees
    };
  };

  const sendNotification = async (notification) => {
    // Implementation for sending notifications
    console.log('Sending notification:', notification);
  };

  const sendInstantNotification = async (notification) => {
    // Implementation for instant notifications
    console.log('Sending instant notification:', notification);
  };

  const saveMeetingToDatabase = async (meeting) => {
    // Save meeting to database
    console.log('Saving meeting to database:', meeting);
  };

  const getUpcomingMeetings = () => {
    const now = new Date();
    return activeMeetings.filter(meeting => {
      const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
      return meetingDate > now;
    }).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
  };

  const upcomingMeetings = getUpcomingMeetings();

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      {/* Enhanced Header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 rounded-t-2xl transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
              <Icon name="Calendar" size={20} className="text-white" />
            </div>
            {upcomingMeetings.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-xs font-bold text-white">{upcomingMeetings.length}</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Meeting Scheduler
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Icon name="Users" size={12} />
              {upcomingMeetings.length} upcoming meeting{upcomingMeetings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className={`p-2 rounded-xl transition-all duration-200 ${isExpanded ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}>
          <Icon
            name={isExpanded ? "ChevronUp" : "ChevronDown"}
            size={20}
            className="transition-transform duration-200"
          />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
            
            {/* Instant Meeting */}
            <Button
              onClick={() => handleStartInstantMeeting('standup')}
              className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
              iconName="Video"
            >
              Start Instant Meeting
            </Button>

            {/* Quick Schedule Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleQuickSchedule('kickoff')}
                iconName="Rocket"
                className="text-sm"
              >
                Schedule Kickoff
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickSchedule('planning')}
                iconName="Calendar"
                className="text-sm"
              >
                Planning Meeting
              </Button>
            </div>
          </div>

          {/* Upcoming Meetings */}
          {upcomingMeetings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Upcoming Meetings</h4>
              <div className="space-y-2">
                {upcomingMeetings.slice(0, 3).map(meeting => (
                  <div key={meeting.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-blue-900">{meeting.title}</h5>
                        <p className="text-sm text-blue-700">
                          {meeting.date} at {meeting.time} ({meeting.duration}min)
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => window.open(meeting.meetingUrl, '_blank')}
                        iconName="ExternalLink"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meeting Type Selector */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Schedule New Meeting</h4>
            <MeetingTypeSelector
              meetingTypes={meetingTypes}
              onSelect={handleMeetingTypeSelect}
              onQuickSchedule={handleQuickSchedule}
              onInstantMeeting={handleStartInstantMeeting}
            />
          </div>

          {/* Custom Meeting Form */}
          {schedulingMeeting && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Meeting Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Meeting Title"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter meeting title..."
                />
                
                <Select
                  label="Duration"
                  value={meetingForm.duration}
                  onChange={(value) => setMeetingForm(prev => ({ ...prev, duration: value }))}
                  options={durationOptions}
                />
                
                <Input
                  label="Date"
                  type="date"
                  value={meetingForm.date}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, date: e.target.value }))}
                />
                
                <Input
                  label="Time"
                  type="time"
                  value={meetingForm.time}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>

              <div className="mt-4">
                <AttendeeSelector
                  organizationMembers={organizationMembers}
                  selectedAttendees={meetingForm.attendees}
                  onAttendeesChange={(attendees) => setMeetingForm(prev => ({ ...prev, attendees }))}
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setSchedulingMeeting(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleQuickSchedule(meetingForm.type)}
                  iconName="Calendar"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Schedule Meeting
                </Button>
              </div>
            </div>
          )}

          {/* Calendar Integration */}
          <CalendarIntegration projectData={projectData} />
        </div>
      )}
    </div>
  );
};

export default MeetingScheduler;
