/*  North Star Maintenance — Cloudflare Worker
 *  Handles:
 *    POST /           → Relay quote form to Zoho Flow
 *    POST /gallery/*  → Gallery management (add/delete photos via GitHub API)
 *
 *  Required secrets (set in Cloudflare dashboard → Worker → Settings → Variables):
 *    GITHUB_TOKEN   – Fine-grained PAT with Contents read/write on North-Star-Maintance
 *    ADMIN_PASSWORD – Same password used on the admin page
 */

const ZOHO_WEBHOOK = 'https://flow.zoho.com/919075448/flow/webhook/incoming?zapikey=1001.1a9d5fcdfdf877a65341cf739f145491.36aadc8cde80059e1d49303feb2e751a&isdebug=false';
const REPO_OWNER = 'ckuball106-code';
const REPO_NAME  = 'North-Star-Maintance';
const BRANCH     = 'main';
const GALLERY_FILE = 'gallery-data.json';
const PHOTOS_DIR   = 'photos';
const SITE_BASE  = `https://${REPO_OWNER}.github.io/${REPO_NAME}/`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ── Gallery endpoints ──
      if (path.startsWith('/gallery')) {
        if (request.method !== 'POST') return json({ error: 'POST required' }, 405);
        const body = await request.json();

        // Verify admin password
        if (!env.ADMIN_PASSWORD || body.password !== env.ADMIN_PASSWORD) {
          return json({ error: 'Wrong password' }, 403);
        }

        if (path === '/gallery/photos') return await getPhotos(env);
        if (path === '/gallery/add')    return await addPhoto(env, body);
        if (path === '/gallery/delete') return await deletePhoto(env, body);
        return json({ error: 'Unknown gallery endpoint' }, 404);
      }

      // ── Default: Zoho quote relay (existing behavior) ──
      if (request.method !== 'POST') {
        return json({ error: 'POST required' }, 405);
      }
      const formData = await request.json();
      const zohoResp = await fetch(ZOHO_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const zohoResult = await zohoResp.text();
      return new Response(zohoResult, {
        status: zohoResp.status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      return json({ error: err.message || 'Server error' }, 500);
    }
  }
};

// ── GitHub helpers ──

function ghUrl(path) {
  return `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
}

function ghHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'NorthStar-Worker',
  };
}

// Read a file from the public repo (no auth needed)
async function readFilePublic(filePath) {
  const resp = await fetch(`${ghUrl(filePath)}?ref=${BRANCH}`, {
    headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'NorthStar-Worker' },
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  const decoded = atob(data.content.replace(/\n/g, ''));
  return { content: JSON.parse(decoded), sha: data.sha };
}

// Read a file with auth (needed before writing to get latest sha)
async function readFileAuth(token, filePath) {
  const resp = await fetch(`${ghUrl(filePath)}?ref=${BRANCH}`, {
    headers: ghHeaders(token),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.message || `GitHub read failed (${resp.status})`);
  }
  const data = await resp.json();
  const decoded = atob(data.content.replace(/\n/g, ''));
  return { content: JSON.parse(decoded), sha: data.sha };
}

async function writeFile(token, filePath, content, sha, message) {
  const encoded = btoa(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  const body = { message, content: encoded, branch: BRANCH };
  if (sha) body.sha = sha;
  const resp = await fetch(ghUrl(filePath), {
    method: 'PUT',
    headers: ghHeaders(token),
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    if (resp.status === 401) throw new Error('GITHUB_TOKEN is invalid — check the secret in Cloudflare Worker settings');
    if (resp.status === 403) throw new Error('GITHUB_TOKEN does not have write permission — make sure Contents is set to Read and write');
    throw new Error(err.message || `GitHub write failed (${resp.status})`);
  }
  const result = await resp.json();
  return result.content.sha;
}

// ── Gallery endpoints ──

async function getPhotos(env) {
  // Public repo — no auth needed to read
  const file = await readFilePublic(GALLERY_FILE);
  const photos = file ? (file.content.photos || []) : [];
  return json({ ok: true, photos });
}

async function addPhoto(env, body) {
  const { image, imageUrl, title, description, category, slideshow } = body;
  if (!title) return json({ error: 'Title is required' }, 400);
  if (!image && !imageUrl) return json({ error: 'Image or URL is required' }, 400);
  if (!env.GITHUB_TOKEN) return json({ error: 'GITHUB_TOKEN secret is not set in Cloudflare Worker settings' }, 500);

  const token = env.GITHUB_TOKEN;
  let finalUrl = imageUrl || '';

  // If a base64 image was sent, upload it to the repo
  if (image) {
    const filename = Date.now() + '.jpg';
    const filePath = `${PHOTOS_DIR}/${filename}`;
    const uploadBody = {
      message: `Add photo: ${filename}`,
      content: image, // already base64
      branch: BRANCH,
    };
    // Check if file already exists (unlikely with timestamp name)
    try {
      const check = await fetch(`${ghUrl(filePath)}?ref=${BRANCH}`, { headers: ghHeaders(token) });
      if (check.ok) {
        const existing = await check.json();
        uploadBody.sha = existing.sha;
      }
    } catch(e) {}
    const uploadResp = await fetch(ghUrl(filePath), {
      method: 'PUT',
      headers: ghHeaders(token),
      body: JSON.stringify(uploadBody),
    });
    if (!uploadResp.ok) {
      const err = await uploadResp.json().catch(() => ({}));
      throw new Error(err.message || 'Image upload failed');
    }
    finalUrl = SITE_BASE + filePath;
  }

  // Read current gallery, add photo, write back
  const file = await readFileAuth(token, GALLERY_FILE).catch(() => null);
  const data = file ? file.content : { photos: [] };
  const sha = file ? file.sha : undefined;

  const newPhoto = {
    id: Date.now(),
    title: title,
    description: description || '',
    imageUrl: finalUrl,
    category: category || 'general',
    slideshow: slideshow !== false,
    dateAdded: new Date().toISOString(),
  };
  data.photos = [newPhoto, ...(data.photos || [])];

  await writeFile(token, GALLERY_FILE, JSON.stringify(data, null, 2), sha, `Add photo: ${title}`);

  return json({ ok: true, photo: newPhoto });
}

async function deletePhoto(env, body) {
  const { photoId } = body;
  if (!photoId) return json({ error: 'photoId is required' }, 400);

  const token = env.GITHUB_TOKEN;
  if (!token) return json({ error: 'GITHUB_TOKEN secret is not set in Cloudflare Worker settings' }, 500);
  const file = await readFileAuth(token, GALLERY_FILE);
  if (!file) return json({ error: 'Gallery file not found' }, 500);

  const data = file.content;
  const before = (data.photos || []).length;
  data.photos = (data.photos || []).filter(p => p.id !== photoId);

  if (data.photos.length === before) {
    return json({ error: 'Photo not found' }, 404);
  }

  await writeFile(token, GALLERY_FILE, JSON.stringify(data, null, 2), file.sha, `Delete photo ${photoId}`);

  return json({ ok: true });
}
