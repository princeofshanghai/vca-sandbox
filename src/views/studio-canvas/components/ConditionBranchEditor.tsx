import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, Plus, Split, Trash2 } from 'lucide-react';
import { Branch } from '../../studio/types';
import {
    createConditionBranch,
    getDefaultConditionPathLabel,
    getNextConditionPathLabel,
} from '../../studio/conditionBranches';
import { getConditionRuleSummary } from '../../studio/conditionBranchLabels';
import { ShellButton, ShellIconButton, ShellNotice, ShellSwitch } from '@/components/shell';
import { cn } from '@/utils/cn';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorField } from './editor-ui/EditorField';

interface ConditionBranchEditorProps {
    nodeId: string;
    question: string;
    branches: Branch[];
    onQuestionChange: (question: string) => void;
    onBranchesChange: (branches: Branch[]) => void;
    onDelete?: () => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    readOnly?: boolean;
}

const EMPTY_MATCH_LOGIC: NonNullable<Branch['logic']> = {
    variable: '',
    value: '',
    operator: 'eq',
};

const AUTO_GENERATED_FALLBACK_PATH_LABEL = /^fallback$/i;

const getSanitizedBranchCondition = (branch: Branch): string => {
    const trimmedCondition = branch.condition?.trim() || '';
    if (branch.isDefault && AUTO_GENERATED_FALLBACK_PATH_LABEL.test(trimmedCondition)) {
        return '';
    }

    return branch.condition ?? '';
};

const reorderBranches = (branches: Branch[]): Branch[] => {
    const matchingBranches: Branch[] = [];
    const defaultBranches: Branch[] = [];

    branches.forEach((branch) => {
        if (branch.isDefault) {
            defaultBranches.push(branch);
        } else {
            matchingBranches.push(branch);
        }
    });

    return [...matchingBranches, ...defaultBranches];
};

const getMaterializedPathName = (branch: Branch, index: number): string => {
    const trimmedCondition = getSanitizedBranchCondition(branch).trim();
    if (trimmedCondition && !(branch.isDefault && AUTO_GENERATED_FALLBACK_PATH_LABEL.test(trimmedCondition))) {
        return trimmedCondition;
    }

    const trimmedValue = branch.logic?.value !== undefined ? String(branch.logic.value).trim() : '';
    if (trimmedValue && !branch.isDefault) {
        return trimmedValue;
    }

    return getDefaultConditionPathLabel(index + 1);
};

const normalizeBranchesForEditor = (branches: Branch[]): Branch[] => {
    const matchingBranches: Branch[] = [];
    let fallbackBranch: Branch | null = null;

    branches.forEach((branch) => {
        const normalizedBranch: Branch = {
            ...branch,
            condition: getSanitizedBranchCondition(branch),
            logic: branch.logic ?? { ...EMPTY_MATCH_LOGIC },
        };

        if (branch.isDefault) {
            if (!fallbackBranch) {
                fallbackBranch = { ...normalizedBranch, isDefault: true };
            } else {
                matchingBranches.push({
                    ...normalizedBranch,
                    isDefault: false,
                });
            }
            return;
        }

        matchingBranches.push({
            ...normalizedBranch,
            isDefault: false,
        });
    });

    return fallbackBranch ? [...matchingBranches, fallbackBranch] : matchingBranches;
};

export function ConditionBranchEditor({
    nodeId,
    question,
    branches,
    onQuestionChange,
    onBranchesChange,
    onDelete,
    children,
    isOpen,
    onOpenChange,
    readOnly = false,
}: ConditionBranchEditorProps) {
    const [draftQuestion, setDraftQuestion] = useState(question);
    const [expandedBranchId, setExpandedBranchId] = useState<string | null>(null);
    const editorBranches = useMemo(() => normalizeBranchesForEditor(branches), [branches]);
    const distinctFieldNames = useMemo(
        () => Array.from(
            new Set(
                editorBranches
                    .map((branch) => branch.logic?.variable?.trim() || '')
                    .filter(Boolean)
            )
        ),
        [editorBranches]
    );
    const hasMixedFields = distinctFieldNames.length > 1;
    const sharedFieldValue = hasMixedFields ? '' : (distinctFieldNames[0] || '');

    useEffect(() => {
        setDraftQuestion(question);
    }, [question]);

    useEffect(() => {
        if (expandedBranchId && !editorBranches.some((branch) => branch.id === expandedBranchId)) {
            setExpandedBranchId(null);
        }
    }, [editorBranches, expandedBranchId]);

    const updateBranch = (branchId: string, updater: (branch: Branch) => Branch) => {
        if (readOnly) return;

        onBranchesChange(
            editorBranches.map((branch) => (
                branch.id === branchId ? updater(branch) : branch
            ))
        );
    };

    const handleAddBranch = () => {
        if (readOnly) return;

        const newBranch = createConditionBranch({
            condition: getNextConditionPathLabel(editorBranches),
            logic: sharedFieldValue
                ? {
                    ...EMPTY_MATCH_LOGIC,
                    variable: sharedFieldValue,
                }
                : undefined,
        });

        setExpandedBranchId(newBranch.id);
        onBranchesChange(reorderBranches([...editorBranches, newBranch]));
    };

    const handleRemoveBranch = (branchId: string) => {
        if (readOnly || editorBranches.length <= 1) return;

        const remainingBranches = editorBranches.filter((branch) => branch.id !== branchId);

        if (expandedBranchId === branchId) {
            const removedIndex = editorBranches.findIndex((branch) => branch.id === branchId);
            const nextExpandedBranch =
                remainingBranches[removedIndex] ??
                remainingBranches[removedIndex - 1] ??
                null;
            setExpandedBranchId(nextExpandedBranch?.id ?? null);
        }

        onBranchesChange(remainingBranches);
    };

    const handleSharedFieldChange = (value: string) => {
        if (readOnly) return;

        onBranchesChange(
            editorBranches.map((branch) => {
                return {
                    ...branch,
                    logic: {
                        variable: value,
                        value: branch.logic?.value || '',
                        operator: 'eq',
                    },
                };
            })
        );
    };

    const handleOtherwiseToggle = (branchId: string, checked: boolean) => {
        if (readOnly) return;

        const nextBranches = editorBranches.map((branch) => {
            if (branch.id === branchId) {
                return {
                    ...branch,
                    isDefault: checked,
                };
            }

            if (checked && branch.isDefault) {
                return {
                    ...branch,
                    isDefault: false,
                };
            }

            return branch;
        });

        onBranchesChange(reorderBranches(nextBranches));
    };

    const handleToggleBranch = (branchId: string) => {
        setExpandedBranchId((currentBranchId) => (
            currentBranchId === branchId ? null : branchId
        ));
    };

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={Split}
                title="Condition"
                onClose={() => onOpenChange(false)}
                onDelete={onDelete}
                deleteLabel="Delete condition"
                deleteDisabled={readOnly}
            />
            <EditorContent>
                <EditorSection title="General">
                    <EditorField
                        label="Condition name"
                        value={draftQuestion}
                        onChange={(nextQuestion) => {
                            setDraftQuestion(nextQuestion);
                            onQuestionChange(nextQuestion);
                        }}
                        placeholder="Is user an admin?"
                        readOnly={readOnly}
                    />
                </EditorSection>

                <EditorSection title="Paths">
                    <p className="text-[10px] leading-relaxed text-shell-muted">
                        Paths are the different paths or edge cases the conversation can take.
                    </p>

                    <div className="space-y-3">
                        {editorBranches.map((branch, index) => {
                            const isExpanded = expandedBranchId === branch.id;
                            const summaryText = getConditionRuleSummary(branch, sharedFieldValue);
                            const branchHeading = getMaterializedPathName(branch, index);

                            return (
                                <div
                                    key={branch.id}
                                    className="group overflow-hidden rounded-lg border border-shell-border bg-shell-bg transition-colors hover:border-shell-accent-border"
                                >
                                    <div
                                        className={cn(
                                            'flex gap-3 bg-shell-surface-subtle px-3 py-2 transition-colors hover:bg-shell-surface',
                                            summaryText ? 'items-start' : 'items-center'
                                        )}
                                        onClick={() => handleToggleBranch(branch.id)}
                                    >
                                        <div className={cn('text-shell-muted', summaryText ? 'pt-0.5' : undefined)}>
                                            <ChevronDown
                                                className={cn(
                                                    'h-4 w-4 transition-transform duration-200',
                                                    isExpanded && 'rotate-180'
                                                )}
                                            />
                                        </div>

                                        <div className={cn('min-w-0 flex-1', !summaryText && 'py-0.5')}>
                                            <p className="truncate text-xs font-medium text-shell-text">
                                                {branchHeading}
                                            </p>
                                            {summaryText && (
                                                <p className="mt-0.5 truncate text-[10px] leading-snug text-shell-muted">
                                                    {summaryText}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <ShellIconButton
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                aria-label="Remove path"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleRemoveBranch(branch.id);
                                                }}
                                                disabled={editorBranches.length <= 1 || readOnly}
                                                className="text-shell-muted opacity-100 transition-opacity hover:text-shell-danger sm:opacity-0 sm:group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </ShellIconButton>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="space-y-3 border-t border-shell-border-subtle bg-shell-bg p-3 animate-in fade-in slide-in-from-top-1">
                                            <EditorField
                                                label="Path name"
                                                value={branch.condition}
                                                onChange={(value) => {
                                                    updateBranch(branch.id, (currentBranch) => ({
                                                        ...currentBranch,
                                                        condition: value,
                                                    }));
                                                }}
                                                placeholder={getDefaultConditionPathLabel(index + 1)}
                                                readOnly={readOnly}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <ShellButton
                        type="button"
                        variant="outline"
                        className="mt-4 w-full justify-center gap-2"
                        onClick={handleAddBranch}
                        disabled={readOnly}
                    >
                        <Plus size={14} />
                        Add path
                    </ShellButton>
                </EditorSection>

                <EditorSection
                    title={(
                        <>
                            Details <span className="text-shell-muted">(optional)</span>
                        </>
                    )}
                    collapsible={true}
                    defaultOpen={false}
                >
                    <p className="text-[10px] leading-relaxed text-shell-muted">
                        Below are technical details needed for engineering.
                    </p>

                    <EditorField
                        label="Variable"
                        value={sharedFieldValue}
                        onChange={handleSharedFieldChange}
                        placeholder="user_role"
                        readOnly={readOnly}
                    />

                    {hasMixedFields && (
                        <ShellNotice
                            size="compact"
                            variant="default"
                            icon={<AlertTriangle size={14} />}
                            title="Use one shared check per condition"
                            description={`This condition currently mixes: ${distinctFieldNames.join(', ')}. Editing the field above will apply one shared check to every path.`}
                        />
                    )}

                    <div className="space-y-3">
                        {editorBranches.map((branch, index) => (
                            <div
                                key={`details-${branch.id}`}
                                className="rounded-lg border border-shell-border bg-shell-bg p-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-shell-text">
                                            {getMaterializedPathName(branch, index)}
                                        </p>
                                        <p className="mt-0.5 text-[10px] leading-snug text-shell-muted">
                                            {branch.isDefault
                                                ? 'Used when none of the other paths match.'
                                                : 'Optional technical rule for this path.'}
                                        </p>
                                    </div>
                                </div>

                                {!branch.isDefault && (
                                    <div className="mt-3 space-y-3">
                                        <EditorField
                                            label="Value"
                                            value={branch.logic?.value || ''}
                                            onChange={(value) => {
                                                updateBranch(branch.id, (currentBranch) => ({
                                                    ...currentBranch,
                                                    logic: {
                                                        variable: currentBranch.logic?.variable || '',
                                                        value,
                                                        operator: 'eq',
                                                    },
                                                }));
                                            }}
                                            placeholder="admin"
                                            readOnly={readOnly}
                                        />
                                    </div>
                                )}

                                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-shell-border-subtle bg-shell-surface-subtle px-3 py-2">
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-medium text-shell-text">
                                            Use when none of the others match
                                        </p>
                                        <p className="mt-0.5 text-[10px] leading-snug text-shell-muted">
                                            Optional catch-all path for engineering handoff.
                                        </p>
                                    </div>
                                    <ShellSwitch
                                        checked={Boolean(branch.isDefault)}
                                        onCheckedChange={(checked) => handleOtherwiseToggle(branch.id, checked)}
                                        size="compact"
                                        disabled={readOnly}
                                        aria-label={`Toggle otherwise path for ${getMaterializedPathName(branch, index)}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </EditorSection>
            </EditorContent>
        </EditorRoot>
    );

    return (
        <ComponentEditorPopover
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            componentId={nodeId}
            editorContent={editorContent}
            width={440}
            readOnly={readOnly}
        >
            {children}
        </ComponentEditorPopover>
    );
}
