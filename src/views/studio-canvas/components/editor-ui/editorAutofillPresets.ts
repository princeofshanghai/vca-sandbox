import type { CheckboxGroupContent, SelectionListContent } from '../../../studio/types';

export type AutofillPresetKey = 'users' | 'accounts' | 'invoices';

const USER_NAMES = ['Alex Parker', 'Jordan Lee', 'Mina Patel'] as const;
const DEFAULT_ITEM_COUNT = 3;

const generateEditorItemId = () => Math.random().toString(36).slice(2, 11);

const generateNineDigitId = () => String(Math.floor(100000000 + Math.random() * 900000000));

const getUserCaption = (fullName: string) => {
    const [firstName = '', ...rest] = fullName.trim().split(/\s+/);
    const lastName = rest.length > 0 ? rest[rest.length - 1] : '';
    const firstInitial = firstName.charAt(0).toLowerCase();
    const lastNameSlug = lastName.replace(/[^a-zA-Z]/g, '').toLowerCase();
    return `${firstInitial}${lastNameSlug}@flexis.com`;
};

export const buildSelectionListAutofillItems = (
    presetKey: AutofillPresetKey
): SelectionListContent['items'] => {
    if (presetKey === 'users') {
        return USER_NAMES.map((name) => ({
            id: generateEditorItemId(),
            title: name,
            subtitle: getUserCaption(name),
            visualType: 'avatar' as const,
        }));
    }

    const iconName = presetKey === 'accounts' ? 'building' : 'document';
    const labelPrefix = presetKey === 'accounts' ? 'Account' : 'Invoice';

    return Array.from({ length: DEFAULT_ITEM_COUNT }, (_, index) => ({
        id: generateEditorItemId(),
        title: `${labelPrefix} ${index + 1}`,
        subtitle: `ID: ${generateNineDigitId()}`,
        visualType: 'icon' as const,
        iconName,
    }));
};

export const buildDisplayCardAutofillItem = (
    presetKey: AutofillPresetKey
): Partial<SelectionListContent['items'][0]> => {
    if (presetKey === 'users') {
        const name = USER_NAMES[0];
        return {
            title: name,
            subtitle: getUserCaption(name),
            visualType: 'avatar',
            imageUrl: undefined,
            iconName: undefined,
        };
    }

    const iconName = presetKey === 'accounts' ? 'building' : 'document';
    const labelPrefix = presetKey === 'accounts' ? 'Account' : 'Invoice';

    return {
        title: `${labelPrefix} 1`,
        subtitle: `ID: ${generateNineDigitId()}`,
        visualType: 'icon',
        imageUrl: undefined,
        iconName,
    };
};

export const buildCheckboxAutofillOptions = (
    presetKey: AutofillPresetKey
): CheckboxGroupContent['options'] => {
    if (presetKey === 'users') {
        return USER_NAMES.map((name) => ({
            id: generateEditorItemId(),
            label: name,
            description: getUserCaption(name),
        }));
    }

    const labelPrefix = presetKey === 'accounts' ? 'Account' : 'Invoice';

    return Array.from({ length: DEFAULT_ITEM_COUNT }, (_, index) => ({
        id: generateEditorItemId(),
        label: `${labelPrefix} ${index + 1}`,
        description: `ID: ${generateNineDigitId()}`,
    }));
};
