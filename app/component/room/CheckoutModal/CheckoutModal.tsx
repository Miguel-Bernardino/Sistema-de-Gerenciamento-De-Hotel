import { useState, useEffect } from 'react';
import Modal from '~/component/Modal/Modal';
import { LogOut, Clock, DollarSign, ShoppingCart, Receipt, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { apiCall } from '~/utils/api';
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

const formatDateTime = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const parts = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).formatToParts(date).reduce<Record<string, string>>((acc, part) => {
        if (part.type !== 'literal') acc[part.type] = part.value;
        return acc;
    }, {});

    const y = parts.year || '';
    const m = parts.month || '';
    const d = parts.day || '';
    const hh = parts.hour || '00';
    const mm = parts.minute || '00';
    return `${y}-${m}-${d} ${hh}:${mm}`;
};

const computeStayDuration = (checkInTime?: string, checkOutTime?: string) => {
    if (!checkInTime || !checkOutTime) return '';
    const start = new Date(checkInTime);
    const end = new Date(checkOutTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return '';
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}min`;
};

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
const finalizeCheckout = async (params: { roomId: string | number }): Promise<{ success: boolean; message?: string }> => {
    const response = await apiCall(`/occupations/${params.roomId}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ serviceChargePercentage: 10 })
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Erro ao finalizar check-out' };
    }

    return { success: true };
};

        setIsLoadingPreview(true);
        setError(null);

        try {
            const preview = await fetchCheckoutSummary(roomId);
            const formatted: CheckoutPreview = {
                ...preview,
                checkInTime: formatDateTime(preview.checkInTime),
                checkOutTime: formatDateTime(preview.checkOutTime),
                stayDuration: preview.stayDuration || computeStayDuration(preview.checkInTime, preview.checkOutTime)
            };
            setPreviewData(formatted);
        } catch (err) {
            console.error('Erro ao buscar prévia de checkout:', err);
            setError('Não foi possível carregar os dados da conta. Tente novamente.');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleConfirmCheckout = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            const response = await finalizeCheckout({ roomId });

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

const fetchCheckoutSummary = async (roomId: string | number): Promise<CheckoutPreview> => {
    const response = await apiCall(`/occupations/room/${roomId}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao carregar resumo do checkout');
    }

    const data = await response.json();
    const occupation = data.data ?? data;

    const products: ConsumedProduct[] = (occupation?.consumptions || []).map((item: any) => ({
        id: item.id ?? item._id ?? `${item.productId ?? 'prod'}-${item.createdAt ?? ''}`,
        name: item.productName ?? item.name ?? 'Produto',
        quantity: Number(item.quantity ?? 1),
        unitPrice: Number(item.unitPrice ?? item.price ?? 0),
        totalPrice: Number(item.totalPrice ?? (Number(item.quantity ?? 1) * Number(item.unitPrice ?? item.price ?? 0)))
    }));

    const subtotalProducts = products.reduce((sum, p) => sum + p.totalPrice, 0);
    const roomRate = Number(occupation?.roomRate ?? occupation?.nightRate ?? occupation?.dailyRate ?? 0);
    const taxesAndFees = Number(occupation?.serviceTax ?? occupation?.serviceCharge ?? 0);
    const totalAmount = Number(occupation?.total ?? occupation?.totalAmount ?? occupation?.finalAmount ?? roomRate + subtotalProducts + taxesAndFees);

    const checkInTime = occupation?.checkInDate ?? occupation?.startDate ?? occupation?.entryDate ?? '';
    const checkOutTime = occupation?.expectedCheckOut ?? occupation?.endDate ?? occupation?.checkOutDate ?? occupation?.exitDate ?? '';

    const stayDuration = occupation?.duration || occupation?.stayDuration || '';

    return {
        roomId,
        responsible: occupation?.responsibleName ?? occupation?.responsible ?? 'Responsável',
        checkInTime,
        checkOutTime,
        stayDuration,
        roomRate,
        products,
        subtotalProducts,
        taxesAndFees,
        totalAmount
    };
};

const finalizeCheckout = async (params: { roomId: string | number }): Promise<{ success: boolean; message?: string }> => {
    const response = await apiCall(`/occupations/${params.roomId}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ serviceChargePercentage: 10 })
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Erro ao finalizar check-out' };
    }

    return { success: true };
};
