"use client"
import { useEffect, useState } from "react"
import { getTeam } from "@/lib/api"
import { useStore } from "@/store/useStore"
import type { TeamMember } from "@/types"
import clsx from "clsx"

const AVATAR_COLORS = [
  { bg: "rgba(255,79,79,0.15)", text: "var(--red)" },
  { bg: "var(--green-glow)", text: "var(--green)" },
  { bg: "rgba(74,158,255,0.15)", text: "var(--blue)" },
  { bg: "rgba(245,166,35,0.15)", text: "var(--amber)" },
]

function WorkloadBar({ percent }: { percent: number }) {
  const color =
    percent >= 100 ? "bg-[var(--red)]" :
    percent >= 85 ? "bg-[var(--amber)]" :
    "bg-[var(--green)]"
  const label =
    percent >= 100 ? "Overloaded" :
    percent >= 85 ? "Near capacity" :
    "Available"
  const labelColor =
    percent >= 100 ? "text-[var(--red)]" :
    percent >= 85 ? "text-[var(--amber)]" :
    "text-[var(--green)]"

  return (
    <div>
      <div className="h-1.5 bg-[var(--card2)] rounded-full overflow-hidden mb-1 mt-2">
        <div
          className={clsx("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px]">
        <span className="text-[var(--text-dim)]">Workload: {percent}%</span>
        <span className={labelColor}>{label}</span>
      </div>
    </div>
  )
}

export function TeamTwin() {
  const { wsEvents } = useStore()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await getTeam()
      setMembers(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const last = wsEvents[wsEvents.length - 1]
    if (!last) return
    if (["task_reassigned", "tasks_created"].includes(last.type)) load()
  }, [wsEvents])

  const overloaded = members.filter(m => m.workload_percent >= 100)

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h1 className="text-[20px] font-semibold">Team Digital Twin</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
          AI model of your team — skills, workload & communication patterns
        </p>
      </div>

      {/* Overload alert */}
      {overloaded.length > 0 && (
        <div className="bg-[rgba(245,166,35,0.07)] border border-[rgba(245,166,35,0.25)] rounded-xl p-4 mb-5 flex items-start gap-3">
          <span className="text-xl">⚡</span>
          <div>
            <div className="text-[13px] font-semibold text-[var(--amber)] mb-1">
              AI Negotiation Agent — Overload Detected
            </div>
            <div className="text-[12px] text-[var(--text-muted)] leading-relaxed">
              {overloaded.map(m => m.name).join(", ")} {overloaded.length === 1 ? "is" : "are"} overloaded.
              Workload rebalancing is available from the Risk Radar section.
            </div>
          </div>
        </div>
      )}

      {/* Member grid */}
      {loading ? (
        <div className="text-[12px] text-[var(--text-dim)] py-6 text-center">Loading team data...</div>
      ) : members.length === 0 ? (
        <div className="text-[12px] text-[var(--text-dim)] py-6 text-center">
          No team members yet. Use the /api/v1/seed endpoint to add demo data.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {members.map((member, i) => {
            const colors = AVATAR_COLORS[i % AVATAR_COLORS.length]
            return (
              <div key={member.id} className="bg-[var(--card)] border border-[var(--border-muted)] rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[14px] flex-shrink-0"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {member.avatar_initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-[var(--text)]">{member.name}</div>
                    <div className="text-[10px] text-[var(--text-dim)]">{member.role}</div>
                  </div>
                </div>

                <WorkloadBar percent={member.workload_percent} />

                <div className="mt-3">
                  <div className="text-[10px] text-[var(--text-dim)] mb-1.5">
                    {member.active_task_count} active task{member.active_task_count !== 1 ? "s" : ""}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((skill, j) => (
                      <span
                        key={j}
                        className="text-[10px] bg-[rgba(74,158,255,0.1)] text-[var(--blue)] border border-[rgba(74,158,255,0.2)] px-1.5 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
