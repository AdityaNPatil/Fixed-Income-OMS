import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import MarketWatch from "./components/MarketWatch";
import OrderExecution from "./components/OrderExecution";
import TradeManagement from "./components/TradeManagement";
import NetPosition from "./components/NetPosition";

export default function App() {
  return (
    <div>
      <header>
        <div className="wrap">
          <h1>Order Execution System — Global Fixed Income</h1>
          <div className="tabs">
            <NavLink to="/market" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
              Market Watch
            </NavLink>
            <NavLink to="/order" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
              Order Execution
            </NavLink>
            <NavLink to="/trade" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
              Trade Management
            </NavLink>
            <NavLink to="/netpos" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
              Net Position
            </NavLink>
          </div>
        </div>
      </header>

      <main className="wrap">
        <Routes>
          <Route path="/" element={<Navigate to="/market" replace />} />
          <Route path="/market" element={<MarketWatch />} />
          <Route path="/order" element={<OrderExecution />} />
          <Route path="/trade" element={<TradeManagement />} />
          <Route path="/netpos" element={<NetPosition />} />
        </Routes>
      </main>
    </div>
  );
}
