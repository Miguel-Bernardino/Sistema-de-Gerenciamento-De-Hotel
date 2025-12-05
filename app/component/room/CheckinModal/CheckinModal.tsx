import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import Modal from '~/component/Modal/Modal';
import { UserRound, CalendarClock, BadgeInfo, Check, X, Calendar, Clock, CreditCard, Users, Plus, Trash2, Car, DoorOpen } from 'lucide-react';
import styles from './CheckinModal.module.css';

interface CheckinModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomId?: string | number;
    roomType?: string;
    availableRooms?: Array<{ id: string | number; type: string; number: string }>;
    onCheckinComplete: (data: CheckinData) => void;
}

export interface CheckinData {
    roomId?: string | number;
    licensePlate?: string;
    isReservation?: boolean;
    responsible: string;
    cpf: string;
    phone: string;
    birthDate: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    stayType: 'daily' | 'overnight';
    companions: Companion[];
}

export interface Companion {
    name: string;
    cpf: string;
    birthDate: string;
}

export const CheckinModal: React.FC<CheckinModalProps> = ({ 
    isOpen, 
    onClose, 
    roomId, 
    roomType,
    availableRooms = [],
    onCheckinComplete 
}) => {
    const getCurrentDateTime = () => {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().slice(0, 5);
        return { date, time };
    };

    const { date: currentDate, time: currentTime } = getCurrentDateTime();

    const { 
        register, 
        control,
        handleSubmit: hookFormSubmit, 
        watch, 
        setValue,
        reset,
        setError: setFormError,
        formState: { errors, isSubmitting } 
    } = useForm<CheckinData>({
        defaultValues: {
            roomId: roomId || '',
            licensePlate: '',
            isReservation: false,
            responsible: '',
            cpf: '',
            phone: '',
            birthDate: '',
            startDate: currentDate,
            startTime: currentTime,
            endDate: '',
            endTime: '',
            stayType: 'daily',
            companions: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'companions'
    });

    const [showMinorWarning, setShowMinorWarning] = useState(false);
    const [minorWarningMessage, setMinorWarningMessage] = useState('');
    const [pendingData, setPendingData] = useState<CheckinData | null>(null);

    const stayType = watch('stayType');
    const startDate = watch('startDate');
    const startTime = watch('startTime');

    // Atualiza hora de entrada quando modal abre
    useEffect(() => {
        if (isOpen) {
            const { date, time } = getCurrentDateTime();
            setValue('startDate', date);
            setValue('startTime', time);
        }
    }, [isOpen, setValue]);

    // Calcula automaticamente data/hora de saída baseado no tipo de estadia
    useEffect(() => {
        if (startDate && startTime) {
            const startDateTime = new Date(`${startDate}T${startTime}`);
            let endDateTime = new Date(startDateTime);

            if (stayType === 'daily') {
                endDateTime.setHours(endDateTime.getHours() + 12);
            } else {
                endDateTime.setDate(endDateTime.getDate() + 1);
            }

            const endDate = endDateTime.toISOString().split('T')[0];
            const endTime = endDateTime.toTimeString().slice(0, 5);

            setValue('endDate', endDate);
            setValue('endTime', endTime);
        }
    }, [stayType, startDate, startTime, setValue]);

    const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        return value;
    };

    const formatLicensePlate = (value: string) => {
        // Formato brasileiro: ABC-1234 ou ABC1D23
        return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
    };

    const validateCPF = (cpf: string): boolean => {
        const numbers = cpf.replace(/\D/g, '');
        if (numbers.length !== 11) return false;
        if (/^(\d)\1+$/.test(numbers)) return false;
        return true;
    };

    const calculateAge = (birthDateStr: string): number => {
        const birthDate = new Date(birthDateStr);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const checkForMinors = (data: CheckinData): { hasMinors: boolean; message: string } => {
        const minors: string[] = [];

        // Apenas verifica acompanhantes menores de idade
        // O responsável deve ser sempre maior de idade
        data.companions.forEach((companion, index) => {
            if (companion.birthDate) {
                const age = calculateAge(companion.birthDate);
                if (age < 18) {
                    minors.push(`Acompanhante ${index + 1} (${companion.name || 'Nome não informado'}) - ${age} anos`);
                }
            }
        });

        if (minors.length > 0) {
            return {
                hasMinors: true,
                message: `Acompanhantes menores de idade identificados:\n${minors.join('\n')}\n\nDeseja continuar adicionando este(s) acompanhante(s)?`
            };
        }

        return { hasMinors: false, message: '' };
    };

    const addCompanion = () => {
        append({
            name: '',
            cpf: '',
            birthDate: ''
        });
    };

    const onSubmit = async (data: CheckinData) => {
        // Verifica menores de idade
        const minorCheck = checkForMinors(data);
        if (minorCheck.hasMinors) {
            setMinorWarningMessage(minorCheck.message);
            setPendingData(data);
            setShowMinorWarning(true);
            return;
        }

        await processCheckin(data);
    };

    const processCheckin = async (data: CheckinData) => {
        try {
            const now = new Date();
            const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
            const isReservation = startDateTime.getTime() > now.getTime();
            const enriched: CheckinData = { ...data, isReservation };
            const response = await mockBackendCall({
                roomId,
                ...enriched
            });

            if (response.success) {
                onCheckinComplete(enriched);
                reset();
                onClose();
            } else {
                setFormError('root', { 
                    message: response.message || 'Erro ao realizar check-in' 
                });
            }
        } catch (err) {
            setFormError('root', { 
                message: 'Erro ao conectar com o servidor. Tente novamente.' 
            });
            console.error('Check-in error:', err);
        } finally {
            setShowMinorWarning(false);
            setPendingData(null);
        }
    };

    const handleCancel = () => {
        reset();
        setShowMinorWarning(false);
        setPendingData(null);
        onClose();
    };

    const handleMinorConfirm = () => {
        if (pendingData) {
            processCheckin(pendingData);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            position="center"
            backgroundColor="var(--ocupacao-box-bg-color)"
            maxWidth="500px"
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
                        <Check className={styles.headerIcon} />
                        <div>
                            <h2 className={styles.title}>Check-in</h2>
                            {roomId && roomType ? (
                                <p className={styles.subtitle}>Quarto {roomId} - {roomType}</p>
                            ) : (
                                <p className={styles.subtitle}>Selecione um quarto disponível</p>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={handleCancel} 
                        className={styles.closeButton}
                        disabled={isSubmitting}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={hookFormSubmit(onSubmit)} className={styles.form}>
                    {/* Dropdown de Quartos (se houver lista de quartos disponíveis) */}
                    {availableRooms.length > 0 && (
                        <div className={styles.inputGroup}>
                            <label htmlFor="roomId" className={styles.label}>
                                <DoorOpen size={20} className={styles.labelIcon} />
                                Quarto
                            </label>
                            <select
                                id="roomId"
                                className={styles.input}
                                disabled={isSubmitting}
                                {...register('roomId', { 
                                    required: 'Selecione um quarto' 
                                })}
                            >
                                <option value="">Selecione um quarto disponível</option>
                                {availableRooms.map((room) => (
                                    <option key={room.id} value={room.id}>
                                        Quarto {room.number} - {room.type}
                                    </option>
                                ))}
                            </select>
                            {errors.roomId && (
                                <span className={styles.errorText}>{errors.roomId.message}</span>
                            )}
                        </div>
                    )}

                    {/* Placa do Veículo */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="licensePlate" className={styles.label}>
                            <Car size={20} className={styles.labelIcon} />
                            Placa do Veículo (opcional)
                        </label>
                        <input
                            id="licensePlate"
                            type="text"
                            placeholder="ABC-1234 ou ABC1D23"
                            maxLength={7}
                            className={styles.input}
                            disabled={isSubmitting}
                            {...register('licensePlate', {
                                onChange: (e) => {
                                    e.target.value = formatLicensePlate(e.target.value);
                                }
                            })}
                        />
                    </div>

                    {/* Responsável */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="responsible" className={styles.label}>
                            <UserRound size={20} className={styles.labelIcon} />
                            Responsável
                        </label>
                        <input
                            id="responsible"
                            type="text"
                            placeholder="Nome completo do responsável"
                            className={styles.input}
                            disabled={isSubmitting}
                            {...register('responsible', { 
                                required: 'Nome é obrigatório',
                                minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                            })}
                        />
                        {errors.responsible && (
                            <span className={styles.errorText}>{errors.responsible.message}</span>
                        )}
                    </div>

                    {/* CPF */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="cpf" className={styles.label}>
                            <CreditCard size={20} className={styles.labelIcon} />
                            CPF
                        </label>
                        <input
                            id="cpf"
                            type="text"
                            placeholder="000.000.000-00"
                            maxLength={14}
                            className={styles.input}
                            disabled={isSubmitting}
                            {...register('cpf', { 
                                required: 'CPF é obrigatório',
                                validate: value => validateCPF(value) || 'CPF inválido',
                                onChange: (e) => {
                                    e.target.value = formatCPF(e.target.value);
                                }
                            })}
                        />
                        {errors.cpf && (
                            <span className={styles.errorText}>{errors.cpf.message}</span>
                        )}
                    </div>

                    {/* Telefone */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="phone" className={styles.label}>
                            <CreditCard size={20} className={styles.labelIcon} />
                            Telefone
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder="(00) 00000-0000"
                            className={styles.input}
                            disabled={isSubmitting}
                            {...register('phone', { 
                                required: 'Telefone é obrigatório'
                            })}
                        />
                        {errors.phone && (
                            <span className={styles.errorText}>{errors.phone.message}</span>
                        )}
                    </div>

                    {/* Data de Nascimento */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="birthDate" className={styles.label}>
                            <Calendar size={20} className={styles.labelIcon} />
                            Data de Nascimento
                        </label>
                        <input
                            id="birthDate"
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            className={styles.input}
                            disabled={isSubmitting}
                            {...register('birthDate', { 
                                required: 'Data de nascimento é obrigatória',
                                validate: value => {
                                    const date = new Date(value);
                                    const today = new Date();
                                    if (date > today) return 'Data não pode ser futura';
                                    const age = calculateAge(value);
                                    if (age < 18) return 'Responsável deve ser maior de idade (18+ anos)';
                                    return true;
                                }
                            })}
                        />
                        {errors.birthDate && (
                            <span className={styles.errorText}>{errors.birthDate.message}</span>
                        )}
                    </div>

                    {/* Tipo de Estadia */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="stayType" className={styles.label}>
                            <Clock size={20} className={styles.labelIcon} />
                            Tipo de Estadia
                        </label>
                        <select
                            id="stayType"
                            className={styles.input}
                            disabled={isSubmitting}
                            {...register('stayType')}
                        >
                            <option value="daily">Diária (12 horas)</option>
                            <option value="overnight">Pernoite (24 horas)</option>
                        </select>
                    </div>

                    {/* Data e Hora de Entrada */}
                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="startDate" className={styles.label}>
                                <CalendarClock size={20} className={styles.labelIcon} />
                                Entrada
                            </label>
                            <input
                                id="startDate"
                                type="date"
                                className={styles.input}
                                disabled={isSubmitting}
                                {...register('startDate', { required: true })}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="startTime" className={styles.label}>
                                <Clock size={20} className={styles.labelIcon} />
                                Hora
                            </label>
                            <input
                                id="startTime"
                                type="time"
                                className={styles.input}
                                disabled={isSubmitting}
                                {...register('startTime', { required: true })}
                            />
                        </div>
                    </div>

                    {/* Data e Hora de Saída (calculada) */}
                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="endDate" className={styles.label}>
                                <CalendarClock size={20} className={styles.labelIcon} />
                                Saída Prevista
                            </label>
                            <input
                                id="endDate"
                                type="date"
                                className={`${styles.input} ${styles.calculatedField}`}
                                disabled
                                {...register('endDate')}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="endTime" className={styles.label}>
                                <Clock size={20} className={styles.labelIcon} />
                                Hora
                            </label>
                            <input
                                id="endTime"
                                type="time"
                                className={`${styles.input} ${styles.calculatedField}`}
                                disabled
                                {...register('endTime')}
                            />
                        </div>
                    </div>

                    {/* Acompanhantes */}
                    <div className={styles.companionsSection}>
                        <div className={styles.companionsHeader}>
                            <label className={styles.label}>
                                <Users size={20} className={styles.labelIcon} />
                                Acompanhantes
                            </label>
                            <button
                                type="button"
                                onClick={addCompanion}
                                className={styles.addCompanionButton}
                                disabled={isSubmitting}
                            >
                                <Plus size={18} />
                                Adicionar
                            </button>
                        </div>

                        {fields.length === 0 ? (
                            <p className={styles.noCompanions}>Nenhum acompanhante adicionado</p>
                        ) : (
                            <div className={styles.companionsList}>
                                {fields.map((field, index) => (
                                    <div key={field.id} className={styles.companionCard}>
                                        <div className={styles.companionHeader}>
                                            <span className={styles.companionNumber}>Acompanhante {index + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className={styles.removeCompanionButton}
                                                disabled={isSubmitting}
                                                title="Remover acompanhante"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className={styles.companionInputs}>
                                            <div className={styles.inputGroup}>
                                                <input
                                                    type="text"
                                                    placeholder="Nome completo"
                                                    className={styles.input}
                                                    disabled={isSubmitting}
                                                    {...register(`companions.${index}.name`, {
                                                        required: 'Nome é obrigatório'
                                                    })}
                                                />
                                                {errors.companions?.[index]?.name && (
                                                    <span className={styles.errorText}>
                                                        {errors.companions[index]?.name?.message}
                                                    </span>
                                                )}
                                            </div>

                                            <div className={styles.inputRow}>
                                                <div className={styles.inputGroup}>
                                                    <input
                                                        type="text"
                                                        placeholder="CPF"
                                                        maxLength={14}
                                                        className={styles.input}
                                                        disabled={isSubmitting}
                                                        {...register(`companions.${index}.cpf`, {
                                                            required: 'CPF é obrigatório',
                                                            validate: value => validateCPF(value) || 'CPF inválido',
                                                            onChange: (e) => {
                                                                e.target.value = formatCPF(e.target.value);
                                                            }
                                                        })}
                                                    />
                                                    {errors.companions?.[index]?.cpf && (
                                                        <span className={styles.errorText}>
                                                            {errors.companions[index]?.cpf?.message}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <input
                                                        type="date"
                                                        max={new Date().toISOString().split('T')[0]}
                                                        className={styles.input}
                                                        disabled={isSubmitting}
                                                        {...register(`companions.${index}.birthDate`, {
                                                            required: 'Data é obrigatória'
                                                        })}
                                                    />
                                                    {errors.companions?.[index]?.birthDate && (
                                                        <span className={styles.errorText}>
                                                            {errors.companions[index]?.birthDate?.message}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Root Error */}
                    {errors.root && (
                        <div className={styles.errorMessage}>
                            {errors.root.message}
                        </div>
                    )}

                    {/* Actions */}
                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className={`${styles.button} ${styles.cancelButton}`}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`${styles.button} ${styles.submitButton}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className={styles.loadingSpinner}>Processando...</span>
                            ) : (
                                <>
                                    <Check size={20} />
                                    Confirmar Check-in
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Minor Warning Modal */}
            {showMinorWarning && (
                <div className={styles.warningOverlay}>
                    <div className={styles.warningModal}>
                        <div className={styles.warningHeader}>
                            <BadgeInfo size={32} className={styles.warningIcon} />
                            <h3 className={styles.warningTitle}>Atenção: Acompanhantes Menores de Idade</h3>
                        </div>
                        <div className={styles.warningContent}>
                            <p className={styles.warningText}>{minorWarningMessage}</p>
                        </div>
                        <div className={styles.warningActions}>
                            <button
                                type="button"
                                onClick={() => setShowMinorWarning(false)}
                                className={`${styles.button} ${styles.cancelButton}`}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleMinorConfirm}
                                className={`${styles.button} ${styles.submitButton}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className={styles.loadingSpinner}>Processando...</span>
                                ) : (
                                    <>
                                        <Check size={20} />
                                        Confirmar e Continuar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

// Mock da chamada ao back-end - Remover quando implementar API real
async function mockBackendCall(data: any): Promise<{ success: boolean; message?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (Math.random() > 0.01) {
        console.log('Mock API Call - Check-in realizado:', data);
        return { success: true };
    } else {
        return { success: false, message: 'Erro simulado do servidor' };
    }
}
