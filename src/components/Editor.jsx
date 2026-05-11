import { useEffect, useRef } from 'react'
import { EditorState, StateEffect } from '@codemirror/state'
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightSpecialChars,
  drawSelection,
  rectangularSelection,
} from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete'
import {
  bracketMatching,
  indentOnInput,
  foldGutter,
  foldKeymap,
  syntaxHighlighting,
  defaultHighlightStyle,
} from '@codemirror/language'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'

/**
 * Map language IDs to CodeMirror language extensions.
 * To add a new language:
 *   1. npm install @codemirror/lang-<xyz>
 *   2. Add case below
 */
function getLanguageExtension(language) {
  switch (language) {
    case 'typescript':
      return javascript({ typescript: true, jsx: true })
    case 'javascript':
    default:
      return javascript({ jsx: true, typescript: false })
  }
}

export default function Editor({ code, onChange, language = 'javascript' }) {
  const editorRef = useRef(null)
  const viewRef = useRef(null)
  const isUpdatingRef = useRef(false)
  const updateListenerRef = useRef(null)

  useEffect(() => {
    if (!editorRef.current) return

    updateListenerRef.current = EditorView.updateListener.of((update) => {
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
            span.style.color = '#a1a1aa'
            span.style.fontSize = '10px'
            span.style.padding = '0 4px'
            span.style.cursor = 'pointer'
            return span
          },
        }),

        // ── Language (dynamisch basierend auf Aufgaben-Sprache) ──
        getLanguageExtension(language),
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

        // ── Syntax Highlighting ──
        syntaxHighlighting(defaultHighlightStyle),

        // ── Light Theme ──
        EditorView.theme({
          '&': { height: '100%', backgroundColor: '#fafafa' },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: "'JetBrains Mono', monospace",
            backgroundColor: '#fafafa',
            fontSize: '13px',
            lineHeight: '1.6',
          },
          '.cm-gutters': {
            backgroundColor: '#f5f5f5',
            borderRight: '1px solid #e5e5e5',
            color: '#a1a1aa',
          },
          '.cm-activeLineGutter': { backgroundColor: '#e8e8e8' },
          '.cm-activeLine': { backgroundColor: '#e8e8e808' },
          '.cm-foldPlaceholder': {
            backgroundColor: 'transparent',
            color: '#a1a1aa',
          },
          '.cm-cursor': { borderLeft: '2px solid #18181b' },
          '.cm-selectionBackground': { backgroundColor: '#b4d7ff' },
          '&.cm-focused .cm-selectionBackground': {
            backgroundColor: '#b4d7ff',
          },
          '.cm-tooltip': {
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '6px',
            color: '#18181b',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
          '.cm-tooltip-autocomplete': {
            '& > ul': { maxHeight: '200px' },
            '& > ul > li': { padding: '4px 8px' },
            '& > ul > li[aria-selected]': { backgroundColor: '#f3f3f3' },
          },
          '.cm-selectionMatch': { backgroundColor: '#b4d7ff44' },
          '.cm-searchMatch': { backgroundColor: '#fff59d' },
          '.cm-searchMatch-selected': { backgroundColor: '#ffcc80' },
          '.cm-panel': {
            backgroundColor: '#f9f9f9',
            borderBottom: '1px solid #e5e5e5',
          },
          '.cm-panel button': {
            color: '#52525b',
          },
          '.cm-search input': {
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5e5',
            color: '#18181b',
          },
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

        updateListenerRef.current,
      ],
    })

    const view = new EditorView({ state, parent: editorRef.current })
    viewRef.current = view
    return () => view.destroy()
  }, [])

  // Reconfigure editor when language changes
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      effects: StateEffect.reconfigure.of([
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        drawSelection(),
        rectangularSelection(),
        foldGutter({
          openText: '▾',
          closedText: '▸',
          markerDOM: (open) => {
            const span = document.createElement('span')
            span.textContent = open ? '▾' : '▸'
            span.style.color = '#a1a1aa'
            span.style.fontSize = '10px'
            span.style.padding = '0 4px'
            span.style.cursor = 'pointer'
            return span
          },
        }),
        getLanguageExtension(language),
        bracketMatching(),
        closeBrackets(),
        indentOnInput(),
        autocompletion({
          activateOnTyping: true,
          closeOnBlur: true,
          maxRenderedOptions: 8,
          defaultKeymap: true,
          icons: false,
        }),
        highlightSelectionMatches({ highlightWordAroundCursor: true }),
        history(),
        syntaxHighlighting(defaultHighlightStyle),
        EditorView.theme({
          '&': { height: '100%', backgroundColor: '#fafafa' },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: "'JetBrains Mono', monospace",
            backgroundColor: '#fafafa',
            fontSize: '13px',
            lineHeight: '1.6',
          },
          '.cm-gutters': {
            backgroundColor: '#f5f5f5',
            borderRight: '1px solid #e5e5e5',
            color: '#a1a1aa',
          },
          '.cm-activeLineGutter': { backgroundColor: '#e8e8e8' },
          '.cm-activeLine': { backgroundColor: '#e8e8e808' },
          '.cm-foldPlaceholder': {
            backgroundColor: 'transparent',
            color: '#a1a1aa',
          },
          '.cm-cursor': { borderLeft: '2px solid #18181b' },
          '.cm-selectionBackground': { backgroundColor: '#b4d7ff' },
          '&.cm-focused .cm-selectionBackground': {
            backgroundColor: '#b4d7ff',
          },
          '.cm-tooltip': {
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '6px',
            color: '#18181b',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
          '.cm-tooltip-autocomplete': {
            '& > ul': { maxHeight: '200px' },
            '& > ul > li': { padding: '4px 8px' },
            '& > ul > li[aria-selected]': { backgroundColor: '#f3f3f3' },
          },
          '.cm-selectionMatch': { backgroundColor: '#b4d7ff44' },
          '.cm-searchMatch': { backgroundColor: '#fff59d' },
          '.cm-searchMatch-selected': { backgroundColor: '#ffcc80' },
          '.cm-panel': {
            backgroundColor: '#f9f9f9',
            borderBottom: '1px solid #e5e5e5',
          },
          '.cm-panel button': { color: '#52525b' },
          '.cm-search input': {
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5e5',
            color: '#18181b',
          },
        }),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          ...closeBracketsKeymap,
          ...foldKeymap,
          ...completionKeymap,
          indentWithTab,
        ]),
        updateListenerRef.current,
      ]),
    })
  }, [language])

  // Sync external code changes into editor
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const currentDoc = view.state.doc.toString()
    if (code !== currentDoc) {
      isUpdatingRef.current = true
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: code },
      })
      isUpdatingRef.current = false
    }
  }, [code])

  return <div ref={editorRef} className="h-full w-full" />
}

/* ── Helper: active line gutter extension ── */
function highlightActiveLineGutter() {
  return EditorView.theme({
    '.cm-activeLineGutter': { backgroundColor: '#e8e8e8' },
  })
}
