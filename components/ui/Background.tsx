import * as React from "react"

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-[#020617]">
      {/* Primary Orb */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-200/40 blur-[100px] dark:bg-indigo-900/20" />
      
      {/* Secondary Orb */}
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-violet-200/40 blur-[120px] dark:bg-violet-900/20" />
      
      {/* Accent Orb */}
      <div className="absolute top-[20%] right-[10%] h-[300px] w-[300px] rounded-full bg-blue-100/30 blur-[80px] dark:bg-blue-900/10" />
    </div>
  )
}
