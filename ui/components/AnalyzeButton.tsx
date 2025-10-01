import React from 'react';

/**
 * @interface AnalyzeButtonProps
 * @description Пропсы для компонента AnalyzeButton.
 */
interface AnalyzeButtonProps {
    /**
     * @property {() => void} onClick - Функция, вызываемая при нажатии на кнопку.
     */
    onClick: () => void;
    /**
     * @property {boolean} isLoading - Флаг, указывающий на состояние загрузки. Если true, отображается спиннер.
     */
    isLoading: boolean;
    /**
     * @property {boolean} [compact] - Если true, кнопка отображается в компактном режиме (только иконка).
     */
    compact?: boolean;
}

const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
);

const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({ onClick, isLoading, compact = false }) => {
    const buttonClasses = compact
        ? "flex items-center justify-center p-2 rounded-full hover:bg-sky-600/40"
        : "flex items-center justify-center gap-2 py-2 px-4 rounded-md hover:bg-sky-600/40";
    
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className={`${buttonClasses} bg-sky-600/20 text-sky-300 font-semibold disabled:bg-gray-600/20 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 border border-sky-500/30 hover:border-sky-500/60 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50`}
            title="Анализ с AI"
        >
            {isLoading ? <LoadingSpinner /> : <BrainIcon className="h-5 w-5" />}
            {!compact && <span className="hidden sm:inline">{isLoading ? 'Анализ...' : 'Анализ с AI'}</span>}
        </button>
    );
};

export default AnalyzeButton;