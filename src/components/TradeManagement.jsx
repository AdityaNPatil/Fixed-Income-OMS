import { useContext, useState } from "react";
import { BondContext } from "../context/BondContext";

export default function TradeManagement() {
  const { orders, trades, cancelOrder, amendOrder } = useContext(BondContext);
  const [amendId, setAmendId] = useState(null);
  const [amendQty, setAmendQty] = useState("");
  const [amendPrice, setAmendPrice] = useState("");

  return (
    <section className="panel active">
      <div className="card">
        <h2>Trade Management</h2>

        {/* Active Orders Table */}
        <h3>Active Orders</h3>
        <table className="trade-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Ticker</th>
              <th>Side</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.filter(o => o.status !== "FILLED" && o.status !== "CANCELLED").length === 0 && (
              <tr>
                <td colSpan="7" className="empty">No active orders</td>
              </tr>
            )}
            {orders
              .filter(o => o.status !== "FILLED" && o.status !== "CANCELLED")
              .map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.ticker}</td>
                  <td>{o.side}</td>
                  <td>{o.qty}</td>
                  <td>{o.price || "MKT"}</td>
                  <td>{o.status}</td>
                  <td>
                    {o.status === "WORKING" && (
                      <>
                        <button className="btn-cancel" onClick={() => cancelOrder(o.id)}>Cancel</button>
                        <button className="btn-amend" onClick={() => setAmendId(o.id)}>Amend</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Executed Lots */}
        <h3>Executed Lots</h3>
        <table className="trade-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Ticker</th>
              <th>Side</th>
              <th>Qty</th>
              <th>Exec Price</th>
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 && (
              <tr>
                <td colSpan="5" className="empty">No trades executed</td>
              </tr>
            )}
            {trades.map((t, idx) => (
              <tr key={idx}>
                <td>{t.time}</td>
                <td>{t.ticker}</td>
                <td>{t.side}</td>
                <td>{t.qty}</td>
                <td>{t.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Amend Modal */}
        {amendId && (
          <div className="modal">
            <div className="modal-content">
              <h3>Amend Order {amendId}</h3>
              <input
                type="number"
                placeholder="New Qty"
                value={amendQty}
                onChange={(e) => setAmendQty(e.target.value)}
              />
              <input
                type="number"
                placeholder="New Price"
                value={amendPrice}
                onChange={(e) => setAmendPrice(e.target.value)}
              />
              <div className="modal-actions">
                <button
                  onClick={() => {
                    amendOrder(amendId, amendQty, amendPrice);
                    setAmendId(null);
                    setAmendQty("");
                    setAmendPrice("");
                  }}
                >
                  Save
                </button>
                <button onClick={() => setAmendId(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
