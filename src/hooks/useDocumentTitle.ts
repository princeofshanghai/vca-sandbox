import { useEffect } from 'react';

export const APP_DOCUMENT_TITLE = 'VCA Sandbox';

const UNTITLED_PROJECT_TITLE = 'Untitled flow';

type ProjectTitleContext = 'preview' | 'shared';

const getNormalizedProjectTitle = (projectTitle?: string | null) => {
    const trimmedTitle = projectTitle?.trim();
    return trimmedTitle ? trimmedTitle : UNTITLED_PROJECT_TITLE;
};

export const buildProjectDocumentTitle = (
    projectTitle?: string | null,
    context?: ProjectTitleContext
) => {
    const titleSegments = [getNormalizedProjectTitle(projectTitle)];

    if (context === 'preview') {
        titleSegments.push('Preview');
    }

    if (context === 'shared') {
        titleSegments.push('Shared');
    }

    titleSegments.push(APP_DOCUMENT_TITLE);

    return titleSegments.join(' - ');
};

export const buildProjectLoadingDocumentTitle = () => `Loading project - ${APP_DOCUMENT_TITLE}`;

export const buildProjectUnavailableDocumentTitle = () => `Project unavailable - ${APP_DOCUMENT_TITLE}`;

export const useDocumentTitle = (title: string) => {
    useEffect(() => {
        if (typeof document === 'undefined') {
            return undefined;
        }

        const previousTitle = document.title;
        document.title = title;

        return () => {
            document.title = previousTitle;
        };
    }, [title]);
};
