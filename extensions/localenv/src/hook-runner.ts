import * as extensionApi from '@podman-desktop/api';
import type { InfraComponent } from './types';

export class HookRunner {
  private localenvRoot: string;

  constructor(localenvRoot: string) {
    this.localenvRoot = localenvRoot;
  }

  setLocalenvRoot(root: string): void {
    this.localenvRoot = root;
  }

  async runPreHooks(component: InfraComponent): Promise<void> {
    if (component.preHook) {
      await this.executeScript(component.preHook);
    }
  }

  async runPostHooks(component: InfraComponent): Promise<void> {
    if (component.postHook) {
      await this.executeScript(component.postHook);
    }
    if (component.webInitHook && component.webUiUrl) {
      await this.waitForUrl(component.webUiUrl, 30);
      await this.executeScript(component.webInitHook);
    }
  }

  async runShutdownHooks(component: InfraComponent): Promise<void> {
    if (component.shutdownHook) {
      await this.executeScript(component.shutdownHook);
    }
  }

  private async executeScript(scriptPath: string): Promise<void> {
    const isWindows = process.platform === 'win32';

    if (isWindows) {
      // Try PowerShell variant
      const ps1Path = scriptPath.replace(/\.sh$/, '.ps1');
      await extensionApi.process.exec('powershell', ['-File', ps1Path], {
        cwd: this.localenvRoot,
      });
    } else {
      await extensionApi.process.exec('bash', [scriptPath], {
        cwd: this.localenvRoot,
      });
    }
  }

  private async waitForUrl(url: string, timeoutSeconds: number): Promise<void> {
    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;

    while (Date.now() - startTime < timeoutMs) {
      try {
        await extensionApi.process.exec('curl', ['-sf', '-o', '/dev/null', url]);
        return;
      } catch {
        await this.sleep(2000);
      }
    }
    console.warn(`Timeout waiting for ${url} after ${timeoutSeconds}s`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
