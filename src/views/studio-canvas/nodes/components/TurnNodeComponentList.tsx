import { Component } from '../../../studio/types';
import { SimpleComponentCard } from './SimpleComponentCard';
import { getComponentDisplay } from '../utils/turnNodeUtils';
import { MessageEditor } from '../../components/MessageEditor';
import { PromptEditor } from '../../components/PromptEditor';
import { InfoMessageEditor } from '../../components/InfoMessageEditor';
import { ActionCardEditor } from '../../components/ActionCardEditor';

interface TurnNodeComponentListProps {
    nodeId: string;
    components: Component[];
    selectedComponentId?: string;
    entryPoint?: string;
    onSelectComponent?: (nodeId: string, componentId: string, anchorEl: HTMLElement) => void;
    onDeselect?: () => void;
    onComponentUpdate?: (componentId: string, updates: Partial<Component>) => void;
}

export const TurnNodeComponentList = ({
    nodeId,
    components,
    selectedComponentId,
    entryPoint,
    onSelectComponent,
    onDeselect,
    onComponentUpdate
}: TurnNodeComponentListProps) => {
    return (
        <div className="px-5 pb-5 pt-5 space-y-3 bg-gray-50 rounded-lg overflow-visible">
            {components.map((component: Component) => {
                const display = getComponentDisplay(component);

                const card = (
                    <SimpleComponentCard
                        component={component}
                        display={display}
                        isSelected={selectedComponentId === component.id}
                        onClick={() => {
                            const el = document.getElementById(`component-${component.id}`);
                            if (onSelectComponent) {
                                onSelectComponent(nodeId, component.id, el || document.body);
                            }
                        }}
                    />
                );

                // Wrap each component type with its respective editor
                const handleOpenChange = (open: boolean) => {
                    if (!open && selectedComponentId === component.id) {
                        onDeselect?.();
                    }
                };

                if (component.type === 'message') {
                    return (
                        <MessageEditor
                            key={component.id}
                            component={component}
                            onChange={(updates) => onComponentUpdate?.(component.id, { content: { ...component.content, ...updates } })}
                            isOpen={selectedComponentId === component.id}
                            onOpenChange={handleOpenChange}
                        >
                            {card}
                        </MessageEditor>
                    );
                }

                if (component.type === 'prompt') {
                    return (
                        <PromptEditor
                            key={component.id}
                            component={component}
                            entryPoint={entryPoint}
                            onChange={(updates) => onComponentUpdate?.(component.id, { content: { ...component.content, ...updates } })}
                            isOpen={selectedComponentId === component.id}
                            onOpenChange={handleOpenChange}
                        >
                            {card}
                        </PromptEditor>
                    );
                }

                if (component.type === 'infoMessage') {
                    return (
                        <InfoMessageEditor
                            key={component.id}
                            component={component}
                            onChange={(updates) => onComponentUpdate?.(component.id, { content: { ...component.content, ...updates } })}
                            isOpen={selectedComponentId === component.id}
                            onOpenChange={handleOpenChange}
                        >
                            {card}
                        </InfoMessageEditor>
                    );
                }

                if (component.type === 'actionCard') {
                    return (
                        <ActionCardEditor
                            key={component.id}
                            component={component}
                            onChange={(updates) => onComponentUpdate?.(component.id, { content: { ...component.content, ...updates } })}
                            isOpen={selectedComponentId === component.id}
                            onOpenChange={handleOpenChange}
                        >
                            {card}
                        </ActionCardEditor>
                    );
                }

                return card;
            })}
        </div>
    );
};
