import { useState, useEffect } from 'react';
import { Flow } from '../types';
import { flowStorage, INITIAL_FLOW } from '@/utils/flowStorage';

export const useStudioFlow = (id?: string) => {
    const [isLoading, setIsLoading] = useState(true);
    const [flow, setFlow] = useState<Flow>(INITIAL_FLOW);

    // Load Flow
    useEffect(() => {
        if (id) {
            const loaded = flowStorage.getFlow(id);
            if (loaded) {
                setFlow(loaded);
            } else {
                console.warn(`Flow ${id} not found, initializing empty.`);
                setFlow({ ...INITIAL_FLOW, id });
            }
        }
        setIsLoading(false);
    }, [id]);

    // Persistence
    useEffect(() => {
        if (!isLoading && flow.id) {
            flowStorage.saveFlow(flow);
        }
    }, [flow, isLoading]);

    return { flow, setFlow, isLoading };
};
