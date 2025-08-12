/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LoaderOverlay } from '@/components/ui/loader';
const LoadingContext = createContext(undefined);
export function LoadingProvider({ children, showOverlay = true, minLoadingTime = 1500 }) {
    const [isLoading, setIsLoading] = useState(false);
    const [navigationLoading, setNavigationLoading] = useState(false);
    const [loadingStartTime, setLoadingStartTime] = useState(null);
    const [targetPath, setTargetPath] = useState(null);
    const pathname = usePathname();
    const setLoading = (loading) => {
        if (loading) {
            setLoadingStartTime(Date.now());
        }
        setIsLoading(loading);
    };
    const startNavigation = (path) => {
        setTargetPath(path || null);
        setLoadingStartTime(Date.now());
        setNavigationLoading(true);
    };
    const finishNavigation = () => {
        const now = Date.now();
        const elapsed = loadingStartTime ? now - loadingStartTime : 0;
        const remainingTime = Math.max(0, minLoadingTime - elapsed);
        setTimeout(() => {
            setNavigationLoading(false);
            setTargetPath(null);
            setLoadingStartTime(null);
        }, remainingTime);
    };
    // Auto-detect navigation completion
    useEffect(() => {
        if (navigationLoading && (!targetPath || pathname === targetPath)) {
            // Small delay to ensure page is rendered
            const timer = setTimeout(() => {
                finishNavigation();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [pathname, navigationLoading, targetPath]);
    // Auto-finish navigation after maximum time
    useEffect(() => {
        if (navigationLoading) {
            const maxTimer = setTimeout(() => {
                finishNavigation();
            }, 2000); // Maximum 5 seconds loading
            return () => clearTimeout(maxTimer);
        }
    }, [navigationLoading]);
    const contextValue = {
        isLoading,
        setLoading,
        navigationLoading,
        setNavigationLoading,
        startNavigation,
        finishNavigation,
    };
    return (<LoadingContext.Provider value={contextValue}>
      {children}
      {showOverlay && (navigationLoading || isLoading) && (<LoaderOverlay text="Loading..." variant="spinner" color="indigo"/>)}
    </LoadingContext.Provider>);
}
export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
}
// Hook for page components to signal when they're ready
export function usePageReady() {
    const { finishNavigation, navigationLoading } = useLoading();
    const setPageReady = () => {
        if (navigationLoading) {
            finishNavigation();
        }
    };
    return { setPageReady, isNavigationLoading: navigationLoading };
}
