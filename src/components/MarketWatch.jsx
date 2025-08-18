import { useContext, useState } from "react";
import { BondContext } from "../context/BondContext";

export default function MarketWatch() {
  const { bonds, setSelectedBond } = useContext(BondContext);
  const [snapshot, setSnapshot] = useState(null);

  const handleSelect = (bond) => {
    setSelectedBond(bond);
    setSnapshot(bond);
  };

  return (
    <section className="panel active">
      <div className="card">
        <h2>Market Watch</h2>
        <div className="body">
          <table>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>ISIN</th>
                <th>Issuer</th>
                <th>Bid</th>
                <th>Ask</th>
                <th>YTM</th>
                <th>Current Yield</th>
                <th>Face</th>
                <th>Days to Maturity</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {bonds.map((b) => (
                <tr
                  key={b.ticker}
                  onClick={() => handleSelect(b)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{b.ticker}</td>
                  <td>{b.isin}</td>
                  <td>{b.issuer}</td>
                  <td>{b.bid}</td>
                  <td>{b.ask}</td>
                  <td>{b.ytm}%</td>
                  <td>{b.currentYield}%</td>
                  <td>{b.face}</td>
                  <td>{b.daysToMat}</td>
                  <td>{b.modDur}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted">Click a bond row to view snapshot & use in Order Execution</p>
        </div>
      </div>

      {/* Bond Snapshot */}
      {snapshot && (
        <div className="card snapshot">
          <h3>📊 Bond Snapshot — {snapshot.ticker}</h3>
          <div className="body">
            <p><strong>Issuer:</strong> {snapshot.issuer}</p>
            <p><strong>ISIN:</strong> {snapshot.isin}</p>
            <p><strong>Bid / Ask:</strong> {snapshot.bid} / {snapshot.ask}</p>
            <p><strong>Yield to Maturity:</strong> {snapshot.ytm}%</p>
            <p><strong>Current Yield:</strong> {snapshot.currentYield}%</p>
            <p><strong>Face Value:</strong> {snapshot.face}</p>
            <p><strong>Days to Maturity:</strong> {snapshot.daysToMat}</p>
            <p><strong>Modified Duration:</strong> {snapshot.modDur}</p>
            <p><strong>Characteristics:</strong> {snapshot.characteristics.join(", ")}</p>
            <p><strong>Issue Date:</strong> {snapshot.dates.issue}</p>
            <p><strong>Coupon:</strong> {snapshot.dates.coupon}</p>
            <p><strong>Call Feature:</strong> {snapshot.dates.call}</p>
            <p><strong>Maturity Date:</strong> {snapshot.dates.maturity}</p>
          </div>
        </div>
      )}
    </section>
  );
}
