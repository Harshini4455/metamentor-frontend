export interface Task {
  id: string
  title: string
  owner: string
  priority: "critical" | "high" | "medium" | "low"
  status: "open" | "in_progress" | "blocked" | "done"
  due_date: string | null
  created_at: string
}

export interface Risk {
  id: string
  title: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  status: "open" | "resolved"
  related_member: string | null
  suggested_action: string
  tags: string[]
  created_at: string
}

export interface KnowledgeEntry {
  id: string
  title: string
  source: string
  source_type: string
  tags: string[]
  created_at: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  skills: string[]
  workload_percent: number
  active_task_count: number
  avatar_initials: string
}

export interface DashboardStats {
  total_tasks: number
  open_tasks: number
  at_risk: number
  kb_entries: number
  meetings_processed: number
}

export interface SprintReport {
  velocity_percent: number
  total_tasks: number
  open_tasks: number
  done_tasks: number
  critical_risks: number
  executive_summary: string
  key_risks: string[]
  team_workloads: { name: string; workload: number }[]
  recommendations: string[]
}
