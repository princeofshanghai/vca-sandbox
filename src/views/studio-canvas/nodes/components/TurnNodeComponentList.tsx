import { memo, useCallback, useMemo } from 'react';
import { Component } from '../../../studio/types';
import { SimpleComponentCard } from './SimpleComponentCard';
import { getComponentDisplay } from '../utils/turnNodeUtils';
import { MessageEditor } from '../../components/MessageEditor';
import { PromptEditor } from '../../components/PromptEditor';
import { InfoMessageEditor } from '../../components/InfoMessageEditor';
import { StatusCardEditor } from '../../components/StatusCardEditor';
import { SelectionListEditor } from '../../components/SelectionListEditor';
import { CheckboxGroupEditor } from '../../components/CheckboxGroupEditor';

interface TurnNodeComponentListProps {
    nodeId: string;
    components: Component[];
    selectedComponentId?: string;
    entryPoint?: string;
    onSelectComponent?: (nodeId: string, componentId: string, anchorEl: HTMLElement) => void;
    onDeselect?: () => void;
    onComponentUpdate?: (nodeId: string, componentId: string, updates: Partial<Component>) => void;
}

interface ComponentRowProps {
    nodeId: string;
    component: Component;
    isSelected: boolean;
    entryPoint?: string;
    onSelectComponent?: (nodeId: string, componentId: string, anchorEl: HTMLElement) => void;
    onDeselect?: () => void;
    onComponentUpdate?: (nodeId: string, componentId: string, updates: Partial<Component>) => void;
}

const ComponentRow = memo(({
    nodeId,
    component,
    isSelected,
    entryPoint,
    onSelectComponent,
    onDeselect,
    onComponentUpdate,
}: ComponentRowProps) => {
    const display = useMemo(() => getComponentDisplay(component), [component]);

    const handleClick = useCallback(() => {
        const el = document.getElementById(`component-${component.id}`);
        onSelectComponent?.(nodeId, component.id, el || document.body);
    }, [component.id, nodeId, onSelectComponent]);

    const handleOpenChange = useCallback((open: boolean) => {
        if (!open && isSelected) {
            onDeselect?.();
        }
    }, [isSelected, onDeselect]);

    const handleComponentChange = useCallback((updates: Record<string, unknown>) => {
        onComponentUpdate?.(nodeId, component.id, { content: { ...component.content, ...updates } });
    }, [component, nodeId, onComponentUpdate]);

    const card = (
        <SimpleComponentCard
            component={component}
            display={display}
            isSelected={isSelected}
            onClick={handleClick}
        />
    );

    if (component.type === 'message') {
        return (
            <MessageEditor
                component={component}
                onChange={handleComponentChange}
                isOpen={isSelected}
                onOpenChange={handleOpenChange}
            >
                {card}
            </MessageEditor>
        );
    }

    if (component.type === 'prompt') {
        return (
            <PromptEditor
                component={component}
                entryPoint={entryPoint}
                onChange={handleComponentChange}
                isOpen={isSelected}
                onOpenChange={handleOpenChange}
            >
                {card}
            </PromptEditor>
        );
    }

    if (component.type === 'infoMessage') {
        return (
            <InfoMessageEditor
                component={component}
                onChange={handleComponentChange}
                isOpen={isSelected}
                onOpenChange={handleOpenChange}
            >
                {card}
            </InfoMessageEditor>
        );
    }

    if (component.type === 'statusCard') {
        return (
            <StatusCardEditor
                component={component}
                onChange={handleComponentChange}
                isOpen={isSelected}
                onOpenChange={handleOpenChange}
            >
                {card}
            </StatusCardEditor>
        );
    }

    if (component.type === 'selectionList') {
        return (
            <SelectionListEditor
                component={component}
                onChange={handleComponentChange}
                isOpen={isSelected}
                onOpenChange={handleOpenChange}
            >
                {card}
            </SelectionListEditor>
        );
    }

    if (component.type === 'checkboxGroup') {
        return (
            <CheckboxGroupEditor
                component={component}
                onChange={handleComponentChange}
                isOpen={isSelected}
                onOpenChange={handleOpenChange}
            >
                {card}
            </CheckboxGroupEditor>
        );
    }

    return card;
});

ComponentRow.displayName = 'ComponentRow';

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
            {components.map((component: Component) => (
                <ComponentRow
                    key={component.id}
                    nodeId={nodeId}
                    component={component}
                    isSelected={selectedComponentId === component.id}
                    entryPoint={entryPoint}
                    onSelectComponent={onSelectComponent}
                    onDeselect={onDeselect}
                    onComponentUpdate={onComponentUpdate}
                />
            ))}
        </div>
    );
};
