'use server';

export const postAction = async ({ req }: any) => {
  try {
    const envelopeBytes = await req.arrayBuffer();
    const envelope = new TextDecoder().decode(envelopeBytes);
    const piece = envelope.split('\n')[0];
    const header = JSON.parse(piece);
    const dsn = new URL(header['dsn']);
    const project_id = dsn.pathname?.replace('/', '');

    if (dsn.hostname !== process.env.SENTRY_DSN_URL) {
      throw new Error(`Invalid sentry hostname: ${dsn.hostname}`);
    }

    if (!project_id || ![process.env.SENTRY_PROJECT_ID]?.includes(project_id)) {
      throw new Error(`Invalid sentry project id: ${project_id}`);
    }

    const upstream_sentry_url = `https://${process.env.SENTRY_DSN_URL}/api/${project_id}/envelope/`;
    await fetch(upstream_sentry_url, {
      method: 'POST',
      body: envelopeBytes,
    });

    return new Response(JSON.stringify({}), { status: 200 });
  } catch (e) {
    console.error('error tunneling to sentry', e);
    return new Response(
      JSON.stringify({ error: 'error tunneling to sentry' }),
      { status: 500 }
    );
  }
};
