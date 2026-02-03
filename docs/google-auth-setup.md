# Google Sign-In Setup Guide

To enable "Sign in with Google," you need to configure both the Google Cloud Platform (GCP) and your Supabase project.

## Step 1: Google Cloud Console

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (or select an existing one).
3.  **OAuth Consent Screen**:
    -   Navigate to **APIs & Services > OAuth consent screen**.
    -   Select **External** (unless you are in a Google Workspace organization and only want internal users).
    -   Fill in required details (App name, support email, etc.).
    -   No special scopes are needed for basic login (just `email`, `profile`, `openid` which are default).
    -   Add test users if the app is in "Testing" mode.
4.  **Credentials**:
    -   Navigate to **APIs & Services > Credentials**.
    -   Click **Create Credentials > OAuth client ID**.
    -   Application type: **Web application**.
    -   **Authorized JavaScript origins**: `http://localhost:5173` (and your production domain).
    -   **Authorized redirect URIs**: `https://<YOUR-SUPABASE-PROJECT-ID>.supabase.co/auth/v1/callback`
        -   *Note: You can find your Supabase URL in your Supabase Dashboard under Settings > API.*
    -   Click **Create**.
    -   Copy the **Client ID** and **Client Secret**.

## Step 2: Supabase Dashboard

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project.
3.  Navigate to **Authentication > Providers**.
4.  Select **Google**.
5.  **Enable** the provider.
6.  Paste the **Client ID** and **Client Secret** from the previous step.
7.  Click **Save**.

## Step 3: Redirect URLs (Supabase)

1.  Navigate to **Authentication > URL Configuration**.
2.  **Site URL**: Set this to your production URL (e.g., `https://vca-sandbox.vercel.app`).
3.  **Redirect URLs**: Add `http://localhost:5173` here.
    -   *Crucial*: You must blacklist **BOTH** your local development URL and your production URL so that login works in both environments. Supabase matches these against the `redirectTo` parameter sent by the app.
4.  If configured correctly, Supabase will handle the handshake with Google and redirect back to your app with a session.
