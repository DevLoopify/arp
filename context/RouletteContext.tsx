import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type RouletteContextValue = {
    rouletteIds: Set<number>;
    isInRoulette: (id: number) => boolean;
    toggleRoulette: (id: number) => void;
    clearRoulette: () => void;
};

const RouletteContext = createContext<RouletteContextValue | undefined>(undefined);

export function RouletteProvider({ children }: { children: ReactNode }) {
    const [rouletteIds, setRouletteIds] = useState<Set<number>>(new Set());

    const toggleRoulette = useCallback((id: number) => {
        setRouletteIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const clearRoulette = useCallback(() => {
        setRouletteIds(new Set());
    }, []);

    const isInRoulette = useCallback((id: number) => rouletteIds.has(id), [rouletteIds]);

    const value = useMemo(
        () => ({ rouletteIds, isInRoulette, toggleRoulette, clearRoulette }),
        [rouletteIds, isInRoulette, toggleRoulette, clearRoulette]
    );

    return <RouletteContext.Provider value={value}>{children}</RouletteContext.Provider>;
}

export function useRoulette() {
    const context = useContext(RouletteContext);
    if (!context) {
        throw new Error('useRoulette must be used within a RouletteProvider');
    }
    return context;
}
