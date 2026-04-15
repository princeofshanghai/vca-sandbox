import { next } from '@vercel/functions';

const APP_TITLE = 'VCA Sandbox';
const GENERIC_DESCRIPTION = 'Easy to use tool for designing LinkedIn VCA agent experiences';
const PREVIEW_BOT_USER_AGENT_PATTERN =
    /Slackbot|Discordbot|Twitterbot|facebookexternalhit|LinkedInBot|WhatsApp|TelegramBot|SkypeUriPreview|Googlebot|Bingbot|crawler|spider|bot|preview|unfurl/i;
const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

type ShareLinkType = 'prototype' | 'studio';

type ShareLinkContext = {
    flowId: string;
    linkType: ShareLinkType;
};

type PublicFlowRecord = {
    title?: string | null;
};

const isPreviewBotRequest = (request: Request) => {
    const userAgent = request.headers.get('user-agent') ?? '';
    return PREVIEW_BOT_USER_AGENT_PATTERN.test(userAgent);
};

const decodePathSegment = (value: string) => {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

const parseShareLinkContext = (pathname: string): ShareLinkContext | null => {
    const segments = pathname.split('/').filter(Boolean);

    if (segments[0] !== 'share') {
        return null;
    }

    if (segments[1] === 'studio' && segments[2]) {
        return {
            flowId: decodePathSegment(segments[2]),
            linkType: 'studio',
        };
    }

    if (!segments[1] || segments[1] === 'studio') {
        return null;
    }

    return {
        flowId: decodePathSegment(segments[1]),
        linkType: 'prototype',
    };
};

const normalizeProjectTitle = (title?: string | null) => {
    const trimmedTitle = title?.trim();
    return trimmedTitle || 'Untitled flow';
};

const buildPreviewDescription = (linkType: ShareLinkType) =>
    linkType === 'studio'
        ? 'Open this shared project in VCA Sandbox.'
        : 'Review this shared prototype in VCA Sandbox.';

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const buildPreviewHtml = ({
    title,
    description,
    requestUrl,
    imageUrl,
}: {
    title: string;
    description: string;
    requestUrl: string;
    imageUrl: string;
}) => {
    const escapedTitle = escapeHtml(title);
    const escapedDescription = escapeHtml(description);
    const escapedRequestUrl = escapeHtml(requestUrl);
    const escapedImageUrl = escapeHtml(imageUrl);
    const escapedImageAlt = escapeHtml(`${title} preview card`);

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${escapedTitle}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapedDescription}" />
    <link rel="canonical" href="${escapedRequestUrl}" />
    <meta name="robots" content="noindex, nofollow" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapedRequestUrl}" />
    <meta property="og:site_name" content="${APP_TITLE}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:image" content="${escapedImageUrl}" />
    <meta property="og:image:alt" content="${escapedImageAlt}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <meta name="twitter:image" content="${escapedImageUrl}" />
  </head>
  <body>
    <main>
      <h1>${escapedTitle}</h1>
      <p>${escapedDescription}</p>
    </main>
  </body>
</html>`;
};

const buildHtmlResponse = ({
    request,
    title,
    description,
}: {
    request: Request;
    title: string;
    description: string;
}) => {
    const imageUrl = new URL('/vca-logo.png', request.url).toString();
    const html = buildPreviewHtml({
        title,
        description,
        requestUrl: request.url,
        imageUrl,
    });

    return new Response(request.method === 'HEAD' ? null : html, {
        status: 200,
        headers: {
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 'no-store, max-age=0',
            'x-robots-tag': 'noindex, nofollow',
        },
    });
};

const fetchPublicFlowTitle = async (flowId: string) => {
    if (!supabaseUrl || !supabaseAnonKey || !UUID_PATTERN.test(flowId)) {
        return null;
    }

    const restUrl = new URL('/rest/v1/flows', supabaseUrl);
    restUrl.searchParams.set('select', 'title');
    restUrl.searchParams.set('id', `eq.${flowId}`);
    restUrl.searchParams.set('is_public', 'eq.true');
    restUrl.searchParams.set('limit', '1');

    try {
        const response = await fetch(restUrl, {
            headers: {
                apikey: supabaseAnonKey,
                authorization: `Bearer ${supabaseAnonKey}`,
                accept: 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        const rows = (await response.json()) as PublicFlowRecord[];
        return rows[0]?.title ?? null;
    } catch (error) {
        console.error('Failed to fetch share preview metadata:', error);
        return null;
    }
};

export const config = {
    matcher: ['/share/:path*'],
};

export default async function middleware(request: Request) {
    if (!isPreviewBotRequest(request)) {
        return next();
    }

    const requestUrl = new URL(request.url);
    const shareLinkContext = parseShareLinkContext(requestUrl.pathname);

    if (!shareLinkContext) {
        return buildHtmlResponse({
            request,
            title: APP_TITLE,
            description: GENERIC_DESCRIPTION,
        });
    }

    const publicTitle = await fetchPublicFlowTitle(shareLinkContext.flowId);

    if (publicTitle === null) {
        return buildHtmlResponse({
            request,
            title: APP_TITLE,
            description: GENERIC_DESCRIPTION,
        });
    }

    return buildHtmlResponse({
        request,
        title: normalizeProjectTitle(publicTitle),
        description: buildPreviewDescription(shareLinkContext.linkType),
    });
}
