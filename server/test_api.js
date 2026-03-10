require("dotenv").config();
const jwt = require("jsonwebtoken");

const payload = {
  aud: "authenticated",
  role: "authenticated",
  sub: "2cad6a54-d293-43ed-8ea7-a462462ecaa7",
  email: "tutor@test.com",
  exp: Math.floor(Date.now() / 1000) + 60 * 60,
};
const token = jwt.sign(payload, process.env.SUPABASE_JWT_SECRET);

async function check() {
  try {
    const res = await fetch(
      "http://localhost:5000/api/subscriptions/my-subscription",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
check();
