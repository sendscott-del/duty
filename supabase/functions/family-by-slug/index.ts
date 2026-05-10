import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { slug } = await req.json();
    if (!slug || typeof slug !== "string") {
      return json({ error: "missing_slug" }, 400);
    }

    const normalized = slug.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(normalized)) {
      return json({ error: "invalid_slug" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Canonical slug
    const { data: direct, error: directErr } = await admin
      .from("chores_families")
      .select("id, name, slug")
      .eq("slug", normalized)
      .maybeSingle();
    if (directErr) return json({ error: directErr.message }, 500);
    if (direct) {
      return json({ family_id: direct.id, name: direct.name, slug: direct.slug, alias: false }, 200);
    }

    // Fallback: alias (old slug after a rename)
    const { data: alias, error: aliasErr } = await admin
      .from("chores_family_slug_aliases")
      .select("family_id")
      .eq("slug", normalized)
      .maybeSingle();
    if (aliasErr) return json({ error: aliasErr.message }, 500);
    if (alias) {
      const { data: family, error: famErr } = await admin
        .from("chores_families")
        .select("id, name, slug")
        .eq("id", alias.family_id)
        .single();
      if (famErr || !family) return json({ error: "not_found" }, 404);
      return json({ family_id: family.id, name: family.name, slug: family.slug, alias: true }, 200);
    }

    return json({ error: "not_found" }, 404);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}
