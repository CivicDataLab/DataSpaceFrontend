import { env } from '@/env';
import { jwtDecode } from 'jwt-decode';
import { Account, AuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';

// One Keycloak refresh per refresh token. Overlapping /api/auth/session calls
// used to refresh the same token together; the loser got invalid_grant and
// saved RefreshAccessTokenError over a refresh that had just succeeded.
let refreshTask: { key: string; promise: Promise<JWT> } | null = null;

function refreshOnce(token: JWT): Promise<JWT> {
  const key = String(token.refresh_token ?? '');
  if (refreshTask?.key === key) return refreshTask.promise;

  const promise = refreshAccessToken(token).finally(() => {
    if (refreshTask?.promise === promise) refreshTask = null;
  });
  refreshTask = { key, promise };
  return promise;
}

// this will refresh an expired access token, when needed
async function refreshAccessToken(token: JWT) {
  const urlObj: Record<string, string> = {
    client_id: env.KEYCLOAK_CLIENT_ID,
    client_secret: env.KEYCLOAK_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: String(token.refresh_token ?? ''),
  };

  const resp = await fetch(`${env.AUTH_ISSUER}/protocol/openid-connect/token`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(urlObj),
    method: 'POST',
  });
  const refreshToken = await resp.json();

  if (!resp.ok) throw refreshToken;

  return {
    ...token,
    access_token: refreshToken.access_token,
    decoded: jwtDecode(refreshToken.access_token),
    id_token: refreshToken.id_token,
    expires_at: Math.floor(Date.now() / 1000) + refreshToken.expires_in,
    refresh_token: refreshToken.refresh_token,
  };
}
export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: `${env.KEYCLOAK_CLIENT_ID}`,
      clientSecret: `${env.KEYCLOAK_CLIENT_SECRET}`,
      issuer: `${env.AUTH_ISSUER}`,
      httpOptions: {
        // The local resolver often takes longer than 10s to reach Keycloak.
        // A shorter timeout aborts the code exchange after the user has already
        // signed in, so the app comes back with no session.
        timeout: 60000,
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      const nowTimeStamp = Math.floor(Date.now() / 1000);

      if (account) {
        // account is only available the first time this callback is called on a new session (after the user signs in)
        token.decoded = jwtDecode(account.access_token as string);
        token.access_token = account.access_token;
        token.id_token = account.id_token;
        token.expires_at = account.expires_at;
        token.refresh_token = account.refresh_token;
        return token;
      } else if (token.error === 'RefreshAccessTokenError') {
        // The cookie still holds a dead session. Throwing makes the session
        // route delete that cookie. Returning the token here saved it again,
        // which put the profile chip back after sign-out.
        throw new Error('RefreshAccessTokenError');
      } else if (nowTimeStamp < (token.expires_at as number)) {
        // token has not expired yet, return it
        return token;
      } else {
        // token is expired, try to refresh it
        try {
          return await refreshOnce(token);
        } catch (error) {
          console.error('Error refreshing access token', error);
          // Mark it once so the next session read takes the branch above and
          // deletes the cookie, without calling Keycloak again.
          return { ...token, error: 'RefreshAccessTokenError' };
        }
      }
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client
      // session.access_token = encrypt(token.access_token as string);
      // session.id_token = encrypt(token.id_token as string);
      session.access_token = (token.access_token as string);
      session.id_token = (token.id_token as string);
      session.roles = (
        token.decoded as {
          realm_access: { roles: string[] };
        }
      ).realm_access.roles;
      session.error = token.error as string;

      return session;
    },
  },
};
