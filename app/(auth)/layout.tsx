import { Sparkles } from "lucide-react";
import "./auth.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="auth-shell">
    <aside className="auth-story" aria-label="About NOVYA">
      <div className="auth-story-brand"><span className="auth-monogram">N</span> NOVYA <span className="auth-story-tag">BUSINESS OS</span></div>
      <div className="auth-story-content"><span className="auth-story-kicker"><span /> A little less busywork. A lot more business.</span><h2>Your business.<br />Working together.</h2><p>One place for your team, your customers,<br className="hidden xl:block" /> and everything that comes next.</p><div className="auth-orbit" aria-hidden="true"><div className="auth-orbit-ring ring-one" /><div className="auth-orbit-ring ring-two" /><div className="auth-orbit-core"><Sparkles size={38} strokeWidth={1.2} /></div><span className="orbit-chip chip-one"><i /> Your team</span><span className="orbit-chip chip-two"><i /> Your customers</span><span className="orbit-chip chip-three"><i /> Kora, your assistant</span></div></div>
      <div className="auth-story-footer"><span>Built around your business.</span><span>Powered by NOVYA</span></div>
    </aside>
    <section className="auth-form-pane"><div className="auth-pane-top"><span>BUSINESS OWNER</span><span className="auth-status"><i /> Secure access</span></div><div className="auth-form-center">{children}</div><footer className="auth-pane-footer">© {new Date().getFullYear()} NOVYA <span>Everything in one place.</span></footer></section>
  </main>;
}
