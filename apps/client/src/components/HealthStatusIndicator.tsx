"use client";

import { useState, useEffect } from "react";
import { Tooltip } from "@/components/UI/Tooltip";

interface HealthStatus {
  contacts: {
    healthy: boolean;
    error: string | null;
    status: unknown;
  };
  events: {
    healthy: boolean;
    error: string | null;
    status: unknown;
  };
}

export function HealthStatusIndicator() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        setHealthStatus(data);
      } catch (error) {
        console.error("Failed to check service health:", error);
        setHealthStatus({
          contacts: {
            healthy: false,
            error: "Failed to check service health",
            status: null,
          },
          events: {
            healthy: false,
            error: "Failed to check service health",
            status: null,
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();
  }, []);

  if (!healthStatus) {
    return null;
  }

  const hasUnhealthyServices =
    !healthStatus.contacts.healthy || !healthStatus.events.healthy;

  if (isLoading || !hasUnhealthyServices) {
    return null;
  }

  const unhealthyServices = [];
  if (!healthStatus.contacts.healthy) {
    unhealthyServices.push(`Contacts service: ${healthStatus.contacts.error}`);
  }
  if (!healthStatus.events.healthy) {
    unhealthyServices.push(`Events service: ${healthStatus.events.error}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Tooltip message={unhealthyServices.join(", ")}>
        <div className="flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full cursor-help">
          <span className="text-sm font-bold">!</span>
        </div>
      </Tooltip>
      <span className="text-sm text-red-600">Service issues detected</span>
    </div>
  );
}
