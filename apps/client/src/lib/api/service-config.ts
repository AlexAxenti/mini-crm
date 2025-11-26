export enum ServiceName {
  CONTACTS = "contacts",
  EVENTS = "events",
}

interface ServiceConfig {
  url: string;
  apiKey: string;
}

const serviceConfig: Record<ServiceName, ServiceConfig> = {
  [ServiceName.CONTACTS]: {
    url: process.env.CONTACTS_SERVICE_URL!,
    apiKey: process.env.CONTACTS_API_KEY!,
  },
  [ServiceName.EVENTS]: {
    url: process.env.EVENTS_SERVICE_URL!,
    apiKey: process.env.EVENTS_API_KEY!,
  },
};

export function getServiceConfig(service: ServiceName): ServiceConfig {
  return serviceConfig[service];
}
