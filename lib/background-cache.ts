// Module-level: persists across client-side navigations
const cache: Record<string, string> = {};
let loaded = false;
let promise: Promise<void> | null = null;

export function getCachedBg(key: string): string {
  return cache[key] || "";
}

export async function prefetchAllBgs(supabase: any): Promise<void> {
  if (loaded) return;
  if (promise) return promise;
  promise = (async () => {
    try {
      const { data } = await (supabase.from("page_backgrounds") as any).select("page_key, image_url");
      if (data) {
        data.forEach((row: any) => {
          if (row.page_key && row.image_url) {
            cache[row.page_key] = row.image_url;
            if (typeof window !== "undefined") {
              const img = new window.Image();
              img.src = row.image_url;
            }
          }
        });
        loaded = true;
      }
    } catch (e) { console.error("bg prefetch:", e); }
  })();
  return promise;
}
