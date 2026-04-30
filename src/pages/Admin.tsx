import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import {
  LogOut,
  Phone,
  MessageSquare,
  Droplets,
  Zap,
  Trash2,
  Activity,
  ShieldCheck,
  RefreshCw,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type IvrCall = {
  id: string;
  phone_number: string;
  status: string;
  twilio_call_sid: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  water_rating: number | null;
  energy_rating: number | null;
  waste_rating: number | null;
};

type SmsReport = {
  id: string;
  message: string;
  status: string;
  twilio_message_sid: string | null;
  error_message: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  completed: "hsl(var(--leaf))",
  queued: "hsl(var(--water))",
  pending: "hsl(var(--sun))",
  failed: "hsl(var(--destructive))",
  "no-answer": "hsl(var(--muted-foreground))",
  busy: "hsl(var(--earth))",
};

function maskPhone(p: string) {
  if (!p || p.length < 6) return p;
  return p.slice(0, 3) + "•••" + p.slice(-3);
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Admin() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [calls, setCalls] = useState<IvrCall[]>([]);
  const [sms, setSms] = useState<SmsReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<"7" | "14" | "30" | "all">("14");
  const [showWater, setShowWater] = useState(true);
  const [showEnergy, setShowEnergy] = useState(true);
  const [showWaste, setShowWaste] = useState(true);
  const [claiming, setClaiming] = useState(false);

  // Auth + role gate
  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        navigate("/auth", { replace: true });
      }
    });
    return () => sub.data.subscription.unsubscribe();
  }, [navigate]);

  const checkAccess = useCallback(async () => {
    setChecking(true);
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) {
      navigate("/auth", { replace: true });
      return;
    }
    setUserEmail(s.session.user.email ?? null);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", s.session.user.id);
    const admin = !!roles?.some((r) => r.role === "admin");
    setIsAdmin(admin);
    setChecking(false);
  }, [navigate]);

  useEffect(() => {
    document.title = "Admin Dashboard · EcoTrack Community";
    checkAccess();
  }, [checkAccess]);

  const loadData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    const [{ data: c, error: cErr }, { data: m, error: mErr }] = await Promise.all([
      supabase.from("ivr_calls").select("*").order("created_at", { ascending: false }).limit(1000),
      supabase.from("sms_reports").select("*").order("created_at", { ascending: false }).limit(1000),
    ]);
    if (cErr) toast.error("Failed to load calls: " + cErr.message);
    if (mErr) toast.error("Failed to load SMS: " + mErr.message);
    setCalls((c ?? []) as IvrCall[]);
    setSms((m ?? []) as SmsReport[]);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin, loadData]);

  // Realtime
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("admin-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "ivr_calls" }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "sms_reports" }, loadData)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, loadData]);

  const claimAdmin = async () => {
    setClaiming(true);
    const { data, error } = await supabase.functions.invoke("claim-admin", { body: {} });
    setClaiming(false);
    if (error || (data && data.success === false)) {
      toast.error((data?.error as string) || error?.message || "Could not claim admin");
      return;
    }
    toast.success("You are now the admin.");
    checkAccess();
  };

  const filteredCalls = useMemo(() => {
    if (range === "all") return calls;
    const days = parseInt(range, 10);
    const cutoff = subDays(new Date(), days).getTime();
    return calls.filter((c) => new Date(c.created_at).getTime() >= cutoff);
  }, [calls, range]);

  const filteredSms = useMemo(() => {
    if (range === "all") return sms;
    const days = parseInt(range, 10);
    const cutoff = subDays(new Date(), days).getTime();
    return sms.filter((s) => new Date(s.created_at).getTime() >= cutoff);
  }, [sms, range]);

  // Aggregations
  const stats = useMemo(() => {
    const completed = filteredCalls.filter((c) => c.status === "completed").length;
    const totalDuration = filteredCalls.reduce((acc, c) => acc + (c.duration_seconds ?? 0), 0);
    const ratings = (key: keyof IvrCall) => {
      const arr = filteredCalls.map((c) => c[key] as number | null).filter((v): v is number => !!v);
      return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    };
    return {
      totalCalls: filteredCalls.length,
      completed,
      totalSms: filteredSms.length,
      avgDuration: filteredCalls.length ? Math.round(totalDuration / filteredCalls.length) : 0,
      avgWater: ratings("water_rating"),
      avgEnergy: ratings("energy_rating"),
      avgWaste: ratings("waste_rating"),
    };
  }, [filteredCalls, filteredSms]);

  const trendData = useMemo(() => {
    const days = range === "all" ? 30 : parseInt(range, 10);
    const buckets = new Map<string, { date: string; calls: number; sms: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = format(startOfDay(subDays(new Date(), i)), "MMM dd");
      buckets.set(d, { date: d, calls: 0, sms: 0 });
    }
    filteredCalls.forEach((c) => {
      const d = format(startOfDay(new Date(c.created_at)), "MMM dd");
      const b = buckets.get(d);
      if (b) b.calls++;
    });
    filteredSms.forEach((s) => {
      const d = format(startOfDay(new Date(s.created_at)), "MMM dd");
      const b = buckets.get(d);
      if (b) b.sms++;
    });
    return Array.from(buckets.values());
  }, [filteredCalls, filteredSms, range]);

  const distribution = useMemo(() => {
    const make = (key: keyof IvrCall) => {
      const counts = [1, 2, 3, 4, 5].map((n) => ({
        rating: String(n),
        count: filteredCalls.filter((c) => c[key] === n).length,
      }));
      return counts;
    };
    const water = make("water_rating");
    const energy = make("energy_rating");
    const waste = make("waste_rating");
    return [1, 2, 3, 4, 5].map((n, i) => ({
      rating: String(n),
      water: water[i].count,
      energy: energy[i].count,
      waste: waste[i].count,
    }));
  }, [filteredCalls]);

  const statusBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredCalls.forEach((c) => map.set(c.status, (map.get(c.status) ?? 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredCalls]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background to-muted">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="font-display">Admin access required</CardTitle>
            <CardDescription>
              Signed in as <span className="font-medium">{userEmail}</span>. This account does not have
              the admin role.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you are the first user setting up the workspace, you can claim the admin role now. This
              only works while no admin exists.
            </p>
            <div className="flex gap-2">
              <Button onClick={claimAdmin} disabled={claiming} className="flex-1">
                {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Claim admin role
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground underline">
              ← Back to site
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/40">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between gap-3 py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-leaf/10 text-leaf flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl leading-none">EcoTrack Admin</h1>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={range} onValueChange={(v) => setRange(v as typeof range)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={loadData} disabled={loading} aria-label="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stat cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Phone className="h-4 w-4" />} label="Total calls" value={stats.totalCalls} sub={`${stats.completed} completed`} />
          <StatCard icon={<MessageSquare className="h-4 w-4" />} label="SMS reports" value={stats.totalSms} />
          <StatCard icon={<Activity className="h-4 w-4" />} label="Avg call length" value={`${stats.avgDuration}s`} />
          <StatCard
            icon={<Droplets className="h-4 w-4" />}
            label="Avg ratings (W/E/W)"
            value={`${stats.avgWater.toFixed(1)} · ${stats.avgEnergy.toFixed(1)} · ${stats.avgWaste.toFixed(1)}`}
          />
        </section>

        <Tabs defaultValue="analytics">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
            <TabsTrigger value="sms">SMS reports</TabsTrigger>
          </TabsList>

          {/* ANALYTICS */}
          <TabsContent value="analytics" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Activity over time</CardTitle>
                <CardDescription>Daily IVR calls and SMS reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="calls" stroke="hsl(var(--leaf))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="sms" stroke="hsl(var(--water))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Rating distribution</CardTitle>
                  <CardDescription>How users rated each category (1 low → 5 high)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
                    <Toggle id="t-w" checked={showWater} onChange={setShowWater} icon={<Droplets className="h-3.5 w-3.5 text-water" />} label="Water" />
                    <Toggle id="t-e" checked={showEnergy} onChange={setShowEnergy} icon={<Zap className="h-3.5 w-3.5 text-sun" />} label="Energy" />
                    <Toggle id="t-r" checked={showWaste} onChange={setShowWaste} icon={<Trash2 className="h-3.5 w-3.5 text-earth" />} label="Waste" />
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={distribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="rating" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                          }}
                        />
                        <Legend />
                        {showWater && <Bar dataKey="water" fill="hsl(var(--water))" radius={[6, 6, 0, 0]} />}
                        {showEnergy && <Bar dataKey="energy" fill="hsl(var(--sun))" radius={[6, 6, 0, 0]} />}
                        {showWaste && <Bar dataKey="waste" fill="hsl(var(--earth))" radius={[6, 6, 0, 0]} />}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Call status breakdown</CardTitle>
                  <CardDescription>Twilio outcomes for triggered calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {statusBreakdown.length === 0 ? (
                      <EmptyState text="No calls yet in this range." />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                            {statusBreakdown.map((s, i) => (
                              <Cell key={i} fill={STATUS_COLORS[s.name] ?? "hsl(var(--primary))"} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: 8,
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CALLS */}
          <TabsContent value="calls" className="pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-display text-lg">IVR calls</CardTitle>
                  <CardDescription>Real Twilio calls with per-question keypad inputs</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadCsv(
                      `ivr-calls-${new Date().toISOString().slice(0, 10)}.csv`,
                      filteredCalls.map((c) => ({
                        time: c.created_at,
                        phone: c.phone_number,
                        status: c.status,
                        duration_seconds: c.duration_seconds ?? "",
                        water_rating: c.water_rating ?? "",
                        energy_rating: c.energy_rating ?? "",
                        waste_rating: c.waste_rating ?? "",
                        twilio_call_sid: c.twilio_call_sid ?? "",
                        error: c.error_message ?? "",
                      })),
                    )
                  }
                >
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent className="overflow-auto">
                {filteredCalls.length === 0 ? (
                  <EmptyState text="No calls in this range yet. Trigger one from the homepage." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Duration</TableHead>
                        <TableHead className="text-center">
                          <span className="inline-flex items-center gap-1"><Droplets className="h-3.5 w-3.5 text-water" /> Water</span>
                        </TableHead>
                        <TableHead className="text-center">
                          <span className="inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-sun" /> Energy</span>
                        </TableHead>
                        <TableHead className="text-center">
                          <span className="inline-flex items-center gap-1"><Trash2 className="h-3.5 w-3.5 text-earth" /> Waste</span>
                        </TableHead>
                        <TableHead>Call SID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCalls.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {format(new Date(c.created_at), "MMM dd, HH:mm")}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{maskPhone(c.phone_number)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{
                                color: STATUS_COLORS[c.status] ?? undefined,
                                borderColor: STATUS_COLORS[c.status] ?? undefined,
                              }}
                            >
                              {c.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {c.duration_seconds != null ? `${c.duration_seconds}s` : "—"}
                          </TableCell>
                          <TableCell className="text-center">{c.water_rating ?? "—"}</TableCell>
                          <TableCell className="text-center">{c.energy_rating ?? "—"}</TableCell>
                          <TableCell className="text-center">{c.waste_rating ?? "—"}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground max-w-[160px] truncate">
                            {c.twilio_call_sid ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS */}
          <TabsContent value="sms" className="pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-display text-lg">Anonymous SMS reports</CardTitle>
                  <CardDescription>Forwarded to the community admin number</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadCsv(
                      `sms-reports-${new Date().toISOString().slice(0, 10)}.csv`,
                      filteredSms.map((s) => ({
                        time: s.created_at,
                        status: s.status,
                        message: s.message,
                        twilio_message_sid: s.twilio_message_sid ?? "",
                        error: s.error_message ?? "",
                      })),
                    )
                  }
                >
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent className="overflow-auto">
                {filteredSms.length === 0 ? (
                  <EmptyState text="No SMS reports in this range yet." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Message SID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSms.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {format(new Date(s.created_at), "MMM dd, HH:mm")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{
                                color: STATUS_COLORS[s.status] ?? undefined,
                                borderColor: STATUS_COLORS[s.status] ?? undefined,
                              }}
                            >
                              {s.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[480px]">
                            <p className="text-sm">{s.message}</p>
                            {s.error_message && (
                              <p className="text-xs text-destructive mt-1">{s.error_message}</p>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground max-w-[160px] truncate">
                            {s.twilio_message_sid ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
          {icon} {label}
        </div>
        <div className="mt-2 font-display text-2xl">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function Toggle({
  id,
  checked,
  onChange,
  icon,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (b: boolean) => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="inline-flex items-center gap-1 cursor-pointer">
        {icon} {label}
      </Label>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="h-full min-h-[180px] flex items-center justify-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
