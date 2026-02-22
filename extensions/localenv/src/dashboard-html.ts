import type { InfraComponent } from './types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from './types';
import { COMPONENT_ICONS } from './icons';

export function generateDashboardHtml(components: InfraComponent[]): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
${CSS}
</style>
</head>
<body>
  <div id="app">
    <header class="toolbar">
      <h1>Localenv Dashboard</h1>
      <div class="toolbar-actions">
        <button id="btn-refresh" class="btn btn-secondary" title="Refresh status">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.65 2.35A8 8 0 1 0 16 8h-2a6 6 0 1 1-1.76-4.24L10 6h6V0l-2.35 2.35z"/>
          </svg>
          Refresh
        </button>
      </div>
    </header>
    <div id="no-path" class="notice" style="display:none">
      <p>No localenv directory configured. Please set the path in the extension settings or click below.</p>
      <button id="btn-set-path" class="btn btn-primary">Select Localenv Directory</button>
    </div>
    <div id="dashboard" class="dashboard"></div>
    <div id="log-modal" class="modal" style="display:none">
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="log-title">Logs</h2>
          <button id="log-close" class="btn-icon">&times;</button>
        </div>
        <pre id="log-output" class="log-output"></pre>
      </div>
    </div>
  </div>
<script>
${JS}
</script>
</body>
</html>`;
}

const CSS = `
:root {
  --bg-primary: #1e1e2e;
  --bg-secondary: #292940;
  --bg-card: #2a2a3d;
  --bg-hover: #32324a;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0b0;
  --text-muted: #707080;
  --border-color: #3a3a50;
  --accent: #7c3aed;
  --accent-hover: #6d28d9;
  --green: #10b981;
  --green-bg: rgba(16, 185, 129, 0.15);
  --amber: #f59e0b;
  --amber-bg: rgba(245, 158, 11, 0.15);
  --red: #ef4444;
  --red-bg: rgba(239, 68, 68, 0.15);
  --orange: #f97316;
  --orange-bg: rgba(249, 115, 22, 0.15);
  --gray: #6b7280;
  --radius: 8px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.toolbar h1 {
  font-size: 18px;
  font-weight: 600;
}

.toolbar-actions { display: flex; gap: 8px; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: none;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn svg { flex-shrink: 0; }

.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover:not(:disabled) { background: var(--accent-hover); }

.btn-secondary { background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color); }
.btn-secondary:hover:not(:disabled) { background: var(--bg-hover); }

.btn-success { background: var(--green); color: #fff; }
.btn-success:hover:not(:disabled) { background: #059669; }

.btn-danger { background: var(--red); color: #fff; }
.btn-danger:hover:not(:disabled) { background: #dc2626; }

.btn-sm { padding: 4px 10px; font-size: 12px; }

.btn-icon {
  background: none; border: none; color: var(--text-secondary);
  cursor: pointer; font-size: 20px; padding: 4px;
}
.btn-icon:hover { color: var(--text-primary); }

.notice {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-secondary);
}
.notice p { margin-bottom: 16px; }

.dashboard { padding: 24px; }

.category-section { margin-bottom: 32px; }

.category-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-color);
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.card:hover { border-color: #4a4a60; }

.card.running { border-left: 3px solid var(--green); }
.card.partially_running { border-left: 3px solid var(--orange); }
.card.starting, .card.stopping { border-left: 3px solid var(--amber); }
.card.error { border-left: 3px solid var(--red); }
.card.stopped { border-left: 3px solid var(--gray); }

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.card-icon {
  width: 51px;
  height: 51px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--bg-secondary);
}
.card-icon svg { width: 32px; height: 32px; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}
.status-badge .dot {
  width: 6px; height: 6px; border-radius: 50%;
}
.status-badge.running { background: var(--green-bg); color: var(--green); }
.status-badge.running .dot { background: var(--green); }
.status-badge.partially_running { background: var(--orange-bg); color: var(--orange); }
.status-badge.partially_running .dot { background: var(--orange); }
.status-badge.starting, .status-badge.stopping { background: var(--amber-bg); color: var(--amber); }
.status-badge.starting .dot, .status-badge.stopping .dot { background: var(--amber); animation: pulse 1.5s infinite; }
.status-badge.error { background: var(--red-bg); color: var(--red); }
.status-badge.error .dot { background: var(--red); }
.status-badge.stopped { background: rgba(107, 114, 128, 0.15); color: var(--gray); }
.status-badge.stopped .dot { background: var(--gray); }

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.card-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  min-height: 36px;
}

.card-services {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.card-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.modal {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  width: 80%; max-width: 800px; max-height: 80vh;
  display: flex; flex-direction: column;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-bottom: 1px solid var(--border-color);
}
.modal-header h2 { font-size: 15px; }
.log-output {
  flex: 1; overflow: auto; padding: 12px 16px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px; line-height: 1.6;
  color: var(--text-secondary);
  white-space: pre-wrap; word-break: break-all;
  max-height: 60vh;
}
`;

const JS = `
const api = window.acquirePodmanDesktopApi();
let components = [];

const STATUS_LABELS = {
  stopped: 'Stopped', starting: 'Starting', running: 'Running',
  partially_running: 'Unhealthy', stopping: 'Stopping', error: 'Error'
};

const CATEGORY_ORDER = ${JSON.stringify(CATEGORY_ORDER)};
const CATEGORY_LABELS = ${JSON.stringify(CATEGORY_LABELS)};

// Receive messages from extension backend
window.addEventListener('message', (event) => {
  const msg = event.data;
  // Messages from backend arrive wrapped: { command: 'onmessage', data: actualData }
  const data = msg.command === 'onmessage' ? msg.data : msg;

  if (data.type === 'statusUpdate') {
    components = data.components;
    render();
  } else if (data.type === 'initialData') {
    components = data.components;
    const noPath = document.getElementById('no-path');
    const dashboard = document.getElementById('dashboard');
    if (data.hasPath) {
      noPath.style.display = 'none';
      dashboard.style.display = 'block';
    } else {
      noPath.style.display = 'block';
      dashboard.style.display = 'none';
    }
    render();
  } else if (data.type === 'logs') {
    document.getElementById('log-output').textContent = data.content;
    document.getElementById('log-title').textContent = 'Logs: ' + data.name;
    document.getElementById('log-modal').style.display = 'flex';
  } else if (data.id) {
    // RPC response - ignore, handled by backend
  }
});

function rpc(method, params) {
  const id = Math.random().toString(36).substring(2);
  api.postMessage({ id, method, params });
}

function render() {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  // Group by category
  const grouped = {};
  for (const c of components) {
    const cat = c.category || 'uncategorized';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(c);
  }

  let html = '';
  for (const cat of CATEGORY_ORDER) {
    const items = grouped[cat];
    if (!items || items.length === 0) continue;

    // Sort components within category by displayName
    items.sort((a, b) => a.displayName.localeCompare(b.displayName));

    html += '<div class="category-section">';
    html += '<div class="category-title">' + (CATEGORY_LABELS[cat] || cat) + '</div>';
    html += '<div class="component-grid">';
    for (const comp of items) {
      html += renderCard(comp);
    }
    html += '</div></div>';
  }

  dashboard.innerHTML = html;

  // Attach event listeners
  dashboard.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', handleAction);
  });
}

function renderCard(comp) {
  const icon = getIconSvg(comp.icon);
  const statusClass = comp.status;
  const statusLabel = STATUS_LABELS[comp.status] || comp.status;
  const services = comp.services?.join(', ') || '';

  let actions = '';
  switch (comp.status) {
    case 'stopped':
    case 'error':
      actions = '<button class="btn btn-primary btn-sm" data-action="start" data-name="' + comp.name + '">'
        + (comp.status === 'error' ? 'Retry' : 'Start') + '</button>';
      break;
    case 'starting':
      actions = '<button class="btn btn-secondary btn-sm" disabled>Starting...</button>';
      break;
    case 'running':
      if (comp.webUiUrl) {
        actions = '<button class="btn btn-success btn-sm" data-action="webui" data-name="' + comp.name + '">Open Web UI</button>';
      }
      actions += '<button class="btn btn-secondary btn-sm" data-action="logs" data-name="' + comp.name + '">Logs</button>';
      actions += '<button class="btn btn-danger btn-sm" data-action="stop" data-name="' + comp.name + '">Stop</button>';
      break;
    case 'partially_running':
      actions = '<button class="btn btn-secondary btn-sm" data-action="logs" data-name="' + comp.name + '">Logs</button>';
      actions += '<button class="btn btn-danger btn-sm" data-action="stop" data-name="' + comp.name + '">Stop</button>';
      break;
    case 'stopping':
      actions = '<button class="btn btn-secondary btn-sm" disabled>Stopping...</button>';
      break;
  }

  return '<div class="card ' + statusClass + '">'
    + '<div class="card-header">'
    + '  <div class="card-icon">' + icon + '</div>'
    + '  <span class="status-badge ' + statusClass + '"><span class="dot"></span>' + statusLabel + '</span>'
    + '</div>'
    + '<div class="card-name">' + escapeHtml(comp.displayName) + '</div>'
    + '<div class="card-desc">' + escapeHtml(comp.description) + '</div>'
    + (services ? '<div class="card-services">Services: ' + escapeHtml(services) + '</div>' : '')
    + '<div class="card-actions">' + actions + '</div>'
    + '</div>';
}

function handleAction(e) {
  const btn = e.currentTarget;
  const action = btn.dataset.action;
  const name = btn.dataset.name;
  switch (action) {
    case 'start': rpc('startComponent', name); break;
    case 'stop': rpc('stopComponent', name); break;
    case 'webui': rpc('openWebUI', name); break;
    case 'logs': rpc('getLogs', { name: name, tail: 200 }); break;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// SVG icon map
const ICONS = ${JSON.stringify(COMPONENT_ICONS)};

function getIconSvg(iconName) {
  return ICONS[iconName] || ICONS['generic'] || '';
}

// Button handlers
document.getElementById('btn-refresh')?.addEventListener('click', () => rpc('refreshStatus'));
document.getElementById('btn-set-path')?.addEventListener('click', () => rpc('setLocalenvPath', ''));
document.getElementById('log-close')?.addEventListener('click', () => {
  document.getElementById('log-modal').style.display = 'none';
});
`;
