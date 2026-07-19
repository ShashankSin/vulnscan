import API_ENDPOINTS from "@/lib/endPoints";
import { getUser } from "@/lib/storage";
import API from "@/request/request";

export const scanAPI = {
  startScanStream: (url: string) => {
    const token = getUser() ?? "";

    return new EventSource(
      `http://localhost:5000/api/scan/stream?url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`,
    );
  },
  listScans: async () => {
    const { data } = await API.get(API_ENDPOINTS.SCAN.LIST);
    return data;
  },

  getScan: async (id: string) => {
    const { data } = await API.get(API_ENDPOINTS.SCAN.DETAIL(id));
    return data;
  },
};
