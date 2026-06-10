import { create } from "zustand"

export type AgentName = "meeting" | "task" | "knowledge" | "risk" | "manager"
export type AgentStatus = "idle" | "running" | "done" | "error"

interface WsEvent {
  type: string
  data: any
}

interface StoreState {
  // WebSocket events log
  wsEvents: WsEvent[]
  addWsEvent: (e: WsEvent) => void

  // Agent pipeline statuses
  agentStatuses: Record<AgentName, AgentStatus>
  setAgentStatus: (agent: AgentName | "all", status: AgentStatus) => void

  // Pipeline running flag
  pipelineRunning: boolean
  setPipelineRunning: (v: boolean) => void

  // Last pipeline results
  lastPipelineResult: any
  setLastPipelineResult: (r: any) => void

  // Active nav section
  activeSection: string
  setActiveSection: (s: string) => void

  // Notification count
  riskCount: number
  setRiskCount: (n: number) => void

  taskCount: number
  setTaskCount: (n: number) => void
}

export const useStore = create<StoreState>((set) => ({
  wsEvents: [],
  addWsEvent: (e) =>
    set((s) => ({ wsEvents: [...s.wsEvents.slice(-99), e] })),

  agentStatuses: {
    meeting: "idle",
    task: "idle",
    knowledge: "idle",
    risk: "idle",
    manager: "idle",
  },
  setAgentStatus: (agent, status) =>
    set((s) => {
      if (agent === "all") {
        return {
          agentStatuses: {
            meeting: "idle",
            task: "idle",
            knowledge: "idle",
            risk: "idle",
            manager: "idle",
          },
        }
      }
      return {
        agentStatuses: { ...s.agentStatuses, [agent]: status },
      }
    }),

  pipelineRunning: false,
  setPipelineRunning: (v) => set({ pipelineRunning: v }),

  lastPipelineResult: null,
  setLastPipelineResult: (r) => set({ lastPipelineResult: r }),

  activeSection: "dashboard",
  setActiveSection: (s) => set({ activeSection: s }),

  riskCount: 0,
  setRiskCount: (n) => set({ riskCount: n }),

  taskCount: 0,
  setTaskCount: (n) => set({ taskCount: n }),
}))
