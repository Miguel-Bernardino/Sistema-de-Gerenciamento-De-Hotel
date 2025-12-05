import { useState } from 'react';
import Modal from '~/component/Modal/Modal';
import { DoorOpen, X, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import styles from './CreateRoomModal.module.css';
import { RoomStatusType } from '~/component/roomStatusbar/roomStatusEnums';
import { useRooms } from '~/contexts/RoomsContext';
import { apiCall } from '~/utils/api';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CreateRoomFormData {
    roomNumber: string;
    roomType: string;
    floor: string;
    capacity: number;
    dailyRate: number;
    overnightRate: number;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
    isOpen,
    onClose
}) => {
    const { refreshRooms } = useRooms();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CreateRoomFormData>({
        defaultValues: {
            roomNumber: '',
            roomType: 'STANDARD',
            floor: '',
            capacity: 1,
            dailyRate: 0,
            overnightRate: 0
        }
    });

    const onSubmit = async (data: CreateRoomFormData) => {
        setIsSubmitting(true);

        try {
            const payload = {
                number: data.roomNumber,
                roomType: data.roomType.toUpperCase(),
                floor: parseInt(data.floor),
                capacity: parseInt(String(data.capacity)),
                dailyRate: parseFloat(String(data.dailyRate)),
                nightRate: parseFloat(String(data.overnightRate))
            };
            
            console.log('🏨 Criando quarto com payload:', payload);
            
            const response = await apiCall('/rooms', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            console.log('📡 Resposta status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Erro do backend:', errorData);
                alert(errorData.message || `Erro ${response.status}: Verifique os dados`);
                setIsSubmitting(false);
                return;
            }
            
            const result = await response.json();
            console.log('✅ Quarto criado:', result);

            // Refresh lista de quartos
            await refreshRooms();
            
            // Reset e fecha modal
            reset();
            onClose();
        } catch (error: any) {
            console.error('❌ Erro ao criar quarto:', error);
            alert(error.message || 'Erro ao conectar com o servidor');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (!isSubmitting) {
            reset();
            onClose();
        }
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
                        <DoorOpen className={styles.headerIcon} />
                        <div>
                            <h2 className={styles.title}>Criar Novo Quarto</h2>
                            <p className={styles.subtitle}>Preencha os dados do novo quarto</p>
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
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    {/* Número do Quarto */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="roomNumber" className={styles.label}>
                            <DoorOpen size={20} className={styles.labelIcon} />
                            Número do Quarto
                        </label>
                        <input
                            id="roomNumber"
                            type="text"
                            placeholder="Ex: 101, 102, 201..."
                            className={styles.input}
                            disabled={isSubmitting}
                            {...register('roomNumber', {
                                required: 'Número do quarto é obrigatório',
                                pattern: {
                                    value: /^[0-9A-Za-z]+$/,
                                    message: 'Use apenas letras e números'
                                }
                            })}
                        />
                        {errors.roomNumber && (
                            <span className={styles.errorText}>{errors.roomNumber.message}</span>
                        )}
                    </div>

                    {/* Tipo de Quarto */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="roomType" className={styles.label}>
                            Tipo de Quarto
                        </label>
                        <select
                            id="roomType"
                            className={styles.input}
                            disabled={isSubmitting}
                            {...register('roomType', {
                                required: 'Tipo de quarto é obrigatório'
                            })}
                        >
                            <option value="STANDARD">Standard</option>
                            <option value="DELUXE">Deluxe</option>
                            <option value="SUITE">Suite</option>
                            <option value="PREMIUM">Premium</option>
                        </select>
                        {errors.roomType && (
                            <span className={styles.errorText}>{errors.roomType.message}</span>
                        )}
                    </div>

                    {/* Andar */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="floor" className={styles.label}>
                            Andar
                        </label>
                        <input
                            id="floor"
                            type="text"
                            placeholder="Ex: 1º, 2º, Térreo..."
                            className={styles.input}
                            disabled={isSubmitting}
                            {...register('floor', {
                                required: 'Andar é obrigatório'
                            })}
                        />
                        {errors.floor && (
                            <span className={styles.errorText}>{errors.floor.message}</span>
                        )}
                    </div>

                    {/* Capacidade */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="capacity" className={styles.label}>
                            Capacidade (pessoas)
                        </label>
                        <input
                            id="capacity"
                            type="number"
                            min="1"
                            max="10"
                            className={styles.input}
                            disabled={isSubmitting}
                            {...register('capacity', {
                                required: 'Capacidade é obrigatória',
                                min: { value: 1, message: 'Mínimo 1 pessoa' },
                                max: { value: 10, message: 'Máximo 10 pessoas' }
                            })}
                        />
                        {errors.capacity && (
                            <span className={styles.errorText}>{errors.capacity.message}</span>
                        )}
                    </div>

                    {/* Tarifas */}
                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="dailyRate" className={styles.label}>
                                Tarifa Diária (12h)
                            </label>
                            <input
                                id="dailyRate"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="R$ 0,00"
                                className={styles.input}
                                disabled={isSubmitting}
                                {...register('dailyRate', {
                                    required: 'Tarifa diária é obrigatória',
                                    min: { value: 0, message: 'Valor deve ser positivo' }
                                })}
                            />
                            {errors.dailyRate && (
                                <span className={styles.errorText}>{errors.dailyRate.message}</span>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="overnightRate" className={styles.label}>
                                Tarifa Pernoite (24h)
                            </label>
                            <input
                                id="overnightRate"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="R$ 0,00"
                                className={styles.input}
                                disabled={isSubmitting}
                                {...register('overnightRate', {
                                    required: 'Tarifa pernoite é obrigatória',
                                    min: { value: 0, message: 'Valor deve ser positivo' }
                                })}
                            />
                            {errors.overnightRate && (
                                <span className={styles.errorText}>{errors.overnightRate.message}</span>
                            )}
                        </div>
                    </div>

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
                                <span>Criando...</span>
                            ) : (
                                <>
                                    <Check size={20} />
                                    Criar Quarto
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
