import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// very simple styles so it's readable
const boxStyle = {
  maxWidth: 420,
  margin: "40px auto",
  padding: 20,
  border: "1px solid #e5e5e5",
  borderRadius: 12,
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
};

export default function Home() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // check current session on load + subscribe to changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signInWithEmail(e) {
    e.preventDefault();
    setMessage("Sending magic link…");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined
      }
    });
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Check your email for the login link.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div style={boxStyle}>
      <h1>Three Eye Analytics</h1>
      <p>Earn cash by submitting short voice clips and geo‑tagged photos.</p>

      {!session ? (
        <>
          <h3>Sign in with your email</h3>
          <form onSubmit={signInWithEmail}>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 10, marginBottom: 8 }}
            />
            <button type="submit" style={{ width: "100%", padding: 10 }}>
              Send Magic Link
            </button>
          </form>
          {message && <p style={{ marginTop: 10 }}>{message}</p>}
          <p style={{ fontSize: 12, color: "#666", marginTop: 16 }}>
            You’ll get a one‑time sign‑in link. No password needed.
          </p>
        </>
      ) : (
        <>
          <p>Signed in as <strong>{session.user.email}</strong></p>
          <div style={{ display: "grid", gap: 8 }}>
            <a href="/consent" style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, textAlign: "center" }}>
              Go to Consent
            </a>
            <a href="/dashboard" style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, textAlign: "center" }}>
              Go to Dashboard
            </a>
            <button onClick={signOut} style={{ padding: 10 }}>
              Sign Out
            </button>
          </div>
        </>
      )}

      <hr style={{ margin: "24px 0" }} />
      <a href="/privacy" style={{ fontSize: 12 }}>Privacy Policy</a>
    </div>
  );
}
