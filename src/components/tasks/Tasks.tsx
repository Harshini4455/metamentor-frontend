"use client"
import { useEffect, useState } from "react"
import { getTasks, updateTask, deleteTask } from "@/lib/api"
import { useStore } from "@/store/useStore"
import { Badge, Btn, PulseDot } from "@/components/shared/ui"
import type { Task } from "@/types"
import clsx from "clsx"

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }
const STATUS_OPTS = ["open", "in_progress", "blocked", "done"]

export function Tasks() {
  const { wsEvents, setTaskCount } = useStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const load = async () => {
    try {
      const data = await getTasks()
      const sorted = data.sort((a: Task, b: Task) =>
        (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4)
      )
      setTasks(sorted)
      setTaskCount(sorted.filter((t: Task) => t.status === "open").length)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const last = wsEvents[wsEvents.length - 1]
    if (!last) return
    if (["tasks_created", "task_updated", "task_created", "task_reassigned"].includes(last.type)) load()
  }, [wsEvents])

  const handleStatus = async (id: string, status: string) => {
    await updateTask(id, { status })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: status as Task["status"] } : t))
  }

  const handleDelete = async (id: string) => {
    await deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const priorityBorder = { critical: "border-l-[var(--red)]", high: "border-l-[var(--red)]", medium: "border-l-[var(--amber)]", low: "border-l-[var(--green)]" }
  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter || t.priority === filter)

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-semibold">Task Manager</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">AI-assigned tasks from meetings & docs</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-[var(--card2)] border border-[var(--border-muted)] text-[var(--text-muted)] text-[12px] rounded-md px-2.5 py-1.5 outline-none"
          >
            <option value="all">All tasks</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[1fr_100px_80px_80px_32px] gap-2 px-3 mb-2 text-[10px] mono text-[var(--text-dim)] uppercase tracking-wider">
        <span>Task</span><span>Owner</span><span>Priority</span><span>Due</span><span></span>
      </div>

      <div className="flex flex-col gap-2">
        {loading && (
          <div className="text-[12px] text-[var(--text-dim)] py-8 text-center">Loading tasks...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-[12px] text-[var(--text-dim)] py-8 text-center">
            No tasks found. Upload a meeting transcript to auto-generate tasks.
          </div>
        )}
        {filtered.map(task => (
          <div
            key={task.id}
            className={clsx(
              "grid grid-cols-[1fr_100px_80px_80px_32px] gap-2 items-center p-3 bg-[var(--card2)] rounded-lg border-l-2 text-[12px]",
              priorityBorder[task.priority] ?? "border-l-[var(--text-dim)]",
              task.status === "done" && "opacity-50"
            )}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStatus(task.id, task.status === "done" ? "open" : "done")}
                className={clsx(
                  "w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[9px] transition-all",
                  task.status === "done"
                    ? "bg-[var(--green)] border-[var(--green)] text-black"
                    : "border-[var(--border-muted)] hover:border-[var(--green)]"
                )}
              >
                {task.status === "done" && "✓"}
              </button>
              <span className={clsx("text-[var(--text)]", task.status === "done" && "line-through")}>{task.title}</span>
            </div>
            <span className="bg-[var(--bg)] rounded px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] truncate">
              {task.owner.split(" ")[0]}
            </span>
            <Badge variant={task.priority as any}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            <span className={clsx("text-[10px]", task.due_date && new Date(task.due_date) < new Date() ? "text-[var(--red)]" : "text-[var(--text-dim)]")}>
              {task.due_date ? new Date(task.due_date).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
            </span>
            <button
              onClick={() => handleDelete(task.id)}
              className="text-[var(--text-dim)] hover:text-[var(--red)] text-[14px] transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-[var(--text-dim)]">
        <PulseDot />
        Task Agent monitors deadlines and auto-flags blockers in real-time
      </div>
    </div>
  )
}
