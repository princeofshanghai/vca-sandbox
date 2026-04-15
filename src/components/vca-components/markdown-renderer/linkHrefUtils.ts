const EMAIL_ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const normalizeHref = (value?: string | null) => (value || '').trim();

export const isMailtoHref = (value?: string | null) =>
    normalizeHref(value).toLowerCase().startsWith('mailto:');

export const isEmailLikeHref = (value?: string | null) => {
    const normalizedValue = normalizeHref(value);

    if (!normalizedValue) return false;
    if (isMailtoHref(normalizedValue)) return true;

    return EMAIL_ADDRESS_PATTERN.test(normalizedValue);
};

