"use client"
import { useEffect, useState } from "react"
import { getKnowledge, searchKnowledge } from "@/lib/api"
import { Spinner, PulseDot } from "@/components/shared/ui"
import type { KnowledgeEntry } from "@/types"
import clsx from "clsx"

const TYPE_ICON: Record<string, string> = {
  meeting: "🗓️",
  doc: "📄",
  slack: "💬",
  decision: "✅",
}

export function KnowledgeBase() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [searchQ, setSearchQ] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getKnowledge().then(data => { setEntries(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleSearch = async () => {
    if (!searchQ.trim()) return
    setSearching(true)
    try {
      const data = await searchKnowledge(searchQ)
      setSearchResults(data.results)
    } catch {}
    setSearching(false)
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h1 className="text-[20px] font-semibold">Knowledge Base</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">Auto-curated by the Knowledge Agent from meetings & docs</p>
      </div>

      {/* Semantic search */}
      <div className="flex gap-2 mb-5">
        <input
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Semantic search across all team knowledge..."
          className="flex-1 bg-[var(--card2)] border border-[var(--border-muted)] text-[var(--text)] text-[13px] rounded-lg px-3 py-2 outline-none focus:border-[var(--green)] placeholder:text-[var(--text-dim)] transition-colors"
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          className="bg-[var(--green)] text-black px-4 py-2 rounded-lg text-[12px] font-medium hover:bg-[#1eb817] disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {searching ? <Spinner /> : "◈"} Search
        </button>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="mb-5">
          <div className="text-[11px] mono text-[var(--text-dim)] uppercase tracking-wider mb-2">
            Semantic Results ({searchResults.length})
          </div>
          <div className="flex flex-col gap-2">
            {searchResults.map((r, i) => (
              <div key={i} className="bg-[var(--green-faint)] border border-[var(--border)] rounded-lg p-3">
                <div className="text-[12px] font-medium text-[var(--text)]">{r.metadata?.title ?? "Result"}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2">{r.text}</div>
                <div className="text-[10px] text-[var(--green)] mt-1">Relevance: {(r.score * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
          <button onClick={() => setSearchResults([])} className="text-[11px] text-[var(--text-dim)] mt-2 hover:underline">
            Clear results
          </button>
        </div>
      )}

      {/* All entries */}
      <div className="flex flex-col gap-2">
        {loading && <div className="text-[12px] text-[var(--text-dim)] py-6 text-center">Loading knowledge base...</div>}
        {!loading && entries.length === 0 && (
          <div className="text-[12px] text-[var(--text-dim)] py-6 text-center">
            Knowledge base is empty. Upload meeting transcripts to populate it.
          </div>
        )}
        {entries.map(entry => (
          <div
            key={entry.id}
            className="flex items-center gap-3 p-3 bg-[var(--card2)] rounded-lg cursor-pointer hover:bg-[var(--green-faint)] transition-all"
          >
            <span className="text-lg flex-shrink-0">
              {TYPE_ICON[entry.source_type] ?? "📋"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[var(--text)] truncate">{entry.title}</div>
              <div className="text-[11px] text-[var(--text-dim)] mt-0.5">
                {entry.source} · {new Date(entry.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {entry.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-[9px] bg-[var(--bg)] text-[var(--text-dim)] px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
            <span className="text-[var(--text-dim)] text-[14px]">→</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-[var(--text-dim)]">
        <PulseDot />
        {entries.length} entries · Knowledge Agent syncs automatically on each upload
      </div>
    </div>
  )
}
