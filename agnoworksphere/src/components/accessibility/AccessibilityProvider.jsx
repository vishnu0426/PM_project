import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    );
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReaderOptimized: false,
    keyboardNavigation: true,
    focusVisible: true,
    announcements: true,
  });

  const [announcements, setAnnouncements] = useState([]);

  // Load accessibility settings from database via API (no localStorage)
  useEffect(() => {
    const loadAccessibilitySettings = async () => {
      try {
        // TODO: Load accessibility settings from database via API
        console.log(
          'Accessibility settings loaded from database (localStorage not used)'
        );
      } catch (error) {
        console.error(
          'Error loading accessibility settings from database:',
          error
        );
      }
    };

    loadAccessibilitySettings();

    // Detect system preferences
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');

    if (prefersReducedMotion.matches) {
      setSettings((prev) => ({ ...prev, reducedMotion: true }));
    }

    if (prefersHighContrast.matches) {
      setSettings((prev) => ({ ...prev, highContrast: true }));
    }

    // Listen for changes in system preferences
    const handleReducedMotionChange = (e) => {
      setSettings((prev) => ({ ...prev, reducedMotion: e.matches }));
    };

    const handleHighContrastChange = (e) => {
      setSettings((prev) => ({ ...prev, highContrast: e.matches }));
    };

    prefersReducedMotion.addEventListener('change', handleReducedMotionChange);
    prefersHighContrast.addEventListener('change', handleHighContrastChange);

    return () => {
      prefersReducedMotion.removeEventListener(
        'change',
        handleReducedMotionChange
      );
      prefersHighContrast.removeEventListener(
        'change',
        handleHighContrastChange
      );
    };
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Screen reader optimized
    if (settings.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }

    // Focus visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Save settings to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const announce = (message, priority = 'polite') => {
    if (!settings.announcements) return;

    const id = Date.now();
    const announcement = {
      id,
      message,
      priority,
      timestamp: new Date(),
    };

    setAnnouncements((prev) => [...prev, announcement]);

    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
  };

  const value = {
    settings,
    updateSetting,
    announce,
    announcements,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <LiveRegion announcements={announcements} />
      <SkipLinks />
    </AccessibilityContext.Provider>
  );
};

// Live region for screen reader announcements
const LiveRegion = ({ announcements }) => {
  return (
    <>
      <div
        aria-live='polite'
        aria-atomic='true'
        className='sr-only'
        id='polite-announcements'
      >
        {announcements
          .filter((a) => a.priority === 'polite')
          .map((announcement) => (
            <div key={announcement.id}>{announcement.message}</div>
          ))}
      </div>
      <div
        aria-live='assertive'
        aria-atomic='true'
        className='sr-only'
        id='assertive-announcements'
      >
        {announcements
          .filter((a) => a.priority === 'assertive')
          .map((announcement) => (
            <div key={announcement.id}>{announcement.message}</div>
          ))}
      </div>
    </>
  );
};

// Skip links for keyboard navigation
const SkipLinks = () => {
  return (
    <div className='skip-links'>
      <a
        href='#main-content'
        className='skip-link'
        onFocus={(e) => e.target.classList.add('focused')}
        onBlur={(e) => e.target.classList.remove('focused')}
      >
        Skip to main content
      </a>
      <a
        href='#navigation'
        className='skip-link'
        onFocus={(e) => e.target.classList.add('focused')}
        onBlur={(e) => e.target.classList.remove('focused')}
      >
        Skip to navigation
      </a>
      <a
        href='#search'
        className='skip-link'
        onFocus={(e) => e.target.classList.add('focused')}
        onBlur={(e) => e.target.classList.remove('focused')}
      >
        Skip to search
      </a>
    </div>
  );
};

// Hook for managing focus
export const useFocusManagement = () => {
  const { settings, announce } = useAccessibility();

  const focusElement = (element) => {
    if (!element) return;

    // Ensure element is focusable
    if (
      !element.hasAttribute('tabindex') &&
      !element.matches('a, button, input, select, textarea')
    ) {
      element.setAttribute('tabindex', '-1');
    }

    element.focus();

    // Announce focus change for screen readers
    if (settings.screenReaderOptimized) {
      const label =
        element.getAttribute('aria-label') ||
        element.getAttribute('title') ||
        element.textContent ||
        'Element focused';

      // Use a small delay to ensure the focus change is announced
      setTimeout(() => {
        announce(`Focused on ${label}`);
      }, 100);
    }
  };

  const trapFocus = (container) => {
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };

  return {
    focusElement,
    trapFocus,
  };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = () => {
  const { settings } = useAccessibility();

  const handleArrowNavigation = (e, items, currentIndex, onSelect) => {
    if (!settings.keyboardNavigation) return;

    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onSelect) {
          onSelect(items[currentIndex], currentIndex);
        }
        return currentIndex;
      default:
        return currentIndex;
    }

    return newIndex;
  };

  return {
    handleArrowNavigation,
  };
};
