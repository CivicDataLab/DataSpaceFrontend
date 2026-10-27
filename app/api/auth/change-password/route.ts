import { NextResponse } from 'next/server';
import { env } from '@/env';
import { getServerSession } from 'next-auth';

import { authOptions } from '../[...nextauth]/options';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.error === 'RefreshAccessTokenError') {
    return NextResponse.json({ url: `${env.NEXTAUTH_URL}/login` });
  }

  const issuer = env.AUTH_ISSUER.replace(/\/$/, '');
  return NextResponse.json({
    url: `${issuer}/account/account-security/signing-in`,
  });
}
