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
    const auth = req.headers.get("authorization");
    if (!auth) return json({ error: "auth_required" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return json({ error: "unauthorized" }, 401);

    const { member_id } = await req.json();
    if (!member_id || typeof member_id !== "string") return json({ error: "missing_member_id" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: caller } = await admin
      .from("chores_family_members")
      .select("family_id, role")
      .eq("user_id", user.id)
      .single();
    if (!caller || caller.role !== "parent") return json({ error: "forbidden" }, 403);

    const { data: target, error: tErr } = await admin
      .from("chores_family_members")
      .select("id, family_id, user_id, role")
      .eq("id", member_id)
      .single();
    if (tErr || !target) return json({ error: "not_found" }, 404);
    if (target.family_id !== caller.family_id) return json({ error: "forbidden" }, 403);
    if (target.role !== "child") return json({ error: "not_a_child" }, 400);
    if (target.user_id) return json({ ok: true, user_id: target.user_id, already: true }, 200);

    const email = `kid-${target.id}@duty.local`;
    const password = crypto.randomUUID() + crypto.randomUUID();

    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { duty_member_id: target.id, role: "child" },
    });
    if (cErr || !created?.user) return json({ error: cErr?.message ?? "create_failed" }, 500);

    const { error: updErr } = await admin
      .from("chores_family_members")
      .update({ user_id: created.user.id })
      .eq("id", target.id);
    if (updErr) {
      await admin.auth.admin.deleteUser(created.user.id);
      return json({ error: updErr.message }, 500);
    }

    return json({ ok: true, user_id: created.user.id }, 200);
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
