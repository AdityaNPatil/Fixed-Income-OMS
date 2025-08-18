import { useContext, useState } from "react";
import { BondContext } from "../context/BondContext";

export default function NetPosition() {
  const { trades, bonds } = useContext(BondContext);
  const [method, setMethod] = useState("FIFO"); // FIFO | LIFO | WAP

  // --- Group trades per ticker ---
  const grouped = {};
  trades.forEach((t) => {
    if (!grouped[t.ticker]) grouped[t.ticker] = [];
    grouped[t.ticker].push(t);
  });

  let totalMTM = 0;
  let totalRealized = 0;

  const rows = Object.entries(grouped).map(([ticker, lots]) => {
    const bond = bonds.find((b) => b.ticker === ticker);
    if (!bond) return null;

    // --- Position & PnL calc ---
    let qty = 0;
    let costLots = [];
    let realizedPnL = 0;

    lots.forEach((t) => {
      if (t.side === "BUY") {
        qty += t.qty;
        costLots.push({ qty: t.qty, price: t.price });
      } else {
        // SELL -> match against existing lots
        let sellQty = t.qty;
        while (sellQty > 0 && costLots.length > 0) {
          const lot =
            method === "FIFO"
              ? costLots[0]
              : costLots[costLots.length - 1];

          const matchedQty = Math.min(lot.qty, sellQty);
          realizedPnL +=
            matchedQty * (t.price - lot.price);

          lot.qty -= matchedQty;
          sellQty -= matchedQty;

          if (lot.qty === 0) {
            if (method === "FIFO") costLots.shift();
            else costLots.pop();
          }
        }
        qty -= t.qty;
      }
    });

    // Remaining open position
    const remainingQty = costLots.reduce((sum, l) => sum + l.qty, 0);
    const totalCost = costLots.reduce(
      (sum, l) => sum + l.qty * l.price,
      0
    );
    const avgCost = remainingQty > 0 ? totalCost / remainingQty : 0;

    // MTM for open positions
    const marketPrice = bond.bid;
    const mtm = (marketPrice - avgCost) * remainingQty;

    totalMTM += mtm;
    totalRealized += realizedPnL;

    return {
      ticker,
      qty: remainingQty,
      avgCost: avgCost.toFixed(2),
      market: marketPrice.toFixed(2),
      mtm: mtm.toFixed(2),
      realized: realizedPnL.toFixed(2),
    };
  });

  return (
    <section className="panel active">
      <div className="card">
        <h2>Net Position</h2>

        {/* Toggle Method */}
        <div style={{ marginBottom: "10px" }}>
          <label>Valuation Method: </label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="FIFO">FIFO</option>
            <option value="LIFO">LIFO</option>
          </select>
        </div>

        {/* Position Table */}
        <table className="netpos-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Net Qty</th>
              <th>Avg Cost</th>
              <th>Market Price</th>
              <th>MTM PnL</th>
              <th>Realized P/L</th>
            </tr>
          </thead>
          <tbody>
            {rows.filter(Boolean).length === 0 && (
              <tr>
                <td colSpan="6" className="empty">No positions yet</td>
              </tr>
            )}
            {rows.filter(Boolean).map((r, idx) => (
              <tr key={idx}>
                <td>{r.ticker}</td>
                <td>{r.qty}</td>
                <td>{r.avgCost}</td>
                <td>{r.market}</td>
                <td className={r.mtm >= 0 ? "positive" : "negative"}>
                  {r.mtm}
                </td>
                <td className={r.realized >= 0 ? "positive" : "negative"}>
                  {r.realized}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ marginTop: "12px", fontWeight: "bold" }}>
          <p>Total MTM PnL: <span className={totalMTM >= 0 ? "positive" : "negative"}>{totalMTM.toFixed(2)}</span></p>
          <p>Overall Realized P/L: <span className={totalRealized >= 0 ? "positive" : "negative"}>{totalRealized.toFixed(2)}</span></p>
        </div>
      </div>
    </section>
  );
}
