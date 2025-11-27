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
import { useAppSelector, type AppDispatch } from './store/store'
import ProtectedRoute from './utils/ProtectedRoute'
import Statistics from './pages/Statistics/Statistics'
import { checkAuth, setPreferences, setUser } from './pages/Account/accountSlice'
import Analysis from './pages/Analyses/Analysis'
import Settings from './pages/Settings/Settings'

function App() {
  const dispatch: AppDispatch = useDispatch();
  const { preferences } = useAppSelector((state) => state.account);

  useEffect(() => {
    if (preferences.darkMode) {
      document.documentElement.style.setProperty('--main-color', '22, 27, 34');
    } else {
      document.documentElement.style.setProperty('--main-color', '247, 250, 252');
    }
  }, [preferences]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedPreferences = localStorage.getItem("preferences");
    if (storedPreferences) {
      try {
        const parsedPreferences = JSON.parse(storedPreferences);
        dispatch(setPreferences(parsedPreferences));
      } catch (error) {
        console.error("Tercih verisi çözümlenirken hata oluştu:", error);
      }
    }
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch(setUser(parsedUser));
        dispatch(checkAuth());
      } catch (error) {
        console.error("Kullanıcı verisi çözümlenirken hata oluştu:", error);
      }
    }
  }, [dispatch]);

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
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </HistoryRouter>

  )
}

export default App
