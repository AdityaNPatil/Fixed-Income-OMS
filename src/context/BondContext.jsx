import { createContext, useState, useEffect } from "react";
import { initialBonds } from "../data/bonds";

export const BondContext = createContext();

export const BondProvider = ({ children }) => {
  const [bonds, setBonds] = useState(initialBonds);
  const [selectedBond, setSelectedBond] = useState(null);
  const [orders, setOrders] = useState([]);
  const [trades, setTrades] = useState([]);

  // --- Random price fluctuations (simulate market) ---
  useEffect(() => {
    const interval = setInterval(() => {
      setBonds((prev) =>
        prev.map((b) => {
          const bidChange = (Math.random() - 0.5) * 0.3;
          const askChange = (Math.random() - 0.5) * 0.3;
          return {
            ...b,
            bid: +(b.bid + bidChange).toFixed(2),
            ask: +(b.ask + askChange).toFixed(2),
          };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- Order monitoring: fills, stops, partials ---
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((o) => {
          if (o.status === "WORKING" || o.status === "NEW") {
            const bond = bonds.find((b) => b.ticker === o.ticker);
            if (!bond) return o;

            const execPrice = o.side === "BUY" ? bond.ask : bond.bid;

            // --- Stop Trigger Activation ---
            if (o.stop) {
              if (
                (o.side === "BUY" && bond.ask >= Number(o.stop)) ||
                (o.side === "SELL" && bond.bid <= Number(o.stop))
              ) {
                const fillQty = Number(o.qty);
                setTrades((prev) => [
                  ...prev,
                  {
                    orderId: o.id,
                    side: o.side,
                    ticker: o.ticker,
                    qty: fillQty,
                    price: execPrice,
                    time: new Date().toLocaleTimeString(),
                  },
                ]);
                return { ...o, status: "FILLED", filledQty: fillQty };
              }
            }

            // --- Market Orders ---
            if (o.orderType === "MARKET") {
              const fillQty = Number(o.qty);
              setTrades((prev) => [
                ...prev,
                {
                  orderId: o.id,
                  side: o.side,
                  ticker: o.ticker,
                  qty: fillQty,
                  price: execPrice,
                  time: new Date().toLocaleTimeString(),
                },
              ]);
              return { ...o, status: "FILLED", filledQty: fillQty };
            }

            // --- Limit Orders ---
            if (o.orderType === "LIMIT") {
              if (
                (o.side === "BUY" && execPrice <= Number(o.price)) ||
                (o.side === "SELL" && execPrice >= Number(o.price))
              ) {
                const fillQty =
                  Math.random() > 0.5 ? Number(o.qty) : Math.floor(o.qty / 2);
                setTrades((prev) => [
                  ...prev,
                  {
                    orderId: o.id,
                    side: o.side,
                    ticker: o.ticker,
                    qty: fillQty,
                    price: execPrice,
                    time: new Date().toLocaleTimeString(),
                  },
                ]);
                return {
                  ...o,
                  status:
                    fillQty === Number(o.qty)
                      ? "FILLED"
                      : "PARTIALLY_FILLED",
                  filledQty: fillQty,
                };
              }
            }
          }
          return o;
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [bonds]);

  // --- Place new order ---
  const placeOrder = (order) => {
    setOrders((prev) => [
      ...prev,
      { ...order, id: prev.length + 1, status: "NEW" },
    ]);
  };

  // --- Cancel Order ---
  const cancelOrder = (id) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id && o.status === "WORKING"
          ? { ...o, status: "CANCELLED" }
          : o
      )
    );
  };

  // --- Amend Order ---
  const amendOrder = (id, newQty, newPrice) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              qty: newQty ? Number(newQty) : o.qty,
              price: newPrice ? Number(newPrice) : o.price,
              status: "WORKING", // re-activates order so it can execute later
            }
          : o
      )
    );
  };

  return (
    <BondContext.Provider
      value={{
        bonds,
        setBonds,
        selectedBond,
        setSelectedBond,
        orders,
        setOrders,
        trades,
        setTrades,
        placeOrder,
        cancelOrder,
        amendOrder,
      }}
    >
      {children}
    </BondContext.Provider>
  );
};
