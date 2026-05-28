import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | any | null = null;

// Return a supabase client. On the server we require environment variables
// and will throw if they are missing. In the browser, to avoid runtime
// crashes when env is not configured (e.g., build-only preview), return a
// lightweight no-op stub that implements the methods the app expects.
export function getSupabaseClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If missing on the server, surface an error so server routes fail fast.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === "undefined") {
      throw new Error("Missing Supabase environment variables. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }

    // In the browser, return a safe stub to prevent UI crashes where
    // Supabase is not configured. Methods return benign values.
    /* eslint-disable @typescript-eslint/no-explicit-any */
    client = {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        signOut: async () => ({}),
        signInWithPassword: async () => ({ error: { message: "Supabase not configured" } }),
        signInWithOAuth: async () => ({ error: { message: "Supabase not configured" } }),
        signInWithOtp: async () => ({ error: { message: "Supabase not configured" } }),
        onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getUser: async () => ({ data: { user: null } }),
      },
      from: (_table: string) => ({
        select: async () => ({ data: null }),
        maybeSingle: async () => ({ data: null }),
        insert: async () => ({ error: null }),
        upsert: async () => ({ error: null }),
        update: async () => ({ error: null }),
        delete: async () => ({ error: null }),
        order: () => ({ limit: async () => ({ data: null }) }),
      }),
      storage: {
        from: (_bucket: string) => ({
          upload: async () => ({ error: null }),
          getPublicUrl: (_path: string) => ({ data: { publicUrl: "" } }),
        }),
      },
    } as any;

    // eslint-enable @typescript-eslint/no-explicit-any
    console.warn("Supabase not configured: returning safe stub client for browser runtime.");
    return client;
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}
