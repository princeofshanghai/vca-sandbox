import { useMemo } from 'react';
import { AlertTriangle, Plus, Split, Trash2 } from 'lucide-react';
import { Branch } from '../../studio/types';
import { createConditionBranch } from '../../studio/conditionBranches';
import { getConditionPathLabel } from '../../studio/conditionBranchLabels';
import { ShellButton, ShellIconButton, ShellNotice } from '@/components/shell';
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
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    readOnly?: boolean;
}

const getBranchHeading = (branch: Branch, index: number): string => {
    if (branch.isDefault) {
        return getConditionPathLabel(branch);
    }

    return branch.condition?.trim() || `Branch ${index + 1}`;
};

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

        const newBranch = createConditionBranch();

        if (fallbackIndex === -1) {
            onBranchesChange([...editorBranches, newBranch]);
            return;
        }

        const nextBranches = [...editorBranches];
        nextBranches.splice(fallbackIndex, 0, newBranch);
        onBranchesChange(nextBranches);
    };

    const handleAddFallback = () => {
        if (readOnly || hasFallback) return;

        onBranchesChange([
            ...editorBranches,
            createConditionBranch({ isDefault: true }),
        ]);
    };

    const handleRemoveBranch = (branchId: string) => {
        if (readOnly || editorBranches.length <= 1) return;

        onBranchesChange(editorBranches.filter((branch) => branch.id !== branchId));
    };

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={Split}
                title="Condition"
                onClose={() => onOpenChange(false)}
            />
            <EditorContent>
                <EditorSection title="Condition question">
                    <EditorField
                        label="Question"
                        value={question}
                        onChange={onQuestionChange}
                        placeholder="Is user an admin?"
                        hint="Describe in human terms what condition you are checking"
                        readOnly={readOnly}
                    />
                </EditorSection>

                <EditorSection title="Branches">
                    {hasMixedFields && (
                        <ShellNotice
                            size="compact"
                            variant="error"
                            icon={<AlertTriangle size={14} />}
                            title="Use one field per condition"
                            description={`Preview works best when all matching branches check the same field. This condition mixes: ${distinctFieldNames.join(', ')}`}
                        />
                    )}

                    <div className="space-y-3">
                        {editorBranches.map((branch, index) => {
                            return (
                                <div
                                    key={branch.id}
                                    className="rounded-xl border border-shell-border-subtle bg-shell-surface-subtle p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-[13px] font-semibold text-shell-text">
                                                {getBranchHeading(branch, index)}
                                            </p>
                                            <p className="mt-0.5 text-[11px] leading-relaxed text-shell-muted">
                                                {branch.isDefault
                                                    ? 'Used if nothing else matches.'
                                                    : 'Shown as one of the possible paths for this condition.'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <ShellIconButton
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                aria-label="Remove branch"
                                                onClick={() => handleRemoveBranch(branch.id)}
                                                disabled={editorBranches.length <= 1 || readOnly}
                                                className="text-shell-muted hover:text-shell-danger"
                                            >
                                                <Trash2 size={14} />
                                            </ShellIconButton>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-4">
                                        <EditorField
                                            label="Branch label"
                                            value={branch.condition}
                                            onChange={(value) => {
                                                updateBranch(branch.id, (currentBranch) => ({
                                                    ...currentBranch,
                                                    condition: value,
                                                }));
                                            }}
                                            placeholder={branch.isDefault ? 'Fallback' : 'Yes'}
                                            readOnly={readOnly}
                                        />

                                        {branch.isDefault ? null : (
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
                                                <EditorField
                                                    label="Field"
                                                    value={branch.logic?.variable || ''}
                                                    onChange={(value) => {
                                                        updateBranch(branch.id, (currentBranch) => ({
                                                            ...currentBranch,
                                                            isDefault: false,
                                                            logic: {
                                                                variable: value,
                                                                value: currentBranch.logic?.value || '',
                                                                operator: 'eq',
                                                            },
                                                        }));
                                                    }}
                                                    placeholder="isAdmin"
                                                    readOnly={readOnly}
                                                />

                                                <div className="pb-2 text-center text-[12px] font-medium text-shell-muted-strong">
                                                    is
                                                </div>

                                                <EditorField
                                                    label="Value"
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
                                            </div>
                                        )}
                                    </div>
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
                        Add branch
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
                            Add fallback
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
