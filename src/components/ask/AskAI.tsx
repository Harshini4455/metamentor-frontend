"use client"
import { useState, useRef, useEffect } from "react"
import { askAI } from "@/lib/api"
import { useStore } from "@/store/useStore"
import { Spinner, PulseDot } from "@/components/shared/ui"

const QUICK_QUERIES = [
  "What are the biggest risks this week?",
  "Which employee is overloaded?",
  "Why is Project Titan delayed?",
  "Generate sprint report",
  "What was decided in the last meeting?",
  "Who owns the auth module?",
  "What tasks are blocked?",
  "Show workload distribution",
]

interface Message {
  role: "user" | "ai"
  text: string
}

export function AskAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hello! I'm your MetaMentor AI Digital Twin. I have full context of your team's meetings, tasks, risks, and projects. Ask me anything — from blockers to workload analysis to sprint summaries.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { setActiveSection } = useStore()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async (question: string) => {
    if (!question.trim() || loading) return
    setInput("")
    setMessages(prev => [...prev, { role: "user", text: question }])
    setLoading(true)
    try {
      const data = await askAI(question)
      setMessages(prev => [...prev, { role: "ai", text: data.answer }])
      // Navigate to reports if report was requested
      if (question.toLowerCase().includes("sprint report")) {
        setTimeout(() => setActiveSection("reports"), 1200)
      }
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Sorry, I couldn't reach the backend. Make sure the server is running on port 8000." }])
    }
    setLoading(false)
  }

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-[20px] font-semibold">Ask the Digital Twin</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
          Query your team's collective knowledge — powered by Gemini AI
        </p>
      </div>

      {/* Quick queries */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_QUERIES.map(q => (
          <button
            key={q}
            onClick={() => send(q)}
            className="text-[11px] px-3 py-1.5 border border-[var(--border)] text-[var(--green)] rounded-full hover:bg-[var(--green-glow)] transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat messages */}
      <div className="flex-1 bg-[var(--card)] border border-[var(--border-muted)] rounded-xl p-4 overflow-y-auto mb-4 min-h-[280px] max-h-[400px] flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                msg.role === "ai" ? "bg-[var(--green)] text-black" : "bg-[var(--card2)] text-[var(--text-muted)]"
              }`}
            >
              {msg.role === "ai" ? "M" : "J"}
            </div>
            <div
              className={`max-w-[75%] px-3 py-2 rounded-xl text-[13px] leading-relaxed whitespace-pre-line ${
                msg.role === "ai"
                  ? "bg-[var(--card2)] text-[var(--text)] border border-[var(--border-muted)]"
                  : "bg-[var(--green)] text-black"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[var(--green)] flex items-center justify-center text-[11px] font-bold text-black">M</div>
            <div className="px-3 py-2 rounded-xl bg-[var(--card2)] border border-[var(--border-muted)] flex items-center gap-2">
              <Spinner />
              <span className="text-[12px] text-[var(--text-muted)]">Analyzing team data...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder="Ask about tasks, risks, blockers, workload..."
          className="flex-1 bg-[var(--card2)] border border-[var(--border-muted)] text-[var(--text)] text-[13px] rounded-lg px-3 py-2.5 outline-none focus:border-[var(--green)] placeholder:text-[var(--text-dim)] transition-colors"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="bg-[var(--green)] text-black px-4 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#1eb817] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send ✦
        </button>
      </div>
    </div>
  )
}
