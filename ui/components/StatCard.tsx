import React from 'react';
import AnalyzeButton from './AnalyzeButton'; // Предполагается, что AnalyzeButton находится в той же папке

/**
 * @interface StatCardProps
 * @description Пропсы для компонента StatCard.
 */
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  /**
   * @property {() => void} [onAnalyze] - Опциональная функция-обработчик для запуска AI-анализа. Если передана, рядом с заголовком появляется кнопка анализа.
   */
  onAnalyze?: () => void;
  /**
   * @property {boolean} [isAnalyzing] - Опциональный флаг, указывающий на то, что для этой карточки в данный момент выполняется анализ.
   */
  isAnalyzing?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description, onAnalyze, isAnalyzing }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 shadow-lg transition-all duration-300 hover:shadow-sky-500/20 hover:border-sky-500 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-sky-500 bg-opacity-20 text-sky-400">
                    {icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">{title}</p>
                  <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </div>
            {onAnalyze && (
                <AnalyzeButton 
                    onClick={onAnalyze} 
                    isLoading={isAnalyzing || false} 
                    compact={true} 
                />
            )}
        </div>
      </div>
      {description && <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-700/50">{description}</p>}
    </div>
  );
};

export default StatCard;