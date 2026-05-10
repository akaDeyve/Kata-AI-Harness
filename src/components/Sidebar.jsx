import { Key, Settings, Check, CaretRight, CaretLeft, RotateCcw, Sparkle } from "./Icons";

export default function Sidebar({
  tasks,
  selectedTaskId,
  onSelectTask,
  collapsed,
  onToggleCollapse,
  width,
  onWidthChange,
  onApiClick,
  onSettingsClick,
  hasApiKey,
  onGenerateTask,
  onReset,
}) {
  const handleResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    const handleMouseMove = (ev) => {
      const newWidth = Math.max(
        180,
        Math.min(400, startWidth + (ev.clientX - startX)),
      );
      onWidthChange(newWidth);
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
    };
    document.body.style.cursor = "col-resize";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="relative flex flex-col overflow-hidden select-none shrink-0 border-r border-borderc bg-bg"
      style={{ width: collapsed ? 44 : width, minWidth: collapsed ? 44 : 220 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-[52px] px-4 border-b border-borderc shrink-0">
        {!collapsed && (
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-t3">
            Aufgaben
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className={`w-6 h-6 rounded text-t3 flex items-center justify-center flex-shrink-0 hover:text-text hover:bg-s2 transition-colors ${collapsed ? "mx-auto" : ""}`}
          title="Sidebar einklappen"
        >
          {collapsed ? <CaretRight size={14} /> : <CaretLeft size={14} />}
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              className={`flex items-center gap-2.5 w-full px-4 py-[5px] text-left cursor-pointer transition-colors relative whitespace-nowrap ${
                selectedTaskId === task.id
                  ? "text-text"
                  : "text-t2 hover:text-text"
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full flex-shrink-0 ${selectedTaskId === task.id ? "bg-text" : "bg-t3"}`}
              />
              <span className="text-sm truncate flex-1 leading-snug">
                {task.title || task.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Footer: Actions + API + Settings */}
      {!collapsed && (
        <div className="shrink-0 border-t border-borderc px-4 py-2 space-y-1">
          <button
            onClick={onReset}
            className="flex items-center gap-2.5 w-full px-0 py-[5px] text-left cursor-pointer text-text hover:text-text transition-colors"
          >
            <span className="text-text flex-shrink-0">
              <RotateCcw size={14} />
            </span>
            <span className="text-sm">Zurücksetzen</span>
          </button>
          {onGenerateTask && (
            <button
              onClick={onGenerateTask}
              className="flex items-center gap-2.5 w-full px-0 py-[5px] text-left cursor-pointer text-text hover:text-text transition-colors"
            >
              <span className="text-text flex-shrink-0">
                <Sparkle size={14} />
              </span>
              <span className="text-sm">Generieren</span>
            </button>
          )}
          <div className="h-px bg-border my-1" />
          <button
            onClick={onApiClick}
            className="flex items-center gap-2.5 w-full px-0 py-[5px] text-left cursor-pointer text-text hover:text-text transition-colors"
          >
            <span className={`flex-shrink-0 ${hasApiKey ? "text-green" : "text-text"}`}>
              {hasApiKey ? <Check size={14} /> : <Key size={14} />}
            </span>
            <span className="text-sm">API-Schlüssel</span>
          </button>
          <button
            onClick={onSettingsClick}
            className="flex items-center gap-2.5 w-full px-0 py-[5px] text-left cursor-pointer text-text hover:text-text transition-colors"
          >
            <span className="text-text flex-shrink-0">
              <Settings size={14} />
            </span>
            <span className="text-sm">Einstellungen</span>
          </button>
        </div>
      )}

      {/* Resize handle */}
      {!collapsed && (
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent/40 active:bg-accent/60 z-10 transition-colors"
          onMouseDown={handleResize}
        />
      )}
    </div>
  );
}
