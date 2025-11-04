import './App.css'
import { Route, Routes, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import { history } from './utils/history'
import Orders from './pages/Orders/Orders'
import Management from './pages/Management/Management'
import TableManagement from './pages/Management/TableManagement'
import AccountManagement from './pages/Management/AccountManagement'
import ProductManagement from './pages/Management/ProductManagement'
import CategoryManagement from './pages/Management/CategoryManagement'

function App() {
  return (
    <HistoryRouter history={history}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/management" element={<Management />} />
          <Route path="/management/tables" element={<TableManagement />} />
          <Route path="/management/accounts" element={<AccountManagement />} />
          <Route path="/management/products" element={<ProductManagement />} />
          <Route path="/management/categories" element={<CategoryManagement />} />
        </Route>
      </Routes>
    </HistoryRouter>

  )
}

export default App
