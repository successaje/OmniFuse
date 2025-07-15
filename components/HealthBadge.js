export default function HealthBadge({ hf }) {
  let color = 'bg-[#10B981] text-white';
  let label = 'Safe';
  let icon = '✅';
  if (hf <= 1.2) {
    color = 'bg-[#EF4444] text-white';
    label = 'Risky';
    icon = '⚠️';
  } else if (hf <= 1.5) {
    color = 'bg-[#FACC15] text-black';
    label = 'Warning';
    icon = '⚠️';
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-300 ${color}`}>
      <span className="mr-1">{icon}</span> HF: {hf.toFixed(2)} <span className="ml-2 font-normal">{label}</span>
    </span>
  );
} 