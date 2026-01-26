import { MessageSquare, MessageCirclePlus, MessageSquareText, Zap } from 'lucide-react';
import { Component, AIMessageContent, PromptContent, AIInfoContent, AIActionContent } from '../../../studio/types';

// Capitalize phase for display
export const formatPhase = (phase?: string): string => {
    if (!phase) return '';
    if (phase === 'intent') return 'Intent recognition';
    if (phase === 'info') return 'Info gathering';
    return phase.charAt(0).toUpperCase() + phase.slice(1);
};

// Get icon and label for component type
export const getComponentDisplay = (component: Component): { icon: JSX.Element; label: string; detail?: string } => {
    switch (component.type) {
        case 'message': {
            const messageContent = component.content as AIMessageContent;
            return {
                icon: <MessageSquare className="w-3 h-3" />,
                label: 'Message',
                detail: messageContent.text || ''
            };
        }
        case 'prompt': {
            const promptContent = component.content as PromptContent;
            return {
                icon: <MessageCirclePlus className="w-3 h-3" />,
                label: 'Prompt',
                detail: promptContent.text || ''
            };
        }
        case 'infoMessage': {
            const infoContent = component.content as AIInfoContent;
            return {
                icon: <MessageSquareText className="w-3 h-3" />,
                label: 'Info Message',
                detail: infoContent.title || infoContent.body || ''
            };
        }
        case 'actionCard': {
            const actionContent = component.content as AIActionContent;
            return {
                icon: <Zap className="w-3 h-3" />,
                label: 'Action Card',
                detail: actionContent.loadingTitle || actionContent.successTitle || ''
            };
        }
        default:
            return { icon: <MessageSquare className="w-3 h-3" />, label: 'Component' };
    }
};
