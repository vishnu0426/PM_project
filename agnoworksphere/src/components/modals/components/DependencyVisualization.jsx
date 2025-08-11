import React, { useState, useEffect, useRef } from 'react';
import Button from '../../ui/Button';
import Icon from '../../AppIcon';

const DependencyVisualization = ({ tasks, onTaskUpdate }) => {
  const svgRef = useRef(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // tree, network, timeline
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (svgRef.current) {
      renderDependencyGraph();
    }
  }, [tasks, viewMode, zoomLevel, panOffset]);

  const renderDependencyGraph = () => {
    const svg = svgRef.current;
    if (!svg) return;

    // Clear previous content
    svg.innerHTML = '';

    const width = svg.clientWidth;
    const height = svg.clientHeight;

    // Create task nodes
    const nodes = tasks.map((task, index) => ({
      id: task.id,
      title: task.title,
      x: 0,
      y: 0,
      dependencies: task.dependencies || [],
      priority: task.priority,
      status: task.status,
      estimated_hours: task.estimated_hours
    }));

    // Calculate positions based on view mode
    if (viewMode === 'tree') {
      calculateTreeLayout(nodes, width, height);
    } else if (viewMode === 'network') {
      calculateNetworkLayout(nodes, width, height);
    } else if (viewMode === 'timeline') {
      calculateTimelineLayout(nodes, width, height);
    }

    // Render connections (edges)
    renderConnections(svg, nodes);

    // Render task nodes
    renderNodes(svg, nodes);
  };

  const calculateTreeLayout = (nodes, width, height) => {
    // Simple tree layout - arrange tasks in levels based on dependencies
    const levels = {};
    const visited = new Set();

    const calculateLevel = (nodeId, level = 0) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      if (!levels[level]) levels[level] = [];
      levels[level].push(node);

      // Process dependencies (children in tree)
      tasks.forEach(task => {
        if (task.dependencies && task.dependencies.includes(nodeId)) {
          calculateLevel(task.id, level + 1);
        }
      });
    };

    // Start with root nodes (no dependencies)
    const rootNodes = nodes.filter(node => !node.dependencies || node.dependencies.length === 0);
    rootNodes.forEach(node => calculateLevel(node.id));

    // Position nodes
    Object.keys(levels).forEach(level => {
      const levelNodes = levels[level];
      const levelY = (parseInt(level) + 1) * (height / (Object.keys(levels).length + 1));
      
      levelNodes.forEach((node, index) => {
        node.x = (index + 1) * (width / (levelNodes.length + 1));
        node.y = levelY;
      });
    });
  };

  const calculateNetworkLayout = (nodes, width, height) => {
    // Force-directed layout simulation
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      node.x = centerX + Math.cos(angle) * radius;
      node.y = centerY + Math.sin(angle) * radius;
    });

    // Simple force simulation (simplified)
    for (let i = 0; i < 50; i++) {
      // Repulsion between nodes
      nodes.forEach(node1 => {
        nodes.forEach(node2 => {
          if (node1.id !== node2.id) {
            const dx = node1.x - node2.x;
            const dy = node1.y - node2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
              const force = 100 / (distance + 1);
              node1.x += (dx / distance) * force * 0.1;
              node1.y += (dy / distance) * force * 0.1;
            }
          }
        });
      });

      // Attraction for dependencies
      nodes.forEach(node => {
        node.dependencies.forEach(depId => {
          const depNode = nodes.find(n => n.id === depId);
          if (depNode) {
            const dx = depNode.x - node.x;
            const dy = depNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const force = distance * 0.01;
            node.x += dx * force;
            node.y += dy * force;
            depNode.x -= dx * force;
            depNode.y -= dy * force;
          }
        });
      });
    }
  };

  const calculateTimelineLayout = (nodes, width, height) => {
    // Arrange tasks in timeline order
    const sortedTasks = [...nodes].sort((a, b) => {
      // Sort by dependencies first, then by priority
      const aDeps = a.dependencies ? a.dependencies.length : 0;
      const bDeps = b.dependencies ? b.dependencies.length : 0;
      if (aDeps !== bDeps) return aDeps - bDeps;
      
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });

    sortedTasks.forEach((node, index) => {
      node.x = (index + 1) * (width / (sortedTasks.length + 1));
      node.y = height / 2;
    });
  };

  const renderConnections = (svg, nodes) => {
    nodes.forEach(node => {
      node.dependencies.forEach(depId => {
        const depNode = nodes.find(n => n.id === depId);
        if (depNode) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', depNode.x);
          line.setAttribute('y1', depNode.y);
          line.setAttribute('x2', node.x);
          line.setAttribute('y2', node.y);
          line.setAttribute('stroke', '#6B7280');
          line.setAttribute('stroke-width', '2');
          line.setAttribute('marker-end', 'url(#arrowhead)');
          svg.appendChild(line);
        }
      });
    });

    // Add arrowhead marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', '#6B7280');
    
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
  };

  const renderNodes = (svg, nodes) => {
    nodes.forEach(node => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('transform', `translate(${node.x}, ${node.y})`);
      group.style.cursor = 'pointer';

      // Node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '20');
      circle.setAttribute('fill', getPriorityColor(node.priority));
      circle.setAttribute('stroke', selectedTask === node.id ? '#7C3AED' : '#E5E7EB');
      circle.setAttribute('stroke-width', selectedTask === node.id ? '3' : '2');
      
      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '0.35em');
      text.setAttribute('font-size', '10');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-weight', 'bold');
      text.textContent = node.title.substring(0, 3).toUpperCase();

      // Hours indicator
      const hoursText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      hoursText.setAttribute('text-anchor', 'middle');
      hoursText.setAttribute('dy', '35');
      hoursText.setAttribute('font-size', '8');
      hoursText.setAttribute('fill', '#6B7280');
      hoursText.textContent = `${node.estimated_hours || 0}h`;

      group.appendChild(circle);
      group.appendChild(text);
      group.appendChild(hoursText);

      // Add click handler
      group.addEventListener('click', () => {
        setSelectedTask(selectedTask === node.id ? null : node.id);
      });

      svg.appendChild(group);
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F97316';
      case 'medium': return '#EAB308';
      case 'low': return '#22C55E';
      default: return '#6B7280';
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const selectedTaskData = selectedTask ? tasks.find(t => t.id === selectedTask) : null;

  return (
    <div className="h-96 bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700">Dependency Visualization</h3>
          <div className="flex items-center gap-1">
            {['tree', 'network', 'timeline'].map(mode => (
              <Button
                key={mode}
                size="sm"
                variant={viewMode === mode ? "default" : "outline"}
                onClick={() => setViewMode(mode)}
                className="text-xs capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleZoomOut}
            iconName="ZoomOut"
            title="Zoom Out"
          />
          <span className="text-xs text-gray-600 min-w-[3rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleZoomIn}
            iconName="ZoomIn"
            title="Zoom In"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetView}
            iconName="RotateCcw"
            title="Reset View"
          />
        </div>
      </div>

      {/* Visualization Area */}
      <div className="relative flex-1">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)` }}
        />
        
        {/* Legend */}
        <div className="absolute top-2 left-2 bg-white border border-gray-200 rounded p-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Urgent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Low</span>
            </div>
          </div>
        </div>

        {/* Task Details Panel */}
        {selectedTaskData && (
          <div className="absolute top-2 right-2 bg-white border border-gray-200 rounded-lg p-3 w-64 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{selectedTaskData.title}</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedTask(null)}
                iconName="X"
              />
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Priority:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  selectedTaskData.priority === 'urgent' ? 'text-red-600 bg-red-50' :
                  selectedTaskData.priority === 'high' ? 'text-orange-600 bg-orange-50' :
                  selectedTaskData.priority === 'medium' ? 'text-yellow-600 bg-yellow-50' :
                  'text-green-600 bg-green-50'
                }`}>
                  {selectedTaskData.priority}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated:</span>
                <span>{selectedTaskData.estimated_hours || 0}h</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Story Points:</span>
                <span>{selectedTaskData.story_points || 0}</span>
              </div>
              
              {selectedTaskData.dependencies && selectedTaskData.dependencies.length > 0 && (
                <div>
                  <span className="text-gray-600">Dependencies:</span>
                  <div className="mt-1 space-y-1">
                    {selectedTaskData.dependencies.map(depId => {
                      const depTask = tasks.find(t => t.id === depId);
                      return depTask ? (
                        <div key={depId} className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
                          {depTask.title}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DependencyVisualization;
