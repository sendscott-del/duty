import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { member_id, pin } = await req.json();
    if (!member_id || !pin || typeof member_id !== "string" || typeof pin !== "string") {
      return json({ error: "missing_fields" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: member, error: memErr } = await admin
      .from("chores_family_members")
      .select("id, pin, user_id, role, pin_attempts, pin_locked_until, is_active")
      .eq("id", member_id)
      .single();

    if (memErr || !member) return json({ error: "not_found" }, 404);
    if (member.role !== "child") return json({ error: "not_a_child" }, 403);
    if (!member.is_active) return json({ error: "inactive" }, 403);

    if (member.pin_locked_until && new Date(member.pin_locked_until).getTime() > Date.now()) {
      return json({ error: "locked", retry_at: member.pin_locked_until }, 429);
    }

    // Constant-time-ish compare (best effort in JS for fixed-length PINs)
    const expected = member.pin ?? "";
    const provided = String(pin);
    let ok = expected.length > 0 && expected.length === provided.length;
    for (let i = 0; i < Math.max(expected.length, provided.length); i++) {
      if ((expected.charCodeAt(i) || 0) !== (provided.charCodeAt(i) || 0)) ok = false;
    }

    if (!ok) {
      const attempts = (member.pin_attempts ?? 0) + 1;
      const locked = attempts >= MAX_ATTEMPTS;
      await admin
        .from("chores_family_members")
        .update({
          pin_attempts: attempts,
          pin_locked_until: locked ? new Date(Date.now() + LOCKOUT_MS).toISOString() : null,
        })
        .eq("id", member_id);
      return json({ error: "wrong_pin", locked, attempts_left: Math.max(0, MAX_ATTEMPTS - attempts) }, 401);
    }

    if (!member.user_id) return json({ error: "not_provisioned" }, 409);

    const { data: userInfo, error: userErr } = await admin.auth.admin.getUserById(member.user_id);
    if (userErr || !userInfo?.user?.email) return json({ error: "auth_user_missing" }, 500);

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: userInfo.user.email,
    });
    if (linkErr || !linkData?.properties?.hashed_token) return json({ error: "link_failed" }, 500);

    await admin
      .from("chores_family_members")
      .update({ pin_attempts: 0, pin_locked_until: null })
      .eq("id", member_id);

    return json({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    }, 200);
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
