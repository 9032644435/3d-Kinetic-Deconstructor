import React from 'react';
import { useIntelStore } from '../store/useIntelStore';
import { Activity, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface HUDProps {
  needsPermission: boolean;
  permissionGranted: boolean;
  onGrantPermission: () => void;
}

export function HUD({ needsPermission, permissionGranted, onGrantPermission }: HUDProps) {
  const stability = useIntelStore(state => state.stability);

  const requestAccess = async () => {
    try {
      const permission = await (DeviceOrientationEvent as any).requestPermission();
      if (permission === 'granted') {
        onGrantPermission();
      }
    } catch (e) {
      console.error(e);
      // Fallback to true to allow mouse events
      onGrantPermission();
    }
  };

  const getSarcasticLog = (stab: number) => {
    if (stab > 90) return "SYSTEM NOMINAL - YOU'RE ACTUALLY HOLDING IT STILL.";
    if (stab > 60) return "MINOR TREMORS DETECTED - BREATHE, HUMAN.";
    if (stab > 30) return "STABILITY COMPROMISED - PUT THE COFFEE DOWN.";
    if (stab > 10) return "ORBITAL DECAY DETECTED - HOLD STILL, HUMAN.";
    return "CATASTROPHIC FAILURE - KINETIC MESH SHATTERED.";
  };

  const isCritical = stability < 30;

  if (needsPermission && !permissionGranted) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        <div className="p-8 border border-cyan-500/30 rounded-2xl bg-slate-900/50 flex flex-col items-center max-w-sm text-center mx-4">
          <Zap className="w-12 h-12 text-cyan-400 mb-4 animate-pulse" />
          <h2 className="text-xl font-mono text-cyan-50 mb-2">INITIALIZE INTEL STREAM</h2>
          <p className="text-sm text-cyan-200/70 mb-6 font-mono">
            Deploying Kinetic Mesh requires gyroscope access to monitor spatial anomalies.
          </p>
          <button 
            onClick={requestAccess}
            className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 rounded-xl text-cyan-50 font-mono transition-all active:scale-95"
          >
            AUTHORIZE SENSORS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-40 pointer-events-none p-6 flex flex-col justify-between pt-safe pb-safe">
      {/* Top Bar */}
      <div className="flex justify-between items-start mt-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-widest">
            <Activity className="w-4 h-4" />
            <span>S25-ULTRA // TACTICAL OVERLAY</span>
          </div>
          <div className="text-slate-400 font-mono text-[10px] tracking-widest uppercase">
            Kinetic Deconstruction Engine v1.0
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-700/50 px-4 py-2 rounded-full backdrop-blur-md">
          {isCritical ? (
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          )}
          <span className={`font-mono text-sm ${isCritical ? 'text-red-500' : 'text-emerald-400'}`}>
            {stability}%
          </span>
        </div>
      </div>

      {/* Bottom Log */}
      <div className="flex flex-col gap-2 max-w-md w-full mb-4">
        <div className="h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-100 ${isCritical ? 'bg-red-500' : 'bg-cyan-400'}`}
            style={{ width: `${stability}%` }}
          />
        </div>
        <div className={`font-mono text-xs tracking-wider uppercase bg-slate-900/60 border ${isCritical ? 'border-red-500/30 text-red-400' : 'border-cyan-500/30 text-cyan-300'} p-3 rounded-lg backdrop-blur-md`}>
          &gt; {getSarcasticLog(stability)}
        </div>
      </div>
    </div>
  );
}
