"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PathwaysPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to opportunities instead of pathways
    router.replace("/opportunities");
  }, [router]);

  return null;
}
