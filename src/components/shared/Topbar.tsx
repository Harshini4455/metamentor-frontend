"use client"
import { useStore } from "@/store/useStore"

export function Topbar() {
  const { agentStatuses, riskCount } = useStore()
  const activeAgents = Object.values(agentStatuses).filter(s => s === "running").length

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-muted)] bg-[var(--bg)] sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-[var(--green)] rounded-md flex items-center justify-center">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <circle cx="8" cy="8" r="3" fill="#000" />
            <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="8" r="6" stroke="#000" strokeWidth="1" />
          </svg>
        </div>
        <div>
          <div className="mono text-[13px] font-bold text-[var(--green)] leading-none">MetaMentor AI</div>
          <div className="text-[10px] text-[var(--text-dim)] mt-0.5">Team Intelligence Workspace</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {riskCount > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--amber)] border border-[rgba(245,166,35,0.3)] rounded-full px-2.5 py-1">
            <span>⚠</span> {riskCount} risks
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[var(--green)] pulse-dot" />
          <span className="mono text-[11px] border border-[var(--border)] text-[var(--green)] rounded-full px-2.5 py-0.5">
            {activeAgents > 0 ? `${activeAgents} Agent${activeAgents > 1 ? "s" : ""} Running` : "5 Agents Ready"}
          </span>
        </div>
        <div className="w-7 h-7 rounded-full bg-[var(--green)] flex items-center justify-center text-[11px] font-bold text-black">
          JD
        </div>
      </div>
    </header>
  )
}
