import { useState, useEffect } from 'react';
import Modal from '~/component/Modal/Modal';
import { LogOut, Clock, DollarSign, ShoppingCart, Receipt, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import styles from './CheckoutModal.module.css';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomId: string | number;
    roomType: string;
    responsible: string;
    startDate: string;
    endDate: string;
    onCheckoutComplete: () => void;
}

export interface ConsumedProduct {
    id: string | number;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface CheckoutPreview {
    roomId: string | number;
    responsible: string;
    checkInTime: string;
    checkOutTime: string;
    stayDuration: string; // "12h 30min"
    roomRate: number;
    products: ConsumedProduct[];
    subtotalProducts: number;
    totalAmount: number;
    taxesAndFees: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
    isOpen,
    onClose,
    roomId,
    roomType,
    responsible,
    startDate,
    endDate,
    onCheckoutComplete
}) => {
    const [isLoadingPreview, setIsLoadingPreview] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewData, setPreviewData] = useState<CheckoutPreview | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Busca prévia da conta ao abrir o modal
    useEffect(() => {
        if (isOpen) {
            fetchCheckoutPreview();
        }
    }, [isOpen, roomId]);

    const fetchCheckoutPreview = async () => {
        setIsLoadingPreview(true);
        setError(null);

        try {
            // Chama o endpoint do CalculadoraTarifaService
            const preview = await fetchCalculadoraTarifaService({
                roomId,
                roomType,
                checkInTime: startDate,
                checkOutTime: endDate
            });

            setPreviewData(preview);
        } catch (err) {
            console.error('Erro ao buscar prévia de checkout:', err);
            setError('Não foi possível carregar os dados da conta. Tente novamente.');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleConfirmCheckout = async () => {
        if (!previewData) return;

        setIsProcessing(true);
        setError(null);

        try {
            // Chama endpoint de finalização de checkout
            const response = await finalizeCheckout({
                roomId,
                totalAmount: previewData.totalAmount
            });

            if (response.success) {
                onCheckoutComplete();
                onClose();
            } else {
                setError(response.message || 'Erro ao finalizar check-out');
            }
        } catch (err) {
            console.error('Erro ao finalizar checkout:', err);
            setError('Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        if (!isProcessing) {
            setPreviewData(null);
            setError(null);
            onClose();
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            position="center"
            backgroundColor="var(--ocupacao-box-bg-color)"
            maxWidth="600px"
            minWidth="320px"
            padding="0"
            borderRadius="12px"
            animationType="scaleIn"
            exitAnimationType="scaleOut"
            showHeader={false}
        >
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <LogOut className={styles.headerIcon} />
                        <div>
                            <h2 className={styles.title}>Check-out</h2>
                            <p className={styles.subtitle}>
                                Quarto {roomId} - {roomType}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleCancel}
                        className={styles.closeButton}
                        disabled={isProcessing}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {isLoadingPreview ? (
                        <div className={styles.loadingState}>
                            <Loader2 className={styles.spinner} size={48} />
                            <p className={styles.loadingText}>Calculando conta...</p>
                        </div>
                    ) : error ? (
                        <div className={styles.errorState}>
                            <AlertCircle className={styles.errorIcon} size={48} />
                            <p className={styles.errorText}>{error}</p>
                            <button
                                onClick={fetchCheckoutPreview}
                                className={styles.retryButton}
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    ) : previewData ? (
                        <>
                            {/* Informações da Estadia */}
                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>
                                    <Clock size={20} />
                                    Informações da Estadia
                                </h3>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Responsável:</span>
                                        <span className={styles.infoValue}>{responsible}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Check-in:</span>
                                        <span className={styles.infoValue}>
                                            {previewData.checkInTime}
                                        </span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Check-out:</span>
                                        <span className={styles.infoValue}>
                                            {previewData.checkOutTime}
                                        </span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Duração:</span>
                                        <span className={styles.infoValue}>
                                            {previewData.stayDuration}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Tarifas do Quarto */}
                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>
                                    <DollarSign size={20} />
                                    Tarifa do Quarto
                                </h3>
                                <div className={styles.chargeItem}>
                                    <span className={styles.chargeLabel}>
                                        {roomType} - {previewData.stayDuration}
                                    </span>
                                    <span className={styles.chargeValue}>
                                        {formatCurrency(previewData.roomRate)}
                                    </span>
                                </div>
                            </section>

                            {/* Produtos Consumidos */}
                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>
                                    <ShoppingCart size={20} />
                                    Produtos Consumidos
                                </h3>
                                {previewData.products.length === 0 ? (
                                    <p className={styles.emptyMessage}>
                                        Nenhum produto consumido
                                    </p>
                                ) : (
                                    <div className={styles.productsList}>
                                        {previewData.products.map((product) => (
                                            <div
                                                key={product.id}
                                                className={styles.productItem}
                                            >
                                                <div className={styles.productInfo}>
                                                    <span className={styles.productName}>
                                                        {product.name}
                                                    </span>
                                                    <span className={styles.productQuantity}>
                                                        {product.quantity}x {formatCurrency(product.unitPrice)}
                                                    </span>
                                                </div>
                                                <span className={styles.productTotal}>
                                                    {formatCurrency(product.totalPrice)}
                                                </span>
                                            </div>
                                        ))}
                                        <div className={styles.subtotalRow}>
                                            <span className={styles.subtotalLabel}>
                                                Subtotal Produtos:
                                            </span>
                                            <span className={styles.subtotalValue}>
                                                {formatCurrency(previewData.subtotalProducts)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Resumo Final */}
                            <section className={styles.summarySection}>
                                <h3 className={styles.sectionTitle}>
                                    <Receipt size={20} />
                                    Resumo da Conta
                                </h3>
                                <div className={styles.summaryList}>
                                    <div className={styles.summaryItem}>
                                        <span>Tarifa do Quarto:</span>
                                        <span>{formatCurrency(previewData.roomRate)}</span>
                                    </div>
                                    <div className={styles.summaryItem}>
                                        <span>Produtos:</span>
                                        <span>{formatCurrency(previewData.subtotalProducts)}</span>
                                    </div>
                                    {previewData.taxesAndFees > 0 && (
                                        <div className={styles.summaryItem}>
                                            <span>Taxas e Serviços:</span>
                                            <span>{formatCurrency(previewData.taxesAndFees)}</span>
                                        </div>
                                    )}
                                    <div className={styles.totalRow}>
                                        <span className={styles.totalLabel}>Total:</span>
                                        <span className={styles.totalValue}>
                                            {formatCurrency(previewData.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {error && (
                                <div className={styles.errorBanner}>
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                {/* Actions */}
                {!isLoadingPreview && !error && previewData && (
                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className={`${styles.button} ${styles.cancelButton}`}
                            disabled={isProcessing}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmCheckout}
                            className={`${styles.button} ${styles.confirmButton}`}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className={styles.buttonSpinner} size={20} />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Check size={20} />
                                    Confirmar Check-out
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

// Mock do serviço CalculadoraTarifaService (T6.1 e T6.2)
// TODO: Substituir por chamada real ao backend
async function fetchCalculadoraTarifaService(params: {
    roomId: string | number;
    roomType: string;
    checkInTime: string;
    checkOutTime: string;
}): Promise<CheckoutPreview> {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock de produtos consumidos
    const mockProducts: ConsumedProduct[] = [
        {
            id: 1,
            name: 'Refrigerante 350ml',
            quantity: 2,
            unitPrice: 8.5,
            totalPrice: 17.0
        },
        {
            id: 2,
            name: 'Sanduíche',
            quantity: 1,
            unitPrice: 25.0,
            totalPrice: 25.0
        },
        {
            id: 3,
            name: 'Água Mineral',
            quantity: 3,
            unitPrice: 5.0,
            totalPrice: 15.0
        }
    ];

    // Calcula duração da estadia
    const checkIn = new Date(params.checkInTime);
    const checkOut = new Date(params.checkOutTime);
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const stayDuration = `${diffHours}h ${diffMinutes}min`;

    // Tarifa base do quarto (mock)
    const roomRate = diffHours >= 24 ? 250.0 : 150.0;

    // Subtotal de produtos
    const subtotalProducts = mockProducts.reduce((sum, p) => sum + p.totalPrice, 0);

    // Taxas e serviços (10% do subtotal)
    const taxesAndFees = (roomRate + subtotalProducts) * 0.1;

    // Total
    const totalAmount = roomRate + subtotalProducts + taxesAndFees;

    return {
        roomId: params.roomId,
        responsible: '',
        checkInTime: checkIn.toLocaleString('pt-BR'),
        checkOutTime: checkOut.toLocaleString('pt-BR'),
        stayDuration,
        roomRate,
        products: mockProducts,
        subtotalProducts,
        totalAmount,
        taxesAndFees
    };
}

// Mock de finalização de checkout
// TODO: Substituir por chamada real ao backend
async function finalizeCheckout(data: {
    roomId: string | number;
    totalAmount: number;
}): Promise<{ success: boolean; message?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Mock API Call - Check-out finalizado:', data);
    return { success: true };
}
