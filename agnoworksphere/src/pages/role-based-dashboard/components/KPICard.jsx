import React from 'react';
import Icon from '../../../components/AppIcon';

const KPICard = ({ title, value, change, changeType, icon, color = 'primary' }) => {
  const getColorClasses = () => {
    const colors = {
      primary: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
      success: 'bg-gradient-to-br from-green-500 to-emerald-600 text-white',
      warning: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
      error: 'bg-gradient-to-br from-red-500 to-red-600 text-white',
      accent: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white'
    };
    return colors[color] || colors.primary;
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-slate-500';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  const getBackgroundDecoration = () => {
    const decorations = {
      primary: 'bg-blue-100',
      success: 'bg-green-100',
      warning: 'bg-amber-100',
      error: 'bg-red-100',
      accent: 'bg-purple-100'
    };
    return decorations[color] || decorations.primary;
  };

  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1">
      {/* Background decoration */}
      <div className={`absolute -top-2 -right-2 w-20 h-20 ${getBackgroundDecoration()} rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-2 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-800 mb-3">
            {value}
          </p>
          {change && (
            <div className={`flex items-center gap-2 ${getChangeColor()}`}>
              <div className="flex items-center gap-1">
                <Icon name={getChangeIcon()} size={16} />
                <span className="text-sm font-semibold">{change}</span>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getColorClasses()} shadow-lg`}>
          <Icon name={icon} size={28} />
        </div>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
    </div>
  );
};

export default KPICard;