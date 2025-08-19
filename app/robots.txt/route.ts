// app/robots.txt/route.ts
export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL;

  const robotsTxt = `User-agent: *
    Allow: /

    Sitemap: ${baseUrl}/sitemap.xml
    `;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
