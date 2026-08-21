import { env } from '@/env';
import { getServerSession } from 'next-auth';

import { authOptions } from '../[...nextauth]/options';

export async function GET() {
  const session = await getServerSession(authOptions);
  const idToken = session?.id_token;

  if (session && idToken && session.error !== 'RefreshAccessTokenError') {
    const logoutUrl = `${env.AUTH_ISSUER}/protocol/openid-connect/logout?${new URLSearchParams(
      {
        id_token_hint: idToken,
        post_logout_redirect_uri: env.NEXTAUTH_URL,
        client_id: env.KEYCLOAK_CLIENT_ID,
      }
    ).toString()}`;

    return new Response(JSON.stringify({ url: logoutUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ url: `${env.NEXTAUTH_URL}/login` }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
