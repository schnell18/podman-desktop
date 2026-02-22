import * as extensionApi from '@podman-desktop/api';

import { ComposeRunner } from './compose-runner';
import { ComponentRegistry } from './component-registry';
import { HookRunner } from './hook-runner';
import type { ComponentStatus, InfraComponent, RpcRequest, RpcResponse } from './types';

export class InfraManager {
  private registry: ComponentRegistry;
  private composeRunner: ComposeRunner;
  private hookRunner: HookRunner;
  private localenvRoot: string;
  private pollingTimer: ReturnType<typeof setInterval> | undefined;
  private eventDisposable: extensionApi.Disposable | undefined;
  private panel: extensionApi.WebviewPanel | undefined;
  private webUiPanels: Map<string, extensionApi.WebviewPanel> = new Map();
  private subscriptions: { dispose(): void }[] | undefined;

  constructor(localenvRoot: string, composeCommand: string) {
    this.localenvRoot = localenvRoot;
    this.registry = new ComponentRegistry(localenvRoot);
    this.composeRunner = new ComposeRunner(composeCommand);
    this.hookRunner = new HookRunner(localenvRoot);
  }

  setSubscriptions(subscriptions: { dispose(): void }[]): void {
    this.subscriptions = subscriptions;
  }

  setLocalenvRoot(newRoot: string): void {
    this.localenvRoot = newRoot;
    this.registry.setLocalenvRoot(newRoot);
    this.hookRunner.setLocalenvRoot(newRoot);
  }

  setComposeCommand(command: string): void {
    this.composeRunner.setComposeCommand(command);
  }

  async scanComponents(): Promise<InfraComponent[]> {
    return this.registry.scanComponents();
  }

  async startComponent(name: string): Promise<void> {
    const component = this.registry.getComponent(name);
    if (!component) {
      throw new Error(`Component not found: ${name}`);
    }

    try {
      this.registry.updateComponentStatus(name, 'starting');
      this.pushStatusUpdate();

      // Ensure the localenv network exists
      await this.ensureNetwork();

      // Run pre-hooks
      await this.hookRunner.runPreHooks(component);

      // Start containers
      await this.composeRunner.composeUp(component.descriptorPath, this.localenvRoot);

      // Wait briefly for containers to initialize
      await this.sleep(3000);

      // Run post-hooks
      await this.hookRunner.runPostHooks(component);

      this.registry.updateComponentStatus(name, 'running');
      this.pushStatusUpdate();
    } catch (error) {
      console.error(`Failed to start component ${name}:`, error);
      this.registry.updateComponentStatus(name, 'error');
      this.pushStatusUpdate();
      throw error;
    }
  }

  async stopComponent(name: string): Promise<void> {
    const component = this.registry.getComponent(name);
    if (!component) {
      throw new Error(`Component not found: ${name}`);
    }

    try {
      this.registry.updateComponentStatus(name, 'stopping');
      this.pushStatusUpdate();

      // Stop containers
      await this.composeRunner.composeDown(component.descriptorPath, this.localenvRoot);

      // Run shutdown hooks
      await this.hookRunner.runShutdownHooks(component);

      this.registry.updateComponentStatus(name, 'stopped');
      this.pushStatusUpdate();
    } catch (error) {
      console.error(`Failed to stop component ${name}:`, error);
      this.registry.updateComponentStatus(name, 'error');
      this.pushStatusUpdate();
      throw error;
    }
  }

  async openWebUI(name: string): Promise<void> {
    const component = this.registry.getComponent(name);
    if (!component?.webUiUrl) {
      throw new Error(`No web UI available for: ${name}`);
    }

    // If a tab is already open for this component, just reveal it
    const existing = this.webUiPanels.get(name);
    if (existing) {
      existing.reveal();
      return;
    }

    // Create a new webview tab with the web UI embedded in an iframe
    const webuiPanel = extensionApi.window.createWebviewPanel(
      `localenv-webui-${name}`,
      component.displayName,
    );

    webuiPanel.webview.html = this.generateWebUiHtml(component.displayName, component.webUiUrl);

    // Handle messages from the webui panel (e.g. "open in browser" fallback)
    webuiPanel.webview.onDidReceiveMessage(async (msg: { method?: string; url?: string }) => {
      if (msg.method === 'openExternal' && msg.url) {
        await extensionApi.env.openExternal(extensionApi.Uri.parse(msg.url));
      }
    });

    // Track the panel and clean up when disposed
    this.webUiPanels.set(name, webuiPanel);
    webuiPanel.onDidDispose(() => {
      this.webUiPanels.delete(name);
    });

    // Register for cleanup on extension deactivation
    this.subscriptions?.push(webuiPanel);
  }

  private generateWebUiHtml(displayName: string, url: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; overflow: hidden; background: #1e1e2e; }
  .toolbar {
    display: flex; align-items: center; justify-content: space-between;
    height: 36px; padding: 0 12px;
    background: #292940; border-bottom: 1px solid #3a3a50;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12px; color: #a0a0b0;
  }
  .toolbar-title { font-weight: 600; color: #e0e0e0; }
  .toolbar-url { color: #707080; margin-left: 12px; }
  .toolbar-actions { display: flex; gap: 6px; }
  .toolbar-btn {
    background: #2a2a3d; color: #e0e0e0; border: 1px solid #3a3a50;
    border-radius: 4px; padding: 2px 10px; font-size: 11px; cursor: pointer;
  }
  .toolbar-btn:hover { background: #32324a; }
  iframe {
    width: 100%; height: calc(100% - 36px); border: none;
    background: #fff;
  }
</style>
</head>
<body>
  <div class="toolbar">
    <div>
      <span class="toolbar-title">${this.escapeHtml(displayName)}</span>
      <span class="toolbar-url">${this.escapeHtml(url)}</span>
    </div>
    <div class="toolbar-actions">
      <button class="toolbar-btn" id="btn-reload" title="Reload">&#x21bb; Reload</button>
      <button class="toolbar-btn" id="btn-external" title="Open in browser">&#x2197; Browser</button>
    </div>
  </div>
  <iframe id="webui-frame" src="${this.escapeHtml(url)}" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"></iframe>
  <script>
    const api = window.acquirePodmanDesktopApi();
    document.getElementById('btn-reload').addEventListener('click', () => {
      document.getElementById('webui-frame').src = '${this.escapeJs(url)}';
    });
    document.getElementById('btn-external').addEventListener('click', () => {
      api.postMessage({ method: 'openExternal', url: '${this.escapeJs(url)}' });
    });
    window.addEventListener('message', (event) => {
      // no-op for now
    });
  </script>
</body>
</html>`;
  }

  private escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  private escapeJs(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
  }

  async getLogs(name: string, tail: number): Promise<string> {
    const component = this.registry.getComponent(name);
    if (!component) {
      throw new Error(`Component not found: ${name}`);
    }
    try {
      const { cmd, baseArgs } = this.parseComposeCommand();
      const args = [...baseArgs, '-f', component.descriptorPath, 'logs', '--tail', String(tail)];
      const result = await extensionApi.process.exec(cmd, args, { cwd: this.localenvRoot });
      return result.stdout + result.stderr;
    } catch {
      return '';
    }
  }

  async refreshStatus(): Promise<InfraComponent[]> {
    await this.pollContainerStatus();
    return this.registry.getAllComponents();
  }

  async handleRpc(msg: RpcRequest): Promise<RpcResponse> {
    const { id, method, params } = msg;
    try {
      let result: unknown;
      switch (method) {
        case 'listComponents':
          result = this.registry.getAllComponents();
          break;
        case 'startComponent':
          await this.startComponent(params as string);
          result = true;
          break;
        case 'stopComponent':
          await this.stopComponent(params as string);
          result = true;
          break;
        case 'openWebUI':
          await this.openWebUI(params as string);
          result = true;
          break;
        case 'getLogs':
          result = await this.getLogs(
            (params as { name: string; tail: number }).name,
            (params as { name: string; tail: number }).tail,
          );
          break;
        case 'refreshStatus':
          result = await this.refreshStatus();
          break;
        case 'getLocalenvPath':
          result = this.localenvRoot;
          break;
        case 'setLocalenvPath':
          this.setLocalenvRoot(params as string);
          await this.scanComponents();
          result = this.registry.getAllComponents();
          break;
        default:
          return { id, error: `Unknown method: ${method}` };
      }
      return { id, result };
    } catch (error) {
      return { id, error: String(error) };
    }
  }

  startStatusPolling(panel: extensionApi.WebviewPanel, intervalMs: number = 5000): void {
    this.panel = panel;

    // Periodic polling
    this.pollingTimer = setInterval(async () => {
      await this.pollContainerStatus();
      this.pushStatusUpdate();
    }, intervalMs);

    // Event-driven updates
    this.eventDisposable = extensionApi.containerEngine.onEvent(async () => {
      await this.pollContainerStatus();
      this.pushStatusUpdate();
    });
  }

  stopStatusPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = undefined;
    }
    this.eventDisposable?.dispose();
    this.eventDisposable = undefined;
  }

  private async ensureNetwork(): Promise<void> {
    try {
      const result = await extensionApi.process.exec('podman', [
        'network', 'ls', '--format', '{{.Name}}',
      ]);
      const networks = result.stdout.split('\n').map(n => n.trim());
      if (!networks.includes('localenv')) {
        await extensionApi.process.exec('podman', [
          'network', 'create', 'localenv', '--driver', 'bridge',
        ]);
      }
    } catch (error) {
      console.warn('Failed to ensure localenv network:', error);
    }
  }

  private async pollContainerStatus(): Promise<void> {
    try {
      const containers = await extensionApi.containerEngine.listContainers();

      for (const component of this.registry.getAllComponents()) {
        // Skip components in transitional states (being actively started/stopped)
        if (component.status === 'starting' || component.status === 'stopping') {
          continue;
        }

        const matchingContainers = containers.filter(c => {
          // Match by compose project label or by name prefix
          const projectLabel = c.Labels?.['com.docker.compose.project'];
          if (projectLabel) {
            // The compose project name is typically the directory name of the descriptor
            const componentDirName = component.name;
            return projectLabel === componentDirName || projectLabel.endsWith(`-${componentDirName}`);
          }
          // Fallback: match by container name containing service names
          return component.services.some(svc =>
            c.Names?.some(n => n.includes(svc)),
          );
        });

        component.containers = matchingContainers.map(c => ({
          id: c.Id,
          name: c.Names?.[0] ?? c.Id.substring(0, 12),
          state: c.State,
          status: c.Status,
        }));

        component.status = this.deriveStatus(component, matchingContainers);
      }
    } catch (error) {
      console.error('Failed to poll container status:', error);
    }
  }

  private deriveStatus(
    component: InfraComponent,
    containers: extensionApi.ContainerInfo[],
  ): ComponentStatus {
    if (containers.length === 0) {
      return component.status === 'error' ? 'error' : 'stopped';
    }

    const running = containers.filter(c => c.State === 'running');
    const errored = containers.filter(
      c => c.State === 'exited' || c.State === 'dead' || c.Status?.includes('Restarting'),
    );

    if (errored.length > 0 && running.length === 0) {
      return 'error';
    }
    if (running.length === containers.length) {
      return 'running';
    }
    if (running.length > 0) {
      return 'partially_running';
    }
    return 'stopped';
  }

  private pushStatusUpdate(): void {
    if (this.panel) {
      this.panel.webview.postMessage({
        type: 'statusUpdate',
        components: this.registry.getAllComponents(),
      });
    }
  }

  private parseComposeCommand(): { cmd: string; baseArgs: string[] } {
    const config = extensionApi.configuration.getConfiguration('localenv');
    const command = config.get<string>('composeCommand') ?? 'podman compose';
    const parts = command.split(' ');
    return { cmd: parts[0], baseArgs: parts.slice(1) };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
