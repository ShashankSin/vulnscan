import { useQueryClient } from "@tanstack/react-query";
import { scanAPI } from "@/api/scanApi";

const scanKeys = {
  all: ["scan"] as const,
  list: () => [...scanKeys.all, "list"] as const,
};

export const useScanStream = () => {
  const queryClient = useQueryClient();

  const startScan = (url: string, handlers: any) => {
    const source = scanAPI.startScanStream(url);

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        if (parsed.type === "progress") {
          handlers.onProgress(parsed.data);
        }

        if (parsed.type === "complete") {
          handlers.onComplete(parsed.data);

          queryClient.invalidateQueries({
            queryKey: scanKeys.list(),
          });

          source.close();
        }
      } catch (err) {
        handlers.onError?.(err);
      }
    };

    source.onerror = (err) => {
      source.close();
      handlers.onError?.(err);
    };

    return source;
  };

  return { startScan };
};
