import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";

const toTimestamp = (dateTime) =>
  Math.floor(new Date(dateTime).getTime() / 1000);

const candles = [
  { time: toTimestamp("2024-05-23T09:15:00+05:30"), open: 25020, high: 25035, low: 24995, close: 25010 },
  { time: toTimestamp("2024-05-23T09:20:00+05:30"), open: 25010, high: 25018, low: 24970, close: 24982 },
  { time: toTimestamp("2024-05-23T09:25:00+05:30"), open: 24982, high: 25015, low: 24972, close: 25008 },
  { time: toTimestamp("2024-05-23T09:30:00+05:30"), open: 25008, high: 25042, low: 24998, close: 25035 },
  { time: toTimestamp("2024-05-23T09:35:00+05:30"), open: 25035, high: 25075, low: 25025, close: 25065 },
  { time: toTimestamp("2024-05-23T09:40:00+05:30"), open: 25065, high: 25078, low: 25038, close: 25045 },
  { time: toTimestamp("2024-05-23T09:45:00+05:30"), open: 25045, high: 25082, low: 25040, close: 25075 },
  { time: toTimestamp("2024-05-23T09:50:00+05:30"), open: 25075, high: 25095, low: 25058, close: 25088 },
  { time: toTimestamp("2024-05-23T09:55:00+05:30"), open: 25088, high: 25102, low: 25062, close: 25070 },
  { time: toTimestamp("2024-05-23T10:00:00+05:30"), open: 25070, high: 25110, low: 25065, close: 25102 },
  { time: toTimestamp("2024-05-23T10:05:00+05:30"), open: 25102, high: 25122, low: 25090, close: 25115 },
  { time: toTimestamp("2024-05-23T10:10:00+05:30"), open: 25115, high: 25128, low: 25098, close: 25105 },
  { time: toTimestamp("2024-05-23T10:15:00+05:30"), open: 25105, high: 25135, low: 25100, close: 25128 },
  { time: toTimestamp("2024-05-23T10:20:00+05:30"), open: 25128, high: 25142, low: 25115, close: 25135 },
  { time: toTimestamp("2024-05-23T10:25:00+05:30"), open: 25135, high: 25140, low: 25118, close: 25125 },
  { time: toTimestamp("2024-05-23T10:30:00+05:30"), open: 25125, high: 25152, low: 25120, close: 25145 },
  { time: toTimestamp("2024-05-23T10:35:00+05:30"), open: 25145, high: 25160, low: 25132, close: 25152 },
];

const vwap = candles.map((c, index) => ({
  time: c.time,
  value: 25010 + index * 3.05,
}));

export default function NiftyCandlestickChart() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 230,
      layout: {
        background: { color: "#091929" },
        textColor: "#8295aa",
      },
      grid: {
        vertLines: { color: "#14283a" },
        horzLines: { color: "#14283a" },
      },
      rightPriceScale: {
        borderColor: "#203449",
      },
      timeScale: {
        borderColor: "#203449",
        timeVisible: true,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#23d77c",
      downColor: "#ff525b",
      borderUpColor: "#23d77c",
      borderDownColor: "#ff525b",
      wickUpColor: "#23d77c",
      wickDownColor: "#ff525b",
    });

    candleSeries.setData(candles);

    const vwapSeries = chart.addSeries(LineSeries, {
      color: "#f4c936",
      lineWidth: 2,
      title: "VWAP",
    });

    vwapSeries.setData(vwap);

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  return <div ref={containerRef} className="candlestick-chart" />;
}