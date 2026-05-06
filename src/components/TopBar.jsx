export default function TopBar({ onApiClick, hasApiKey }) {
  return (
    <div className="h-9 bg-[#323233] flex items-center px-3 border-b border-[#3c3c3c] select-none shrink-0">
      <div className="flex items-center gap-2 mr-4">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57] cursor-pointer hover:brightness-110" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e] cursor-pointer hover:brightness-110" />
        <div className="w-3 h-3 rounded-full bg-[#28c840] cursor-pointer hover:brightness-110" />
      </div>

      <span className="text-sm text-[#cccccc] font-medium flex-1 text-center font-sans">
        Coding-Trainer
      </span>

      <button
        onClick={onApiClick}
        className={`text-xs px-3 py-1 rounded transition-colors font-sans ${
          hasApiKey
            ? 'bg-green-700/30 text-green-400 border border-green-700/50 hover:bg-green-700/40'
            : 'bg-[#0e639c] text-white hover:bg-[#1177bb]'
        }`}
      >
        {hasApiKey ? '\u2713 API-Key' : 'API-Key'}
      </button>
    </div>
  )
}
