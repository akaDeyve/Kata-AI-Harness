export default function StatusBar({ task, code = "" }) {
  const lineCount = code ? code.split("\n").length : 1;
  const charCount = code ? code.length : 0;

  return (
    <div className="h-8 flex items-center justify-between px-5 bg-bg border-t border-borderc shrink-0 select-none">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-xs text-t3">
          <span className="w-1.5 h-1.5 rounded-full bg-green" />
          Bereit
        </span>
        {task && (
          <span className="text-xs text-t3">
            {task.name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-t3">JSX</span>
        <span className="text-xs text-t3">UTF-8</span>
        <span className="text-xs text-t3">Ln 1, Col 1</span>
      </div>
    </div>
  );
}
