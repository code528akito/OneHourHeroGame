import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useGameStore } from '@/stores/gameStore'
import LoginPage from '@/components/LoginPage'
import RegisterPage from '@/components/RegisterPage'
import MainMenuPage from '@/components/MainMenuPage'
import ClassSelectionPage from '@/components/ClassSelectionPage'
import GamePage from '@/components/GamePage'

function App() {
  const { token } = useGameStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/menu"
          element={token ? <MainMenuPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/class-selection"
          element={token ? <ClassSelectionPage /> : <Navigate to="/login" />}
        />
        <Route path="/game" element={token ? <GamePage /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={token ? '/menu' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
