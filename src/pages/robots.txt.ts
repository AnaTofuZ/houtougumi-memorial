const allowIndex = import.meta.env.SITE_READY === 'true';

export function GET() {
  return new Response(`User-agent: *\nDisallow: ${allowIndex ? '' : '/'}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
