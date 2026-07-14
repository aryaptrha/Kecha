import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getClientIp } from './utils/rateLimit';

/**
 * Next.js Proxy/Middleware function to handle rate limiting.
 * It intercepts requests and blocks them with a 429 Too Many Requests response
 * if the rate limit threshold is exceeded.
 */
export async function proxy(request: NextRequest) {
  const ip = getClientIp(request);
  
  // Read limit options with safe defaults
  const limit = process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 60;
  const windowSeconds = process.env.RATE_LIMIT_WINDOW_SECONDS ? parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 10) : 60;
  const windowMs = windowSeconds * 1000;

  // Run the rate limit check
  const result = await checkRateLimit(ip, limit, windowMs);

  // If rate limited, return 429 Too Many Requests response
  if (!result.success) {
    const retryAfter = Math.max(0, result.reset - Math.ceil(Date.now() / 1000));
    
    // Set headers
    const headers = new Headers({
      'Retry-After': String(retryAfter),
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(result.reset),
    });

    const acceptHeader = request.headers.get('accept') || '';
    
    // Return JSON response if requested by client-side API calls
    if (acceptHeader.includes('application/json')) {
      headers.set('Content-Type', 'application/json; charset=utf-8');
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Batas akses terlampaui. Silakan coba lagi dalam ${retryAfter} detik.`,
          retryAfter,
        }),
        { status: 429, headers }
      );
    }

    // Return beautiful, flat-design HTML page matching the Kecha design guidelines
    headers.set('Content-Type', 'text/html; charset=utf-8');
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terlalu Banyak Permintaan - Kecha</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background-color: #F8F6F3;
      color: #1C1E21;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .card {
      background-color: #F2EFEA;
      border: 4px solid #2B2D31;
      padding: 2.5rem 2rem;
      max-width: 480px;
      width: 90%;
      box-shadow: 6px 6px 0px 0px #2B2D31;
      text-align: center;
    }
    .badge {
      background-color: #B71C2B;
      color: #F8F6F3;
      font-size: 0.75rem;
      font-weight: 900;
      padding: 0.35rem 0.85rem;
      border: 2px solid #2B2D31;
      text-transform: uppercase;
      display: inline-block;
      margin-bottom: 1.5rem;
      letter-spacing: 0.05em;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 900;
      text-transform: uppercase;
      margin: 0 0 1rem 0;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    p {
      font-size: 0.95rem;
      line-height: 1.6;
      margin: 0 0 1.75rem 0;
      color: #2B2D31;
    }
    .info {
      font-size: 0.8rem;
      background-color: #F8F6F3;
      border: 2px solid #2B2D31;
      padding: 1rem;
      margin-bottom: 1.75rem;
      font-family: monospace;
      text-align: left;
      line-height: 1.5;
    }
    .btn {
      background-color: #2B2D31;
      color: #F8F6F3;
      border: 2px solid #2B2D31;
      padding: 0.85rem 1.75rem;
      font-size: 0.9rem;
      font-weight: 900;
      text-transform: uppercase;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      width: 100%;
      box-sizing: border-box;
      transition: all 0.15s ease;
      box-shadow: 3px 3px 0px 0px #B71C2B;
    }
    .btn:hover {
      background-color: #F8F6F3;
      color: #2B2D31;
      transform: translate(-1px, -1px);
      box-shadow: 4px 4px 0px 0px #B71C2B;
    }
    .btn:active {
      transform: translate(1px, 1px);
      box-shadow: 2px 2px 0px 0px #B71C2B;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Error 429</div>
    <h1>Batas Akses Terlampaui</h1>
    <p>Maaf, Anda melakukan terlalu banyak permintaan dalam waktu singkat demi keamanan website Kecha. Silakan tunggu beberapa saat sebelum mencoba kembali.</p>
    <div class="info">
      <strong>IP:</strong> ${ip}<br>
      <strong>Batas:</strong> ${limit} request / ${windowSeconds} detik<br>
      <strong>Coba lagi dalam:</strong> ${retryAfter} detik
    </div>
    <button class="btn" onclick="window.location.reload()">Coba Lagi</button>
  </div>
</body>
</html>`;

    return new Response(html, { status: 429, headers });
  }

  // If rate limit checks pass, proceed to next middleware/routes
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(result.reset));
  return response;
}

/**
 * Configure paths to include/exclude for the middleware.
 * Excludes static directories, favicons, and files with common static extensions
 * to prevent blocking styling, scripting, or image requests.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js)$).*)',
  ],
};
