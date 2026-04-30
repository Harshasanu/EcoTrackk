import {
  Phone, Mic, MessageSquareText, WifiOff, Users, Sparkles,
  Droplets, Zap, Trash2, ArrowRight, Leaf, AlertTriangle, EyeOff,
  Smartphone, Radio, Heart, MapPin, Building2, Globe2, CheckCircle2,
  TrendingUp, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/Counter";
import { IvrCallForm } from "@/components/IvrCallForm";
import { SmsForm } from "@/components/SmsForm";
import heroImg from "@/assets/hero-community.jpg";

const NavBar = () => (
  <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
    <div className="container flex h-16 items-center justify-between">
      <a href="#top" className="flex items-center gap-2 font-display text-xl font-semibold text-primary">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf text-primary-foreground">
          <Leaf className="h-4 w-4" />
        </span>
        EcoTrack
      </a>
      <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
        <a href="#problem" className="hover:text-foreground transition-colors">Problem</a>
        <a href="#solution" className="hover:text-foreground transition-colors">Solution</a>
        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
        <a href="#dashboard" className="hover:text-foreground transition-colors">Impact</a>
        <a href="#try-it" className="hover:text-foreground transition-colors">Try IVR</a>
        <a href="/admin" className="hover:text-foreground transition-colors">Admin</a>
      </nav>
      <Button asChild variant="hero" size="pill"><a href="#try-it">Try the call</a></Button>
    </div>
  </header>
);

const Hero = () => (
  <section id="top" className="relative overflow-hidden bg-hero">
    <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-leaf/20 blur-3xl" aria-hidden />
    <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-water/15 blur-3xl" aria-hidden />
    <div className="container relative grid lg:grid-cols-12 gap-12 items-center py-20 lg:py-28">
      <div className="lg:col-span-6 space-y-7 animate-fade-up">
        <span className="inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-card/70 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-leaf animate-pulse-ring" />
            <span className="relative h-2 w-2 rounded-full bg-leaf" />
          </span>
          Live IVR — no app needed
        </span>
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] text-balance text-primary">
          Making invisible<br />resource waste<br /><em className="not-italic text-leaf">visible.</em>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl text-balance">
          EcoTrack Community is a voice-first, offline-friendly accountability tool that helps informal settlements and rural villages track water, energy, and waste — without smartphones, sensors, or data plans.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="hero" size="lg"><a href="#solution">Explore solution <ArrowRight className="h-4 w-4" /></a></Button>
          <Button asChild variant="outlineHero" size="lg"><a href="#dashboard">View impact</a></Button>
        </div>
        <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-leaf" /> Works on any phone</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-leaf" /> Offline-first</div>
        </div>
      </div>
      <div className="lg:col-span-6 relative">
        <div className="absolute inset-0 bg-leaf/15 blur-3xl rounded-full" aria-hidden />
        <div className="relative rounded-[2rem] overflow-hidden shadow-elev border border-border/50 bg-card">
          <img src={heroImg} alt="Rural community members tracking water, energy, and waste using a basic feature phone" width={1920} height={1080} className="w-full h-auto" />
        </div>
        <div className="absolute -bottom-6 -left-4 hidden md:flex items-center gap-3 rounded-2xl bg-card border border-border px-4 py-3 shadow-elev animate-float-slow">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-water-grad text-primary-foreground"><Droplets className="h-5 w-5" /></div>
          <div>
            <div className="text-xs text-muted-foreground">Today</div>
            <div className="font-semibold text-foreground"><Counter end={1240} /> L saved</div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 hidden md:flex items-center gap-3 rounded-2xl bg-card border border-border px-4 py-3 shadow-elev animate-float-slow" style={{ animationDelay: "1.5s" }}>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-leaf text-primary-foreground"><Phone className="h-5 w-5" /></div>
          <div>
            <div className="text-xs text-muted-foreground">IVR reports</div>
            <div className="font-semibold text-foreground"><Counter end={3812} /></div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Problem = () => {
  const items = [
    { icon: EyeOff, title: "Invisible flows", body: "Water, power and waste move through settlements with zero visibility — leaks, theft and overuse go untracked." },
    { icon: AlertTriangle, title: "Unaffordable monitoring", body: "Smart meters and IoT sensors cost more than a household earns in a year. They're not coming." },
    { icon: Smartphone, title: "Tech that excludes", body: "App-only solutions ignore feature phones, low literacy, and patchy connectivity — leaving billions out." },
  ];
  return (
    <section id="problem" className="container py-20 lg:py-28">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-leaf">The problem</span>
        <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-primary">A blind spot the size of a continent.</h2>
        <p className="mt-4 text-muted-foreground text-lg">Over 1 billion people live in informal or rural settings where shared resources are wasted because nobody can measure what's happening.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {items.map((it) => (
          <div key={it.title} className="group rounded-2xl border border-border bg-card p-7 shadow-soft hover:shadow-elev transition-shadow">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-earth mb-5">
              <it.icon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-semibold text-primary mb-2">{it.title}</h3>
            <p className="text-muted-foreground">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const Solution = () => (
  <section id="solution" className="bg-secondary/40 border-y border-border">
    <div className="container py-20 lg:py-28 grid lg:grid-cols-2 gap-14 items-center">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-leaf">The solution</span>
        <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-primary text-balance">A phone call. A score. A movement.</h2>
        <p className="mt-4 text-muted-foreground text-lg">EcoTrack turns any phone into an environmental sensor. No installs, no logins, no data — just a call, a press of a button, and instant community feedback.</p>
        <ol className="mt-8 space-y-5">
          {[
            ["Report via IVR or assisted input", "Place a missed call. Our system calls you back with simple voice prompts."],
            ["Receive your eco score and tips", "Get an instant impact score by SMS or voice — in your local language."],
            ["Community tracks collective impact", "Every report rolls up into a public dashboard the whole village can see."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-leaf text-primary-foreground font-semibold">{i + 1}</div>
              <div>
                <h4 className="font-semibold text-foreground">{t}</h4>
                <p className="text-muted-foreground text-sm mt-1">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="relative">
        <div className="rounded-[2rem] bg-card border border-border p-8 shadow-elev">
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-leaf text-primary-foreground">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Live call flow</div>
              <div className="font-semibold">+1 (415) 555 ECO</div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { who: "IVR", text: "Welcome to EcoTrack. Press 1 to report water use." },
              { who: "User", text: "🔘 Pressed 2 — energy" },
              { who: "IVR", text: "Press 1–5 to rate today's energy usage." },
              { who: "User", text: "🔘 Pressed 3" },
              { who: "IVR", text: "Thanks! Your eco score today: 78. Tip: switch to LED at night." },
            ].map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.who === "IVR" ? "bg-secondary text-secondary-foreground" : "ml-auto bg-leaf text-primary-foreground"}`}>
                <span className="block text-[10px] uppercase tracking-wider opacity-70 mb-0.5">{m.who}</span>
                {m.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => {
  const f = [
    { icon: Phone, title: "IVR-based reporting", body: "Toll-friendly voice menus. Works on $10 feature phones." },
    { icon: Mic, title: "Voice-assisted input", body: "Natural prompts in local languages, no typing required." },
    { icon: MessageSquareText, title: "WhatsApp / SMS bot", body: "Confirmations and tips delivered the way people already chat." },
    { icon: WifiOff, title: "Offline-first", body: "Reports cache locally and sync the moment a signal returns." },
    { icon: Users, title: "Community dashboard", body: "Village leaders see live, anonymized resource flows." },
    { icon: Sparkles, title: "Localized nudges", body: "Behavior tips tailored to season, neighborhood, and culture." },
  ];
  return (
    <section id="features" className="container py-20 lg:py-28">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-leaf">Core features</span>
        <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-primary">Built for the next billion users.</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {f.map((it) => (
          <div key={it.title} className="rounded-2xl border border-border bg-card p-6 hover:-translate-y-1 transition-transform duration-300 shadow-soft hover:shadow-elev">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-leaf/10 text-leaf mb-4">
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-semibold text-primary">{it.title}</h3>
            <p className="text-muted-foreground text-sm mt-2">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { icon: Phone, title: "Report by call", desc: "Missed call or assisted IVR" },
    { icon: WifiOff, title: "Cached offline", desc: "Stored on the gateway" },
    { icon: Sparkles, title: "Eco score", desc: "Computed instantly" },
    { icon: MessageSquareText, title: "Voice / SMS reply", desc: "Tips in local language" },
    { icon: Users, title: "Dashboard updates", desc: "Community sees impact" },
  ];
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container py-20 lg:py-28">
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-leaf">How it works</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-balance">From a single press to collective change.</h2>
        </div>
        <div className="relative grid md:grid-cols-5 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-leaf text-primary-foreground mb-4">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="text-xs uppercase tracking-widest opacity-60">Step {i + 1}</div>
                <h3 className="font-display text-lg font-semibold mt-1">{s.title}</h3>
                <p className="text-sm opacity-80 mt-1">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 h-6 w-6 text-leaf" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Dashboard = () => (
  <section id="dashboard" className="container py-20 lg:py-28">
    <div className="max-w-2xl mb-12">
      <span className="text-xs font-semibold uppercase tracking-widest text-leaf">Impact dashboard</span>
      <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-primary">A village's eco vitals — live.</h2>
    </div>
    <div className="rounded-3xl border border-border bg-card shadow-elev p-6 md:p-10">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Sparkles, label: "Daily eco score", value: 78, suffix: "/100", grad: "bg-leaf", trend: "+6" },
          { icon: Droplets, label: "Water saved", value: 12480, suffix: " L", grad: "bg-water-grad", trend: "+18%" },
          { icon: Zap, label: "Energy reduced", value: 342, suffix: " kWh", grad: "bg-earth-grad", trend: "+9%" },
          { icon: Trash2, label: "Waste diverted", value: 1820, suffix: " kg", grad: "bg-leaf", trend: "+22%" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${s.grad} text-primary-foreground`}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-leaf">
                <TrendingUp className="h-3 w-3" />{s.trend}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="font-display text-3xl font-semibold text-primary mt-1">
              <Counter end={s.value} suffix={s.suffix} />
            </div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground">Last 7 days · resource trend</h4>
            <span className="text-xs text-muted-foreground">L · kWh · kg</span>
          </div>
          <div className="flex items-end gap-3 h-44">
            {[42, 58, 51, 68, 74, 70, 86].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-leaf/80 hover:bg-leaf transition-colors" style={{ height: `${h}%` }} />
                <span className="text-[10px] text-muted-foreground">{["M","T","W","T","F","S","S"][i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-6">
          <h4 className="font-semibold text-foreground mb-3">Community participation</h4>
          <div className="font-display text-5xl font-semibold text-primary"><Counter end={84} suffix="%" /></div>
          <p className="text-sm text-muted-foreground mt-1">of households reported this week</p>
          <div className="mt-5 h-3 w-full rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-leaf" style={{ width: "84%" }} />
          </div>
          <div className="mt-6 space-y-2">
            {["Block A · 92%", "Block B · 88%", "Block C · 71%"].map((t) => (
              <div key={t} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.split(" · ")[0]}</span>
                <span className="font-semibold text-foreground">{t.split(" · ")[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TryIt = () => (
  <section id="try-it" className="bg-secondary/40 border-y border-border">
    <div className="container py-20 lg:py-28 grid lg:grid-cols-2 gap-10 items-start">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-leaf">Try it now — really</span>
        <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-primary text-balance">Real IVR. Real SMS. No simulation.</h2>
        <p className="mt-4 text-muted-foreground text-lg">Drop your number — our backend triggers a real Twilio call to walk you through the EcoTrack survey. Or send an anonymous SMS report straight to the community admin line.</p>
        <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-leaf mt-0.5" /> Use international format e.g. <code className="px-1.5 py-0.5 bg-card rounded border">+14155552671</code></li>
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-leaf mt-0.5" /> Anonymous SMS is rate-limited to prevent abuse.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-leaf mt-0.5" /> Powered by Twilio Voice + Messaging.</li>
        </ul>
      </div>
      <div className="space-y-5">
        <IvrCallForm />
        <SmsForm />
      </div>
    </div>
  </section>
);

const Benefits = () => {
  const b = [
    "No smartphone required",
    "No IoT dependency",
    "Works fully offline",
    "Accessible for low-literacy users",
    "Community-driven accountability",
    "Scalable & affordable",
  ];
  return (
    <section className="container py-20 lg:py-28">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-leaf">Key benefits</span>
        <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-primary">Designed for inclusion, built for scale.</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {b.map((t) => (
          <div key={t} className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
            <CheckCircle2 className="h-5 w-5 text-leaf shrink-0" />
            <span className="font-medium text-foreground">{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const Users_ = () => {
  const u = [
    { icon: MapPin, title: "Rural communities", body: "Villages with shared wells, generators, and waste pits." },
    { icon: Building2, title: "Informal settlements", body: "Urban peripheries lacking formal utility tracking." },
    { icon: Heart, title: "Low-literacy populations", body: "Voice-first design that respects every user." },
    { icon: Globe2, title: "NGOs & local orgs", body: "Field tools, dashboards, and reporting for impact." },
  ];
  return (
    <section className="bg-secondary/40 border-y border-border">
      <div className="container py-20 lg:py-28">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-leaf">Target users</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-primary">Built with — and for — the people closest to the problem.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {u.map((it) => (
            <div key={it.title} className="rounded-2xl bg-card border border-border p-6 shadow-soft">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-earth-grad text-primary-foreground mb-4">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary">{it.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Metrics = () => {
  const m = [
    { label: "Offline reliability", value: 96 },
    { label: "Ease of use", value: 92 },
    { label: "Behavior change effectiveness", value: 78 },
    { label: "Community engagement", value: 88 },
    { label: "Resource savings", value: 81 },
  ];
  return (
    <section className="container py-20 lg:py-28">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-leaf">Evaluation metrics</span>
        <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-primary">Measured against what really matters.</h2>
      </div>
      <div className="grid lg:grid-cols-2 gap-x-12 gap-y-6">
        {m.map((it) => (
          <div key={it.label}>
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-medium text-foreground">{it.label}</span>
              <span className="font-display text-2xl font-semibold text-primary"><Counter end={it.value} suffix="%" /></span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-leaf transition-all duration-1000" style={{ width: `${it.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Innovation = () => {
  const i = [
    { icon: Radio, t: "Missed-call native", d: "We meet people on the most familiar channel in emerging markets." },
    { icon: Users, t: "Non-digital inclusion", d: "Zero apps, zero data plans — true accessibility." },
    { icon: Leaf, t: "Sensorless ecology", d: "Behavioral telemetry that doesn't need IoT infrastructure." },
    { icon: Sparkles, t: "Collective visibility", d: "Shared dashboards turn data into community pride." },
  ];
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container py-20 lg:py-28">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-leaf">Innovation</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-balance">Why this hasn't been built before.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {i.map((it) => (
            <div key={it.t} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-leaf text-primary-foreground mb-4">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{it.t}</h3>
              <p className="text-sm opacity-80 mt-1">{it.d}</p>
            </div>
          ))}
        </div>
        <figure className="mt-16 max-w-3xl">
          <blockquote className="font-display text-2xl md:text-3xl leading-snug text-balance">
            "Before EcoTrack, our village argued about water. Now we have numbers. The arguments became plans."
          </blockquote>
          <figcaption className="mt-4 text-sm opacity-70">— Amina K., community health worker</figcaption>
        </figure>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="container py-20 lg:py-28">
    <div className="relative overflow-hidden rounded-[2.5rem] bg-leaf text-primary-foreground p-10 md:p-16 shadow-elev">
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" aria-hidden />
      <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-water/30 blur-3xl" aria-hidden />
      <div className="relative max-w-3xl">
        <h2 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] text-balance">Join the movement. Scale sustainable communities.</h2>
        <p className="mt-5 text-lg opacity-90 max-w-2xl">Partner with us to deploy EcoTrack in your region — or fund the next 100 villages onto the grid of accountability.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"><a href="#try-it">Try the call</a></Button>
          <Button asChild variant="outlineHero" size="lg" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"><a href="mailto:hello@ecotrack.community">Partner with us</a></Button>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container py-14 grid md:grid-cols-4 gap-10">
      <div className="md:col-span-2">
        <div className="flex items-center gap-2 font-display text-xl font-semibold text-primary">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf text-primary-foreground"><Leaf className="h-4 w-4" /></span>
          EcoTrack Community
        </div>
        <p className="mt-4 text-muted-foreground max-w-md">Empowering underserved communities to monitor, understand, and reduce shared resource waste — without expensive infrastructure or digital literacy.</p>
      </div>
      <div>
        <h4 className="font-semibold text-foreground mb-3">Project</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="#solution" className="hover:text-foreground">Solution</a></li>
          <li><a href="#features" className="hover:text-foreground">Features</a></li>
          <li><a href="#dashboard" className="hover:text-foreground">Impact</a></li>
          <li className="pt-1">
            <a
              href="/auth"
              className="inline-flex items-center gap-1.5 rounded-full border border-leaf/40 bg-leaf/10 px-3 py-1.5 text-xs font-semibold text-leaf hover:bg-leaf hover:text-primary-foreground transition-colors"
            >
              <Leaf className="h-3 w-3" /> Admin Login
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-foreground mb-3">Contact</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="mailto:hello@ecotrack.community" className="hover:text-foreground">hello@ecotrack.community</a></li>
          <li>Twitter · LinkedIn · GitHub</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border">
      <div className="container py-5 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
        <span>© {new Date().getFullYear()} EcoTrack Community · Built with care for the next billion.</span>
        <span>Sustainability is a community sport.</span>
      </div>
    </div>
  </footer>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <HowItWorks />
        <Dashboard />
        <TryIt />
        <Benefits />
        <Users_ />
        <Metrics />
        <Innovation />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
