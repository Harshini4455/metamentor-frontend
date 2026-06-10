import clsx from "clsx"

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("bg-[var(--card)] border border-[var(--border-muted)] rounded-xl p-4", className)}>
      {children}
    </div>
  )
}

export function PanelTitle({ icon, children }: { icon?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--text)] mb-3">
      {icon && <span className="text-[var(--green)]">{icon}</span>}
      {children}
    </div>
  )
}

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode
  variant?: "default" | "critical" | "high" | "medium" | "low" | "amber" | "blue"
}) {
  const styles = {
    default: "bg-[var(--green-faint)] text-[var(--green)] border border-[var(--border)]",
    critical: "bg-[rgba(255,79,79,0.15)] text-[var(--red)] border border-[rgba(255,79,79,0.3)]",
    high: "bg-[rgba(255,79,79,0.1)] text-[var(--red)] border border-[rgba(255,79,79,0.2)]",
    medium: "bg-[rgba(245,166,35,0.12)] text-[var(--amber)] border border-[rgba(245,166,35,0.25)]",
    low: "bg-[var(--green-faint)] text-[var(--green)] border border-[var(--border)]",
    amber: "bg-[rgba(245,166,35,0.12)] text-[var(--amber)] border border-[rgba(245,166,35,0.25)]",
    blue: "bg-[rgba(74,158,255,0.12)] text-[var(--blue)] border border-[rgba(74,158,255,0.25)]",
  }
  return (
    <span className={clsx("text-[10px] font-semibold px-2 py-0.5 rounded", styles[variant])}>
      {children}
    </span>
  )
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  className,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "outline" | "ghost"
  className?: string
  disabled?: boolean
}) {
  const styles = {
    primary: "bg-[var(--green)] text-black hover:bg-[#1eb817]",
    outline: "bg-transparent border border-[var(--border)] text-[var(--green)] hover:bg-[var(--green-faint)]",
    ghost: "bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--green-faint)]",
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all cursor-pointer",
        styles[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  )
}

export function StatCard({
  label,
  value,
  delta,
  color,
}: {
  label: string
  value: string | number
  delta?: string
  color?: "green" | "red" | "amber" | "default"
}) {
  const colorMap = {
    green: "text-[var(--green)]",
    red: "text-[var(--red)]",
    amber: "text-[var(--amber)]",
    default: "text-[var(--text)]",
  }
  return (
    <div className="bg-[var(--card)] border border-[var(--border-muted)] rounded-xl p-4">
      <div className="mono text-[9px] text-[var(--text-dim)] uppercase tracking-wider mb-1.5">{label}</div>
      <div className={clsx("text-2xl font-semibold", colorMap[color ?? "default"])}>{value}</div>
      {delta && <div className="text-[10px] text-[var(--text-dim)] mt-1">{delta}</div>}
    </div>
  )
}

export function Spinner() {
  return <div className="spinner" />
}

export function PulseDot() {
  return <div className="w-2 h-2 rounded-full bg-[var(--green)] pulse-dot flex-shrink-0" />
}

export function SeverityDot({ severity }: { severity: string }) {
  const c = {
    critical: "bg-[var(--red)]",
    high: "bg-[var(--red)] opacity-75",
    medium: "bg-[var(--amber)]",
    low: "bg-[var(--green)]",
  }[severity] ?? "bg-[var(--text-dim)]"
  return <div className={clsx("w-2 h-2 rounded-full flex-shrink-0", c)} />
}
