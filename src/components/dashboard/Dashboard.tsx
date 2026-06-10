"use client"
import { useEffect, useState } from "react"
import { getDashboardStats, getRisks, getTasks } from "@/lib/api"
import { useStore } from "@/store/useStore"
import { StatCard, Card, PanelTitle, Badge, PulseDot, SeverityDot } from "@/components/shared/ui"
import type { DashboardStats, Task, Risk } from "@/types"
import clsx from "clsx"

const AGENTS = [
  { key: "meeting", icon: "🎙️", label: "Meeting Agent", section: "upload" },
  { key: "task", icon: "✅", label: "Task Agent", section: "tasks" },
  { key: "knowledge", icon: "🧠", label: "Knowledge Agent", section: "knowledge" },
  { key: "risk", icon: "🚨", label: "Risk Agent", section: "risks" },
  { key: "manager", icon: "📊", label: "Manager Agent", section: "reports" },
]

export function Dashboard() {
  const { agentStatuses, setActiveSection, wsEvents } = useStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [risks, setRisks] = useState<Risk[]>([])

  const load = async () => {
    try {
      const [s, t, r] = await Promise.all([getDashboardStats(), getTasks(), getRisks()])
      setStats(s)
      setTasks(t.slice(0, 4))
      setRisks(r.slice(0, 3))
    } catch {}
  }

  useEffect(() => { load() }, [])

  // Reload on relevant WS events
  useEffect(() => {
    const last = wsEvents[wsEvents.length - 1]
    if (!last) return
    if (["tasks_created", "task_updated", "risks_detected", "pipeline_complete"].includes(last.type)) {
      load()
    }
  }, [wsEvents])

  const priorityColor: Record<string, string> = {
    critical: "border-l-[var(--red)]",
    high: "border-l-[var(--red)]",
    medium: "border-l-[var(--amber)]",
    low: "border-l-[var(--green)]",
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h1 className="text-[20px] font-semibold">Command Center</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">Live team intelligence — updated by AI agents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Open Tasks" value={stats?.open_tasks ?? "—"} delta="Auto-tracked" color="green" />
        <StatCard label="At Risk" value={stats?.at_risk ?? "—"} delta="Agent flagged" color="amber" />
        <StatCard label="Meetings Processed" value={stats?.meetings_processed ?? "—"} delta="This sprint" />
        <StatCard label="KB Entries" value={stats?.kb_entries ?? "—"} delta="Auto-generated" color="green" />
      </div>

      {/* Agent swarm */}
      <div className="mb-5">
        <div className="text-[12px] font-semibold text-[var(--text)] mb-2 flex items-center gap-2">
          <span className="text-[var(--green)]">⬡</span> Active Agent Swarm
        </div>
        <div className="grid grid-cols-5 gap-2">
          {AGENTS.map((agent) => {
            const status = agentStatuses[agent.key as keyof typeof agentStatuses]
            return (
              <button
                key={agent.key}
                onClick={() => setActiveSection(agent.section)}
                className={clsx(
                  "bg-[var(--card)] border rounded-lg p-3 text-center transition-all cursor-pointer",
                  status === "running"
                    ? "border-[var(--green)] bg-[var(--green-faint)]"
                    : "border-[var(--border-muted)] hover:border-[var(--green)] hover:bg-[var(--green-faint)]"
                )}
              >
                <div className="text-2xl mb-1.5">{agent.icon}</div>
                <div className="text-[11px] text-[var(--text)] font-medium leading-tight">{agent.label}</div>
                <div
                  className={clsx("text-[10px] mt-1", {
                    "text-[var(--green)]": status === "running" || status === "done",
                    "text-[var(--amber)]": status === "error",
                    "text-[var(--text-dim)]": status === "idle",
                  })}
                >
                  {status === "running" ? "● Running" : status === "done" ? "✓ Done" : status === "error" ? "⚠ Error" : "○ Standby"}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tasks + Risks */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <PanelTitle icon="📌">Top Tasks This Week</PanelTitle>
          <div className="flex flex-col gap-2">
            {tasks.length === 0 && (
              <div className="text-[12px] text-[var(--text-dim)] py-4 text-center">
                No tasks yet — upload a meeting to get started
              </div>
            )}
            {tasks.map((t) => (
              <div
                key={t.id}
                className={clsx(
                  "flex items-center gap-2 p-2.5 bg-[var(--card2)] rounded-lg border-l-2 text-[12px]",
                  priorityColor[t.priority] ?? "border-l-[var(--text-dim)]"
                )}
              >
                <span className="flex-1 text-[var(--text)]">{t.title}</span>
                <span className="bg-[var(--bg)] rounded px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
                  {t.owner.split(" ")[0]}
                </span>
                <span className="text-[10px] text-[var(--text-dim)] min-w-[45px] text-right">
                  {t.due_date ? new Date(t.due_date).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <PanelTitle icon="⚠">Risk Radar — Live</PanelTitle>
          <div className="flex flex-col gap-2">
            {risks.length === 0 && (
              <div className="text-[12px] text-[var(--text-dim)] py-4 text-center">
                No active risks detected
              </div>
            )}
            {risks.map((r) => (
              <div key={r.id} className="flex items-start gap-2 p-2.5 bg-[var(--card2)] rounded-lg">
                <SeverityDot severity={r.severity} />
                <div className="flex-1">
                  <div className="text-[12px] text-[var(--text)] font-medium">{r.title}</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-1">{r.description}</div>
                  <button
                    onClick={() => setActiveSection("risks")}
                    className="text-[11px] text-[var(--green)] mt-1 hover:underline"
                  >
                    → View analysis
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
