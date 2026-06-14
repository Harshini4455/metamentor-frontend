"use client"
import { useEffect, useState } from "react"
import { getRisks, resolveRisk, rebalanceWorkload, getTasks } from "@/lib/api"
import { useStore } from "@/store/useStore"
import { Badge, Btn, SeverityDot } from "@/components/shared/ui"
import type { Risk, Task } from "@/types"
import clsx from "clsx"

export function RiskRadar() {
  const { wsEvents, setRiskCount } = useStore()
  const [risks, setRisks] = useState<Risk[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [rebalancing, setRebalancing] = useState<string | null>(null)
  const [resolved, setResolved] = useState<Set<string>>(new Set())

  const load = async () => {
    try {
      const [r, t] = await Promise.all([getRisks(), getTasks()])
      setRisks(r)
      setTasks(t)
      setRiskCount(r.length)
    } catch {}
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const last = wsEvents[wsEvents.length - 1]
    if (!last) return
    if (["risks_detected", "risk_resolved", "task_reassigned"].includes(last.type)) load()
  }, [wsEvents])

  const handleResolve = async (id: string) => {
    await resolveRisk(id)
    setResolved(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    setRisks(prev => prev.filter(r => r.id !== id))
    setRiskCount(risks.length - 1)
  }

  const handleRebalance = async (risk: Risk) => {
    // Find overloaded member's task to reassign
    const overloadedTask = tasks.find(t => t.owner.includes(risk.related_member?.split(" ")[0] ?? ""))
    if (!overloadedTask) return
    // Find available member
    const toMember = risk.suggested_action.includes("Priya") ? "Priya Sharma" : "Sam Johnson"

    setRebalancing(risk.id)
    try {
      await rebalanceWorkload({
        from_member: risk.related_member,
        to_member: toMember,
        task_id: overloadedTask.id,
      })
      await handleResolve(risk.id)
    } catch {}
    setRebalancing(null)
  }

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  const sorted = [...risks].sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4))

  const severityIcon = { critical: "🔴", high: "🔴", medium: "🟡", low: "🟢" }

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h1 className="text-[20px] font-semibold">Risk Radar</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">AI-detected blockers, delays, and workload conflicts</p>
      </div>

      {sorted.length === 0 && (
        <div className="bg-[var(--green-faint)] border border-[var(--border)] rounded-xl p-8 text-center">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-[14px] text-[var(--green)] font-medium">All clear — no active risks</div>
          <div className="text-[12px] text-[var(--text-muted)] mt-1">Risk Agent is continuously monitoring your team</div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {sorted.map(risk => (
          <div
            key={risk.id}
            className={clsx(
              "bg-[var(--card)] border rounded-xl p-4",
              risk.severity === "critical" ? "border-[rgba(255,79,79,0.3)]" :
              risk.severity === "high" ? "border-[rgba(255,79,79,0.2)]" :
              "border-[var(--border-muted)]"
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{severityIcon[risk.severity] ?? "⚪"}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-semibold text-[var(--text)]">{risk.title}</span>
                  <Badge variant={risk.severity as any}>
                    {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)}
                  </Badge>
                </div>
                <p className="text-[12px] text-[var(--text-muted)] leading-relaxed mb-2">{risk.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {risk.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] bg-[var(--card2)] text-[var(--text-dim)] px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Suggested action */}
                {risk.suggested_action && (
                  <div className="bg-[var(--green-faint)] border border-[var(--border)] rounded-lg p-2.5 mb-3">
                    <div className="text-[10px] mono text-[var(--green)] uppercase tracking-wider mb-1">AI Suggestion</div>
                    <div className="text-[12px] text-[var(--text)]">{risk.suggested_action}</div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {risk.related_member && risk.severity !== "low" && (
                    <Btn
                      onClick={() => handleRebalance(risk)}
                      disabled={rebalancing === risk.id}
                      variant="primary"
                    >
                      {rebalancing === risk.id ? "Rebalancing..." : "⚡ Accept AI Rebalance"}
                    </Btn>
                  )}
                  <Btn onClick={() => handleResolve(risk.id)} variant="outline">
                    Mark Resolved
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
