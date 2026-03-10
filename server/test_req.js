require("dotenv").config();
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");

async function test() {
  const payload = {
    aud: "authenticated",
    role: "authenticated",
    sub: "2cad6a54-d293-43ed-8ea7-a462462ecaa7",
    email: "tutor@test.com",
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };
  const token = jwt.sign(payload, process.env.SUPABASE_JWT_SECRET);
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  console.log("Fetching center...");
  const res = await sb
    .from("tutorial_centers")
    .select("id")
    .eq("tutor_id", "2cad6a54-d293-43ed-8ea7-a462462ecaa7")
    .single();
  console.log(JSON.stringify(res, null, 2));
}

test().catch(console.error);
