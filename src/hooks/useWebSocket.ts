"use client"
import { useEffect, useRef, useCallback } from "react"
import { useStore } from "@/store/useStore"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"

export function useWebSocket(clientId: string) {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>()
  const { addWsEvent, setAgentStatus } = useStore()

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return

    const socket = new WebSocket(`${WS_URL}/ws/${clientId}`)
    ws.current = socket

    socket.onopen = () => {
      console.log("[WS] connected")
      addWsEvent({ type: "connected", data: {} })
    }

    socket.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        addWsEvent(msg)

        // Update agent statuses in store
        if (msg.type === "agent_start") {
          setAgentStatus(msg.data.agent, "running")
        } else if (msg.type === "agent_done") {
          setAgentStatus(msg.data.agent, "done")
        } else if (msg.type === "agent_error") {
          setAgentStatus(msg.data.agent, "error")
        } else if (msg.type === "pipeline_complete") {
          setAgentStatus("all", "idle")
        }
      } catch {}
    }

    socket.onclose = () => {
      console.log("[WS] disconnected — reconnecting in 3s")
      reconnectTimer.current = setTimeout(connect, 3000)
    }

    socket.onerror = () => {
      socket.close()
    }
  }, [clientId, addWsEvent, setAgentStatus])

  useEffect(() => {
    connect()
    // Keepalive ping every 30s
    const ping = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "ping" }))
      }
    }, 30000)
    return () => {
      clearInterval(ping)
      clearTimeout(reconnectTimer.current)
      ws.current?.close()
    }
  }, [connect])

  return ws
}
