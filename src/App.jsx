/**
 * App.jsx — ThermalGuard Root Router
 * Base Application Layout & Shell
 */

import { Routes, Route, Navigate } from 'react-router-dom'

function HomePage() {
  return (
    <div className="min-h-screen bg-[#04101f] text-white flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#79dce8]/30 bg-[#79dce8]/10 text-xs font-mono text-[#79dce8]">
          <span className="w-2 h-2 rounded-full bg-[#79dce8] animate-pulse"></span>
          <span>System Initialized • v0.1.0</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-serif">
          Thermal<span className="text-[#79dce8]">Guard</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Real-time thermal anomaly monitoring & planetary intelligence. Setting up core visualization pipeline...
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
