/*
 * Sign-in without an SDK, and without asking a 15-year-old for an email address.
 *
 * The student types a name and a PIN. The name is hashed into a stable synthetic
 * email so Firebase Auth has something in the shape it expects, and Firebase
 * does the real password hashing and token issuing. The refresh token is kept in
 * localStorage, so she stays signed in on that device until she signs out — and
 * can sign in on any other device with the same name + PIN.
 */
const API_KEY = 'AIzaSyCUR8fqY1-qMlPlw2onPrDqu9Bi2lfr8fk';
const IDENTITY = 'https://identitytoolkit.googleapis.com/v1/accounts';
const SECURE_TOKEN = 'https://securetoken.googleapis.com/v1/token';

const K_REFRESH = 'torches.refreshToken';
const K_VISITOR = 'torches.visitor';

export interface Session {
  uid: string;
  idToken: string;
}

/** Same name always maps to the same account, whatever the script or spacing. */
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

async function emailFor(name: string): Promise<string> {
  const bytes = new TextEncoder().encode(`torches:${normalizeName(name)}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = [...new Uint8Array(digest)]
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `u${hex}@torches.app`;
}

/** Firebase demands 6+ characters; the student only ever types the short PIN. */
const passwordFor = (pin: string) => `PIN:${pin.trim()}:torches`;

export class AuthError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

async function identityCall(path: string, body: unknown) {
  const res = await fetch(`${IDENTITY}:${path}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...(body as object), returnSecureToken: true }),
  });
  const json = await res.json();
  if (!res.ok) throw new AuthError(json?.error?.message ?? 'AUTH_FAILED');
  return json as { localId: string; idToken: string; refreshToken: string };
}

function remember(refreshToken: string) {
  try {
    localStorage.setItem(K_REFRESH, refreshToken);
  } catch {
    /* private mode — the session still works until the tab closes */
  }
}

export async function signUp(name: string, pin: string): Promise<Session> {
  const r = await identityCall('signUp', {
    email: await emailFor(name),
    password: passwordFor(pin),
  });
  remember(r.refreshToken);
  return { uid: r.localId, idToken: r.idToken };
}

/*
 * The visitor account. Firestore will not answer an unauthenticated read, so
 * someone who only wants to look at the class still needs a sign-in — this one
 * belongs to nobody. The app never writes a student record for it, so a visit
 * leaves no trace and never reaches the leaderboard.
 */
const VISITOR_NAME = '__torches_visitor__';
const VISITOR_PIN = '730514';

export async function signInVisitor(): Promise<Session> {
  // First visit ever creates it; every visit after that signs in.
  const session = await signIn(VISITOR_NAME, VISITOR_PIN).catch(() =>
    signUp(VISITOR_NAME, VISITOR_PIN),
  );
  try {
    localStorage.setItem(K_VISITOR, '1');
  } catch {
    /* private mode — the visit still works until the tab closes */
  }
  return session;
}

/** True when the restored session belongs to a visitor, not a student. */
export function isVisitorSession(): boolean {
  try {
    return localStorage.getItem(K_VISITOR) === '1';
  } catch {
    return false;
  }
}

export async function signIn(name: string, pin: string): Promise<Session> {
  const r = await identityCall('signInWithPassword', {
    email: await emailFor(name),
    password: passwordFor(pin),
  });
  remember(r.refreshToken);
  return { uid: r.localId, idToken: r.idToken };
}

/** Restores the session on a page load, so the student never re-types anything. */
export async function restoreSession(): Promise<Session | null> {
  let refreshToken: string | null = null;
  try {
    refreshToken = localStorage.getItem(K_REFRESH);
  } catch {
    return null;
  }
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${SECURE_TOKEN}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
    });
    if (!res.ok) {
      // The token was revoked or the account is gone — make her sign in again.
      if (res.status === 400) forgetSession();
      return null;
    }
    const json = await res.json();
    remember(json.refresh_token);
    return { uid: json.user_id, idToken: json.id_token };
  } catch {
    return null; // offline: no session this load, but the saved token survives
  }
}

export function forgetSession() {
  try {
    localStorage.removeItem(K_REFRESH);
    localStorage.removeItem(K_VISITOR);
  } catch {
    /* ignore */
  }
}
