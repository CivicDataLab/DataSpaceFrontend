import { env } from '@/env';
import { getServerSession } from 'next-auth';

import { authOptions } from '../[...nextauth]/options';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (session) {
    
    const idToken = session.id_token;

    const logoutUrl = `${env.AUTH_ISSUER}/protocol/openid-connect/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(env.NEXTAUTH_URL)}`;

    return new Response(JSON.stringify({ url: logoutUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return new Response(JSON.stringify({ url: env.NEXTAUTH_URL }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
