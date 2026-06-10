"use client"
import { useStore } from "@/store/useStore"
import clsx from "clsx"

const navItems = [
  { id: "dashboard", icon: "⬡", label: "Dashboard", group: "Workspace" },
  { id: "upload", icon: "↑", label: "Upload & Process", group: "Workspace" },
  { id: "tasks", icon: "✓", label: "Tasks", group: "Workspace", badgeKey: "taskCount" },
  { id: "risks", icon: "⚠", label: "Risk Radar", group: "Workspace", badgeKey: "riskCount" },
  { id: "ask", icon: "✦", label: "Ask AI", group: "Intelligence" },
  { id: "knowledge", icon: "◈", label: "Knowledge Base", group: "Intelligence" },
  { id: "team", icon: "◉", label: "Team Twin", group: "Intelligence" },
  { id: "reports", icon: "▤", label: "Manager Report", group: "Reports" },
]

const groups = ["Workspace", "Intelligence", "Reports"]

export function Sidebar() {
  const { activeSection, setActiveSection, riskCount, taskCount } = useStore()

  const getBadge = (key?: string) => {
    if (key === "riskCount") return riskCount
    if (key === "taskCount") return taskCount
    return 0
  }

  return (
    <aside className="w-48 border-r border-[var(--border-muted)] flex flex-col gap-1 px-3 py-4 overflow-y-auto flex-shrink-0">
      {groups.map((group) => (
        <div key={group}>
          <div className="mono text-[9px] text-[var(--text-dim)] uppercase tracking-widest px-2 pt-3 pb-1">
            {group}
          </div>
          {navItems
            .filter((n) => n.group === group)
            .map((item) => {
              const badge = getBadge(item.badgeKey)
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={clsx(
                    "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] transition-all border",
                    activeSection === item.id
                      ? "bg-[var(--green-glow)] text-[var(--green)] border-[var(--border)]"
                      : "text-[var(--text-muted)] border-transparent hover:bg-[var(--green-faint)] hover:text-[var(--text)]"
                  )}
                >
                  <span className="w-4 text-center text-[13px]">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {badge > 0 && (
                    <span className="text-[9px] bg-[var(--green)] text-black rounded-full px-1.5 py-0.5 font-bold">
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
        </div>
      ))}
    </aside>
  )
}
