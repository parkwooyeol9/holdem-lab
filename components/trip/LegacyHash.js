"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The guide used to be one page with hash tabs. Send old links to the new pages.
const MOVED = { strategy: "/strategy", study: "/strategy#study", culture: "/culture", lab: "/lab", routine: "/lab#routine" };

export default function LegacyHash() {
  const router = useRouter();
  useEffect(() => {
    const target = MOVED[location.hash.slice(1)];
    if (target) router.replace(target);
  }, [router]);
  return null;
}
