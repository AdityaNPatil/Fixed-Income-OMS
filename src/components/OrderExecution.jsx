import { useContext, useState, useEffect } from "react";
import { BondContext } from "../context/BondContext";

export default function OrderExecution() {
  const { selectedBond, orders, setOrders, trades, setTrades } = useContext(BondContext);

  const [form, setForm] = useState({
    side: "BUY",
    ticker: "",
    qty: "",
    orderType: "MARKET",
    price: "",
    stop: "",
    disclosed: "",
    conditional: "",
    tif: "DAY",
  });

  useEffect(() => {
    if (selectedBond) {
      setForm((f) => ({ ...f, ticker: selectedBond.ticker }));
    }
  }, [selectedBond]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitOrder = (e) => {
    e.preventDefault();
    if (!form.ticker || !form.qty) return alert("Ticker and Quantity required");
    if (form.orderType === "LIMIT" && !form.price) return alert("Limit Price required for Limit Orders");

    let order = {
      ...form,
      id: Date.now(),
      status: "NEW",
      filledQty: 0,
    };

    // --- Market Order executes immediately ---
    if (form.orderType === "MARKET" && selectedBond) {
      let execPrice = form.side === "BUY" ? selectedBond.ask : selectedBond.bid;
      order.status = "FILLED";
      order.filledQty = Number(form.qty);

      setTrades([
        ...trades,
        {
          orderId: order.id,
          side: form.side,
          ticker: form.ticker,
          qty: order.filledQty,
          price: execPrice,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }

    // --- Limit Order: FILLED if price crossed else WORKING ---
    if (form.orderType === "LIMIT" && selectedBond) {
      let execPrice = form.side === "BUY" ? selectedBond.ask : selectedBond.bid;
      if (
        (form.side === "BUY" && execPrice <= form.price) ||
        (form.side === "SELL" && execPrice >= form.price)
      ) {
        order.status = "FILLED";
        order.filledQty = Number(form.qty);
        setTrades([
          ...trades,
          {
            orderId: order.id,
            side: form.side,
            ticker: form.ticker,
            qty: order.filledQty,
            price: execPrice,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      } else {
        order.status = "WORKING";
      }
    }

    // --- IOC auto cancel if not instantly matched ---
    if (form.tif === "IOC" && order.status === "WORKING") {
      order.status = "CANCELLED";
    }

    setOrders([...orders, order]);

    // reset form
    setForm({
      side: "BUY",
      ticker: selectedBond ? selectedBond.ticker : "",
      qty: "",
      orderType: "MARKET",
      price: "",
      stop: "",
      disclosed: "",
      conditional: "",
      tif: "DAY",
    });
  };

  return (
    <section className="panel active">
      <div className="grid grid-2">
        <div className="card">
          <h2>Order Execution</h2>
          {selectedBond && (
            <div className="info-box">
              <strong>{selectedBond.ticker}</strong> ({selectedBond.isin}) — {selectedBond.issuer}<br/>
              Bid: {selectedBond.bid} | Ask: {selectedBond.ask} | YTM: {selectedBond.ytm}% | Face: {selectedBond.face}
            </div>
          )}

          <form onSubmit={submitOrder} className="grid">
            {/* Row 1 */}
            <div className="row">
              <div>
                <label>Side</label>
                <select name="side" value={form.side} onChange={handleChange}>
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
              <div>
                <label>Ticker</label>
                <input
                  name="ticker"
                  value={form.ticker}
                  onChange={handleChange}
                  placeholder="e.g. US10Y-2030"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="row">
              <div>
                <label>Quantity</label>
                <input
                  type="number"
                  name="qty"
                  value={form.qty}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Order Type</label>
                <select name="orderType" value={form.orderType} onChange={handleChange}>
                  <option value="MARKET">Market</option>
                  <option value="LIMIT">Limit</option>
                </select>
              </div>
            </div>

            {/* Row 3 */}
            {form.orderType === "LIMIT" && (
              <div className="row">
                <div>
                  <label>Limit Price</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder={`Default Ask: ${selectedBond ? selectedBond.ask : ""}`}
                  />
                </div>
              </div>
            )}

            {/* Row 4 */}
            <div className="row">
              <div>
                <label>Disclosed Qty</label>
                <input
                  type="number"
                  name="disclosed"
                  value={form.disclosed}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Stop Loss (Trigger)</label>
                <input
                  type="number"
                  name="stop"
                  value={form.stop}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 5 */}
            <div className="row">
              <div>
                <label>Conditional Order</label>
                <input
                  name="conditional"
                  value={form.conditional}
                  onChange={handleChange}
                  placeholder="e.g. if YTM > 6%"
                />
              </div>
              <div>
                <label>Time in Force (TIF)</label>
                <select name="tif" value={form.tif} onChange={handleChange}>
                  <option value="DAY">DAY</option>
                  <option value="IOC">IOC</option>
                  <option value="GTC">GTC</option>
                </select>
              </div>
            </div>

            <button className="primary">Submit Order</button>
          </form>
        </div>

        {/* Order Book */}
        <div className="card">
          <h2>Order Book</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Side</th><th>Ticker</th><th>Qty</th>
                <th>Order Type</th><th>Price</th><th>TIF</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.side}</td>
                  <td>{o.ticker}</td>
                  <td>{o.qty}</td>
                  <td>{o.orderType}</td>
                  <td>{o.price || "MKT"}</td>
                  <td>{o.tif}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
