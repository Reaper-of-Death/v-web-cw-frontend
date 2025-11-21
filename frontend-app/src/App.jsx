import { BrowserRouter } from 'react-router-dom'
import { Routing } from '@app/providers/router'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routing />
      </div>
    </BrowserRouter>
  )
}

export default App