import React from 'react';
import Button from '../../ui/Button';
import Icon from '../../AppIcon';

const TaskAlternatives = ({ alternatives, onSelect, onClose }) => {
  const getComplexityColor = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case 'beginner':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComplexityIcon = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case 'beginner':
        return 'Zap';
      case 'intermediate':
        return 'Target';
      case 'advanced':
        return 'Rocket';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-blue-900 flex items-center gap-2">
          <Icon name="Lightbulb" size={16} />
          AI Alternative Approaches
        </h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          iconName="X"
          className="text-blue-600 hover:text-blue-800"
        />
      </div>

      <div className="space-y-3">
        {alternatives.map((alternative, index) => (
          <div
            key={alternative.id || index}
            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
          >
            {/* Alternative Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 text-sm">
                  {alternative.title}
                </h5>
                <div className="flex items-center gap-3 mt-1">
                  {/* Complexity Badge */}
                  <span className={`
                    inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border
                    ${getComplexityColor(alternative.complexity)}
                  `}>
                    <Icon name={getComplexityIcon(alternative.complexity)} size={12} />
                    {alternative.complexity}
                  </span>

                  {/* Effort Indicators */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={12} />
                      {alternative.estimated_hours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Target" size={12} />
                      {alternative.story_points} SP
                    </span>
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelect(alternative)}
                className="ml-3 text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Use This
              </Button>
            </div>

            {/* Alternative Description */}
            <p className="text-sm text-gray-700 mb-3">
              {alternative.description}
            </p>

            {/* Explanation */}
            {alternative.explanation && (
              <div className="bg-gray-50 border border-gray-200 rounded p-2">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600">
                    {alternative.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Comparison Indicators */}
            <div className="mt-3 flex items-center gap-4 text-xs">
              {/* Time Comparison */}
              <div className="flex items-center gap-1">
                <Icon name="TrendingUp" size={12} className="text-gray-400" />
                <span className="text-gray-600">
                  Time: {alternative.estimated_hours > 8 ? '+' : ''}{alternative.estimated_hours - 8}h
                </span>
              </div>

              {/* Complexity Comparison */}
              <div className="flex items-center gap-1">
                <Icon name="BarChart3" size={12} className="text-gray-400" />
                <span className="text-gray-600">
                  Complexity: {alternative.complexity}
                </span>
              </div>

              {/* Risk Level */}
              {alternative.risk_level && (
                <div className="flex items-center gap-1">
                  <Icon name="AlertTriangle" size={12} className="text-gray-400" />
                  <span className="text-gray-600">
                    Risk: {alternative.risk_level}
                  </span>
                </div>
              )}
            </div>

            {/* Pros and Cons */}
            {(alternative.pros || alternative.cons) && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {alternative.pros && (
                  <div>
                    <h6 className="text-xs font-medium text-green-700 mb-1">Pros:</h6>
                    <ul className="text-xs text-green-600 space-y-0.5">
                      {alternative.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <Icon name="Plus" size={10} className="mt-0.5 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {alternative.cons && (
                  <div>
                    <h6 className="text-xs font-medium text-red-700 mb-1">Cons:</h6>
                    <ul className="text-xs text-red-600 space-y-0.5">
                      {alternative.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <Icon name="Minus" size={10} className="mt-0.5 flex-shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Technologies/Skills Required */}
            {alternative.technologies && (
              <div className="mt-3">
                <h6 className="text-xs font-medium text-gray-700 mb-1">Technologies:</h6>
                <div className="flex flex-wrap gap-1">
                  {alternative.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Suggestion Footer */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <Icon name="Sparkles" size={12} />
          <span>
            These alternatives were generated based on your project type, team experience, and task complexity.
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskAlternatives;
