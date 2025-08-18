import { useEffect, useMemo, useReducer, useRef } from 'react'
import { initialBonds } from '../data/bonds'

const fmtInt = (v)=> Number(v).toLocaleString()
const nowStr = ()=> new Date().toLocaleTimeString()
const uid = (p='ID')=> p + '-' + Math.random().toString(36).slice(2,8).toUpperCase()
const clamp = (n,min,max)=> Math.max(min, Math.min(max, n))

const STORAGE_KEY = 'oms_state_v1'

const initialState = (()=>{
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try { 
      const parsed = JSON.parse(saved)
      return parsed
    } catch {}
  }
  const lastPrice = {}
  initialBonds.forEach(b => lastPrice[b.ticker] = +(((b.bid + b.ask)/2).toFixed(2)))
  return {
    bonds: initialBonds,
    lastPrice,
    orders: [],   // {id,time,ticker,side,qty,remaining,disclosed,workingExposed,type,limit,stop,cond,tif,status}
    execs: [],    // {id,time,ordId,ticker,side,qty,price}
    realized: 0,
    costMode: 'FIFO'
  }
})()

function reducer(state, action){
  switch(action.type){
    case 'TICK': {
      // market simulation tick
      const bonds = state.bonds.map(b => {
        const mid = (b.bid + b.ask)/2
        const shock = (Math.random() - 0.5) * 0.20 // +/-10 bps on price
        const newMid = clamp(mid + shock, 90, 110)
        const spread = 0.10 + Math.random() * 0.15
        const bid = +(newMid - spread/2).toFixed(2)
        const ask = +(newMid + spread/2).toFixed(2)
        const ytm = +clamp(b.ytm + (mid - newMid) * 0.12, 0.10, 15).toFixed(2)
        const currentYield = +clamp(b.currentYield + (mid - newMid) * 0.10, 0.05, 15).toFixed(2)
        return { ...b, bid, ask, ytm, currentYield }
      })
      const lastPrice = { ...state.lastPrice }
      bonds.forEach(b => lastPrice[b.ticker] = +(((b.bid + b.ask)/2).toFixed(2)))
      return { ...state, bonds, lastPrice }
    }
    case 'PLACE_ORDER': {
      const o = action.order
      return { ...state, orders: [o, ...state.orders] }
    }
    case 'SET_ORDERS': {
      return { ...state, orders: action.orders }
    }
    case 'ADD_EXEC': {
      return { ...state, execs: [action.exec, ...state.execs], realized: state.realized + (action.realizedDelta || 0) }
    }
    case 'SET_REALIZED': {
      return { ...state, realized: action.value }
    }
    case 'SET_COSTMODE': {
      return { ...state, costMode: action.mode }
    }
    case 'LOAD_STATE': {
      return action.state
    }
    default:
      return state
  }
}

export function useOmsStore(){
  const [state, dispatch] = useReducer(reducer, initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  // Persist to localStorage
  useEffect(()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Market ticker
  useEffect(()=>{
    const id = setInterval(()=>{
      dispatch({ type: 'TICK' })
      checkOrderTriggersAndMatch()
    }, 1500)
    return ()=> clearInterval(id)
  }, [])

  // Helpers
  const marketFor = (ticker)=> stateRef.current.bonds.find(b => b.ticker === ticker)
  const last = (ticker)=> stateRef.current.lastPrice[ticker] ?? ((marketFor(ticker).bid + marketFor(ticker).ask)/2)

  function placeOrder(payload){
    const { ticker, side, qty, type, limit, disclosed, stop, cond, tif } = payload
    const o = {
      id: uid('ORD'), time: nowStr(), ticker, side, qty, remaining: qty,
      disclosed: disclosed > 0 ? disclosed : null, workingExposed: 0,
      type, limit: limit ?? null, stop: stop ?? null,
      cond: cond?.type ? cond : null, tif, status: 'NEW'
    }
    dispatch({ type: 'PLACE_ORDER', order: o })
    // immediate check
    setTimeout(checkOrderTriggersAndMatch, 0)
    return o.id
  }

  function cancelOrder(id){
    const orders = stateRef.current.orders.map(o => o.id === id && !['FILLED','CANCELLED'].includes(o.status) ? { ...o, status: 'CANCELLED' } : o)
    dispatch({ type: 'SET_ORDERS', orders })
  }

  function amendOrder(id, changes){
    const orders = stateRef.current.orders.map(o => {
      if (o.id !== id) return o
      let newQty = o.qty
      let remaining = o.remaining
      if (changes.limit !== undefined){
        const lim = parseFloat(changes.limit)
        o = { ...o, limit: isNaN(lim) ? o.limit : lim, type: 'LIMIT' }
      }
      if (changes.qty !== undefined){
        const q = parseInt(changes.qty, 10)
        if (!isNaN(q)){
          newQty = Math.max(q, (o.qty - o.remaining))
          remaining = newQty - (o.qty - o.remaining)
        }
      }
      return { ...o, qty: newQty, remaining, status: remaining > 0 ? 'WORKING' : 'FILLED', workingExposed: 0 }
    })
    dispatch({ type: 'SET_ORDERS', orders })
    setTimeout(checkOrderTriggersAndMatch, 0)
  }

  function addExec(ex, realizedDelta=0){
    dispatch({ type: 'ADD_EXEC', exec: ex, realizedDelta })
  }

  // Matching + triggers
  function checkOrderTriggersAndMatch(){
    const s = stateRef.current
    let orders = s.orders.slice()

    // evaluate triggers/conditions and working state
    orders = orders.map(o => {
      if (['CANCELLED', 'FILLED'].includes(o.status)) return o
      const md = marketFor(o.ticker)
      const lp = last(o.ticker)

      // Stop trigger
      if (o.stop && o.status === 'NEW'){
        if ((o.side === 'BUY' && lp >= o.stop) || (o.side === 'SELL' && lp <= o.stop)){
          return { ...o, status: 'TRIGGERED' }
        }
      }

      // Condition
      let condOk = true
      if (o.cond && o.cond.type){
        if (o.cond.type === 'LAST_PRICE_LE') condOk = lp <= o.cond.val
        if (o.cond.type === 'LAST_PRICE_GE') condOk = lp >= o.cond.val
        if (o.cond.type === 'YTM_GE') condOk = md.ytm >= o.cond.val
        if (o.cond.type === 'YTM_LE') condOk = md.ytm <= o.cond.val
      }

      if ((!o.stop && !o.cond?.type) && o.status === 'NEW') return { ...o, status: 'WORKING' }
      if (o.status === 'TRIGGERED' && condOk) return { ...o, status: 'WORKING' }
      if (o.status === 'WORKING' && !condOk) return { ...o, status: 'NEW' }
      return o
    })

    // match pass
    const newExecs = []
    orders = orders.map(o => {
      if (!['WORKING', 'PARTIAL'].includes(o.status)) return o
      const md = marketFor(o.ticker)
      const pxCandidate = o.type === 'MARKET' ? (o.side === 'BUY' ? md.ask : md.bid) : o.limit
      let priceOk = (o.type === 'MARKET')
      if (!priceOk && o.type === 'LIMIT'){
        if (o.side === 'BUY') priceOk = md.ask <= o.limit
        if (o.side === 'SELL') priceOk = md.bid >= o.limit
      }
      if (!priceOk) return o

      let available = o.disclosed ? Math.min(o.disclosed - o.workingExposed, o.remaining) : o.remaining
      if (available <= 0){
        // refresh slice
        o = { ...o, workingExposed: 0 }
        available = o.disclosed ? Math.min(o.disclosed, o.remaining) : o.remaining
        if (available <= 0) return o
      }

      const slice = Math.max(1, Math.floor(available * (0.3 + Math.random() * 0.7)))
      const fillQty = Math.min(slice, o.remaining)
      const fillPrice = o.type === 'MARKET' ? (o.side === 'BUY' ? md.ask : md.bid) : pxCandidate

      const ex = { id: uid('EX'), time: nowStr(), ordId: o.id, ticker: o.ticker, side: o.side, qty: fillQty, price: fillPrice }
      newExecs.push(ex)

      // update order
      const remaining = o.remaining - fillQty
      const workingExposed = o.disclosed ? o.workingExposed + fillQty : o.workingExposed
      const status = remaining > 0 ? 'PARTIAL' : 'FILLED'
      return { ...o, remaining, workingExposed, status }
    })

    // IOC cancellation
    orders = orders.map(o => (o.tif === 'IOC' && ['NEW','WORKING'].includes(o.status)) ? { ...o, status: 'CANCELLED' } : o)

    // Commit
    dispatch({ type: 'SET_ORDERS', orders })
    newExecs.forEach(ex => addExec(ex, 0))
  }

  // Derived data
  const helpers = useMemo(()=> ({
    fmtInt, last, marketFor, placeOrder, cancelOrder, amendOrder
  }), [])

  return { state, dispatch, helpers }
}

// P&L assembly helpers (used by NetPosition)
export function assembleLotsForMode(execs, ticker, costMode, face){
  const trades = execs.filter(x => x.ticker === ticker).slice().reverse() // oldest first
  let lots = []
  let realized = 0
  const pushLot = (qty, price)=>{
    if (lots.length && Math.sign(lots[lots.length-1].qty) === Math.sign(qty) && lots[lots.length-1].price === price){
      lots[lots.length-1].qty += qty
    } else {
      lots.push({ qty, price })
    }
  }
  trades.forEach(tr => {
    if (tr.side === 'BUY'){
      pushLot(tr.qty, tr.price)
    } else {
      let qty = tr.qty
      while (qty > 0){
        const idx = costMode === 'FIFO' 
          ? lots.findIndex(l => l.qty > 0)
          : [...lots].map((l,i)=>[i,l]).reverse().find(e => e[1].qty > 0)?.[0]
        if (idx === undefined || idx === -1){
          pushLot(-qty, tr.price)
          qty = 0; break
        }
        const lot = lots[idx]
        const take = Math.min(lot.qty, qty)
        realized += (tr.price - lot.price) * take * (face/100)
        lot.qty -= take
        qty -= take
        if (lot.qty === 0) lots.splice(idx, 1)
      }
    }
  })
  return { lots, realized }
}
