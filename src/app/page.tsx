"use client"
import { useEffect, useRef } from "react"
import { Topbar } from "@/components/shared/Topbar"
import { Sidebar } from "@/components/shared/Sidebar"
import { Dashboard } from "@/components/dashboard/Dashboard"
import { UploadProcess } from "@/components/upload/UploadProcess"
import { Tasks } from "@/components/tasks/Tasks"
import { RiskRadar } from "@/components/risks/RiskRadar"
import { AskAI } from "@/components/ask/AskAI"
import { KnowledgeBase } from "@/components/knowledge/KnowledgeBase"
import { TeamTwin } from "@/components/team/TeamTwin"
import { ManagerReport } from "@/components/reports/ManagerReport"
import { useStore } from "@/store/useStore"
import { useWebSocket } from "@/hooks/useWebSocket"
import { seedDemoData } from "@/lib/api"

// Generate stable client ID
function getClientId() {
  if (typeof window === "undefined") return "ssr"
  let id = localStorage.getItem("mm_client_id")
  if (!id) {
    id = "client_" + Math.random().toString(36).slice(2, 10)
    localStorage.setItem("mm_client_id", id)
  }
  return id
}

export default function Home() {
  const { activeSection } = useStore()
  const clientId = typeof window !== "undefined" ? getClientId() : "ssr"
  useWebSocket(clientId)

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === "dashboard" && <Dashboard />}
          {activeSection === "upload" && <UploadProcess />}
          {activeSection === "tasks" && <Tasks />}
          {activeSection === "risks" && <RiskRadar />}
          {activeSection === "ask" && <AskAI />}
          {activeSection === "knowledge" && <KnowledgeBase />}
          {activeSection === "team" && <TeamTwin />}
          {activeSection === "reports" && <ManagerReport />}
        </main>
      </div>
    </div>
  )
}
