import React from 'react';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isLoading: boolean;
}

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4" // Увеличиваем z-index
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-700">
          <h3 className="text-lg font-bold text-sky-400">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Закрыть модальное окно">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-300">Анализирую данные...</p>
            </div>
          ) : (
            /**
             * @security ВАЖНОЕ ЗАМЕЧАНИЕ ДЛЯ БЭКЕНД-РАЗРАБОТЧИКА!
             * 
             * Мы используем `dangerouslySetInnerHTML` для рендеринга ответа от AI,
             * так как он может содержать HTML-теги для форматирования (<ul>, <li>, <strong> и т.д.).
             * 
             * Это создает потенциальную уязвимость для XSS-атак (Cross-Site Scripting),
             * если ответ от LLM будет содержать вредоносный JavaScript-код.
             * 
             * ЗАДАЧА БЭКЕНДА: Перед отправкой ответа на фронтенд, его НЕОБХОДИМО
             * пропустить через HTML-санитайзер (например, библиотеку `bleach` для Python
             * или `sanitize-html` для Node.js).
             * 
             * Санитайзер должен быть настроен так, чтобы разрешать только безопасный
             * набор тегов и атрибутов (например, <p>, <ul>, <li>, <strong>, <em>) и удалять
             * все остальное, особенно <script>, onclick, onerror и т.д.
             */
            <div 
                className="prose prose-invert prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: content }} 
            />
          )}
        </div>
        <div className="p-4 bg-gray-900/50 border-t border-gray-700 rounded-b-xl text-right">
            <button 
                onClick={onClose} 
                className="bg-sky-600 text-white font-semibold py-2 px-5 rounded-md hover:bg-sky-700 transition-colors"
            >
                Закрыть
            </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s forwards;
        }
      `}</style>
    </div>
  );
};

export default AIAnalysisModal;