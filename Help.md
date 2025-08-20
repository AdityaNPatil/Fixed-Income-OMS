Nice — I’ll walk you through every single requirement in plain language, with the prerequisite concepts you need, clear definitions, and step-by-step examples so a complete finance beginner can understand it. I’ll keep the math explicit and show how values are calculated so there’s no guessing.

Prerequisites — what to know first

Before diving into the UI requirements, these foundational concepts will make everything else clear.

1. What is a bond (very simply)
A bond is like an IOU issued by a company or government. If you buy a bond you are lending money; the issuer promises to pay:
	•	regular interest (the coupon) and
	•	the principal back at the maturity date.

Typical shorthand:
	•	Par / Face value — the amount the issuer repays at maturity (commonly quoted as 100 or 1,000).
	•	Price — how much you pay now (often shown as a percentage of par: e.g., price = 99.85 means 99.85% of par).

2. Units & quoting convention
	•	If price is 99.85 and par = 100, the bond costs ₹99.85 per ₹100 of face value.
	•	Market participants talk in par and percent of par a lot.

3. Market price vs last trade vs bid/ask
	•	Bid = the highest price someone is willing to buy at (you sell at the bid).
	•	Ask (offer) = the lowest price someone is willing to sell at (you buy at the ask).
	•	Last price = price of the most recent trade.
	•	Spread = ask − bid (wider spread = less liquidity).

4. Order basics
	•	Market order: execute immediately at market prices.
	•	Limit order: execute only at a specified price or better.
	•	Stop/Trigger order: sits dormant until a trigger price is reached, then becomes market/limit.
	•	Time in Force (TIF): how long the order stays active (DAY, IOC = immediate-or-cancel, GTC = good-til-cancelled).

5. Profit & loss (P/L) basics
	•	Realized P/L — profit or loss when you actually sell (cash P/L).
	•	Unrealized (MTM) — value change while you still hold the position, computed using current market price.

6. Inventory accounting methods
	•	FIFO (First-In-First-Out) — when you sell, assume earliest bought lots are sold first.
	•	LIFO (Last-In-First-Out) — when you sell, assume latest bought lots are sold first.
These affect realized P/L and average cost.

⸻

Requirement 1 — Market Watch Screen

This screen displays live information about bonds. Below are each of the fields you listed, explained for a beginner.

Ticker code

What it is: short identifier for the bond (e.g., US10Y-2030, or an exchange ticker).
Why it matters: quick human-readable reference. Usually there’s also a unique identifier like ISIN for exact identification.

Bid / Ask

Meaning: the prices at which you can immediately sell (bid) or buy (ask).
Example: Bid = 99.80, Ask = 100.05. If you want to sell right now you’ll get 99.80; to buy right now you pay 100.05. The spread 100.05 − 99.80 = 0.25 indicates how costly/illiquid quick execution is.

Yield to Maturity (YTM)

Meaning: the annualized return you would get if you buy the bond now and hold to maturity, assuming all coupons are paid and reinvested at that rate. It’s the internal rate of return of the bond cash flows.
Why it matters: YTM is the most common way to compare returns between bonds with different coupons and prices.

Simple approximate example (2-year bond)
	•	Par = 100, coupon = 5% → coupon payment = 5 per year.
	•	Price = 95, years to maturity = 2.
Use the common approximation:
\text{approx YTM} = \frac{C + \frac{F - P}{n}}{\frac{F + P}{2}}
where C = annual coupon (5), F = par (100), P = price (95), n = years (2).

Step-by-step:
	1.	F - P = 100 - 95 = 5.
	2.	(F - P)/n = 5/2 = 2.5.
	3.	Numerator = C + (F-P)/n = 5 + 2.5 = 7.5.
	4.	Denominator (F + P)/2 = (100 + 95)/2 = 195/2 = 97.5.
	5.	Approx YTM = 7.5 / 97.5 = 0.076923… = 7.692\%.

So even though the coupon is 5%, because you bought at a discount (95) your YTM is ~7.69%.

Note: exact YTM uses present value math and is solved iteratively — the formula above is a standard approximation that is great for intuition.

Current yield

Definition: annual coupon divided by current price. It ignores reinvestment and capital gain/loss.
Example with the same numbers: coupon = 5, price = 95 → current yield = 5 / 95 = 0.0526316 = 5.263%.
So current yield < YTM in this example because YTM includes the capital gain (you will receive par at maturity).

Face value (Par)

Definition: amount repaid at maturity (per bond). Often the price is quoted as % of this.
Example: face/par = 100. A price of 101 means you pay 101 per 100 par.

Days to maturity

Definition: remaining calendar days until the bond repays principal. Investors use this to judge near-term vs long-term risk and interest rate sensitivity.

Modified duration

Conceptual: a measure of price sensitivity to interest-rate changes. Specifically: approx percent price change ≈ −(modified duration) × (change in yield in decimals).
Example: If modified duration = 6, and yields rise by 1% (i.e., 0.01 in decimal), price change ≈ −6 × 0.01 = −0.06 = −6%.
Step-by-step for a 0.5% increase:
	•	change in yield = 0.005.
	•	price change ≈ −6 × 0.005 = −0.03 = −3%.
So higher duration means higher sensitivity.

Bond characteristics

Short descriptions you’ll see on the UI:
	•	Government / Corporate — issuer type; government bonds are usually safer.
	•	Fixed / Floating — fixed coupon vs rate that adjusts (floating).
	•	Bullet — pays coupons and full principal at maturity (no amortization).
	•	Callable — issuer can repay early at specified terms (risk to investor).
	•	Puttable — investor can sell back to issuer at a date/price (protective).
	•	Zero-coupon — no coupon; sold at a discount; returns come from price appreciation to par.

Important dates
	•	Issue date — when bond was issued.
	•	Coupon dates — when interest payments occur (e.g., semi-annual).
	•	Call dates — earliest dates issuer can call (if callable).
	•	Maturity date — when par is repaid.
	•	Ex-coupon date — last date to buy and still receive the next coupon (useful for accrued interest).

⸻

Requirement 2 — Order Execution Window (how orders work & examples)

This is the screen for placing and configuring trades. Here are all bullets explained with examples.

Buy / Sell orders
	•	Buy = take a long position (lend to issuer).
	•	Sell = reduce/close a long position (or create a short if you were allowed to short).

Example: If you buy 100 bonds at price 100, and par=100, you pay 100 × 100 = 10,000.

Disclosed Quantity (Iceberg orders)

What it is: you want to trade a large total size, but publicly only show a smaller slice. As each disclosed slice is filled, another slice becomes visible. This reduces market impact.

Example:
	•	Total order = 10,000 (face).
	•	Disclosed = 1,000.
Market sees 1,000. If that 1,000 fills, the system exposes the next 1,000, until the full 10,000 is done. This helps hide full intent.

Why use it: prevents big moves in price that occur when others see a large order.

Stop Loss (Trigger)

Two common usages:
	•	Stop-loss on a long position (sell stop): place a stop price below current price so if the market falls to the stop, your position is sold (limits further loss).
	•	Buy stop (stop-entry): used to enter a position if price moves above a level (e.g., breakout).

Example (sell stop):
	•	You bought 100 bonds at 102. Current price 102.
	•	You set a sell stop at 99 (stop-loss).
	•	If last price falls to 99 or below, the stop order activates and becomes a market order, then executes at the next available price (maybe 98.5 due to slippage).
Calculations:
Value at 102: 100 × 102 = 10,200.
If stop executes at 98.5: proceeds = 100 × 98.5 = 9,850.
Loss = 10,200 − 9,850 = 350.

Important: a stop becomes a market (or stop-limit) when triggered; execution price may be worse than the stop because of market moves.

Conditional Orders

These are orders that only become active if another condition is true (price, yield, index level, time). They help automate complex strategies.

Examples:
	•	Price condition: “Place a buy limit when last price ≤ 98.”
	•	YTM condition: “Place a buy when YTM ≥ 7%” — useful if you want to capture higher yields.

Use case: You want to buy if yields rise above a threshold (higher yields = lower price), so you set a conditional buy.

Time In Force (TIF)
	•	DAY: the order expires at the end of the trading day if not filled.
	•	IOC (Immediate or Cancel): fill immediately as much as possible; cancel remainder.
	•	GTC (Good ’til Cancelled): stays active until filled or cancelled (might be limited by exchange rules).

⸻

Requirement 3 — Trade Management Window

This allows monitoring and controlling orders and executions.

View and manage open trades

Open orders means orders placed but not fully filled. The trade management screen shows status (NEW, WORKING, PARTIAL, FILLED, CANCELLED).

Example statuses:
	•	NEW = submitted but not active yet (maybe waiting on condition).
	•	WORKING = active in the market.
	•	PARTIAL = partially filled.
	•	FILLED = fully executed.
	•	CANCELLED = user or system cancelled.

Cancel existing orders
	•	Cancel removes an order from the market (if not yet filled).
	•	If an order is partially filled, cancelling affects only the remaining unfilled portion.

Example: Order for 1,000; 400 filled; cancel results in order final status PARTIAL with 600 cancelled/not executed.

Amend executions (Modify an order)
	•	Amend price/qty/TIF while order is working (subject to market/exchange rules).
	•	You cannot amend an order to a quantity less than what’s already executed.

Example:
	•	You placed order: Qty 1,000. 350 executed. If you attempt to set Qty = 300, system must either block that (because 350 already executed) or treat as invalid. Setting new Qty = 900 is allowed (remaining becomes 900 − 350 = 550).

Partial fills, order slices, and working quantity
	•	Orders can fill in pieces. The management screen should show executed qty, remaining qty, and the current working/exposed slice for iceberg orders.

Audit trail & history
	•	The system should keep a log of order placements, amendments, cancels and executions. This is critical for compliance and for tracking realized P/L.

⸻

Requirement 4 — Net Position Window (P/L & inventory accounting)

This window summarizes your overall positions and profits. I’ll explain how net position, FIFO/LIFO, realized and MTM work with concrete numbers.

Net position & weighted average price

Weighted average price (simple) =
\text{Average cost} = \frac{\sum(\text{qty}_i \times \text{price}_i)}{\sum \text{qty}_i}
This is the dollar (or rupee) cost per unit for your held quantity.

FIFO vs LIFO — why it matters

When you sell some of your holdings, your realized P/L depends on which lots you’re considered to have sold.

I’ll show a full numeric example.

Scenario (simple numbers):
	•	Par per bond = 100 (price quoted as % of par). We’ll treat the prices as currency units for clarity.
	•	Trade 1: Buy 100 bonds @ 99.00
	•	Trade 2: Buy 50 bonds  @ 101.00
	•	Trade 3: Sell 80 bonds @ 100.00
	•	After these, compute realized P/L and remaining position under FIFO and LIFO.

Step-by-step (FIFO)
	1.	FIFO sells from the earliest buy lots.
	2.	First lot is 100 @ 99.00. To sell 80, take 80 from that lot.
	•	Cost basis for sold shares = 80 × 99.00 = 7,920.
	•	Proceeds from sale = 80 × 100.00 = 8,000.
	•	Realized P/L = proceeds − cost = 8,000 − 7,920 = 80 (profit).
	3.	Remaining inventory after sale:
	•	From first lot: 100 − 80 = 20 @ 99.00
	•	Second lot: 50 @ 101.00
	•	Net qty = 20 + 50 = 70.
	4.	Weighted average cost of remaining lots:
	•	Total cost = 20×99 + 50×101 = 1,980 + 5,050 = 7,030.
	•	Avg cost = 7,030 / 70 = 100.428571… ≈ 100.43.
	5.	If the last market price is 102.00, unrealized (MTM) = (102.00 − 100.428571) × 70 = 1.571429 × 70 = 110.0 (approx).

So under FIFO: realized = +80, unrealized = +110.

Step-by-step (LIFO)
	1.	LIFO sells from the latest buy lots.
	2.	Latest lot is 50 @ 101.00; sell 50 from it, then 30 from first lot.
	•	Cost basis sold = (50×101) + (30×99) = 5,050 + 2,970 = 8,020.
	•	Proceeds from sale = 80 × 100 = 8,000.
	•	Realized P/L = 8,000 − 8,020 = −20 (loss).
	3.	Remaining inventory:
	•	First lot left: 100 − 30 = 70 @ 99.00
	•	Net qty = 70.
	4.	Avg cost = 70 × 99 / 70 = 99.00 (all remaining are at 99).
	5.	MTM at last price 102.00 = (102 − 99) × 70 = 3 × 70 = 210.0.

So under LIFO: realized = −20, unrealized = +210.

Key takeaways:
	•	FIFO and LIFO produce different realized P/L and average cost — this matters for performance reporting and tax/ledger reasons.
	•	Total P/L (realized + unrealized) in both methods for this moment should be identical:
	•	FIFO total = 80 + 110 = 190.
	•	LIFO total = −20 + 210 = 190.
The split between realized and unrealized differs, but the combined economic result is the same (for these trades at that price).

Mark-to-Market (MTM)

Definition: revalue positions at current market price.
Formula (per asset):
\text{MTM P/L} = (\text{Market price} - \text{Average cost}) \times \text{Net qty} \times \frac{\text{face}}{100}
(If price quoted as % of par, multiply by face/100 to convert to currency.)

Small numeric example (using earlier FIFO numbers):
	•	Net qty = 70, avg cost ≈ 100.428571, market price = 102, face = 100.
	•	Price difference = 102 − 100.428571 = 1.571429.
	•	MTM = 1.571429 × 70 × (100/100) = 1.571429 × 70 = 110.0.

Overall profit or loss

Combine:
	•	Realized P/L (from completed sells)
	•	Unrealized/MTM (on open positions)
Net P/L = realized + unrealized.

⸻

Short glossary / cheat sheet
	•	Par/Face — amount repaid at maturity.
	•	Bid / Ask — price to sell / buy right now.
	•	YTM — expected annualized return to maturity (exact requires PV math).
	•	Current yield — coupon / current price.
	•	Duration — approximate sensitivity of price to 1% yield change.
	•	Iceberg / Disclosed Qty — show only a slice of a large order.
	•	Stop — trigger price that activates an order.
	•	Limit — price control that prevents execution worse than this.
	•	IOC / DAY / GTC — order time-in-force options.
	•	FIFO / LIFO — lot consumption methods that affect realized P/L.
	•	MTM — mark-to-market, unrealized P/L using current market prices.

⸻

Practical tips for beginners
	1.	Start small — use small lots to learn how order types behave in live markets.
	2.	Watch spreads — wide spreads can eat expected gains; prefer liquid bonds for execution.
	3.	Beware settlement — settlement (T+1, T+2 depending on market) matters for cash management and counterparty risk.
	4.	Use stop orders carefully — they protect downside but can trigger in volatile markets and execute at worse prices.
	5.	Record keeping — keep an audit trail of orders and fills (essential for accurate realized P/L).

⸻

If you want, I can:
	•	produce a one-page cheat sheet (PDF or printable) summarizing this;
	•	annotate the web UI elements from your earlier HTML with short help tips for each field (hover text and microcopy); or
	•	give a step-by-step walkthrough showing a full demo trade lifecycle (place order → partial fills → amend → cancel → settlement) with the exact numbers seen in the UI simulator I built earlier.

Which of those would help next?