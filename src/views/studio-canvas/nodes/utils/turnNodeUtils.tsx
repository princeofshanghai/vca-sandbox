import { MessageSquare, MessageCirclePlus, MessageSquareText, Zap, LayoutList, CheckSquare } from 'lucide-react';
import { Component, AIMessageContent, PromptContent, AIInfoContent, AIStatusContent, SelectionListContent, CheckboxGroupContent } from '../../../studio/types';

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
        case 'statusCard': {
            const actionContent = component.content as AIStatusContent;
            return {
                icon: <Zap className="w-3 h-3" />,
                label: 'Status Card',
                detail: actionContent.loadingTitle || actionContent.successTitle || ''
            };
        }
        case 'selectionList': {
            const listContent = component.content as SelectionListContent;
            return {
                icon: <LayoutList className="w-3 h-3" />,
                label: 'Selection List',
                detail: listContent.title || `${listContent.items?.length || 0} items`
            };
        }
        case 'checkboxGroup': {
            const groupContent = component.content as CheckboxGroupContent;
            return {
                icon: <CheckSquare className="w-3 h-3" />,
                label: 'Checkbox Group',
                detail: groupContent.title || `${groupContent.options?.length || 0} options`
            };
        }
        default:
            return { icon: <MessageSquare className="w-3 h-3" />, label: 'Component' };
    }
};
