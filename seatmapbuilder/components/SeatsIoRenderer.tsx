"use client";
import { useEffect, useRef, useState } from 'react';

type Props = {
  workspaceKey: string;
  chartKey?: string;
  eventKey?: string;
  region?: string; // e.g. 'eu' | 'na' | 'sa' depending on your Seats.io account
  onObjectSelected?: (obj: unknown) => void;
  onObjectDeselected?: (obj: unknown) => void;
};

declare global {
  interface Window {
    seatsio?: any;
  }
}

function loadSeatsIoScript(region: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.seatsio) return resolve();
    const script = document.createElement('script');
    script.src = `https://cdn-${region}.seatsio.net/chart.js`;
    script.async = true;
    script.onload = () => {
      // Wait a bit for the script to fully initialize
      setTimeout(() => resolve(), 100);
    };
    script.onerror = () => reject(new Error('Failed to load Seats.io script'));
    document.head.appendChild(script);
  });
}

export default function SeatsIoRenderer({ workspaceKey, chartKey, eventKey, region = 'eu', onObjectSelected, onObjectDeselected }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const divId = 'seatsio-chart-container';

  useEffect(() => {
    let chart: any;
    let disposed = false;
    (async () => {
      try {
        await loadSeatsIoScript(region);
        if (disposed) return;
        const seatsio = window.seatsio;
        if (!seatsio || !seatsio.SeatingChart) {
          throw new Error('Seats.io library not properly loaded');
        }
        const baseConfig: any = {
          divId,
          workspaceKey,
          region,
          events: {
            objectSelected: (obj: unknown) => onObjectSelected?.(obj),
            objectDeselected: (obj: unknown) => onObjectDeselected?.(obj),
            renderFailed: (err: any) => {
              console.error('Seats.io renderFailed', err);
              setError(typeof err === 'string' ? err : (err?.message || 'Render failed'));
            },
          },
        };
        if (eventKey) baseConfig.event = eventKey; else if (chartKey) baseConfig.chart = chartKey;
        chart = new seatsio.SeatingChart(baseConfig);
        chart.render();
      } catch (e) {
        setError((e as Error).message);
      }
    })();
    return () => {
      disposed = true;
      try {
        chart?.destroy?.();
      } catch {}
    };
  }, [workspaceKey, chartKey, eventKey, region, onObjectSelected, onObjectDeselected]);

  if (error) {
    return <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>;
  }

  return <div id={divId} ref={containerRef} className="w-full overflow-auto rounded border border-neutral-200" style={{ minHeight: 400 }} />;
}


