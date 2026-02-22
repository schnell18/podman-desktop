import * as fs from 'node:fs';
import * as path from 'node:path';

import * as yaml from 'js-yaml';

import type { ComponentCategory, ComponentMetadata, InfraComponent } from './types';

const IGNORED_DIRS = ['global'];

const DEFAULT_METADATA: Record<string, Partial<ComponentMetadata>> = {
  postgresql: { displayName: 'PostgreSQL', description: 'PostgreSQL 17 relational database with pgAdmin web console', category: 'database', icon: 'postgresql' },
  mariadb: { displayName: 'MariaDB', description: 'MariaDB 10.7 MySQL-compatible database', category: 'database', icon: 'mariadb' },
  mongodb: { displayName: 'MongoDB', description: 'MongoDB 4.4 document database', category: 'database', icon: 'mongodb' },
  cockroachdb: { displayName: 'CockroachDB', description: 'CockroachDB distributed SQL database', category: 'database', icon: 'cockroachdb' },
  etcd: { displayName: 'etcd', description: 'etcd distributed key-value store', category: 'config_registry', icon: 'etcd' },
  kafka: { displayName: 'Kafka', description: 'Kafka 3-broker cluster with Kafdrop UI', category: 'message_broker', icon: 'kafka' },
  kafka4: { displayName: 'Kafka 4', description: 'Kafka 4 KRaft-mode cluster', category: 'message_broker', icon: 'kafka' },
  rabbitmq: { displayName: 'RabbitMQ', description: 'RabbitMQ with management console', category: 'message_broker', icon: 'rabbitmq' },
  nats: { displayName: 'NATS', description: 'NATS with JetStream and NUI web client', category: 'message_broker', icon: 'nats' },
  rocketmq: { displayName: 'RocketMQ', description: 'Apache RocketMQ with web admin', category: 'message_broker', icon: 'rocketmq' },
  zookeeper: { displayName: 'ZooKeeper', description: 'Apache ZooKeeper 3-node ensemble', category: 'config_registry', icon: 'zookeeper' },
  'redis-cluster': { displayName: 'Redis Cluster', description: 'Redis 7 cluster with P3X Redis UI', category: 'cache', icon: 'redis' },
  'redis-sentinel': { displayName: 'Redis Sentinel', description: 'Redis Sentinel high-availability setup', category: 'cache', icon: 'redis' },
  elasticsearch: { displayName: 'Elasticsearch', description: 'Elasticsearch 7.15 with Kibana', category: 'search_analytics', icon: 'elasticsearch' },
  nacos: { displayName: 'Nacos', description: 'Nacos service discovery and config management', category: 'config_registry', icon: 'nacos' },
  nginx: { displayName: 'Nginx', description: 'Nginx reverse proxy', category: 'web_server', icon: 'nginx' },
  filebeat: { displayName: 'Filebeat', description: 'Filebeat log collector for Elasticsearch', category: 'logging', icon: 'filebeat' },
  fluentbit: { displayName: 'Fluent Bit', description: 'Fluent Bit log processor', category: 'logging', icon: 'fluentbit' },
  jaeger: { displayName: 'Jaeger', description: 'Jaeger distributed tracing', category: 'tracing', icon: 'jaeger' },
};

export class ComponentRegistry {
  private localenvRoot: string;
  private components: Map<string, InfraComponent> = new Map();

  constructor(localenvRoot: string) {
    this.localenvRoot = localenvRoot;
  }

  setLocalenvRoot(root: string): void {
    this.localenvRoot = root;
    this.components.clear();
  }

  async scanComponents(): Promise<InfraComponent[]> {
    this.components.clear();
    const infraDir = path.join(this.localenvRoot, '.infra');

    if (!fs.existsSync(infraDir)) {
      console.warn(`Infra directory not found: ${infraDir}`);
      return [];
    }

    const entries = fs.readdirSync(infraDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() || IGNORED_DIRS.includes(entry.name)) {
        continue;
      }

      const componentDir = path.join(infraDir, entry.name);
      const descriptorPath = path.join(componentDir, 'descriptor.yml');

      if (!fs.existsSync(descriptorPath)) {
        continue;
      }

      const component = await this.buildComponent(entry.name, componentDir, descriptorPath);
      this.components.set(entry.name, component);
    }

    return Array.from(this.components.values());
  }

  getComponent(name: string): InfraComponent | undefined {
    return this.components.get(name);
  }

  getAllComponents(): InfraComponent[] {
    return Array.from(this.components.values());
  }

  updateComponentStatus(name: string, status: InfraComponent['status']): void {
    const component = this.components.get(name);
    if (component) {
      component.status = status;
    }
  }

  private async buildComponent(
    name: string,
    componentDir: string,
    descriptorPath: string,
  ): Promise<InfraComponent> {
    const metadata = this.readMetadata(name, componentDir);
    const services = this.parseServices(descriptorPath);
    const hooks = this.discoverHooks(componentDir);
    const webUiUrl = this.readWebUiUrl(componentDir);

    return {
      name,
      displayName: metadata.displayName,
      description: metadata.description,
      category: metadata.category,
      icon: metadata.icon,
      descriptorPath,
      services,
      ...hooks,
      webUiUrl,
      status: 'stopped',
      containers: [],
    };
  }

  private readMetadata(name: string, componentDir: string): ComponentMetadata {
    const metadataPath = path.join(componentDir, 'metadata.yml');
    const defaults = DEFAULT_METADATA[name];

    const fallback: ComponentMetadata = {
      displayName: defaults?.displayName ?? name,
      description: defaults?.description ?? `${name} infrastructure component`,
      category: (defaults?.category as ComponentCategory) ?? 'uncategorized',
      icon: defaults?.icon ?? 'generic',
    };

    if (!fs.existsSync(metadataPath)) {
      return fallback;
    }

    try {
      const content = fs.readFileSync(metadataPath, 'utf-8');
      const parsed = yaml.load(content) as Partial<ComponentMetadata>;
      return {
        displayName: parsed.displayName ?? fallback.displayName,
        description: parsed.description ?? fallback.description,
        category: (parsed.category as ComponentCategory) ?? fallback.category,
        icon: parsed.icon ?? fallback.icon,
      };
    } catch {
      return fallback;
    }
  }

  private parseServices(descriptorPath: string): string[] {
    try {
      const content = fs.readFileSync(descriptorPath, 'utf-8');
      const compose = yaml.load(content) as { services?: Record<string, unknown> };
      return compose?.services ? Object.keys(compose.services) : [];
    } catch {
      return [];
    }
  }

  private discoverHooks(
    componentDir: string,
  ): Pick<InfraComponent, 'preHook' | 'postHook' | 'shutdownHook' | 'webInitHook'> {
    const provisionDir = path.join(componentDir, 'provision');
    const result: Pick<InfraComponent, 'preHook' | 'postHook' | 'shutdownHook' | 'webInitHook'> = {};

    const preHook = path.join(provisionDir, 'pre', 'prepare.sh');
    if (fs.existsSync(preHook)) {
      result.preHook = preHook;
    }

    const postHook = path.join(provisionDir, 'post', 'setup.sh');
    if (fs.existsSync(postHook)) {
      result.postHook = postHook;
    }

    const shutdownHook = path.join(provisionDir, 'shutdown', 'cleanup.sh');
    if (fs.existsSync(shutdownHook)) {
      result.shutdownHook = shutdownHook;
    }

    const webInitHook = path.join(provisionDir, 'post', 'web-init.sh');
    if (fs.existsSync(webInitHook)) {
      result.webInitHook = webInitHook;
    }

    return result;
  }

  private readWebUiUrl(componentDir: string): string | undefined {
    const webuiPath = path.join(componentDir, 'provision', 'post', 'webui.txt');
    if (!fs.existsSync(webuiPath)) {
      return undefined;
    }
    try {
      return fs.readFileSync(webuiPath, 'utf-8').trim();
    } catch {
      return undefined;
    }
  }
}
