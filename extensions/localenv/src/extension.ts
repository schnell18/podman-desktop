import * as extensionApi from '@podman-desktop/api';

import { generateDashboardHtml } from './dashboard-html';
import { InfraManager } from './infra-manager';
import type { RpcRequest } from './types';

let infraManager: InfraManager | undefined;

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  const config = extensionApi.configuration.getConfiguration('localenv');
  let localenvRoot = config.get<string>('rootPath') ?? '';
  const composeCommand = config.get<string>('composeCommand') ?? 'podman compose';
  const pollingInterval = config.get<number>('pollingInterval') ?? 5000;

  infraManager = new InfraManager(localenvRoot, composeCommand);

  // Create the Dashboard webview panel
  const panel = extensionApi.window.createWebviewPanel('localenv-dashboard', 'Localenv');

  // If localenv root is configured, scan components immediately
  let components = localenvRoot ? await infraManager.scanComponents() : [];

  // Generate and set dashboard HTML
  panel.webview.html = generateDashboardHtml(components);

  // Send initial data to the webview after a brief delay to let it initialize
  setTimeout(() => {
    panel.webview.postMessage({
      type: 'initialData',
      components,
      hasPath: !!localenvRoot,
    });
  }, 500);

  // Handle RPC messages from the frontend
  panel.webview.onDidReceiveMessage(async (msg: RpcRequest) => {
    if (!msg.method) {
      return;
    }

    // Special handling for setLocalenvPath - show folder picker
    if (msg.method === 'setLocalenvPath') {
      const selected = await extensionApi.window.showOpenDialog({
        title: 'Select Localenv Root Directory',
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
      });

      if (selected && selected.length > 0) {
        localenvRoot = selected[0].fsPath;
        await config.update('rootPath', localenvRoot);
        infraManager!.setLocalenvRoot(localenvRoot);
        components = await infraManager!.scanComponents();
        panel.webview.postMessage({
          type: 'initialData',
          components,
          hasPath: true,
        });
      }
      return;
    }

    // Special handling for getLogs - send log content back
    if (msg.method === 'getLogs') {
      const params = msg.params as { name: string; tail: number };
      try {
        const content = await infraManager!.getLogs(params.name, params.tail);
        panel.webview.postMessage({
          type: 'logs',
          name: params.name,
          content,
        });
      } catch (error) {
        panel.webview.postMessage({
          type: 'logs',
          name: params.name,
          content: `Error fetching logs: ${error}`,
        });
      }
      return;
    }

    // Handle all other RPC methods
    const response = await infraManager!.handleRpc(msg);
    panel.webview.postMessage(response);
  });

  // Register commands for command-palette access
  const openDashboardCmd = extensionApi.commands.registerCommand(
    'localenv.openDashboard',
    () => {
      panel.reveal();
    },
  );

  const startCmd = extensionApi.commands.registerCommand(
    'localenv.startComponent',
    async (name: string) => {
      await infraManager!.startComponent(name);
    },
  );

  const stopCmd = extensionApi.commands.registerCommand(
    'localenv.stopComponent',
    async (name: string) => {
      await infraManager!.stopComponent(name);
    },
  );

  // Listen for configuration changes
  const configListener = extensionApi.configuration.onDidChangeConfiguration(async () => {
    const newConfig = extensionApi.configuration.getConfiguration('localenv');
    const newRoot = newConfig.get<string>('rootPath') ?? '';
    const newCompose = newConfig.get<string>('composeCommand') ?? 'podman compose';

    if (newRoot !== localenvRoot && newRoot) {
      localenvRoot = newRoot;
      infraManager!.setLocalenvRoot(newRoot);
      components = await infraManager!.scanComponents();
      panel.webview.postMessage({
        type: 'initialData',
        components,
        hasPath: true,
      });
    }

    infraManager!.setComposeCommand(newCompose);
  });

  extensionContext.subscriptions.push(panel, openDashboardCmd, startCmd, stopCmd, configListener);

  // Start polling container status
  if (localenvRoot) {
    infraManager.startStatusPolling(panel, pollingInterval);
  }
}

export function deactivate(): void {
  infraManager?.stopStatusPolling();
}
