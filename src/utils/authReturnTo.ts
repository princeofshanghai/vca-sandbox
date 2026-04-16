export function getSafeReturnPath(rawReturnTo: string | null | undefined): string {
    if (!rawReturnTo) return '/';
    if (!rawReturnTo.startsWith('/')) return '/';
    if (rawReturnTo.startsWith('//')) return '/';
    return rawReturnTo;
}

export function buildAbsoluteRedirectUrl(returnPath: string): string {
    return new URL(getSafeReturnPath(returnPath), window.location.origin).toString();
}
