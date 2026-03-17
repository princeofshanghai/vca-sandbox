import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, Plus, Split, Trash2 } from 'lucide-react';
import { Branch } from '../../studio/types';
import { createConditionBranch } from '../../studio/conditionBranches';
import { getConditionPathLabel, getConditionRuleSummary } from '../../studio/conditionBranchLabels';
import { ShellButton, ShellIconButton, ShellNotice } from '@/components/shell';
import { cn } from '@/utils/cn';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorField } from './editor-ui/EditorField';
import { EditorFieldRow } from './editor-ui/EditorFieldRow';

interface ConditionBranchEditorProps {
    nodeId: string;
    question: string;
    branches: Branch[];
    onQuestionChange: (question: string) => void;
    onBranchesChange: (branches: Branch[]) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    readOnly?: boolean;
}

const getBranchHeading = (branch: Branch): string => getConditionPathLabel(branch);

const EMPTY_MATCH_LOGIC: NonNullable<Branch['logic']> = {
    variable: '',
    value: '',
    operator: 'eq',
};

const normalizeBranchesForEditor = (branches: Branch[]): Branch[] => {
    const matchingBranches: Branch[] = [];
    let fallbackBranch: Branch | null = null;

    branches.forEach((branch) => {
        if (branch.isDefault) {
            if (!fallbackBranch) {
                fallbackBranch = {
                    ...branch,
                    condition: branch.condition?.trim() || 'Fallback',
                    isDefault: true,
                    logic: undefined,
                };
            } else {
                matchingBranches.push({
                    ...branch,
                    isDefault: false,
                    logic: branch.logic ?? { ...EMPTY_MATCH_LOGIC },
                });
            }
            return;
        }

        matchingBranches.push({
            ...branch,
            isDefault: false,
            logic: branch.logic ?? { ...EMPTY_MATCH_LOGIC },
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
    children,
    isOpen,
    onOpenChange,
    readOnly = false,
}: ConditionBranchEditorProps) {
    const [draftQuestion, setDraftQuestion] = useState(question);
    const [expandedBranchId, setExpandedBranchId] = useState<string | null>(null);
    const editorBranches = useMemo(() => normalizeBranchesForEditor(branches), [branches]);
    const fallbackIndex = editorBranches.findIndex((branch) => branch.isDefault);
    const hasFallback = fallbackIndex !== -1;
    const distinctFieldNames = useMemo(
        () => Array.from(
            new Set(
                editorBranches
                    .filter((branch) => !branch.isDefault)
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
            logic: sharedFieldValue
                ? {
                    ...EMPTY_MATCH_LOGIC,
                    variable: sharedFieldValue,
                }
                : undefined,
        });

        if (fallbackIndex === -1) {
            setExpandedBranchId(newBranch.id);
            onBranchesChange([...editorBranches, newBranch]);
            return;
        }

        const nextBranches = [...editorBranches];
        nextBranches.splice(fallbackIndex, 0, newBranch);
        setExpandedBranchId(newBranch.id);
        onBranchesChange(nextBranches);
    };

    const handleAddFallback = () => {
        if (readOnly || hasFallback) return;

        const fallbackBranch = createConditionBranch({ isDefault: true });
        setExpandedBranchId(fallbackBranch.id);
        onBranchesChange([
            ...editorBranches,
            fallbackBranch,
        ]);
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
                if (branch.isDefault) {
                    return branch;
                }

                return {
                    ...branch,
                    isDefault: false,
                    logic: {
                        variable: value,
                        value: branch.logic?.value || '',
                        operator: 'eq',
                    },
                };
            })
        );
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
            />
            <EditorContent>
                <EditorSection title="General">
                    <EditorFieldRow className="items-start sm:grid-cols-[minmax(0,1fr)_140px]">
                        <EditorField
                            label="Question"
                            type="textarea"
                            minRows={1}
                            textareaVariant="compact"
                            value={draftQuestion}
                            onChange={(nextQuestion) => {
                                setDraftQuestion(nextQuestion);
                                onQuestionChange(nextQuestion);
                            }}
                            placeholder="Is user an admin?"
                            hint="Appears in prototype"
                            readOnly={readOnly}
                        />
                        <EditorField
                            label="Variable name"
                            value={sharedFieldValue}
                            onChange={handleSharedFieldChange}
                            placeholder="isAdmin"
                            className="sm:max-w-[140px]"
                            readOnly={readOnly}
                        />
                    </EditorFieldRow>
                    {hasMixedFields && (
                        <ShellNotice
                            size="compact"
                            variant="default"
                            icon={<AlertTriangle size={14} />}
                            title="Use one variable per condition"
                            description={`This condition currently mixes: ${distinctFieldNames.join(', ')}. Editing the variable below will apply one shared variable to every matching path.`}
                        />
                    )}
                </EditorSection>

                <EditorSection title="Paths">
                    <div className="space-y-3">
                        {editorBranches.map((branch) => {
                            const isExpanded = expandedBranchId === branch.id;
                            const summaryText = getConditionRuleSummary(branch, sharedFieldValue);

                            return (
                                <div
                                    key={branch.id}
                                    className="group overflow-hidden rounded-lg border border-shell-border bg-shell-bg transition-colors hover:border-shell-accent-border"
                                >
                                    <div
                                        className="flex items-start gap-3 bg-shell-surface-subtle px-3 py-2 transition-colors hover:bg-shell-surface"
                                        onClick={() => handleToggleBranch(branch.id)}
                                    >
                                        <div className="pt-0.5 text-shell-muted">
                                            <ChevronDown
                                                className={cn(
                                                    'h-4 w-4 transition-transform duration-200',
                                                    isExpanded && 'rotate-180'
                                                )}
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-medium text-shell-text">
                                                {getBranchHeading(branch)}
                                            </p>
                                            <p className="mt-0.5 truncate text-[10px] leading-snug text-shell-muted">
                                                {summaryText || 'Set variable and value'}
                                            </p>
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
                                            {branch.isDefault ? (
                                                <EditorField
                                                    label="Label"
                                                    value={branch.condition}
                                                    onChange={(value) => {
                                                        updateBranch(branch.id, (currentBranch) => ({
                                                            ...currentBranch,
                                                            condition: value,
                                                        }));
                                                    }}
                                                    placeholder="Fallback"
                                                    readOnly={readOnly}
                                                />
                                            ) : (
                                                <EditorFieldRow>
                                                    <EditorField
                                                        label="Variable value"
                                                        value={branch.logic?.value || ''}
                                                        onChange={(value) => {
                                                            updateBranch(branch.id, (currentBranch) => ({
                                                                ...currentBranch,
                                                                isDefault: false,
                                                                logic: {
                                                                    variable: currentBranch.logic?.variable || '',
                                                                    value,
                                                                    operator: 'eq',
                                                                },
                                                            }));
                                                        }}
                                                        placeholder="true"
                                                        readOnly={readOnly}
                                                    />
                                                    <EditorField
                                                        label="Label (optional)"
                                                        value={branch.condition}
                                                        onChange={(value) => {
                                                            updateBranch(branch.id, (currentBranch) => ({
                                                                ...currentBranch,
                                                                condition: value,
                                                            }));
                                                        }}
                                                        placeholder="Yes"
                                                        readOnly={readOnly}
                                                    />
                                                </EditorFieldRow>
                                            )}
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

                    {!hasFallback && (
                        <ShellButton
                            type="button"
                            variant="outline"
                            className="mt-2 w-full justify-center gap-2"
                            onClick={handleAddFallback}
                            disabled={readOnly}
                        >
                            <Plus size={14} />
                            Add fallback path
                        </ShellButton>
                    )}
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
