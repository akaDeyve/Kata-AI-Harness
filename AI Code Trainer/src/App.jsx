import { useState } from 'react'
import './App.css'
import CodePanel from './components/Codepanel'
import AIModal from './components/AIModal'

function App() {


  return (
    <>
    <div className="App">
      {/* <h1>AI Code Trainer</h1>
       <CodePanel /> */}
        <AIModal />
    </div>
    </>
  )
}

export default App
