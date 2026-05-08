import { useState, useEffect, useRef } from "react";
import { Puzzle, Lightbulb } from "./Icons";

function AnimatedContent({ children, taskId }) {
  const [visible, setVisible] = useState(false);
  const prevId = useRef(taskId);

  useEffect(() => {
    if (prevId.current !== taskId) {
      setVisible(false);
      prevId.current = taskId;
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setVisible(true);
    }
  }, [taskId]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      {children}
    </div>
  );
}

export default function TaskPanel({ task }) {
  if (!task) {
    return (
      <div
        className="bg-s1 border-b border-borderc p-6 flex items-center justify-center text-t2 font-sans shrink-0"
        style={{ minHeight: "120px" }}
      >
        <div className="text-center">
          <Puzzle size={36} className="text-t2 mb-1" />
          <p className="text-base mb-1 text-text">
            Wähle eine Aufgabe aus der Seitenleiste
          </p>
          <p className="text-xs text-t3">
            Praktische Code-Muster für den Job-Alltag
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-s1 border-b border-borderc p-6 shrink-0 font-sans">
      <AnimatedContent taskId={task.id}>
        <h2 className="text-lg font-semibold text-text mb-3">{task.title}</h2>
        <p className="text-t2 text-sm leading-relaxed mb-3">
          {task.description}
        </p>
        {task.hint && (
          <details className="text-sm group">
            <summary className="text-accent cursor-pointer hover:brightness-125 select-none transition-all">
              <span className="inline-flex items-center gap-1.5">
                <Lightbulb size={14} /> Tipp anzeigen
              </span>
            </summary>
            <p className="mt-2 text-t2 italic pl-4 border-l-2 border-borderc animate-fade-in">
              {task.hint}
            </p>
          </details>
        )}
      </AnimatedContent>
    </div>
  );
}
