import { useState, useEffect } from "react";

export interface SystemMetrics {
  batteryLevel: number | null;
  isCharging: boolean | null;
  networkType: string;
  isOnline: boolean;
  cpuLoad: number;
  memoryUsageMb: number;
  aiPipelineStatus: "IDLE" | "LISTENING" | "THINKING" | "EXECUTING" | "DONE";
}

export function useSystemTelemetry(pipelineStatus: "IDLE" | "LISTENING" | "THINKING" | "EXECUTING" | "DONE") {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    batteryLevel: 88,
    isCharging: true,
    networkType: "5G / WiFi",
    isOnline: true,
    cpuLoad: 18,
    memoryUsageMb: 412,
    aiPipelineStatus: pipelineStatus,
  });

  useEffect(() => {
    // Battery API check
    if ("getBattery" in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          setMetrics((prev) => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            isCharging: battery.charging,
          }));

          battery.addEventListener("levelchange", () => {
            setMetrics((prev) => ({
              ...prev,
              batteryLevel: Math.round(battery.level * 100),
            }));
          });

          battery.addEventListener("chargingchange", () => {
            setMetrics((prev) => ({
              ...prev,
              isCharging: battery.charging,
            }));
          });
        })
        .catch(() => {});
    }

    // Network connection
    const updateNetwork = () => {
      const conn = (navigator as any).connection;
      const effectiveType = conn?.effectiveType ? `${conn.effectiveType.toUpperCase()} Net` : "Broadband";
      setMetrics((prev) => ({
        ...prev,
        isOnline: navigator.onLine,
        networkType: effectiveType,
      }));
    };

    updateNetwork();
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);

    // Dynamic CPU & memory load simulation reacting to AI status
    const interval = setInterval(() => {
      let targetCpu = 14;
      let targetRam = 380;

      if (pipelineStatus === "LISTENING") {
        targetCpu = 32 + Math.floor(Math.random() * 10);
        targetRam = 420;
      } else if (pipelineStatus === "THINKING") {
        targetCpu = 68 + Math.floor(Math.random() * 18);
        targetRam = 510;
      } else if (pipelineStatus === "EXECUTING") {
        targetCpu = 48 + Math.floor(Math.random() * 12);
        targetRam = 460;
      } else {
        targetCpu = 12 + Math.floor(Math.random() * 6);
        targetRam = 390;
      }

      setMetrics((prev) => ({
        ...prev,
        cpuLoad: targetCpu,
        memoryUsageMb: targetRam,
        aiPipelineStatus: pipelineStatus,
      }));
    }, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
    };
  }, [pipelineStatus]);

  return metrics;
}
