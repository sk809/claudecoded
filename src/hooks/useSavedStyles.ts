import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

// Saved styles live in the saved_styles table (see supabase/migrations), one row per user and style.
export function useSavedStyles() {
  const { user } = useAuth();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !user) { setSlugs([]); setLoading(false); return; }
    setLoading(true);
    supabase
      .from("saved_styles")
      .select("slug")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError("Saved styles didn't load. " + error.message);
        else setSlugs((data ?? []).map((r) => r.slug as string));
        setLoading(false);
      });
  }, [user]);

  const toggle = useCallback(async (slug: string) => {
    if (!supabase || !user) return;
    const saved = slugs.includes(slug);
    const { error } = saved
      ? await supabase.from("saved_styles").delete().eq("user_id", user.id).eq("slug", slug)
      : await supabase.from("saved_styles").insert({ user_id: user.id, slug });
    if (error) throw new Error(error.message);
    setSlugs((prev) => (saved ? prev.filter((s) => s !== slug) : [slug, ...prev]));
  }, [slugs, user]);

  return { slugs, loading, error, toggle, isSaved: (slug: string) => slugs.includes(slug) };
}
