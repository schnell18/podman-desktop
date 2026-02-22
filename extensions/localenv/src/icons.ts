// Simplified SVG icons for infrastructure components
// Each icon is a small inline SVG string used in the dashboard cards

export const COMPONENT_ICONS: Record<string, string> = {
  postgresql: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2C9.4 2 4 5.6 4 10v12c0 4.4 5.4 8 12 8s12-3.6 12-8V10c0-4.4-5.4-8-12-8z" fill="#336791" opacity="0.2"/>
    <ellipse cx="16" cy="10" rx="12" ry="6" fill="#336791" opacity="0.4"/>
    <path d="M22 12c0-1.5-2.7-3-6-3s-6 1.5-6 3v8c0 1.5 2.7 3 6 3s6-1.5 6-3v-8z" fill="#336791"/>
    <path d="M22 12c0 1.5-2.7 3-6 3s-6-1.5-6-3" stroke="#fff" stroke-width="0.5" fill="none"/>
  </svg>`,

  mariadb: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="12" fill="#003545" opacity="0.3"/>
    <path d="M8 20c2-4 4-8 8-10s6 0 8 2c-2 2-4 6-6 8s-6 2-10 0z" fill="#003545"/>
    <circle cx="20" cy="12" r="2" fill="#c0a875"/>
  </svg>`,

  mongodb: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4c-1 4-4 8-4 12 0 5 3.5 8 4 12 .5-4 4-7 4-12 0-4-3-8-4-12z" fill="#4faa41"/>
    <path d="M16 4c-.5 2-2 5-3 8h6c-1-3-2.5-6-3-8z" fill="#3f9c35"/>
    <rect x="15.2" y="22" width="1.6" height="6" rx="0.8" fill="#89572a"/>
  </svg>`,

  cockroachdb: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="11" stroke="#6933ff" stroke-width="2" fill="none"/>
    <circle cx="16" cy="16" r="5" fill="#6933ff" opacity="0.3"/>
    <circle cx="16" cy="16" r="2" fill="#6933ff"/>
    <path d="M16 5v6M16 21v6M5 16h6M21 16h6" stroke="#6933ff" stroke-width="1.5"/>
  </svg>`,

  redis: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M28 12l-12 7L4 12l12-7 12 7z" fill="#d82c20" opacity="0.8"/>
    <path d="M28 16l-12 7L4 16" stroke="#d82c20" stroke-width="2" fill="none"/>
    <path d="M28 20l-12 7L4 20" stroke="#d82c20" stroke-width="2" fill="none"/>
    <path d="M16 8l3 2-3 2-3-2 3-2z" fill="#fff"/>
  </svg>`,

  kafka: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="4" fill="#231f20"/>
    <circle cx="24" cy="10" r="3" fill="#231f20" opacity="0.7"/>
    <circle cx="24" cy="22" r="3" fill="#231f20" opacity="0.7"/>
    <circle cx="8" cy="10" r="3" fill="#231f20" opacity="0.7"/>
    <circle cx="8" cy="22" r="3" fill="#231f20" opacity="0.7"/>
    <path d="M16 16l8-6M16 16l8 6M16 16l-8-6M16 16l-8 6" stroke="#231f20" stroke-width="1.5"/>
  </svg>`,

  rabbitmq: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="14" width="20" height="12" rx="2" fill="#ff6600" opacity="0.3"/>
    <rect x="10" y="17" width="5" height="5" rx="1" fill="#ff6600"/>
    <rect x="17" y="17" width="5" height="5" rx="1" fill="#ff6600"/>
    <path d="M12 14V8c0-2 1-3 3-3h2c2 0 3 1 3 3v6" stroke="#ff6600" stroke-width="2" fill="none"/>
  </svg>`,

  nats: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4l2 10h-4l2-10z" fill="#27aae1"/>
    <path d="M6 20l8-4 4 8-8 4-4-8z" fill="#27aae1" opacity="0.6"/>
    <path d="M22 20l-8-4-4 8 8 4 4-8z" fill="#27aae1" opacity="0.4"/>
    <circle cx="16" cy="16" r="3" fill="#27aae1"/>
  </svg>`,

  rocketmq: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4l-4 14h8L16 4z" fill="#d77310"/>
    <path d="M12 18l-2 6h12l-2-6H12z" fill="#d77310" opacity="0.6"/>
    <path d="M14 24l-1 4h6l-1-4h-4z" fill="#d77310" opacity="0.4"/>
    <circle cx="16" cy="10" r="2" fill="#fff" opacity="0.6"/>
  </svg>`,

  elasticsearch: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 10h20c1 0 2 1 2 2H4c0-1 1-2 2-2z" fill="#fed10a"/>
    <path d="M4 14h24v4H4z" fill="#00bfb3"/>
    <path d="M6 20h20c1 0 2 1 2 2H4c0-1 1-2 2-2z" fill="#f04e98"/>
    <circle cx="10" cy="16" r="4" fill="#343741" opacity="0.8"/>
    <circle cx="10" cy="16" r="2" stroke="#fff" stroke-width="1" fill="none"/>
  </svg>`,

  nacos: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="11" stroke="#1890ff" stroke-width="2" fill="none"/>
    <circle cx="16" cy="10" r="3" fill="#1890ff"/>
    <circle cx="10" cy="20" r="3" fill="#1890ff" opacity="0.6"/>
    <circle cx="22" cy="20" r="3" fill="#1890ff" opacity="0.6"/>
    <path d="M16 13v4M13 18l-1.5 1M19 18l1.5 1" stroke="#1890ff" stroke-width="1.5"/>
  </svg>`,

  etcd: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="8" width="20" height="16" rx="3" fill="#419eda" opacity="0.2"/>
    <path d="M10 14h4v2h-4zM18 14h4v2h-4zM10 18h4v2h-4zM18 18h4v2h-4z" fill="#419eda"/>
    <rect x="6" y="8" width="20" height="16" rx="3" stroke="#419eda" stroke-width="1.5" fill="none"/>
  </svg>`,

  zookeeper: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 6v20" stroke="#6a8759" stroke-width="2"/>
    <path d="M16 10l-6 4M16 10l6 4M16 16l-8 4M16 16l8 4M16 22l-4 3M16 22l4 3" stroke="#6a8759" stroke-width="1.5"/>
    <circle cx="16" cy="6" r="2" fill="#6a8759"/>
  </svg>`,

  nginx: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="16,4 28,28 4,28" fill="#009639" opacity="0.8"/>
    <text x="16" y="24" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">N</text>
  </svg>`,

  filebeat: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="6" width="16" height="20" rx="2" fill="#00bfb3" opacity="0.2"/>
    <rect x="8" y="6" width="16" height="20" rx="2" stroke="#00bfb3" stroke-width="1.5" fill="none"/>
    <path d="M12 12h8M12 16h8M12 20h5" stroke="#00bfb3" stroke-width="1.5"/>
    <path d="M20 2l4 4-4 4" stroke="#00bfb3" stroke-width="1.5" fill="none"/>
  </svg>`,

  fluentbit: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8l10 8-10 8V8z" fill="#49bda5"/>
    <path d="M16 12l10 4-10 4v-8z" fill="#49bda5" opacity="0.6"/>
    <circle cx="6" cy="16" r="2" fill="#49bda5"/>
  </svg>`,

  jaeger: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 16h24" stroke="#60d0e4" stroke-width="2"/>
    <circle cx="8" cy="16" r="3" fill="#60d0e4"/>
    <circle cx="16" cy="16" r="3" fill="#60d0e4" opacity="0.7"/>
    <circle cx="24" cy="16" r="3" fill="#60d0e4" opacity="0.4"/>
    <path d="M8 16l4-6M16 16l4 6M8 16l4 6" stroke="#60d0e4" stroke-width="1" opacity="0.5"/>
  </svg>`,

  generic: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="20" height="20" rx="4" stroke="#8b8ba0" stroke-width="1.5" fill="none"/>
    <circle cx="16" cy="16" r="4" stroke="#8b8ba0" stroke-width="1.5" fill="none"/>
    <path d="M16 12v-2M16 22v-2M20 16h2M10 16h2" stroke="#8b8ba0" stroke-width="1.5"/>
  </svg>`,
};
