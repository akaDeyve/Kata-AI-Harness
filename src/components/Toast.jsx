import { useEffect, useState } from 'react'
import { Check, Close, Info } from './Icons'

const typeStyles = {
  success: 'bg-green-700/90 border-green-500 text-green-100',
  error: 'bg-red-700/90 border-red-500 text-red-100',
  info: 'bg-[#007acc]/90 border-[#007acc] text-white',
}

const typeIcons = {
  success: <Check size={14} />,
  error: <Close size={14} />,
  info: <Info size={14} />,
}

export default function Toast({ message, type = 'info' }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => setVisible(false), 2200)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div
      className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] select-none transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border shadow-lg text-sm font-sans font-medium backdrop-blur-sm
          ${typeStyles[type] || typeStyles.info}`}
      >
        <span className="flex items-center">{typeIcons[type] || typeIcons.info}</span>
        {message}
      </div>
    </div>
  )
}
