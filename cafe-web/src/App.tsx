import './App.css'
import { Route, Routes, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import { history } from './utils/history'
import Orders from './pages/Orders'

function App() {
  return (
    <HistoryRouter history={history}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
      </Routes>
    </HistoryRouter>

  )
}

export default App
