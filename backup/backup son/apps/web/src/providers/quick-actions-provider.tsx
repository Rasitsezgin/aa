'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import QuickSaleModal from '@/components/dashboard/QuickSaleModal';
import AddProductModal from '@/components/dashboard/AddProductModal';

interface QuickActionsContextType {
    openQuickSale: () => void;
    openAddProduct: () => void;
}

const QuickActionsContext = createContext<QuickActionsContextType | undefined>(undefined);

export function QuickActionsProvider({ children }: { children: React.ReactNode }) {
    const [quickSaleOpen, setQuickSaleOpen] = useState(false);
    const [addProductOpen, setAddProductOpen] = useState(false);

    const openQuickSale = useCallback(() => setQuickSaleOpen(true), []);
    const openAddProduct = useCallback(() => setAddProductOpen(true), []);

    return (
        <QuickActionsContext.Provider value={{ openQuickSale, openAddProduct }}>
            {children}
            <QuickSaleModal isOpen={quickSaleOpen} onClose={() => setQuickSaleOpen(false)} />
            <AddProductModal isOpen={addProductOpen} onClose={() => setAddProductOpen(false)} />
        </QuickActionsContext.Provider>
    );
}

export function useQuickActions() {
    const context = useContext(QuickActionsContext);
    if (!context) {
        throw new Error('useQuickActions must be used within a QuickActionsProvider');
    }
    return context;
}
