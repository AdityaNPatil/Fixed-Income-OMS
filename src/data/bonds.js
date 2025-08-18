export const initialBonds = [
  {
    ticker: "US10Y-2030", isin: "US912828YY10", issuer: "U.S. Treasury",
    bid: 99.85, ask: 100.00, ytm: 3.45, currentYield: 3.20, face: 100000, daysToMat: 1825, modDur: 6.8,
    characteristics: ["Government", "Fixed", "USD", "Bullet"],
    dates: { issue: "2020-08-15", coupon: "Semi-Annual (Feb/Aug)", call: "Non-callable", maturity: "2030-08-15" },
  },
  {
    ticker: "INR-GSEC-2029", isin: "IN1234567890", issuer: "Govt. of India",
    bid: 98.40, ask: 98.70, ytm: 6.95, currentYield: 6.50, face: 100000, daysToMat: 1460, modDur: 5.9,
    characteristics: ["Government", "Fixed", "INR", "Bullet"],
    dates: { issue: "2019-06-01", coupon: "Annual (Jun)", call: "Non-callable", maturity: "2029-06-01" },
  },
  {
    ticker: "TATA-26C", isin: "INE081A08026", issuer: "Tata Motors",
    bid: 101.10, ask: 101.50, ytm: 7.40, currentYield: 7.05, face: 100000, daysToMat: 365 * 1, modDur: 0.9,
    characteristics: ["Corporate", "Fixed", "INR", "Senior"],
    dates: { issue: "2023-07-01", coupon: "Annual (Jul)", call: "Callable @ 100 after 6m", maturity: "2026-07-01" },
  },
  {
    ticker: "EU-BUND-2034", isin: "DE0001102465", issuer: "Germany",
    bid: 96.20, ask: 96.35, ytm: 2.35, currentYield: 2.10, face: 100000, daysToMat: 3300, modDur: 9.1,
    characteristics: ["Government", "Fixed", "EUR", "Bullet"],
    dates: { issue: "2024-05-10", coupon: "Annual (May)", call: "Non-callable", maturity: "2034-05-10" },
  },
  {
    ticker: "APPLE-31", isin: "US037833AK11", issuer: "Apple Inc.",
    bid: 102.75, ask: 103.05, ytm: 4.10, currentYield: 3.80, face: 100000, daysToMat: 2200, modDur: 6.0,
    characteristics: ["Corporate", "Fixed", "USD", "Senior"],
    dates: { issue: "2021-04-20", coupon: "Semi-Annual (Apr/Oct)", call: "Make-whole", maturity: "2031-04-20" },
  },
  {
    ticker: "JPN-GOV-2040", isin: "JP1234567890", issuer: "Japan Government",
    bid: 97.10, ask: 97.25, ytm: 1.20, currentYield: 1.10, face: 100000, daysToMat: 5400, modDur: 12.2,
    characteristics: ["Government", "Fixed", "JPY", "Bullet"],
    dates: { issue: "2020-01-10", coupon: "Annual (Jan)", call: "Non-callable", maturity: "2040-01-10" },
  },
  {
    ticker: "RELIANCE-28", isin: "INE002A08014", issuer: "Reliance Industries",
    bid: 100.40, ask: 100.75, ytm: 6.85, currentYield: 6.60, face: 100000, daysToMat: 1100, modDur: 3.1,
    characteristics: ["Corporate", "Fixed", "INR", "Senior"],
    dates: { issue: "2022-12-01", coupon: "Annual (Dec)", call: "Callable after 2y", maturity: "2028-12-01" },
  },
  {
    ticker: "UK-GILT-2032", isin: "GB00BM8Z2F89", issuer: "UK Treasury",
    bid: 99.00, ask: 99.25, ytm: 3.75, currentYield: 3.50, face: 100000, daysToMat: 2700, modDur: 7.8,
    characteristics: ["Government", "Fixed", "GBP", "Bullet"],
    dates: { issue: "2022-09-15", coupon: "Semi-Annual (Mar/Sep)", call: "Non-callable", maturity: "2032-09-15" },
  }
];
