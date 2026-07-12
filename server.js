const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = Number(process.env.PORT || 3013);
// const HOST = process.env.HOST || '127.0.0.1';
const ROOT = __dirname;
const JSON_FILE = path.join(ROOT, 'flowchart.json');
const MMD_FILE = path.join(ROOT, 'flowchart.mmd');
const FLOWS_DIR = path.join(ROOT, 'flows');
const USERS_DIR = path.join(FLOWS_DIR, 'users');
const DEFAULT_PROJECT = 'flowchart';
const DEFAULT_USER = '000666888';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mmd': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function slugProject(value) {
  const slug = String(value || DEFAULT_PROJECT)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || DEFAULT_PROJECT;
}

function slugUser(value) {
  const slug = String(value || DEFAULT_USER)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || DEFAULT_USER;
}

function userDir(user) {
  return path.join(USERS_DIR, slugUser(user));
}

function projectPaths(project, user = DEFAULT_USER) {
  const slug = slugProject(project);
  const owner = slugUser(user);
  const dir = userDir(owner);
  return {
    slug,
    user: owner,
    dir,
    json: path.join(dir, `${slug}.json`),
    mmd: path.join(dir, `${slug}.mmd`),
    legacyJson: path.join(FLOWS_DIR, `${slug}.json`),
    legacyMmd: path.join(FLOWS_DIR, `${slug}.mmd`)
  };
}

async function ensureFlowsDir() {
  await fs.mkdir(FLOWS_DIR, { recursive: true });
  await fs.mkdir(USERS_DIR, { recursive: true });
}

async function ensureUserDir(user = DEFAULT_USER) {
  await ensureFlowsDir();
  await fs.mkdir(userDir(user), { recursive: true });
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function escapeMermaidText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r?\n/g, '<br/>');
}

function mermaidNodeId(id) {
  return 'n_' + String(id || '').replace(/[^a-zA-Z0-9_]/g, '_');
}

function toMermaid(data) {
  const nodes = Array.isArray(data.nodes) ? data.nodes : [];
  const edges = Array.isArray(data.edges) ? data.edges : [];
  const nodeIds = new Set(nodes.map(node => node.id));
  const classDefs = new Map([
    ['CORE', 'fill:#fff8dc,stroke:#ead68f,color:#8a6510'],
    ['DOM', 'fill:#eef6ff,stroke:#b9d7f8,color:#1759b7'],
    ['API', 'fill:#f2fbf6,stroke:#a9dcc2,color:#27885c'],
    ['RISK', 'fill:#fff7f7,stroke:#efb5b5,color:#bf4a4a']
  ]);

  const lines = ['flowchart TD'];
  const classLines = [];

  nodes.forEach(node => {
    const id = mermaidNodeId(node.id);
    const tags = Array.isArray(node.tags) ? node.tags.join(', ') : '';
    const tagLine = tags ? `<small>${escapeMermaidText(tags)}</small><br/>` : '';
    const body = node.body ? `<br/>${escapeMermaidText(node.body)}` : '';
    lines.push(`  ${id}["<b>${escapeMermaidText(node.title || 'Untitled')}</b><br/>${tagLine}${body}"]`);

    const primaryTag = (node.tags || []).find(tag => classDefs.has(String(tag).toUpperCase()));
    if (primaryTag) classLines.push(`  class ${id} ${String(primaryTag).toUpperCase()}`);
  });

  edges.forEach(edge => {
    if (nodeIds.has(edge.from) && nodeIds.has(edge.to)) {
      lines.push(`  ${mermaidNodeId(edge.from)} --> ${mermaidNodeId(edge.to)}`);
    }
  });

  if (classLines.length) {
    lines.push('');
    classDefs.forEach((style, name) => lines.push(`  classDef ${name} ${style}`));
    lines.push(...classLines);
  }

  return lines.join('\n') + '\n';
}

async function saveFlowchart(body, project = DEFAULT_PROJECT, user = DEFAULT_USER) {
  const data = JSON.parse(body);
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    throw new Error('Invalid flowchart data');
  }

  const paths = projectPaths(project || data.project, user || data.user);
  const normalized = {
    project: paths.slug,
    user: paths.user,
    projectName: data.projectName || data.name || data.project || paths.slug,
    version: data.version || 1,
    currentFlowId: data.currentFlowId || 'main',
    view: data.view || { x: 0, y: 0, scale: 1 },
    display: data.display || undefined,
    flows: Array.isArray(data.flows) ? data.flows : undefined,
    groups: Array.isArray(data.groups) ? data.groups : undefined,
    nodes: data.nodes,
    edges: data.edges
  };

  const json = JSON.stringify(normalized, null, 2) + '\n';
  await ensureUserDir(paths.user);
  await fs.writeFile(paths.json, json, 'utf8');
  await fs.writeFile(paths.mmd, toMermaid(normalized), 'utf8');
  if (paths.user === DEFAULT_USER && paths.slug === DEFAULT_PROJECT) {
    await fs.writeFile(JSON_FILE, json, 'utf8');
    await fs.writeFile(MMD_FILE, toMermaid(normalized), 'utf8');
  }
  return normalized;
}

async function readFlowchart(project = DEFAULT_PROJECT, user = DEFAULT_USER) {
  const paths = projectPaths(project, user);
  try {
    return await fs.readFile(paths.json, 'utf8');
  } catch {
    if (paths.user === DEFAULT_USER) {
      try {
        return await fs.readFile(paths.legacyJson, 'utf8');
      } catch {}
    }
    if (paths.slug === DEFAULT_PROJECT) {
      return await fs.readFile(JSON_FILE, 'utf8');
    }
    throw new Error(`${paths.slug}.json not found`);
  }
}

async function listUsers() {
  await ensureFlowsDir();
  const users = new Map();
  const addUser = async (id, dirPath, stats = null) => {
    const user = slugUser(id);
    if (!user) return;
    users.set(user, {
      id: user,
      name: user,
      path: `flows/users/${user}`,
      updatedAt: (stats || await fs.stat(dirPath)).mtime.toISOString()
    });
  };

  try {
    const entries = await fs.readdir(USERS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const id = slugUser(entry.name);
      const dirPath = path.join(USERS_DIR, entry.name);
      await addUser(id, dirPath);
    }
  } catch {}

  if (!users.has(DEFAULT_USER)) {
    await ensureUserDir(DEFAULT_USER);
    await addUser(DEFAULT_USER, userDir(DEFAULT_USER));
  }

  return [...users.values()].sort((a, b) => a.id.localeCompare(b.id));
}

async function listProjects(user = DEFAULT_USER) {
  await ensureFlowsDir();
  await ensureUserDir(user);
  const owner = slugUser(user);
  const dir = userDir(owner);
  const projects = new Map();
  const addProject = async (slug, filePath, stats = null, source = 'user') => {
    try {
      const body = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(body);
      projects.set(slug, {
        id: slug,
        name: data.projectName || data.name || data.project || slug,
        nodes: Array.isArray(data.nodes) ? data.nodes.length : 0,
        edges: Array.isArray(data.edges) ? data.edges.length : 0,
        updatedAt: (stats || await fs.stat(filePath)).mtime.toISOString(),
        source
      });
    } catch {}
  };

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || path.extname(entry.name) !== '.json') continue;
      const slug = slugProject(path.basename(entry.name, '.json'));
      const filePath = path.join(dir, entry.name);
      await addProject(slug, filePath, null, 'user');
    }
  } catch {}

  if (owner === DEFAULT_USER) {
    try {
      const entries = await fs.readdir(FLOWS_DIR, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile() || path.extname(entry.name) !== '.json') continue;
        const slug = slugProject(path.basename(entry.name, '.json'));
        if (projects.has(slug)) continue;
        const filePath = path.join(FLOWS_DIR, entry.name);
        await addProject(slug, filePath, null, 'legacy');
      }
    } catch {}
  }

  if (!projects.has(DEFAULT_PROJECT)) {
    await addProject(DEFAULT_PROJECT, JSON_FILE, null, 'legacy');
  }

  return [...projects.values()].sort((a, b) => {
    if (a.id === DEFAULT_PROJECT) return -1;
    if (b.id === DEFAULT_PROJECT) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt) || a.name.localeCompare(b.name);
  });
}

async function serveStatic(req, res) {
  const requestedPath = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
  const routePath = requestedPath === '/' ? '/flowchart.html' : requestedPath;
  const filePath = path.normalize(path.join(ROOT, routePath));

  if (!filePath.startsWith(ROOT)) {
    send(res, 403, 'Forbidden');
    return;
  }

  try {
    const ext = path.extname(filePath);
    const body = await fs.readFile(filePath);
    send(res, 200, body, MIME[ext] || 'application/octet-stream');
  } catch {
    send(res, 404, 'Not found');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === 'GET' && url.pathname === '/api/users') {
      const users = await listUsers();
      send(res, 200, JSON.stringify({ users }), 'application/json; charset=utf-8');
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/projects') {
      const user = url.searchParams.get('user') || DEFAULT_USER;
      const projects = await listProjects(user);
      send(res, 200, JSON.stringify({ user: slugUser(user), projects }), 'application/json; charset=utf-8');
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/flowchart') {
      const project = url.searchParams.get('project') || DEFAULT_PROJECT;
      const user = url.searchParams.get('user') || DEFAULT_USER;
      try {
        const body = await readFlowchart(project, user);
        send(res, 200, body, 'application/json; charset=utf-8');
      } catch {
        send(res, 404, JSON.stringify({ error: `${slugProject(project)}.json not found` }), 'application/json; charset=utf-8');
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/flowchart') {
      const project = url.searchParams.get('project') || DEFAULT_PROJECT;
      const user = url.searchParams.get('user') || DEFAULT_USER;
      const body = await readRequestBody(req);
      const saved = await saveFlowchart(body, project, user);
      send(res, 200, JSON.stringify({ ok: true, user: saved.user, project: saved.project, nodes: saved.nodes.length, edges: saved.edges.length }), 'application/json; charset=utf-8');
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/mermaid') {
      const project = url.searchParams.get('project') || DEFAULT_PROJECT;
      const user = url.searchParams.get('user') || DEFAULT_USER;
      const paths = projectPaths(project, user);
      try {
        let body;
        try {
          body = await fs.readFile(paths.mmd, 'utf8');
        } catch {
          body = paths.user === DEFAULT_USER
            ? await fs.readFile(paths.slug === DEFAULT_PROJECT ? MMD_FILE : paths.legacyMmd, 'utf8')
            : null;
        }
        if (!body) throw new Error(`${paths.slug}.mmd not found`);
        send(res, 200, body, 'text/plain; charset=utf-8');
      } catch {
        send(res, 404, `${paths.slug}.mmd not found`);
      }
      return;
    }

    if (req.method === 'GET') {
      await serveStatic(req, res);
      return;
    }

    send(res, 405, 'Method not allowed');
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }), 'application/json; charset=utf-8');
  }
});

server.listen(PORT, () => {
  console.log(`Flowchart editor running at http://localhost:${PORT}/flowchart.html`);
});
