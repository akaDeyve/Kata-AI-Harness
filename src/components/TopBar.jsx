export default function TopBar({ task }) {
  return (
    <div className="h-12 flex items-center justify-between px-5 border-b border-borderc bg-bg shrink-0 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        {task ? (
          <span className="text-sm text-text truncate font-medium">
            {task.title || task.name}
          </span>
        ) : (
          <span className="text-sm text-t3">CodeLab</span>
        )}
      </div>
    </div>
  );
}
