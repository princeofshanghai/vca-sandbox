import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from 'npm:resend@4.6.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type CommentAnchorPayload = {
  anchorMode?: 'canvas' | 'review' | null;
  anchorKind?: 'turn' | 'component' | 'decision' | 'feedback' | null;
  canvasAnchorType?: 'node' | 'free' | null;
  anchorBlockId?: string | null;
  anchorStepId?: string | null;
  anchorComponentId?: string | null;
  anchorHistoryIndex?: number | null;
  anchorLocalX?: number | null;
  anchorLocalY?: number | null;
  anchorCanvasX?: number | null;
  anchorCanvasY?: number | null;
  pathSignature?: string | null;
};

type CreateMentionCommentRequest = {
  flowId: string;
  message: string;
  mentionedUserIds?: string[];
  parentId?: string;
  anchor?: CommentAnchorPayload | null;
  pinX?: number | null;
  pinY?: number | null;
  shareSurface: 'review' | 'studio';
  siteOrigin: string;
};

type ProfileRecord = {
  user_id: string;
  display_name: string;
  email: string | null;
  avatar_url: string | null;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

const getBearerToken = (request: Request) => {
  const authorization = request.headers.get('Authorization') || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
};

const getAuthorDisplayName = (user: {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}) => {
  const metadata = user.user_metadata || {};
  const fullName = typeof metadata.full_name === 'string' ? metadata.full_name.trim() : '';
  const shortName = typeof metadata.name === 'string' ? metadata.name.trim() : '';
  const emailPrefix = user.email ? user.email.split('@')[0].trim() : '';

  return fullName || shortName || emailPrefix || 'Signed-in user';
};

const getAuthorAvatarUrl = (user: {
  user_metadata?: Record<string, unknown> | null;
}) => {
  const metadata = user.user_metadata || {};
  const candidate = metadata.avatar_url || metadata.picture;
  if (typeof candidate !== 'string') return null;

  const trimmed = candidate.trim();
  return trimmed || null;
};

const getAnchorColumns = (anchor?: CommentAnchorPayload | null) => ({
  anchor_mode: anchor?.anchorMode ?? null,
  anchor_kind: anchor?.anchorKind ?? null,
  anchor_canvas_type: anchor?.canvasAnchorType ?? null,
  anchor_block_id: anchor?.anchorBlockId ?? null,
  anchor_step_id: anchor?.anchorStepId ?? null,
  anchor_component_id: anchor?.anchorComponentId ?? null,
  anchor_history_index: anchor?.anchorHistoryIndex ?? null,
  anchor_local_x: anchor?.anchorLocalX ?? null,
  anchor_local_y: anchor?.anchorLocalY ?? null,
  anchor_canvas_x: anchor?.anchorCanvasX ?? null,
  anchor_canvas_y: anchor?.anchorCanvasY ?? null,
  path_signature: anchor?.pathSignature ?? null,
});

const buildCommentLink = ({
  flowId,
  threadId,
  shareSurface,
  siteOrigin,
}: {
  flowId: string;
  threadId: string;
  shareSurface: 'review' | 'studio';
  siteOrigin: string;
}) => {
  const routePath =
    shareSurface === 'review' ? `/share/${flowId}` : `/share/studio/${flowId}`;
  const url = new URL(routePath, siteOrigin);
  url.searchParams.set('comments', '1');
  url.searchParams.set('thread', threadId);
  url.searchParams.set('mention', '1');
  return url.toString();
};

const getCommentExcerpt = (message: string, maxLength = 180) => {
  const trimmed = message.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
};

const createEmailProvider = () => {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL');

  if (!apiKey || !fromEmail) {
    return null;
  }

  const resend = new Resend(apiKey);

  return {
    async sendMentionEmail({
      to,
      recipientName,
      commenterName,
      flowTitle,
      commentMessage,
      commentLink,
    }: {
      to: string;
      recipientName: string;
      commenterName: string;
      flowTitle: string;
      commentMessage: string;
      commentLink: string;
    }) {
      const subject = `${commenterName} mentioned you in "${flowTitle}"`;
      const excerpt = getCommentExcerpt(commentMessage);

      const { error } = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
            <p>Hi ${recipientName || 'there'},</p>
            <p><strong>${commenterName}</strong> mentioned you in <strong>${flowTitle}</strong>.</p>
            <blockquote style="margin: 16px 0; padding-left: 12px; border-left: 3px solid #cbd5e1; color: #334155;">
              ${excerpt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </blockquote>
            <p>
              <a href="${commentLink}" style="display: inline-block; padding: 10px 14px; background: #0a66c2; color: white; text-decoration: none; border-radius: 999px;">
                View comment
              </a>
            </p>
          </div>
        `,
        text: [
          `Hi ${recipientName || 'there'},`,
          '',
          `${commenterName} mentioned you in "${flowTitle}".`,
          '',
          excerpt,
          '',
          `Open the comment: ${commentLink}`,
        ].join('\n'),
      });

      if (error) {
        throw new Error(error.message);
      }
    },
  };
};

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Supabase environment variables are missing.' }, 500);
  }

  const token = getBearerToken(request);
  if (!token) {
    return json({ error: 'Missing authorization token.' }, 401);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return json({ error: 'Could not verify the signed-in user.' }, 401);
  }

  const user = userData.user;

  let body: CreateMentionCommentRequest;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  if (!body.flowId || !body.message?.trim()) {
    return json({ error: 'flowId and message are required.' }, 400);
  }

  if (body.shareSurface !== 'review' && body.shareSurface !== 'studio') {
    return json({ error: 'shareSurface must be "review" or "studio".' }, 400);
  }

  let siteOrigin: string;
  try {
    siteOrigin = new URL(body.siteOrigin).origin;
  } catch {
    return json({ error: 'siteOrigin must be a valid URL origin.' }, 400);
  }

  const { data: flow, error: flowError } = await supabase
    .from('flows')
    .select('id, title, user_id, is_public')
    .eq('id', body.flowId)
    .single();

  if (flowError || !flow) {
    return json({ error: 'Flow not found.' }, 404);
  }

  const { data: collaboratorAccess } = await supabase
    .from('flow_collaborators')
    .select('flow_id')
    .eq('flow_id', body.flowId)
    .eq('user_id', user.id)
    .maybeSingle();

  const canComment =
    flow.is_public === true ||
    flow.user_id === user.id ||
    Boolean(collaboratorAccess);

  if (!canComment) {
    return json({ error: 'You do not have access to comment on this flow.' }, 403);
  }

  const authorName = getAuthorDisplayName(user);
  const authorAvatarUrl = getAuthorAvatarUrl(user);

  await supabase.from('profiles').upsert({
    user_id: user.id,
    display_name: authorName,
    email: user.email ?? null,
    avatar_url: authorAvatarUrl,
    last_sign_in_at: user.last_sign_in_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  let threadId = body.parentId || '';
  let parentId: string | null = null;

  if (body.parentId) {
    const { data: parentComment, error: parentError } = await supabase
      .from('flow_comments')
      .select('id, flow_id, parent_id, status')
      .eq('id', body.parentId)
      .single();

    if (parentError || !parentComment || parentComment.flow_id !== body.flowId) {
      return json({ error: 'Parent comment was not found on this flow.' }, 400);
    }

    const rootCommentId = parentComment.parent_id || parentComment.id;
    const { data: rootComment, error: rootError } = await supabase
      .from('flow_comments')
      .select('id, status')
      .eq('id', rootCommentId)
      .single();

    if (rootError || !rootComment) {
      return json({ error: 'Comment thread could not be resolved.' }, 400);
    }

    if (rootComment.status === 'resolved') {
      return json({ error: 'Resolved threads cannot accept new replies.' }, 400);
    }

    parentId = rootComment.id;
    threadId = rootComment.id;
  }

  const insertPayload = {
    flow_id: body.flowId,
    parent_id: parentId,
    author_name: authorName,
    author_user_id: user.id,
    author_avatar_url: authorAvatarUrl,
    message: body.message.trim(),
    ...(parentId
      ? {}
      : {
          pin_x: body.pinX ?? null,
          pin_y: body.pinY ?? null,
          ...getAnchorColumns(body.anchor),
        }),
  };

  const { data: createdComment, error: insertError } = await supabase
    .from('flow_comments')
    .insert(insertPayload)
    .select('*')
    .single();

  if (insertError || !createdComment) {
    return json({ error: insertError?.message || 'Could not create the comment.' }, 500);
  }

  if (!threadId) {
    threadId = createdComment.id;
  }

  const requestedMentionIds = Array.from(
    new Set((body.mentionedUserIds || []).filter((mentionedUserId) => mentionedUserId && mentionedUserId !== user.id))
  );

  if (requestedMentionIds.length > 0) {
    const { data: mentionProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, display_name, email, avatar_url')
      .in('user_id', requestedMentionIds)
      .not('last_sign_in_at', 'is', null);

    if (profileError) {
      return json({ error: profileError.message }, 500);
    }

    const validProfiles = (mentionProfiles || []) as ProfileRecord[];
    const mentionableProfiles = validProfiles.filter((profile) => profile.user_id !== user.id);
    const collaboratorRows = mentionableProfiles
      .filter((profile) => profile.user_id !== flow.user_id)
      .map((profile) => ({
        flow_id: body.flowId,
        user_id: profile.user_id,
        role: 'commenter',
        source: 'mention',
        granted_by_user_id: user.id,
        updated_at: new Date().toISOString(),
      }));

    if (collaboratorRows.length > 0) {
      const { error: collaboratorError } = await supabase
        .from('flow_collaborators')
        .upsert(collaboratorRows, { onConflict: 'flow_id,user_id' });

      if (collaboratorError) {
        return json({ error: collaboratorError.message }, 500);
      }
    }

    const mentionRows = mentionableProfiles.map((profile) => ({
      comment_id: createdComment.id,
      mentioned_user_id: profile.user_id,
      mentioned_by_user_id: user.id,
    }));

    const { data: insertedMentions, error: mentionInsertError } = await supabase
      .from('flow_comment_mentions')
      .insert(mentionRows)
      .select('id, mentioned_user_id');

    if (mentionInsertError) {
      return json({ error: mentionInsertError.message }, 500);
    }

    const emailProvider = createEmailProvider();
    const mentionLink = buildCommentLink({
      flowId: body.flowId,
      threadId,
      shareSurface: body.shareSurface,
      siteOrigin,
    });

    for (const mentionRecord of insertedMentions || []) {
      const profile = mentionableProfiles.find(
        (candidate) => candidate.user_id === mentionRecord.mentioned_user_id
      );

      let emailStatus: 'sent' | 'failed' = 'failed';
      let emailSentAt: string | null = null;
      let emailError: string | null = null;

      if (!profile?.email) {
        emailError = 'Mentioned user does not have an email address.';
      } else if (!emailProvider) {
        emailError = 'Email delivery is not configured for comment mentions.';
      } else {
        try {
          await emailProvider.sendMentionEmail({
            to: profile.email,
            recipientName: profile.display_name,
            commenterName: authorName,
            flowTitle: flow.title,
            commentMessage: createdComment.message,
            commentLink: mentionLink,
          });
          emailStatus = 'sent';
          emailSentAt = new Date().toISOString();
        } catch (error) {
          emailError = error instanceof Error ? error.message : 'Unknown email delivery failure.';
        }
      }

      await supabase
        .from('flow_comment_mentions')
        .update({
          email_status: emailStatus,
          email_sent_at: emailSentAt,
          email_error: emailError,
          updated_at: new Date().toISOString(),
        })
        .eq('id', mentionRecord.id);
    }
  }

  return json({ comment: createdComment });
});
