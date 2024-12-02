import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import NavBar from './components/NavBar'
import MapInterface from './components/mapUI'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <NavBar/>
      <MapInterface />
    </>
  )
}

export default App
