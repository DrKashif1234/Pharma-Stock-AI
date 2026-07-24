import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import MedicineDetails from './pages/MedicineDetails';
import ExpiryMonitor from './pages/ExpiryMonitor';
import LowStock from './pages/LowStock';
import QRScanner from './pages/QRScanner';
import StockHistory from './pages/StockHistory';
import AIAssistant from './pages/AIAssistant';
import AIReports from './pages/AIReports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/:id" element={<MedicineDetails />} />
        <Route path="/expiry" element={<ExpiryMonitor />} />
        <Route path="/low-stock" element={<LowStock />} />
        <Route path="/scanner" element={<QRScanner />} />
        <Route path="/history" element={<StockHistory />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/reports" element={<AIReports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}
