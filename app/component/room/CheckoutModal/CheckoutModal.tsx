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
            const n = Number(roomId);
            if (!Number.isFinite(n)) {
                console.error('❌ roomId inválido ao abrir modal de checkout:', roomId);
                setError('ID do quarto inválido para checkout');
                setIsLoadingPreview(false);
                return;
            }
            fetchCheckoutPreview();
        }
    }, [isOpen, roomId]);

    const fetchCheckoutPreview = async () => {
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
    const roomIdNum = Number(roomId);
    if (!Number.isFinite(roomIdNum) || roomIdNum <= 0) {
        console.error('❌ roomId inválido ao buscar resumo:', roomId);
        throw new Error('ID do quarto inválido para checkout');
    }
    console.log('🔍 Buscando ocupação para quarto:', roomIdNum);

    // Tenta endpoint principal
    let occupation: any | null = null;
    let primaryStatus: number | null = null;

    const response = await apiCall(`/occupations/room/${roomIdNum}`);
    primaryStatus = response.status;

    if (response.ok) {
        const data = await response.json();
        occupation = data.data ?? data;
    } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('❌ Status ao buscar ocupação:', response.status, 'Erro:', errorData);
    }

    // Fallback se 404 ou nenhum resultado
    if (!occupation) {
        console.log(`🟡 Tentando fallback via lista de ocupações: /occupations?roomId=${roomIdNum}`);
        const fallbackResponse = await apiCall(`/occupations?roomId=${roomIdNum}`);

        if (fallbackResponse.ok) {
            const payload = await fallbackResponse.json().catch(() => ({}));
            const root = payload?.data ?? payload;
            const list = Array.isArray(root)
                ? root
                : Array.isArray(root?.items)
                    ? root.items
                    : Array.isArray(root?.results)
                        ? root.results
                        : [];

            const isActive = (status?: string) => {
                const s = (status || '').toLowerCase();
                return ['active', 'ativado', 'ativa', 'occupied', 'ocupado', 'em_andamento', 'in_progress', 'checked_in', 'ongoing', 'open'].includes(s);
            };

            const hasNoCheckout = (o: any) => {
                return !o?.checkOutDate && !o?.checkoutDate && !o?.checkOut && !o?.closedAt && !o?.endedAt;
            };

            const chosen = list.find((o) => isActive(o.status))
                || list.find(hasNoCheckout)
                || list[0];
            occupation = chosen || null;
        } else {
            const err = await fallbackResponse.json().catch(() => ({}));
            console.warn('❌ Fallback também falhou:', fallbackResponse.status, err);
        }
    }

    if (!occupation) {
        throw new Error(`Nenhuma ocupação ativa encontrada para este quarto (status ${primaryStatus})`);
    }

    console.log('✅ Ocupação carregada:', occupation);

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

    const isActive = (status?: string) => {
        const s = (status || '').toLowerCase();
        return ['active', 'ativado', 'ativa', 'occupied', 'ocupado', 'em_andamento', 'in_progress', 'checked_in', 'ongoing', 'open'].includes(s);
    };

    if (!isActive(occupation.status)) {
        throw new Error('A ocupação deste quarto não está ativa. Faça um novo check-in antes do checkout.');
    }

    return {
        roomId: roomIdNum,
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
    try {
        const roomIdNum = Number(params.roomId);
        if (!Number.isFinite(roomIdNum) || roomIdNum <= 0) {
            return { success: false, message: 'ID do quarto inválido para checkout' };
        }

        // Primeiro, busca a ocupação ativa para obter seu ID
        let occupation: any | null = null;
        const occupationResponse = await apiCall(`/occupations/room/${roomIdNum}`);

        const selectFromList = (list: any[]) => {
            const isActive = (status?: string) => {
                const s = (status || '').toLowerCase();
                return ['active', 'ativado', 'ativa', 'occupied', 'ocupado', 'em_andamento', 'in_progress', 'checked_in', 'ongoing', 'open'].includes(s);
            };

            const hasNoCheckout = (o: any) => {
                return !o?.checkOutDate && !o?.checkoutDate && !o?.checkOut && !o?.closedAt && !o?.endedAt;
            };

            const sorted = [...list].sort((a, b) => {
                const da = new Date(a?.checkInDate || a?.startDate || a?.createdAt || 0).getTime();
                const db = new Date(b?.checkInDate || b?.startDate || b?.createdAt || 0).getTime();
                return db - da;
            });

            return sorted.find((o) => isActive(o.status))
                || sorted.find(hasNoCheckout)
                || sorted[0]
                || null;
        };

        if (occupationResponse.ok) {
            const data = await occupationResponse.json().catch(() => ({}));
            occupation = data.data ?? data;
        } else {
            console.warn('❌ Ocupação direta falhou, tentando fallback...');
            console.log(`🟡 Tentando fallback via lista de ocupações: /occupations?roomId=${roomIdNum}`);
            const fallbackResponse = await apiCall(`/occupations?roomId=${roomIdNum}`);
            if (fallbackResponse.ok) {
                const payload = await fallbackResponse.json().catch(() => ({}));
                const root = payload?.data ?? payload;
                const list = Array.isArray(root)
                    ? root
                    : Array.isArray(root?.items)
                        ? root.items
                        : Array.isArray(root?.results)
                            ? root.results
                            : [];

                occupation = selectFromList(list);
            }
        }

        if (!occupation) {
            return { success: false, message: 'Não foi possível encontrar a ocupação ativa' };
        }

        const isActive = (occ: any) => {
            const s = String(occ?.status || occ?.state || '').toLowerCase();
            const flag = occ?.isActive === true || occ?.active === true;
            return flag || ['active', 'ativado', 'ativa', 'occupied', 'ocupado', 'em_andamento', 'in_progress', 'checked_in', 'ongoing', 'open'].includes(s);
        };

        console.log('ℹ️ Status da ocupação selecionada (finalize):', occupation.status, 'state:', occupation.state, 'isActive:', occupation.isActive, 'active:', occupation.active);

        if (!isActive(occupation)) {
            console.warn('⚠️ Ocupação selecionada não está ativa:', occupation);
            return { success: false, message: 'A ocupação não está ativa. Faça um novo check-in antes do checkout.' };
        }

        const occupationId = occupation?.id ?? occupation?._id ?? roomIdNum;
        console.log('🏨 Finalizando checkout para ocupação:', occupationId, 'ocupação:', occupation);
        
        // Realiza o checkout
        const response = await apiCall(`/occupations/${occupationId}/checkout`, {
            method: 'POST',
            body: JSON.stringify({ 
                serviceChargePercentage: 10
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Erro ao finalizar checkout:', errorData);
            return { success: false, message: errorData.message || 'Erro ao finalizar check-out' };
        }

        const result = await response.json();
        console.log('✅ Checkout realizado com sucesso:', result);
        return { success: true };
    } catch (error: any) {
        console.error('❌ Erro na finalização:', error);
        return { success: false, message: error.message || 'Erro ao conectar com servidor' };
    }
};
