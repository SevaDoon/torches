/*
 * Minimal Firestore REST client. No SDK — the full `firebase` package wouldn't
 * install (disk was full), and a class-sized leaderboard doesn't need it:
 * fetch + Firestore's plain REST API does the whole job in ~60 lines.
 *
 * The web "apiKey" below is not a secret (Firebase's own docs say so) — access
 * control is enforced by firestore.rules, deployed separately.
 */
const PROJECT_ID = 'torches-megagoal-687ee';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/*
 * The signed-in student's token. Firestore rules only let her write her own row,
 * so every request carries it. Set at sign-in and on each page load.
 */
let idToken: string | null = null;
export function setAuthToken(token: string | null) {
  idToken = token;
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  return idToken ? { ...extra, Authorization: `Bearer ${idToken}` } : extra;
}

type FsValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { arrayValue: { values?: FsValue[] } }
  | { mapValue: { fields?: Record<string, FsValue> } };

function encodeValue(v: unknown): FsValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  return { mapValue: { fields: encodeFields(v as Record<string, unknown>) } };
}

function decodeValue(v: FsValue): unknown {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(decodeValue);
  if ('mapValue' in v) return decodeFields(v.mapValue.fields ?? {});
  return null;
}

function encodeFields(obj: Record<string, unknown>): Record<string, FsValue> {
  const out: Record<string, FsValue> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = encodeValue(v);
  return out;
}

function decodeFields(fields: Record<string, FsValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) out[k] = decodeValue(v);
  return out;
}

export async function getDocument<T>(collection: string, id: string): Promise<T | null> {
  const res = await fetch(`${BASE}/${collection}/${encodeURIComponent(id)}`, {
    headers: headers(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore get failed: ${res.status}`);
  const body = await res.json();
  return decodeFields(body.fields ?? {}) as T;
}

export async function setDocument(collection: string, id: string, data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/${collection}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ fields: encodeFields(data) }),
  });
  if (!res.ok) throw new Error(`Firestore set failed: ${res.status} ${await res.text()}`);
}

export async function deleteDocument(collection: string, id: string) {
  const res = await fetch(`${BASE}/${collection}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Firestore delete failed: ${res.status}`);
}

/**
 * Top `limit` documents in `collection`, ordered by `orderByField` descending.
 *
 * `fields` asks Firestore for those fields only. The leaderboard needs five of
 * them out of a record that also carries every answer the student has ever
 * missed, so this is the difference between a small response and a huge one.
 */
export async function queryTop<T>(
  collection: string,
  orderByField: string,
  limit: number,
  fields?: string[],
): Promise<T[]> {
  const res = await fetch(`${BASE}:runQuery`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        ...(fields ? { select: { fields: fields.map((f) => ({ fieldPath: f })) } } : {}),
        orderBy: [{ field: { fieldPath: orderByField }, direction: 'DESCENDING' }],
        limit,
      },
    }),
  });
  if (!res.ok) throw new Error(`Firestore query failed: ${res.status}`);
  const rows: Array<{ document?: { fields: Record<string, FsValue> } }> = await res.json();
  return rows.filter((r) => r.document).map((r) => decodeFields(r.document!.fields ?? {}) as T);
}
