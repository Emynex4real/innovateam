const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl =
  process.env.SUPABASE_URL || "https://jdedscbvbkjvqm8n9i1.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  const { data: plans } = await supabase.from("subscription_plans").select("*");
  const { data: subs } = await supabase
    .from("tutor_subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const fs = require("fs");
  fs.writeFileSync("db_dump.json", JSON.stringify({ plans, subs }, null, 2));
  console.log("Done");
}

checkDb().catch(console.error);
