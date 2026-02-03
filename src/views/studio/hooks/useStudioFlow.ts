import { useState, useEffect } from 'react';
import { Flow } from '../types';
import { flowStorage, INITIAL_FLOW } from '@/utils/flowStorage';

export const useStudioFlow = (id?: string) => {
    const [isLoading, setIsLoading] = useState(true);
    const [flow, setFlow] = useState<Flow>(INITIAL_FLOW);

    // Load Flow
    useEffect(() => {
        const loadFlow = async () => {
            if (id) {
                const loaded = await flowStorage.getFlow(id);
                if (loaded) {
                    // Migration: Ensure Start Node exists for V4 flows
                    if (loaded.steps && !loaded.steps.find(s => s.type === 'start')) {
                        const startNode: import('../types').StartNode = {
                            id: 'start-node-' + Date.now(),
                            type: 'start',
                            position: { x: 50, y: 50 }
                        };

                        // Connect to the first node (likely the welcome node or first in list)
                        const firstStep = loaded.steps.find(s => s.type === 'turn' && s.phase === 'welcome') || loaded.steps[0];
                        let newConnections = loaded.connections || [];

                        if (firstStep) {
                            newConnections = [
                                {
                                    id: 'edge-start-' + Date.now(),
                                    source: startNode.id,
                                    target: firstStep.id
                                },
                                ...newConnections
                            ];
                        }

                        setFlow({
                            ...loaded,
                            steps: [startNode, ...loaded.steps],
                            connections: newConnections
                        });
                    } else {
                        setFlow(loaded);
                    }
                } else {
                    console.warn(`Flow ${id} not found, initializing empty.`);
                    setFlow({ ...INITIAL_FLOW, id });
                }
            }
            setIsLoading(false);
        };
        loadFlow();
    }, [id]);

    // Persistence
    useEffect(() => {
        if (!isLoading && flow.id && flow.id !== 'initial') {
            const saveDebounce = setTimeout(() => {
                flowStorage.saveFlow(flow);
            }, 1000); // 1s auto-save debounce

            return () => clearTimeout(saveDebounce);
        }
    }, [flow, isLoading]);

    return { flow, setFlow, isLoading };
};
