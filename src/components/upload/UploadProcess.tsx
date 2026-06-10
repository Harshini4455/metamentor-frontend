"use client"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { uploadDocument } from "@/lib/api"
import { useStore } from "@/store/useStore"
import { Btn, Spinner } from "@/components/shared/ui"
import clsx from "clsx"

const STEPS = [
  { key: "meeting", label: "Meeting Agent — Transcribing & Parsing", detail: "Extracting decisions, action items, participants" },
  { key: "task", label: "Task Agent — Creating Tasks", detail: "Assigning owners based on context & workload" },
  { key: "knowledge", label: "Knowledge Agent — Updating Knowledge Base", detail: "Tagging decisions, storing context, linking projects" },
  { key: "risk", label: "Risk Agent — Scanning for Blockers", detail: "Identifying risks, predicting delays, alerting stakeholders" },
  { key: "manager", label: "Manager Agent — Drafting Report", detail: "Preparing leadership summary with insights" },
]

type StepStatus = "pending" | "running" | "done" | "error"

export function UploadProcess() {
  const { agentStatuses, wsEvents, setPipelineRunning, setLastPipelineResult, pipelineRunning } = useStore()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const clientId = typeof window !== "undefined" ? (localStorage.getItem("mm_client_id") || "demo") : "demo"

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0])
    setResult(null)
    setError("")
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt"], "text/markdown": [".md"], "application/json": [".json"], "text/csv": [".csv"] },
    maxFiles: 1,
  })

  const getStepStatus = (key: string): StepStatus => {
    return agentStatuses[key as keyof typeof agentStatuses] as StepStatus
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setPipelineRunning(true)
    setError("")
    try {
      const res = await uploadDocument(file, clientId, setProgress)
      setResult(res.results)
      setLastPipelineResult(res.results)
    } catch (e: any) {
      setError(e.response?.data?.detail || "Upload failed. Is the backend running?")
    } finally {
      setUploading(false)
      setPipelineRunning(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h1 className="text-[20px] font-semibold">Upload & Process</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
          Drop in meetings, Slack exports, or project docs — agents handle the rest
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={clsx(
          "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-5",
          isDragActive
            ? "border-[var(--green)] bg-[var(--green-faint)]"
            : "border-[var(--border)] hover:border-[var(--green)] hover:bg-[var(--green-faint)]"
        )}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3">📁</div>
        {file ? (
          <div>
            <div className="text-[14px] text-[var(--green)] font-medium">{file.name}</div>
            <div className="text-[12px] text-[var(--text-dim)] mt-1">{(file.size / 1024).toFixed(1)} KB — ready to process</div>
          </div>
        ) : (
          <div>
            <div className="text-[14px] text-[var(--text-muted)]">Drop meeting transcript, Slack export, or project doc</div>
            <div className="text-[12px] text-[var(--text-dim)] mt-1">.txt .md .json .csv</div>
          </div>
        )}
      </div>

      {file && !result && (
        <div className="flex justify-end mb-5">
          <Btn onClick={handleUpload} disabled={uploading}>
            {uploading ? <><Spinner /> Processing...</> : "⚡ Run All Agents"}
          </Btn>
        </div>
      )}

      {error && (
        <div className="bg-[rgba(255,79,79,0.1)] border border-[rgba(255,79,79,0.3)] text-[var(--red)] rounded-lg p-3 text-[13px] mb-4">
          {error}
        </div>
      )}

      {/* Pipeline steps */}
      {uploading && (
        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-[var(--green)]">Processing: {file?.name}</span>
            <div className="mono text-[11px] text-[var(--text-dim)]">{progress}%</div>
          </div>
          {STEPS.map((step, i) => {
            const status = getStepStatus(step.key)
            return (
              <div
                key={step.key}
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  status === "done" && "bg-[var(--green-faint)] border-[rgba(37,204,29,0.3)]",
                  status === "running" && "border-[var(--green)] bg-[var(--green-faint)]",
                  status === "pending" && "bg-[var(--card)] border-[var(--border-muted)] opacity-50",
                  status === "error" && "border-[rgba(255,79,79,0.3)] bg-[rgba(255,79,79,0.05)]"
                )}
              >
                <div
                  className={clsx(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[12px] flex-shrink-0",
                    status === "done" && "bg-[var(--green)] text-black",
                    status === "running" && "bg-[var(--green-glow)] text-[var(--green)]",
                    status === "pending" && "bg-[var(--card2)] text-[var(--text-dim)]",
                    status === "error" && "bg-[rgba(255,79,79,0.2)] text-[var(--red)]"
                  )}
                >
                  {status === "done" ? "✓" : status === "running" ? <Spinner /> : i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-[var(--text)]">{step.label}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{step.detail}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="animate-fade-in">
          <div className="text-[13px] font-semibold text-[var(--green)] mb-3">✦ Processing Complete</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--green-faint)] border border-[var(--border)] rounded-xl p-4">
              <div className="text-[12px] font-semibold text-[var(--text)] mb-2">📋 Tasks Created ({result?.tasks?.created ?? 0})</div>
              <div className="flex flex-col gap-1">
                {result?.tasks?.tasks?.slice(0, 5).map((t: any, i: number) => (
                  <div key={i} className="text-[12px] text-[var(--text-muted)]">• {t.title} → {t.owner}</div>
                ))}
              </div>
            </div>
            <div className="bg-[var(--green-faint)] border border-[var(--border)] rounded-xl p-4">
              <div className="text-[12px] font-semibold text-[var(--text)] mb-2">🧠 Knowledge Captured ({result?.knowledge?.entries_created ?? 0})</div>
              <div className="flex flex-col gap-1">
                {result?.knowledge?.entries?.slice(0, 5).map((e: any, i: number) => (
                  <div key={i} className="text-[12px] text-[var(--text-muted)]">• {e.title}</div>
                ))}
              </div>
            </div>
            {result?.risks?.risks_found > 0 && (
              <div className="bg-[rgba(245,166,35,0.07)] border border-[rgba(245,166,35,0.2)] rounded-xl p-4 col-span-2">
                <div className="text-[12px] font-semibold text-[var(--amber)] mb-2">⚠ Risks Detected ({result.risks.risks_found})</div>
                <div className="flex flex-col gap-1">
                  {result.risks.risks?.slice(0, 3).map((r: any, i: number) => (
                    <div key={i} className="text-[12px] text-[var(--text-muted)]">• {r.title}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => { setFile(null); setResult(null) }}
            className="mt-4 text-[12px] text-[var(--text-dim)] hover:text-[var(--text)] underline"
          >
            Process another document
          </button>
        </div>
      )}
    </div>
  )
}
