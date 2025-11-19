import * as status from './roomStatusEnums';

export function RoomStatusbar({...props}: any) {
    
    const statusKeys = Object.keys(status.RoomStatusMeta) as Array<keyof typeof status.RoomStatusMeta>;

    return (
        <div className="w-full h-fit text-[9px] md:text-[12.5px] flex flex-row justify-center mt-4">
            <ol className="w-[80%] flex flex-row flex-wrap justify-center gap-2">
                {
                    statusKeys.map(key => {
                        const { status: statusLabel, color } = status.RoomStatusMeta[key];
                        return (
                            <li key={key} style={{
                                backgroundColor: color,
                                color: 'var(--text-on-primary)',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 600,
                                padding: '4px 8px',
                                borderRadius: '999px',
                            }}>
                                {statusLabel}
                            </li>
                        );
                    })
                }
            </ol>
        </div>
    );
}