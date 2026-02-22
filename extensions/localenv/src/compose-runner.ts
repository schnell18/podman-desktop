import * as extensionApi from '@podman-desktop/api';

export class ComposeRunner {
  private composeCommand: string;

  constructor(composeCommand: string = 'podman compose') {
    this.composeCommand = composeCommand;
  }

  setComposeCommand(command: string): void {
    this.composeCommand = command;
  }

  async composeUp(descriptorPath: string, cwd: string): Promise<void> {
    const { cmd, baseArgs } = this.parseCommand();
    const args = [...baseArgs, '-f', descriptorPath, 'up', '-d', '--force-recreate'];
    await extensionApi.process.exec(cmd, args, { cwd });
  }

  async composeDown(descriptorPath: string, cwd: string): Promise<void> {
    const { cmd, baseArgs } = this.parseCommand();
    const args = [...baseArgs, '-f', descriptorPath, 'down'];
    await extensionApi.process.exec(cmd, args, { cwd });
  }

  async composePs(descriptorPath: string, cwd: string): Promise<string> {
    const { cmd, baseArgs } = this.parseCommand();
    const args = [...baseArgs, '-f', descriptorPath, 'ps', '--format', 'json'];
    const result = await extensionApi.process.exec(cmd, args, { cwd });
    return result.stdout;
  }

  private parseCommand(): { cmd: string; baseArgs: string[] } {
    // Handle "podman compose" (two words) vs "podman-compose" or "docker-compose"
    const parts = this.composeCommand.split(' ');
    return {
      cmd: parts[0],
      baseArgs: parts.slice(1),
    };
  }
}
