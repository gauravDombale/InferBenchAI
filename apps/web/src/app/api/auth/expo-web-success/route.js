import { getToken } from "@auth/core/jwt";

// Only post messages to a known, trusted origin — never wildcard '*'
const TRUSTED_ORIGIN =
  process.env.EXPO_PUBLIC_BASE_URL ||
  process.env.AUTH_URL ||
  process.env.NEXT_PUBLIC_CREATE_APP_URL ||
  "*"; // last-resort fallback only (local dev)

export async function GET(request) {
  const isSecure =
    process.env.AUTH_URL?.startsWith("https") ??
    request.url?.startsWith("https") ??
    false;
  const [token, jwt] = await Promise.all([
    getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: isSecure,
      raw: true,
    }),
    getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: isSecure,
    }),
  ]);

  if (!jwt) {
    return new Response(
      `<html><body><script>
        window.parent.postMessage({ type: 'AUTH_ERROR', error: 'Unauthorized' }, ${JSON.stringify(TRUSTED_ORIGIN)});
      </script></body></html>`,
      { status: 401, headers: { "Content-Type": "text/html" } },
    );
  }

  const message = {
    type: "AUTH_SUCCESS",
    jwt: token,
    user: { id: jwt.sub, email: jwt.email, name: jwt.name },
  };

  return new Response(
    `<html><body><script>
      window.parent.postMessage(${JSON.stringify(message)}, ${JSON.stringify(TRUSTED_ORIGIN)});
    </script></body></html>`,
    { headers: { "Content-Type": "text/html" } },
  );
}
