"use client";
import { useEffect } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import { prefetchAllBgs } from "../../lib/background-cache";

export function BgPrefetch() {
  useEffect(() => {
    prefetchAllBgs(getSupabaseClient());
  }, []);
  return null;
}
