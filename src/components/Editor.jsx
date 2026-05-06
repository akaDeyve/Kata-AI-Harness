import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

export default function Editor({ code, onChange }) {
  const editorRef = useRef(null)
  const viewRef = useRef(null)
  const isUpdatingRef = useRef(false)

  useEffect(() => {
    if (!editorRef.current) return

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !isUpdatingRef.current) {
        onChange(update.state.doc.toString())
      }
    })

    const state = EditorState.create({
      doc: code,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        keymap.of(defaultKeymap),
        javascript({ jsx: true, typescript: false }),
        oneDark,
        updateListener,
        EditorView.theme({
          '&': { height: '100%', backgroundColor: '#0a0b0d' },
          '.cm-scroller': { overflow: 'auto', fontFamily: "'JetBrains Mono', monospace", backgroundColor: '#0a0b0d' },
          '.cm-gutters': { backgroundColor: '#0a0b0d', borderRight: '1px solid #ffffff0f', color: '#4e5168' },
          '.cm-activeLineGutter': { backgroundColor: '#111318' },
          '.cm-activeLine': { backgroundColor: '#6c63ff08' },
        }),
      ],
    })

    const view = new EditorView({ state, parent: editorRef.current })
    viewRef.current = view
    return () => view.destroy()
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const currentDoc = view.state.doc.toString()
    if (code !== currentDoc) {
      isUpdatingRef.current = true
      view.dispatch({ changes: { from: 0, to: currentDoc.length, insert: code } })
      isUpdatingRef.current = false
    }
  }, [code])

  return <div ref={editorRef} className="h-full w-full" />
}
