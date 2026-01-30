import { useState, useCallback, useRef, useEffect } from 'react';
import { Flow } from '../types';

export const useFlowHistory = (
    currentFlow: Flow,
    setFlow: (flow: Flow) => void
) => {
    // We use a ref for the stacks to mutable updates without re-renders until necessary,
    // but actually standard react state is safer for UI updates (buttons enabled/disabled).
    const [past, setPast] = useState<Flow[]>([]);
    const [future, setFuture] = useState<Flow[]>([]);

    // We keep a reference to current flow to avoid stale closures in callbacks if needed,
    // but we can also just rely on the prop if it's kept fresh.
    const flowRef = useRef(currentFlow);
    useEffect(() => {
        flowRef.current = currentFlow;
    }, [currentFlow]);

    // Wrapper for updates that should be recorded
    const setFlowWithHistory = useCallback((newFlow: Flow) => {
        setPast(prev => {
            // Optional: Limit history size (e.g. 50 steps)
            const newPast = [...prev, flowRef.current];
            if (newPast.length > 50) return newPast.slice(1);
            return newPast;
        });
        setFuture([]); // Clear future on new change
        setFlow(newFlow);
    }, [setFlow]);

    const undo = useCallback(() => {
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);

        setPast(newPast);
        setFuture(prev => [flowRef.current, ...prev]);
        setFlow(previous);
    }, [past, setFlow]);

    const redo = useCallback(() => {
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast(prev => [...prev, flowRef.current]);
        setFuture(newFuture);
        setFlow(next);
    }, [future, setFlow]);

    return {
        setFlowWithHistory,
        undo,
        redo,
        canUndo: past.length > 0,
        canRedo: future.length > 0
    };
};
