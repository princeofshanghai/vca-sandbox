import { useEffect, type RefObject } from 'react';

const SAFARI_GESTURE_EVENTS = ['gesturestart', 'gesturechange', 'gestureend'] as const;

export function usePreventBrowserPinchZoom<T extends HTMLElement>(
    ref: RefObject<T | null>,
    enabled = true
) {
    useEffect(() => {
        if (!enabled) return;

        const element = ref.current;
        if (!element) return;

        const handleWheel = (event: WheelEvent) => {
            // Desktop pinch gestures commonly surface as ctrl+wheel. We only block
            // that browser zoom path so normal scrolling inside the panel still works.
            if (!event.ctrlKey) return;
            event.preventDefault();
        };

        const handleSafariGesture = (event: Event) => {
            event.preventDefault();
        };

        element.addEventListener('wheel', handleWheel, { passive: false });

        for (const eventName of SAFARI_GESTURE_EVENTS) {
            element.addEventListener(eventName, handleSafariGesture, { passive: false });
        }

        return () => {
            element.removeEventListener('wheel', handleWheel);

            for (const eventName of SAFARI_GESTURE_EVENTS) {
                element.removeEventListener(eventName, handleSafariGesture);
            }
        };
    }, [enabled, ref]);
}
