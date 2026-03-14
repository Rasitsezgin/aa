import { useState, useEffect, useCallback } from 'react';
import { useOrders, useProducts } from '@/lib/hooks';

export interface SelectedItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    sku?: string;
}

export interface CustomerData {
    name: string;
    phone: string;
    email: string;
    address: string;
}

export const useQuickSale = (onClose: () => void) => {
    const { createOrder, loading: orderLoading } = useOrders();
    const { products, loading: productsLoading } = useProducts();

    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [customerData, setCustomerData] = useState<CustomerData>({
        name: '',
        phone: '',
        email: '',
        address: ''
    });

    // Keyboard navigation state
    const [focusedProductIndex, setFocusedProductIndex] = useState(-1);

    const reset = useCallback(() => {
        setSelectedItems([]);
        setCustomerData({
            name: '',
            phone: '',
            email: '',
            address: ''
        });
        setStatus('idle');
        setErrorMessage('');
        setSearchQuery('');
        setFocusedProductIndex(-1);
    }, []);

    const handleClose = useCallback(() => {
        if (status !== 'idle') reset();
        onClose();
    }, [status, reset, onClose]);

    const addItem = useCallback((product: any) => {
        if (!product) return;

        setSelectedItems(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                name: product.name,
                quantity: 1,
                price: product.price,
                sku: product.sku
            }];
        });
        setSearchQuery('');
        setFocusedProductIndex(-1);
    }, []);

    const removeItem = useCallback((productId: string) => {
        setSelectedItems(prev => prev.filter(item => item.productId !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, delta: number) => {
        setSelectedItems(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    }, []);

    const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (selectedItems.length === 0) {
            setErrorMessage('Lütfen en az bir ürün seçin.');
            setStatus('error');
            return;
        }

        try {
            await createOrder({
                customerName: customerData.name,
                customerEmail: customerData.email,
                customerPhone: customerData.phone,
                shippingAddress: customerData.address,
                items: selectedItems,
                totalAmount: totalAmount,
                platform: 'MANUAL',
                status: 'CONFIRMED',
                paymentStatus: 'confirmed'
            });
            setStatus('success');
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Satış oluşturulurken bir hata oluştu.');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5);

    // Keyboard navigation logic
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!searchQuery) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedProductIndex(prev =>
                prev < filteredProducts.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedProductIndex(prev => prev > 0 ? prev - 1 : 0);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (focusedProductIndex >= 0 && filteredProducts[focusedProductIndex]) {
                addItem(filteredProducts[focusedProductIndex]);
            }
        }
    }, [searchQuery, filteredProducts, focusedProductIndex, addItem]);

    // Reset focus when query changes
    useEffect(() => {
        setFocusedProductIndex(filteredProducts.length > 0 ? 0 : -1);
    }, [searchQuery, products]);

    return {
        status,
        errorMessage,
        searchQuery,
        setSearchQuery,
        selectedItems,
        customerData,
        setCustomerData,
        focusedProductIndex,
        filteredProducts,
        totalAmount,
        orderLoading,
        productsLoading,
        handleClose,
        addItem,
        removeItem,
        updateQuantity,
        handleSubmit,
        handleKeyDown
    };
};
