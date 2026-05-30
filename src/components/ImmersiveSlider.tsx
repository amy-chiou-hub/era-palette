interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  displayValue?: string;
  trackGradient?: string;
}

export default function ImmersiveSlider({ label, value, onChange, min, max, displayValue, trackGradient }: {
  label: string, value: number, onChange: (v: number) => void, min: number, max: number, displayValue?: string, trackGradient?: string
}) {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-bold tracking-[0.2em] text-white/40">{label}</label>
        <span className="text-[10px] font-mono text-[#e2c38b] font-bold">{displayValue || `${Math.round(percentage)}%`}</span>
      </div>
      <div className="relative flex items-center h-4">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 h-[2px] w-full bg-white/[0.04] rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${trackGradient || 'from-cyan-400 to-indigo-500'}`} style={{ width: `${percentage}%` }} />
        </div>
        <input type="range" min={min} max={max} step={0.5} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" />
        <div className="absolute top-1/2 h-3 w-[2px] bg-cyan-200 pointer-events-none" style={{ left: `${percentage}%`, boxShadow: '0 0 12px rgba(34,211,238,0.8)', transform: 'translate(-50%, -50%)' }} />
      </div>
    </div>
  );
}

