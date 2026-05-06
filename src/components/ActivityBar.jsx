export default function ActivityBar() {
  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center py-2 border-r border-[#3c3c3c] select-none shrink-0">
      <div
        className="w-10 h-10 flex items-center justify-center text-[#cccccc] cursor-pointer border-l-2 border-[#007acc] bg-[#37373d] transition-all duration-200 hover:bg-[#3e3e42] group"
        title="Aufgaben"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="group-hover:scale-110 transition-transform duration-200">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </div>
    </div>
  )
}
