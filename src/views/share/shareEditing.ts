import { supabase } from '@/lib/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const FLOW_EDIT_LOCK_TIMEOUT_MS = 25000;
export const FLOW_EDIT_LOCK_REFRESH_INTERVAL_MS = 8000;
export const FLOW_EDIT_LOCK_POLL_INTERVAL_MS = 5000;

export interface FlowEditLockState {
    granted: boolean;
    reason: 'granted' | 'locked' | 'auth_required' | 'not_found' | 'forbidden' | 'unknown';
    holderUserId: string | null;
    holderDisplayName: string | null;
    holderAvatarUrl: string | null;
    expiresAt: string | null;
}

function normalizeLockState(payload: unknown): FlowEditLockState {
    if (!payload || typeof payload !== 'object') {
        return {
            granted: false,
            reason: 'unknown',
            holderUserId: null,
            holderDisplayName: null,
            holderAvatarUrl: null,
            expiresAt: null,
        };
    }

    const value = payload as Record<string, unknown>;
    const reasonValue = typeof value.reason === 'string' ? value.reason : 'unknown';

    return {
        granted: value.granted === true,
        reason:
            reasonValue === 'granted' ||
            reasonValue === 'locked' ||
            reasonValue === 'auth_required' ||
            reasonValue === 'not_found' ||
            reasonValue === 'forbidden'
                ? reasonValue
                : 'unknown',
        holderUserId: typeof value.holderUserId === 'string' ? value.holderUserId : null,
        holderDisplayName: typeof value.holderDisplayName === 'string' ? value.holderDisplayName : null,
        holderAvatarUrl: typeof value.holderAvatarUrl === 'string' ? value.holderAvatarUrl : null,
        expiresAt: typeof value.expiresAt === 'string' ? value.expiresAt : null,
    };
}

export async function claimFlowEditLock(flowId: string): Promise<FlowEditLockState> {
    const { data, error } = await supabase.rpc('claim_flow_edit_lock', { target_flow_id: flowId });
    if (error) throw error;
    return normalizeLockState(data);
}

export async function releaseFlowEditLock(flowId: string): Promise<void> {
    const { error } = await supabase.rpc('release_flow_edit_lock', { target_flow_id: flowId });
    if (error) throw error;
}

export function releaseFlowEditLockWithKeepalive(flowId: string, accessToken: string | null | undefined) {
    if (!supabaseUrl || !supabaseAnonKey || !accessToken) return;

    void fetch(`${supabaseUrl}/rest/v1/rpc/release_flow_edit_lock`, {
        method: 'POST',
        keepalive: true,
        headers: {
            'Content-Type': 'application/json',
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ target_flow_id: flowId }),
    }).catch((error) => {
        console.error('Error sending keepalive release for shared flow edit lock:', error);
    });
}
