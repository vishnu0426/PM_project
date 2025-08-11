import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const KeyboardShortcutsContext = createContext();

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
};

export const KeyboardShortcutsProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState({});

  // Default keyboard shortcuts
  const defaultShortcuts = {
    // Navigation
    'g d': { action: () => navigate('/dashboard'), description: 'Go to Dashboard' },
    'g p': { action: () => navigate('/projects'), description: 'Go to Projects' },
    'g t': { action: () => navigate('/teams'), description: 'Go to Teams' },
    'g s': { action: () => navigate('/settings'), description: 'Go to Settings' },
    
    // Actions
    'c': { action: () => triggerAction('create'), description: 'Create new item' },
    'e': { action: () => triggerAction('edit'), description: 'Edit current item' },
    'd': { action: () => triggerAction('delete'), description: 'Delete current item' },
    's': { action: () => triggerAction('save'), description: 'Save current item' },
    
    // Search and filters
    '/': { action: () => triggerAction('search'), description: 'Focus search' },
    'f': { action: () => triggerAction('filter'), description: 'Open filters' },
    'r': { action: () => triggerAction('refresh'), description: 'Refresh current view' },
    
    // Modal and UI
    'Escape': { action: () => triggerAction('escape'), description: 'Close modal/cancel' },
    '?': { action: () => setIsHelpModalOpen(true), description: 'Show keyboard shortcuts' },
    
    // Theme
    't': { action: () => triggerAction('toggleTheme'), description: 'Toggle theme' }
  };

  const [keySequence, setKeySequence] = useState('');
  const [sequenceTimeout, setSequenceTimeout] = useState(null);

  // Action handlers that can be registered by components
  const [actionHandlers, setActionHandlers] = useState({});

  const registerActionHandler = useCallback((action, handler) => {
    setActionHandlers(prev => ({
      ...prev,
      [action]: handler
    }));
  }, []);

  const unregisterActionHandler = useCallback((action) => {
    setActionHandlers(prev => {
      const newHandlers = { ...prev };
      delete newHandlers[action];
      return newHandlers;
    });
  }, []);

  const triggerAction = useCallback((action) => {
    if (actionHandlers[action]) {
      actionHandlers[action]();
    }
  }, [actionHandlers]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.contentEditable === 'true'
    ) {
      // Allow Escape to blur inputs
      if (event.key === 'Escape') {
        event.target.blur();
      }
      return;
    }

    // Handle modifier keys
    const modifiers = [];
    if (event.ctrlKey || event.metaKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');

    let keyString = event.key;
    
    // Handle special keys
    if (event.key === ' ') keyString = 'Space';
    if (event.key === 'Escape') keyString = 'Escape';
    if (event.key === 'Enter') keyString = 'Enter';
    if (event.key === 'Tab') keyString = 'Tab';

    // Create full key combination
    const fullKey = modifiers.length > 0 
      ? `${modifiers.join('+')}+${keyString}`
      : keyString;

    // Handle single key shortcuts
    if (defaultShortcuts[fullKey]) {
      event.preventDefault();
      defaultShortcuts[fullKey].action();
      return;
    }

    // Handle key sequences (like 'g d' for go to dashboard)
    if (sequenceTimeout) {
      clearTimeout(sequenceTimeout);
    }

    const newSequence = keySequence + (keySequence ? ' ' : '') + keyString.toLowerCase();
    setKeySequence(newSequence);

    // Check if this sequence matches any shortcut
    if (defaultShortcuts[newSequence]) {
      event.preventDefault();
      defaultShortcuts[newSequence].action();
      setKeySequence('');
      return;
    }

    // Set timeout to reset sequence
    const timeout = setTimeout(() => {
      setKeySequence('');
    }, 1000);
    setSequenceTimeout(timeout);
  }, [keySequence, sequenceTimeout, actionHandlers, navigate]);

  // Set up global keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
      }
    };
  }, [handleKeyDown, sequenceTimeout]);

  // Initialize shortcuts
  useEffect(() => {
    setShortcuts(defaultShortcuts);
  }, []);

  const value = {
    shortcuts,
    keySequence,
    isHelpModalOpen,
    setIsHelpModalOpen,
    registerActionHandler,
    unregisterActionHandler,
    triggerAction
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      {isHelpModalOpen && <KeyboardShortcutsHelp />}
    </KeyboardShortcutsContext.Provider>
  );
};

// Keyboard shortcuts help modal
const KeyboardShortcutsHelp = () => {
  const { shortcuts, setIsHelpModalOpen } = useKeyboardShortcuts();

  const shortcutCategories = {
    'Navigation': ['g d', 'g p', 'g t', 'g s'],
    'Actions': ['c', 'e', 'd', 's'],
    'Search & Filters': ['/', 'f', 'r'],
    'Interface': ['Escape', '?', 't']
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(shortcutCategories).map(([category, keys]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {keys.map(key => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        {shortcuts[key]?.description}
                      </span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono">
                        {key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">?</kbd> to show this help again, 
              or <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Escape</kbd> to close.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
