import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as flightsSlice from '../store/flightsSlice';
import { AppDispatch } from '../store/store';

const FileUploader: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [responseData, setResponseData] = useState<any | null>(null);

    const resetState = () => {
        setStatus('idle');
        setProgress(0);
        setError(null);
        setResponseData(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            resetState();
        }
    };
    
    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            setFile(event.dataTransfer.files[0]);
            resetState();
        }
    }, []);

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);


    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');
        setError(null);
        setResponseData(null);
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            dispatch(flightsSlice.resetFlightsData()); // Сбрасываем данные в LocalStorage перед загрузкой новых
            dispatch(flightsSlice.fetchFlights()); // Re-fetch data to update the whole app
            setResponseData(data.data); // Show the returned data preview
            setStatus('success');
            setProgress(100);
        } catch (err: any) {
            setStatus('error');
            setError(err.message || 'An unknown error occurred.');
        }
    };

    return (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 w-full max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Загрузка пакета сообщений</h3>
            <div 
                onDrop={onDrop}
                onDragOver={onDragOver}
                className="border-2 border-dashed border-gray-600 rounded-lg p-10 text-center cursor-pointer hover:border-sky-500 transition-colors"
            >
                <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept=".xlsx" />
                <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h1.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V16a4 4 0 01-4 4H7z"></path></svg>
                    <p className="mt-2 text-sm text-gray-400">
                        <span className="font-semibold text-sky-400">Нажмите для выбора</span> или перетащите файл
                    </p>
                    <p className="text-xs text-gray-500">Поддерживаемый формат: .XLSX</p>
                </label>
            </div>
            {file && (
                <div className="mt-6">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <p className="text-gray-300 truncate pr-4">{file.name}</p>
                        <p className="text-gray-500">{`${(file.size / 1024).toFixed(2)} KB`}</p>
                    </div>
                    {status !== 'idle' && (
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                            <div 
                                className={`h-2.5 rounded-full transition-all duration-300 ${status === 'success' ? 'bg-green-500' : (status === 'error' ? 'bg-red-500' : 'bg-sky-500')}`}
                                style={{ width: `${progress}%` }}>
                            </div>
                        </div>
                    )}
                    {status === 'success' && <p className="text-green-400 text-sm text-center">Файл успешно загружен и обработан!</p>}
                    {status === 'error' && <p className="text-red-400 text-sm text-center">{error}</p>}
                </div>
            )}
            {responseData && status === 'success' && (
                <div className="mt-6">
                    <h4 className="text-lg font-semibold text-green-400 mb-2">Ответ от сервера (первые 10 записей):</h4>
                    <pre className="bg-gray-900 text-sm text-gray-300 p-4 rounded-md max-h-60 overflow-auto">
                        {JSON.stringify(responseData.slice(0, 10), null, 2)}
                    </pre>
                </div>
            )}
            <button
                onClick={handleUpload}
                disabled={!file || status === 'uploading'}
                className="w-full mt-6 bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
                {status === 'uploading' ? 'Обработка...' : 'Начать обработку'}
            </button>
        </div>
    );
};

export default FileUploader;