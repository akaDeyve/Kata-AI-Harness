import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightSpecialChars, drawSelection, rectangularSelection } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import {
  closeBrackets,
  closeBracketsKeymap,
  autocompletion,
  completionKeymap,
} from '@codemirror/autocomplete'
import {
  bracketMatching,
  indentOnInput,
  foldGutter,
  foldKeymap,
  syntaxHighlighting,
  defaultHighlightStyle,
} from '@codemirror/language'
import {
  searchKeymap,
  highlightSelectionMatches,
} from '@codemirror/search'

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
        // ── Line & Selection ──
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        drawSelection(),
        rectangularSelection(),

        // ── Code Folding ──
        foldGutter({
          openText: '▾',
          closedText: '▸',
          markerDOM: (open) => {
            const span = document.createElement('span')
            span.textContent = open ? '▾' : '▸'
            span.style.color = '#4e5168'
            span.style.fontSize = '10px'
            span.style.padding = '0 4px'
            span.style.cursor = 'pointer'
            return span
          },
        }),

        // ── Language ──
        javascript({ jsx: true, typescript: false }),
        bracketMatching(),
        closeBrackets(),
        indentOnInput(),

        // ── Autocompletion ──
        autocompletion({
          activateOnTyping: true,
          closeOnBlur: true,
          maxRenderedOptions: 8,
          defaultKeymap: true,
          icons: false,
        }),

        // ── Search / Selection ──
        highlightSelectionMatches({ highlightWordAroundCursor: true }),

        // ── History (Undo/Redo) ──
        history(),

        // ── Theme ──
        oneDark,
        EditorView.theme({
          '&': { height: '100%', backgroundColor: '#0a0b0d' },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: "'JetBrains Mono', monospace",
            backgroundColor: '#0a0b0d',
          },
          '.cm-gutters': {
            backgroundColor: '#0a0b0d',
            borderRight: '1px solid #ffffff0f',
            color: '#4e5168',
          },
          '.cm-activeLineGutter': { backgroundColor: '#111318' },
          '.cm-activeLine': { backgroundColor: '#6c63ff08' },
          '.cm-foldPlaceholder': { backgroundColor: 'transparent', color: '#4e5168' },
          '.cm-tooltip': {
            backgroundColor: '#1c1f28',
            border: '1px solid #ffffff18',
            borderRadius: '6px',
            color: '#e2e4ed',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
          },
          '.cm-tooltip-autocomplete': {
            '& > ul': { maxHeight: '200px' },
            '& > ul > li': { padding: '4px 8px' },
            '& > ul > li[aria-selected]': { backgroundColor: '#6c63ff22' },
          },
          '.cm-selectionMatch': { backgroundColor: '#6c63ff22' },
          '.cm-searchMatch': { backgroundColor: '#ffff0055' },
          '.cm-searchMatch-selected': { backgroundColor: '#ffaa0055' },
        }),

        // ── Keymaps ──
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          ...closeBracketsKeymap,
          ...foldKeymap,
          ...completionKeymap,
          indentWithTab,
        ]),

        updateListener,
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

/* ── Helper: active line gutter extension ── */
function highlightActiveLineGutter() {
  return EditorView.theme({
    '.cm-activeLineGutter': { backgroundColor: '#111318' },
  })
}
