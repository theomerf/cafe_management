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
import Login from './pages/Account/Login'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { logout, setUser } from './pages/Account/accountSlice'
import { type AppDispatch } from './store/store'
import { jwtDecode } from 'jwt-decode'
import ProtectedRoute from './utils/ProtectedRoute'

function App() {
  const dispatch: AppDispatch = useDispatch();

  function isTokenExpired(token: string) {
    if (!token) return true;

    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return true;
      return decoded.exp * 1000 < Date.now();
    }
    catch (err) {
      return true;
    }
  }

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      if (isTokenExpired(JSON.parse(localUser).accessToken)) {
        dispatch(logout());
      }
      else {
        dispatch(setUser(JSON.parse(localUser)));
      }
    }
  }, []);


  return (
    <HistoryRouter history={history}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/management" element={<Management />} />
            <Route path="/management/tables" element={<TableManagement />} />
            <Route path="/management/accounts" element={<AccountManagement />} />
            <Route path="/management/products" element={<ProductManagement />} />
            <Route path="/management/categories" element={<CategoryManagement />} />
          </Route>
        </Route>
      </Routes>
    </HistoryRouter>

  )
}

export default App
