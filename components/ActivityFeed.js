export default function ActivityFeed({ feed }) {
  return (
    <div className="relative pl-6">
      {/* Vertical timeline line */}
      <div className="absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#3B82F6]/40 to-[#22D3EE]/10 rounded-full" />
      <ul className="space-y-6">
        {feed.map((item, i) => (
          <li key={item.id} className="relative flex items-start animate-fade-in-up">
            {/* Timeline dot */}
            <span className="absolute left-[-18px] top-2 w-4 h-4 rounded-full border-2 border-[#3B82F6] bg-[#181C23] flex items-center justify-center shadow-glow">
              {item.type === 'deposit' ? '💰' : item.type === 'borrow' ? '💸' : item.type === 'repay' ? '✅' : '⚠️'}
            </span>
            <div className="ml-2 flex-1">
              <div className="text-sm text-[#F3F4F6] font-medium">{item.message}</div>
              <div className="text-xs text-[#9CA3AF] mt-1">{typeof item.timestamp === 'string' ? item.timestamp : item.timestamp.toLocaleString()}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 