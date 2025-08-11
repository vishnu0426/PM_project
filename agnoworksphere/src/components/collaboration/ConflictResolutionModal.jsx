import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Icon from '../AppIcon';
import collaborationService from '../../utils/collaborationService';

const ConflictResolutionModal = ({ 
  isOpen, 
  onClose, 
  conflict,
  onResolve 
}) => {
  const [selectedResolution, setSelectedResolution] = useState('accept_changes');
  const [mergeStrategy, setMergeStrategy] = useState('last_writer_wins');
  const [isResolving, setIsResolving] = useState(false);

  const resolutionOptions = [
    {
      value: 'accept_changes',
      label: 'Accept Changes',
      description: 'Apply the incoming changes and overwrite local changes',
      icon: 'Check',
      color: 'text-green-600'
    },
    {
      value: 'reject_changes',
      label: 'Reject Changes',
      description: 'Keep current state and discard incoming changes',
      icon: 'X',
      color: 'text-red-600'
    },
    {
      value: 'merge_changes',
      label: 'Merge Changes',
      description: 'Attempt to merge both sets of changes intelligently',
      icon: 'GitMerge',
      color: 'text-blue-600'
    }
  ];

  const mergeStrategies = [
    {
      value: 'last_writer_wins',
      label: 'Last Writer Wins',
      description: 'Most recent change takes precedence'
    },
    {
      value: 'first_writer_wins',
      label: 'First Writer Wins',
      description: 'Original change takes precedence'
    },
    {
      value: 'manual_merge',
      label: 'Manual Merge',
      description: 'Manually review and merge changes'
    }
  ];

  const handleResolve = async () => {
    if (!conflict) return;

    setIsResolving(true);
    
    try {
      const resolution = {
        type: selectedResolution,
        mergeStrategy: selectedResolution === 'merge_changes' ? mergeStrategy : null,
        timestamp: Date.now()
      };

      collaborationService.resolveConflict(conflict.id, resolution);
      onResolve?.(conflict, resolution);
      onClose();
    } catch (error) {
      console.error('Error resolving conflict:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderChangePreview = (changes) => {
    if (!changes || typeof changes !== 'object') {
      return <span className="text-muted-foreground">No changes to preview</span>;
    }

    return (
      <div className="space-y-2">
        {Object.entries(changes).map(([key, value]) => (
          <div key={key} className="flex items-start gap-2">
            <span className="text-sm font-medium text-foreground min-w-0 flex-shrink-0">
              {key}:
            </span>
            <span className="text-sm text-muted-foreground break-all">
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (!conflict) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve Conflict"
      size="lg"
    >
      <div className="space-y-6">
        {/* Conflict Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="AlertTriangle" className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Conflicting Changes Detected
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Multiple users have made changes to the same element. Please choose how to resolve this conflict.
              </p>
            </div>
          </div>
        </div>

        {/* Conflict Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Conflict Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Element:</span>
                <span className="font-medium">{conflict.elementId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User:</span>
                <span className="font-medium">{conflict.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{formatTimestamp(conflict.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{conflict.conflictType?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Changes Preview</h4>
            <div className="bg-secondary/30 rounded-lg p-3 text-sm max-h-32 overflow-y-auto">
              {renderChangePreview(conflict.changes)}
            </div>
          </div>
        </div>

        {/* Resolution Options */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Resolution Options</h4>
          <div className="space-y-3">
            {resolutionOptions.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedResolution === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-secondary/30"
                )}
              >
                <input
                  type="radio"
                  name="resolution"
                  value={option.value}
                  checked={selectedResolution === option.value}
                  onChange={(e) => setSelectedResolution(e.target.value)}
                  className="mt-1"
                />
                <Icon name={option.icon} className={cn("h-4 w-4 mt-0.5", option.color)} />
                <div className="flex-1">
                  <div className="font-medium text-foreground">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Merge Strategy (only shown when merge is selected) */}
        {selectedResolution === 'merge_changes' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Merge Strategy</h4>
            <div className="space-y-2">
              {mergeStrategies.map((strategy) => (
                <label
                  key={strategy.value}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    mergeStrategy === strategy.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary/30"
                  )}
                >
                  <input
                    type="radio"
                    name="mergeStrategy"
                    value={strategy.value}
                    checked={mergeStrategy === strategy.value}
                    onChange={(e) => setMergeStrategy(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{strategy.label}</div>
                    <div className="text-sm text-muted-foreground">{strategy.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isResolving}
          >
            Cancel
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                // Add to queue for later resolution
                onClose();
              }}
              disabled={isResolving}
            >
              Resolve Later
            </Button>
            
            <Button
              onClick={handleResolve}
              disabled={isResolving}
              loading={isResolving}
            >
              {isResolving ? 'Resolving...' : 'Resolve Conflict'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConflictResolutionModal;
