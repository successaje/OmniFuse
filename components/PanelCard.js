export default function PanelCard({ children, className = '' }) {
  return (
    <div className={`bg-[#23272F]/80 rounded-2xl shadow-xl border border-[#23272F]/60 backdrop-blur-lg p-8 mb-8 card-hover animate-fade-in-up ${className}`}>
      {children}
    </div>
  );
} 