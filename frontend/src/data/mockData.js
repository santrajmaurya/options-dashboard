export const watchlist = [
  { name: "NIFTY", value: "25,152.35", points: "+132.45", change: "+0.53%" },
  { name: "BANKNIFTY", value: "51,362.70", points: "+310.20", change: "+0.61%" },
  { name: "FINNIFTY", value: "23,812.85", points: "+154.35", change: "+0.65%" },
  { name: "INDIA VIX", value: "13.42", points: "+0.45", change: "+3.47%" },
  { name: "SENSEX", value: "82,396.47", points: "+412.23", change: "+0.50%" },
];

export const trendData = [
  { timeframe: "5 Minute", trend: "PULLBACK", direction: "↓", strength: "38/100", type: "bear" },
  { timeframe: "15 Minute", trend: "BULLISH", direction: "↑", strength: "68/100", type: "bull" },
  { timeframe: "1 Hour", trend: "BULLISH", direction: "↑", strength: "72/100", type: "bull" },
  { timeframe: "Daily", trend: "BULLISH", direction: "↑", strength: "78/100", type: "bull" },
];

export const priceLevels = [
  ["SPOT PRICE", "25,152.35", ""],
  ["VWAP", "25,058.70", "ABOVE"],
  ["DAY OPEN", "25,020.15", "ABOVE"],
  ["PREV CLOSE", "25,019.90", "ABOVE"],
  ["PDH (Prev Day High)", "25,120.60", "BROKEN"],
  ["PDL (Prev Day Low)", "24,850.40", "ABOVE"],
  ["OPENING RANGE HIGH", "25,080.25", ""],
  ["OPENING RANGE LOW", "24,940.80", ""],
];

export const chartData = [
  { time: "09:15", price: 25020, vwap: 25015 },
  { time: "09:25", price: 24970, vwap: 25012 },
  { time: "09:35", price: 25030, vwap: 25015 },
  { time: "09:45", price: 25065, vwap: 25020 },
  { time: "10:00", price: 25025, vwap: 25028 },
  { time: "10:15", price: 25090, vwap: 25036 },
  { time: "10:30", price: 25055, vwap: 25043 },
  { time: "10:45", price: 25115, vwap: 25049 },
  { time: "11:00", price: 25128, vwap: 25053 },
  { time: "11:15", price: 25105, vwap: 25056 },
  { time: "11:30", price: 25145, vwap: 25058 },
  { time: "11:45", price: 25138, vwap: 25059 },
  { time: "12:00", price: 25152, vwap: 25059 },
];

export const futuresData = [
  ["5 Min", "25,174.0", "+0.48%", "1.72 Cr", "+1.62%", "Long Build-up"],
  ["15 Min", "25,168.5", "+0.52%", "1.70 Cr", "+2.85%", "Long Build-up"],
  ["30 Min", "25,157.0", "+0.45%", "1.68 Cr", "+3.74%", "Long Build-up"],
  ["Session", "25,152.0", "+0.53%", "1.72 Cr", "+5.31%", "Strong Long Build-up"],
];

export const optionChain = [
  ["1,820", "+210", "24,800", "1,950", "+450"],
  ["2,210", "+320", "24,900", "2,650", "+680"],
  ["3,150", "+520", "25,000", "5,280", "+950"],
  ["4,820", "+610", "25,100", "6,450", "+1,120"],
  ["3,210", "+410", "25,200", "4,120", "+780"],
  ["2,150", "+250", "25,300", "2,980", "+420"],
];

export const supports = [
  { level: "25,000", score: 91 },
  { level: "24,900", score: 72 },
  { level: "24,800", score: 51 },
  { level: "24,700", score: 32 },
];

export const resistances = [
  { level: "25,200", score: 53 },
  { level: "25,300", score: 89 },
  { level: "25,400", score: 65 },
  { level: "25,500", score: 34 },
];

export const sectors = [
  ["BANKING", "+1.12%", "↑", "bull"],
  ["IT", "+0.85%", "↑", "bull"],
  ["AUTO", "+0.48%", "↑", "bull"],
  ["PHARMA", "-0.12%", "↓", "bear"],
  ["METAL", "-0.35%", "↓", "bear"],
];