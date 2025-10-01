import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { UserRole } from './types';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Upload from './pages/Upload';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
const FlightsListPage = lazy(() => import('./pages/FlightsListPage'));
const FlightDetailPage = lazy(() => import('./pages/FlightDetailPage'));
const RegionalFlightsPage = lazy(() => import('./pages/RegionalFlightsPage'));
const AltitudeAnalysisPage = lazy(() => import('./pages/AltitudeAnalysisPage'));
const FullMapPage = lazy(() => import('./pages/FullMapPage'));

const LoadingFallback: React.FC = () => (
    <div className="flex items-center justify-center h-full">
        <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-sky-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg text-gray-300">Загрузка страницы...</p>
        </div>
    </div>
);


const ProtectedLayout: React.FC = () => {
    const userRole = useSelector((state: RootState) => state.user.role);

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-800 p-4 sm:p-6 lg:p-8">
                    <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/map" element={<FullMapPage />} />
                            <Route path="/flights" element={<FlightsListPage />} />
                            <Route path="/flights/:sid" element={<FlightDetailPage />} />
                            <Route path="/regions" element={<RegionalFlightsPage />} />
                            <Route path="/altitudes" element={<AltitudeAnalysisPage />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/upload" element={<Upload />} />
                            {userRole === UserRole.ADMIN && (
                                <Route path="/admin" element={<AdminPanel />} />
                            )}
                            <Route path="/*" element={<Navigate replace to="/dashboard" />} />
                        </Routes>
                    </Suspense>
                </main>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  return (
    <HashRouter>
        <Routes>
            <Route 
                path="/login" 
                element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
            />
            <Route 
                path="/*" 
                element={isAuthenticated ? <ProtectedLayout /> : <Navigate to="/login" replace />} 
            />
        </Routes>
    </HashRouter>
  );
};

export default App;