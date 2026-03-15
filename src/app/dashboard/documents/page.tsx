'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect, useCallback } from 'react'

interface DocumentRecord {
  id: string
  name: string
  type: string
  size_bytes: number
  chunk_count: number
  created_at: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      setDocuments(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleUpload = async (file: File) => {
    setUploading(true)
    setUploadStatus(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/documents', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setUploadStatus({ type: 'error', message: data.error || 'Upload failed' })
      } else {
        setUploadStatus({ type: 'success', message: `✅ "${data.name}" uploaded — ${data.chunk_count} chunks indexed` })
        await fetchDocuments()
      }
    } catch {
      setUploadStatus({ type: 'error', message: 'Upload failed. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its memory chunks?`)) return
    await fetch(`/api/documents?id=${id}`, { method: 'DELETE' })
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">📄 Documents</h1>
          <p className="text-gray-400 text-sm mt-1">Upload documents to make them searchable in your memory</p>
        </div>

        {/* Upload zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors mb-6 ${
            dragging
              ? 'border-indigo-400 bg-indigo-950/30'
              : 'border-gray-700 bg-gray-900 hover:border-indigo-600 hover:bg-gray-900/80'
          } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md"
            className="hidden"
            onChange={handleFileInput}
            disabled={uploading}
          />
          <div className="text-3xl mb-3">{uploading ? '⏳' : '📂'}</div>
          <p className="text-white font-medium text-sm">
            {uploading ? 'Processing document…' : 'Drop a file here or click to browse'}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Supported: <span className="text-gray-400">.txt, .md</span> &nbsp;·&nbsp;
            <span className="text-gray-600">PDF coming soon</span>
          </p>
        </div>

        {/* Status message */}
        {uploadStatus && (
          <div className={`rounded-xl px-4 py-3 text-sm mb-6 ${
            uploadStatus.type === 'success'
              ? 'bg-green-950/50 text-green-300 border border-green-800'
              : 'bg-red-950/50 text-red-300 border border-red-800'
          }`}>
            {uploadStatus.message}
          </div>
        )}

        {/* Documents list */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-white">Your Documents</h2>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-gray-600 text-sm">Loading…</div>
          ) : documents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-2xl mb-3">📂</p>
              <p className="text-gray-400 text-sm">No documents yet.</p>
              <p className="text-gray-600 text-xs mt-1">Upload a CV, contract, or notes to make them part of your memory.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-gray-800">
                  <th className="text-left px-6 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Chunks</th>
                  <th className="text-left px-4 py-3 font-medium">Size</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-3 text-white font-medium truncate max-w-[180px]">{doc.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-0.5 rounded-full border border-indigo-500/20">
                        .{doc.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{doc.chunk_count}</td>
                    <td className="px-4 py-3 text-gray-400">{formatBytes(doc.size_bytes)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(doc.id, doc.name)}
                        className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
