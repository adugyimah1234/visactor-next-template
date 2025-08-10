/* eslint-disable @typescript-eslint/consistent-type-imports */
// contexts/DashboardContext.tsx
'use client';
import { createContext, useState, useContext } from 'react';
const DashboardContext = createContext(undefined);
export const DashboardProvider = ({ children }) => {
    const [activeItem, setActiveItem] = useState('Dashboard'); // Default active item
    return (<DashboardContext.Provider value={{ activeItem, setActiveItem }}>
      {children}
    </DashboardContext.Provider>);
};
export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
