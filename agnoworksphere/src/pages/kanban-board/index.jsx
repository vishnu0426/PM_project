import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import RoleBasedHeader from '../../components/ui/RoleBasedHeader';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BoardHeader from './components/BoardHeader';
import BoardColumn from './components/BoardColumn';

import AddCardModal from './components/AddCardModal';
import AddColumnModal from './components/AddColumnModal';
import InviteMemberModal from './components/InviteMemberModal';
import { useUserProfile } from '../../hooks/useUserProfile';

const KanbanBoard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { currentOrganization, userProfile } = useUserProfile();

  // User state and role
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('member');

  // Project context - get from location state or default
  const [currentProject] = useState(() => {
    const locationState = window.location.state;
    return locationState?.projectId
      ? {
          id: locationState.projectId,
          name: 'Current Project',
          memberRole: 'assigned', // This would come from API
        }
      : {
          id: 1,
          name: 'Website Redesign',
          memberRole: 'assigned', // assigned, not-assigned
        };
  });

  // Check if current user is assigned to this project
  const isUserAssignedToProject = () => {
    // For members, check if they're assigned to this specific project
    if (userRole === 'member') {
      return currentProject.memberRole === 'assigned';
    }
    // Admins and owners have access to all projects
    return ['admin', 'owner'].includes(userRole);
  };

  // Mock data
  const [board] = useState({
    id: 'board-1',
    title: 'Project Management Board',
    description: 'Main project tracking board for Q4 initiatives',
    isPrivate: false,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-28T05:54:23Z',
  });

  // Real members data - will be loaded from team service
  const [members, setMembers] = useState([]);

  // Initialize with empty columns - will be loaded from backend
  const [columns, setColumns] = useState([]);
  // Current board id (needed when creating columns)
  const [boardId, setBoardId] = useState(null);

  // Initialize with empty cards - will be loaded from backend
  const [cards, setCards] = useState(() => {
    // Try to restore cards from localStorage as fallback
    try {
      const savedCards = localStorage.getItem('kanban-cards');
      return savedCards ? JSON.parse(savedCards) : [];
    } catch (error) {
      console.error('Error loading cards from localStorage:', error);
      return [];
    }
  });

  // Modal states
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  // Load user data and role via unified profile hook
  useEffect(() => {
    if (userProfile) {
      setCurrentUser(userProfile);
      setUserRole((userProfile.role || 'member').toLowerCase());
    }
  }, [userProfile]);

  // Load boards and columns for current project, robust to navigation/reload
  useEffect(() => {
    const loadBoardsAndColumns = async () => {
      try {
        if (!isAuthenticated) {
          console.log('User not authenticated, clearing board state');
          setColumns([]);
          setBoardId(null);
          setCards([]);
          // Clear localStorage backup when not authenticated
          try {
            localStorage.removeItem('kanban-cards');
          } catch (error) {
            console.error('Error clearing localStorage:', error);
          }
          return;
        }
        
        console.log('Loading boards and columns for authenticated user');
        const apiService = (await import('../../utils/apiService')).default;
        
        // Always fetch projects for the authenticated user from backend
        console.log('Fetching projects...');
        const projects = await apiService.projects.getAll();
        console.log('Projects response:', projects);
        
        if (!projects || projects.length === 0) {
          console.log('No projects found');
          setColumns([]);
          setBoardId(null);
          setCards([]);
          return;
        }
        
        // Use first available project (or prompt user in future)
        const currentProjectId = projects[0].id;
        console.log('Using project:', currentProjectId);
        
        // Get boards for the project
        console.log('Fetching boards for project:', currentProjectId);
        const boards = await apiService.boards.getByProject(currentProjectId);
        console.log('Boards response:', boards);
        
        if (!boards || boards.length === 0) {
          console.log('No boards found for project');
          setColumns([]);
          setBoardId(null);
          setCards([]);
          return;
        }
        
        const board = boards[0];
        console.log('Using board:', board.id);
        
        // Get columns for the board
        console.log('Fetching columns for board:', board.id);
        const columnsResp = await apiService.columns.getByBoard(board.id);
        console.log('Columns response:', columnsResp);
        
        const columns = columnsResp?.data || columnsResp || [];
        setBoardId(board.id);
        
        if (columns && columns.length > 0) {
          const mappedColumns = columns.map((col) => ({
            id: col.id,
            title: col.name || col.title,
            status: col.status || 'todo',
            order: col.position || col.order || 1,
          }));
          const sortedColumns = mappedColumns.sort((a, b) => a.order - b.order);
          console.log('Setting columns:', sortedColumns);
          setColumns(sortedColumns);
        } else {
          console.log('No columns found for board');
          setColumns([]);
        }
      } catch (error) {
        console.error('Error loading boards and columns:', error);
        // Don't clear existing state on error - this prevents data loss on temporary network issues
        console.log('Keeping existing board state due to error');
      }
    };
    
    // Add a small delay to ensure authentication state is stable
    const timeoutId = setTimeout(loadBoardsAndColumns, 50);
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated]);

  // Role-based and project-based permission checks
  const canCreateCards = () => {
    if (userRole === 'viewer') return false;
    return isUserAssignedToProject();
  };

  const canEditCards = () => {
    if (userRole === 'viewer') return false;
    return isUserAssignedToProject();
  };

  const canDeleteCards = () => {
    if (userRole === 'viewer') return false;
    return isUserAssignedToProject();
  };

  const canCreateColumns = () => {
    if (userRole === 'viewer') return false;
    return isUserAssignedToProject();
  };

  const canEditColumns = () => {
    if (userRole === 'viewer') return false;
    return isUserAssignedToProject();
  };

  const canDeleteColumns = () => {
    if (userRole === 'viewer') return false;
    return isUserAssignedToProject();
  };

  const canInviteMembers = () => {
    return ['admin', 'owner'].includes(userRole);
  };

  const canDragCards = () => {
    if (userRole === 'viewer') return false;
    return isUserAssignedToProject();
  };

  // Load cards from API when columns are loaded
  useEffect(() => {
    const loadCards = async () => {
      if (columns.length === 0) {
        console.log('No columns available, skipping card loading');
        return;
      }

      console.log('Loading cards for columns:', columns);
      
      try {
        const apiService = (await import('../../utils/apiService')).default;
        let allCards = [];
        let hasErrors = false;

        // Load cards for each column with better error handling
        for (const column of columns) {
          try {
            console.log(`Fetching cards for column ${column.id} (${column.title})`);
            const result = await apiService.cards.getAll(column.id);
            console.log(`Raw API response for column ${column.id}:`, result);
            
            // Handle different response formats from backend
            let list = [];
            if (Array.isArray(result)) {
              list = result;
            } else if (result?.data && Array.isArray(result.data)) {
              list = result.data;
            } else if (result && typeof result === 'object' && result.id) {
              // Single card object returned
              list = [result];
            }
            
            console.log(`Processed card list for column ${column.id}:`, list);
            
            if (Array.isArray(list) && list.length > 0) {
              // Transform backend data to frontend format with better error handling
              const transformedCards = list.map((card) => {
                if (!card || !card.id) {
                  console.warn('Invalid card data:', card);
                  return null;
                }
                
                return {
                  id: card.id,
                  columnId: card.column_id || column.id, // Fallback to current column
                  title: card.title || 'Untitled Card',
                  description: card.description || '',
                  priority: card.priority || 'medium',
                  assignedTo: Array.isArray(card.assigned_to) ? card.assigned_to : [],
                  dueDate: card.due_date || null,
                  labels: Array.isArray(card.labels) ? card.labels : [],
                  createdAt: card.created_at || new Date().toISOString(),
                  updatedAt: card.updated_at || new Date().toISOString(),
                  checklist: Array.isArray(card.checklist) ? card.checklist : [],
                  comments: Array.isArray(card.comments) ? card.comments : [],
                  attachments: Array.isArray(card.attachments) ? card.attachments : [],
                };
              }).filter(Boolean); // Remove null entries
              
              allCards = [...allCards, ...transformedCards];
              console.log(`Added ${transformedCards.length} cards from column ${column.id}`);
            } else {
              console.log(`No cards found for column ${column.id}`);
            }
          } catch (columnError) {
            console.error(
              `Error loading cards for column ${column.id}:`,
              columnError
            );
            hasErrors = true;
            // Continue with other columns instead of failing completely
          }
        }

        console.log('Final loaded cards:', allCards);
        console.log(`Successfully loaded ${allCards.length} cards total`);
        
        // Always update the cards state, even if some columns failed
        setCards(allCards);
        
        // Save to localStorage as backup
        try {
          localStorage.setItem('kanban-cards', JSON.stringify(allCards));
        } catch (error) {
          console.error('Error saving cards to localStorage:', error);
        }
        
        if (hasErrors && allCards.length === 0) {
          console.warn('Failed to load cards from all columns, but continuing with empty state');
        }
        
      } catch (error) {
        console.error('Critical error loading cards from API:', error);
        // Don't clear existing cards on error - keep current state
        console.log('Keeping existing card state due to API error');
      }
    };

    // Add a small delay to ensure authentication is ready
    const timeoutId = setTimeout(loadCards, 100);
    return () => clearTimeout(timeoutId);
  }, [columns, isAuthenticated]); // Add isAuthenticated as dependency

  // Filter cards based on search and filters
  const filteredCards = cards.filter((card) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        card.title.toLowerCase().includes(query) ||
        card.description.toLowerCase().includes(query) ||
        card.labels?.some((label) => label.name.toLowerCase().includes(query));

      if (!matchesSearch) return false;
    }

    // Priority filter
    if (activeFilters.priority?.length > 0) {
      if (!activeFilters.priority.includes(card.priority)) return false;
    }

    // Assignee filter
    if (activeFilters.assignee?.length > 0) {
      const hasAssignee = card.assignedTo?.some((assigneeId) =>
        activeFilters.assignee.includes(assigneeId)
      );
      if (!hasAssignee) return false;
    }

    // Due date filter
    if (activeFilters.dueDate?.length > 0) {
      const today = new Date();
      const cardDueDate = card.dueDate ? new Date(card.dueDate) : null;

      const matchesDueDate = activeFilters.dueDate.some((filter) => {
        if (filter === 'overdue') {
          return cardDueDate && cardDueDate < today;
        }
        if (filter === 'today') {
          return (
            cardDueDate && cardDueDate.toDateString() === today.toDateString()
          );
        }
        if (filter === 'this-week') {
          const weekFromNow = new Date(
            today.getTime() + 7 * 24 * 60 * 60 * 1000
          );
          return (
            cardDueDate && cardDueDate >= today && cardDueDate <= weekFromNow
          );
        }
        if (filter === 'this-month') {
          const monthFromNow = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            today.getDate()
          );
          return (
            cardDueDate && cardDueDate >= today && cardDueDate <= monthFromNow
          );
        }
        if (filter === 'custom' && activeFilters.customDateRange) {
          const startDate = new Date(activeFilters.customDateRange.start);
          const endDate = new Date(activeFilters.customDateRange.end);
          return (
            cardDueDate && cardDueDate >= startDate && cardDueDate <= endDate
          );
        }
        return false;
      });

      if (!matchesDueDate) return false;
    }

    return true;
  });

  // Handle card movement between columns
  const handleCardMove = async (cardId, sourceColumnId, targetColumnId) => {
    // Check if user can drag cards
    if (!canDragCards()) {
      if (userRole === 'viewer') {
        console.log('Viewers cannot move cards');
      } else {
        console.log('You can only move cards in projects you are assigned to');
      }
      return;
    }

    try {
      // Use dedicated move endpoint instead of general update
      const apiService = (await import('../../utils/apiService')).default;
      await apiService.cards.move(cardId, targetColumnId);

      // After move, reload all cards from backend to ensure sync
      console.log('Reloading cards after move operation');
      if (columns.length > 0) {
        let allCards = [];
        for (const column of columns) {
          try {
            const result = await apiService.cards.getAll(column.id);
            console.log(`Reloading cards for column ${column.id}:`, result);
            
            // Handle different response formats
            let list = [];
            if (Array.isArray(result)) {
              list = result;
            } else if (result?.data && Array.isArray(result.data)) {
              list = result.data;
            }
            
            if (Array.isArray(list)) {
              const transformedCards = list.map((card) => ({
                id: card.id,
                columnId: card.column_id || card.columnId || column.id,
                title: card.title || 'Untitled Card',
                description: card.description || '',
                priority: card.priority || 'medium',
                assignedTo: Array.isArray(card.assigned_to || card.assignedTo) ? (card.assigned_to || card.assignedTo) : [],
                dueDate: card.due_date || card.dueDate || null,
                labels: Array.isArray(card.labels) ? card.labels : [],
                createdAt: card.created_at || card.createdAt || new Date().toISOString(),
                updatedAt: card.updated_at || card.updatedAt || new Date().toISOString(),
                checklist: card.checklist_items || card.checklist || [],
                comments: card.comments || [],
                attachments: card.attachments || [],
              }));
              allCards = [...allCards, ...transformedCards];
            }
          } catch (columnError) {
            console.error(
              `Error reloading cards for column ${column.id}:`,
              columnError
            );
          }
        }
        console.log('Cards reloaded after move:', allCards);
        setCards(allCards);
        
        // Save to localStorage as backup
        try {
          localStorage.setItem('kanban-cards', JSON.stringify(allCards));
        } catch (error) {
          console.error('Error saving cards to localStorage:', error);
        }
      }
    } catch (error) {
      console.error('Failed to move card:', error);
      // Optionally show error to user
    }
  };

  // Handle card click - navigate to card details
  const handleCardClick = (card) => {
    console.log('Navigating to card details:', card);

    // Navigate with card data in state and URL params
    navigate(`/card-details?id=${card.id}`, {
      state: {
        card: card,
        members: members,
        returnPath: '/kanban-board',
      },
    });
  };

  // Handle adding new card
  const handleAddCard = (columnId) => {
    // Check authentication first
    if (!isAuthenticated) {
      console.log('Please log in to create cards');
      // Optionally redirect to login page
      navigate('/login');
      return;
    }

    if (!canCreateCards()) {
      if (userRole === 'viewer') {
        console.log('Viewers cannot create cards');
      } else {
        console.log(
          'You can only create cards in projects you are assigned to'
        );
      }
      return;
    }
    console.log('Opening AddCardModal for column ID:', columnId);
    setSelectedColumnId(columnId);
    setShowAddCardModal(true);
  };

  const handleSaveCard = async (newCard) => {
    try {
      // Choose a valid target column (prefer explicit, then selected, then first available)
      const chosenColumnId =
        newCard.columnId ||
        newCard.column_id ||
        selectedColumnId ||
        columns[0]?.id;
      if (!chosenColumnId) {
        alert('No column available. Please create a column first.');
        return;
      }

      // Build a backend-safe payload (only supported fields and sane defaults)
      const sanitizePriority = (p) =>
        ['low', 'medium', 'high', 'urgent'].includes((p || '').toLowerCase())
          ? p.toLowerCase()
          : 'medium';

      const payload = {
        title: (newCard.title || '').trim() || 'Untitled Card',
        description: (newCard.description || '').trim(),
        column_id: chosenColumnId,
        priority: sanitizePriority(newCard.priority),
        // Optional fields the backend can accept
        position: Number.isInteger(newCard.position)
          ? newCard.position
          : undefined,
        assigned_to: Array.isArray(newCard.assignedTo)
          ? newCard.assignedTo
          : undefined,
        due_date: newCard.due_date || newCard.dueDate || undefined,
        checklist: Array.isArray(newCard.checklist)
          ? newCard.checklist
          : undefined,
        labels: Array.isArray(newCard.labels) ? newCard.labels : undefined,
      };

      const apiService = (await import('../../utils/apiService')).default;
      const result = await apiService.cards.create(chosenColumnId, payload);

      const created = result && result.data ? result.data : result;
      console.log('Card created via API:', created, '| raw result:', result);

      // Add to UI if backend returned a valid card object; otherwise we will rely on reload
      if (created && created.id) {
        const toClient = (card) => ({
          id: card.id,
          columnId: card.column_id || chosenColumnId,
          title: card.title,
          description: card.description || payload.description || '',
          priority: card.priority || payload.priority || 'medium',
          assignedTo: card.assigned_to || payload.assigned_to || [],
          dueDate: card.due_date || payload.due_date || null,
          labels: card.labels || payload.labels || [],
          createdAt: card.created_at || new Date().toISOString(),
          updatedAt: card.updated_at || new Date().toISOString(),
          checklist: card.checklist_items || card.checklist || [],
          comments: card.comments || [],
          attachments: card.attachments || [],
        });
        setCards((prev) => [...prev, toClient(created)]);
      } else {
        // No usable object returned; continue to reload from backend to confirm persistence
        console.warn(
          'Backend did not return a card object; will reload cards to verify persistence.'
        );
      }

      // Send notifications for task assignments (best-effort)
      if (created?.assigned_to?.length) {
        try {
          const notificationService = (
            await import('../../utils/notificationService')
          ).default;
          for (const assigneeId of created.assigned_to) {
            if (assigneeId !== currentUser?.id) {
              await notificationService.notifyTaskAssigned(
                created,
                assigneeId,
                currentUser?.id
              );
            }
          }
        } catch (notificationError) {
          console.error(
            'Failed to send task assignment notifications:',
            notificationError
          );
        }
      }

      // Reload from backend to guarantee persistence and normalize data
      console.log('Reloading cards after creation to ensure persistence');
      if (columns.length > 0) {
        try {
          let allCards = [];
          for (const column of columns) {
            try {
              const res = await apiService.cards.getAll(column.id);
              console.log(`Reloading cards for column ${column.id} after creation:`, res);
              
              // Handle different response formats
              let list = [];
              if (Array.isArray(res)) {
                list = res;
              } else if (res?.data && Array.isArray(res.data)) {
                list = res.data;
              }
              
              if (Array.isArray(list)) {
                const transformedCards = list.map((card) => ({
                  id: card.id,
                  columnId: card.column_id || column.id,
                  title: card.title || 'Untitled Card',
                  description: card.description || '',
                  priority: card.priority || 'medium',
                  assignedTo: Array.isArray(card.assigned_to) ? card.assigned_to : [],
                  dueDate: card.due_date || null,
                  labels: Array.isArray(card.labels) ? card.labels : [],
                  createdAt: card.created_at || new Date().toISOString(),
                  updatedAt: card.updated_at || new Date().toISOString(),
                  checklist: card.checklist_items || card.checklist || [],
                  comments: card.comments || [],
                  attachments: card.attachments || [],
                }));
                allCards = [...allCards, ...transformedCards];
              }
            } catch (columnError) {
              console.error(
                `Error reloading cards for column ${column.id}:`,
                columnError
              );
            }
          }
          console.log('Cards reloaded after creation:', allCards);
          setCards(allCards);
          
          // Save to localStorage as backup
          try {
            localStorage.setItem('kanban-cards', JSON.stringify(allCards));
          } catch (error) {
            console.error('Error saving cards to localStorage:', error);
          }
        } catch (reloadError) {
          console.error('Error reloading cards after save:', reloadError);
        }
      }
    } catch (error) {
      const errorMsg =
        error?.message ||
        'Failed to create card. Please check your connection and try again.';
      console.error('Create card failed:', errorMsg, error);
      alert(`Failed to create card: ${errorMsg}`);
    }
  };

  // Handle adding new column
  const handleSaveColumn = (newColumn) => {
    if (!canCreateColumns()) {
      if (userRole === 'viewer') {
        console.log('Viewers cannot create columns');
      } else {
        console.log(
          'You can only create columns in projects you are assigned to'
        );
      }
      return;
    }
    setColumns((prevColumns) => [...prevColumns, newColumn]);
  };

  // Handle column operations
  const handleEditColumn = (columnId, updates) => {
    if (!canEditColumns()) {
      if (userRole === 'viewer') {
        console.log('Viewers cannot edit columns');
      } else {
        console.log(
          'You can only edit columns in projects you are assigned to'
        );
      }
      return;
    }
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId
          ? { ...col, ...updates, updatedAt: new Date().toISOString() }
          : col
      )
    );
  };

  const handleDeleteColumn = (columnId) => {
    if (!canDeleteColumns()) {
      if (userRole === 'viewer') {
        console.log('Viewers cannot delete columns');
      } else {
        console.log(
          'You can only delete columns in projects you are assigned to'
        );
      }
      return;
    }
    // Move cards from deleted column to first column
    const firstColumnId = columns[0]?.id;
    if (firstColumnId && firstColumnId !== columnId) {
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.columnId === columnId
            ? { ...card, columnId: firstColumnId }
            : card
        )
      );
    }

    setColumns((prevColumns) =>
      prevColumns.filter((col) => col.id !== columnId)
    );
  };

  // Handle member invitation
  const handleMemberInvite = () => {
    if (!canInviteMembers()) {
      console.log('Only admins and owners can invite members');
      return;
    }
    setShowInviteMemberModal(true);
  };

  const handleSendInvitation = (invitation) => {
    console.log('Invitation sent:', invitation);
    // In real app, this would send the invitation via API
  };

  // Handle board updates
  const handleBoardUpdate = (updates) => {
    console.log('Board updated:', updates);
    // In real app, this would update the board via API
  };

  // Get cards for a specific column
  const getCardsForColumn = (columnId) => {
    return filteredCards.filter((card) => card.columnId === columnId);
  };

  // Show login prompt if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4'>
            <Icon name='Kanban' size={32} className='text-primary-foreground' />
          </div>
          <h1 className='text-2xl font-bold text-foreground mb-2'>
            Authentication Required
          </h1>
          <p className='text-muted-foreground mb-6'>
            Please log in to access the project management board.
          </p>
          <Button onClick={() => navigate('/login')} className='px-6 py-2'>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='min-h-screen bg-background'>
        <RoleBasedHeader
          userRole={userRole.toLowerCase()}
          currentUser={
            currentUser
              ? {
                  name: `${currentUser.firstName} ${currentUser.lastName}`,
                  email: currentUser.email,
                  avatar: currentUser.avatar || '/assets/images/avatar.jpg',
                  role: userRole,
                }
              : {
                  name: 'Loading...',
                  email: '',
                  avatar: '/assets/images/avatar.jpg',
                  role: userRole,
                }
          }
        />

        <main className='pt-16'>
          <div className='max-w-full px-4 sm:px-6 lg:px-8 py-8'>
            <Breadcrumb />

            {/* Page Header */}
            <div className='mb-6'>
              <div className='flex items-center space-x-3 mb-4'>
                <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center'>
                  <Icon
                    name='Kanban'
                    size={20}
                    className='text-primary-foreground'
                  />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-foreground'>
                    Projects
                  </h1>
                  <p className='text-muted-foreground'>
                    Manage tasks and track project progress
                  </p>
                </div>
              </div>
            </div>

            {/* Board Header */}
            <BoardHeader
              board={board}
              members={members}
              onBoardUpdate={handleBoardUpdate}
              onMemberInvite={handleMemberInvite}
              onFilterChange={setActiveFilters}
              onSearchChange={setSearchQuery}
              searchQuery={searchQuery}
              activeFilters={activeFilters}
              canInviteMembers={canInviteMembers()}
              organizationName={
                (currentOrganization && currentOrganization.name) ||
                'Organization'
              }
            />

            {/* Board Content */}
            <div className='flex-1 p-6'>
              <div className='flex space-x-6 overflow-x-auto pb-6'>
                {/* Columns */}
                {columns
                  .sort((a, b) => a.order - b.order)
                  .map((column) => (
                    <BoardColumn
                      key={column.id}
                      column={column}
                      cards={getCardsForColumn(column.id)}
                      onCardMove={handleCardMove}
                      onCardClick={handleCardClick}
                      onAddCard={handleAddCard}
                      onEditColumn={handleEditColumn}
                      onDeleteColumn={handleDeleteColumn}
                      members={members}
                      canCreateCards={canCreateCards()}
                      canEditColumns={canEditColumns()}
                      canDeleteColumns={canDeleteColumns()}
                      canDragCards={canDragCards()}
                    />
                  ))}

                {/* Add Column Button - Only show for non-viewers */}
                {canCreateColumns() && (
                  <div className='flex-shrink-0'>
                    <Button
                      variant='outline'
                      onClick={() => setShowAddColumnModal(true)}
                      className='w-80 h-32 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors'
                      iconName='Plus'
                      iconPosition='left'
                    >
                      Add Column
                    </Button>
                  </div>
                )}
              </div>

              {/* Empty State */}
              {filteredCards.length === 0 && searchQuery && (
                <div className='flex flex-col items-center justify-center py-12'>
                  <Icon
                    name='Search'
                    size={48}
                    className='text-text-secondary mb-4'
                  />
                  <h3 className='text-lg font-medium text-text-primary mb-2'>
                    No cards found
                  </h3>
                  <p className='text-text-secondary text-center max-w-md'>
                    No cards match your search criteria. Try adjusting your
                    search terms or filters.
                  </p>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFilters({});
                    }}
                    className='mt-4'
                  >
                    Clear Search & Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Modals */}
            <AddCardModal
              isOpen={showAddCardModal}
              onClose={() => {
                setShowAddCardModal(false);
                setSelectedColumnId(null);
              }}
              onSave={handleSaveCard}
              columnId={selectedColumnId}
              members={members}
            />

            <AddColumnModal
              isOpen={showAddColumnModal}
              onClose={() => setShowAddColumnModal(false)}
              onSave={handleSaveColumn}
            />

            <InviteMemberModal
              isOpen={showInviteMemberModal}
              onClose={() => setShowInviteMemberModal(false)}
              onInvite={handleSendInvitation}
            />
          </div>
        </main>
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
