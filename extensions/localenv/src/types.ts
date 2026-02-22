export type ComponentStatus =
  | 'stopped'
  | 'starting'
  | 'running'
  | 'partially_running'
  | 'stopping'
  | 'error';

export type ComponentCategory =
  | 'database'
  | 'cache'
  | 'message_broker'
  | 'config_registry'
  | 'search_analytics'
  | 'logging'
  | 'web_server'
  | 'tracing'
  | 'uncategorized';

export interface InfraComponent {
  // Identity
  name: string;
  displayName: string;
  description: string;
  category: ComponentCategory;
  icon: string;

  // Compose
  descriptorPath: string;
  services: string[];

  // Hooks
  preHook?: string;
  postHook?: string;
  shutdownHook?: string;
  webInitHook?: string;

  // Web UI
  webUiUrl?: string;

  // Runtime state
  status: ComponentStatus;
  containers: ContainerInfo[];
}

export interface ContainerInfo {
  id: string;
  name: string;
  state: string;
  status: string;
}

export interface ComponentMetadata {
  displayName: string;
  description: string;
  category: ComponentCategory;
  icon: string;
}

// RPC message types
export interface RpcRequest {
  id: string;
  method: string;
  params?: unknown;
}

export interface RpcResponse {
  id: string;
  result?: unknown;
  error?: string;
}

// Category display info
export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  database: 'Databases',
  cache: 'Cache',
  message_broker: 'Message Brokers',
  config_registry: 'Config & Registry',
  search_analytics: 'Search & Analytics',
  logging: 'Logging',
  web_server: 'Web Servers',
  tracing: 'Tracing',
  uncategorized: 'Other',
};

// Category display order
export const CATEGORY_ORDER: ComponentCategory[] = [
  'database',
  'message_broker',
  'cache',
  'config_registry',
  'search_analytics',
  'logging',
  'web_server',
  'tracing',
  'uncategorized',
];
