import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter } from 'react-router-dom';
import Routes from './Routes';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { KeyboardShortcutsProvider } from './contexts/KeyboardShortcutsContext';
import { AccessibilityProvider } from './components/accessibility/AccessibilityProvider';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/accessibility.css';


function App() {
  return (
    <ErrorBoundary>
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter>
          <ThemeProvider>
            <AccessibilityProvider>
              <AuthProvider>
                <ProjectProvider>
                  <KeyboardShortcutsProvider>
                    <div className='w-full'>
                      <Routes />
                    </div>
                  </KeyboardShortcutsProvider>
                </ProjectProvider>
              </AuthProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </BrowserRouter>
      </DndProvider>
    </ErrorBoundary>
  );
}

export default App;
