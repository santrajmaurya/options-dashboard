import { useEffect, useRef } from "react";
import { CandlestickSeries, createChart, LineSeries } from "lightweight-charts";

// ==========================================
// TIMESTAMP NORMALIZER
// ==========================================

const toChartTimestamp = (value) => {
  if (typeof value === "number") {
    return value;
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return Math.floor(timestamp / 1000);
};

// ==========================================
// NIFTY CANDLESTICK CHART
// ==========================================

export default function NiftyCandlestickChart({ candles = [] }) {
  const containerRef = useRef(null);
  console.log("NiftyCandlestickChart data:", candles);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    // ======================================
    // CREATE CHART
    // ======================================

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 230,

      layout: {
        background: {
          color: "#091929",
        },
        textColor: "#8295aa",
      },

      grid: {
        vertLines: {
          color: "#14283a",
        },
        horzLines: {
          color: "#14283a",
        },
      },

      rightPriceScale: {
        borderColor: "#203449",
      },

      timeScale: {
        borderColor: "#203449",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // ======================================
    // CANDLE SERIES
    // ======================================

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#23d77c",
      downColor: "#ff525b",

      borderUpColor: "#23d77c",
      borderDownColor: "#ff525b",

      wickUpColor: "#23d77c",
      wickDownColor: "#ff525b",
    });

    // ======================================
    // VWAP SERIES
    // ======================================

    const vwapSeries = chart.addSeries(LineSeries, {
      color: "#f4c936",
      lineWidth: 2,
      title: "VWAP",
    });

    // ======================================
    // NORMALIZE API CANDLE DATA
    // ======================================

    const normalizedCandles = candles
      .map((candle) => {
        const time = toChartTimestamp(candle.timestamp ?? candle.time);

        if (time === null) {
          return null;
        }

        return {
          time,

          open: Number(candle.open),
          high: Number(candle.high),
          low: Number(candle.low),
          close: Number(candle.close),

          vwap:
            candle.vwap !== undefined && candle.vwap !== null
              ? Number(candle.vwap)
              : null,
        };
      })
      .filter(
        (candle) =>
          candle !== null &&
          Number.isFinite(candle.open) &&
          Number.isFinite(candle.high) &&
          Number.isFinite(candle.low) &&
          Number.isFinite(candle.close)
      );

    // ======================================
    // REMOVE DUPLICATE TIMESTAMPS
    //
    // Lightweight Charts requires each
    // series to contain unique timestamps.
    // If duplicate candles exist, the last
    // candle for that timestamp is retained.
    // ======================================

    const uniqueCandles = Array.from(
      new Map(normalizedCandles.map((candle) => [candle.time, candle])).values()
    ).sort((a, b) => a.time - b.time);

    // ======================================
    // SET CANDLE DATA
    // ======================================

    candleSeries.setData(
      uniqueCandles.map((candle) => ({
        time: candle.time,

        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }))
    );

    // ======================================
    // SET VWAP DATA
    // ======================================

    const vwapData = uniqueCandles
      .filter((candle) => Number.isFinite(candle.vwap))
      .map((candle) => ({
        time: candle.time,
        value: candle.vwap,
      }));

    if (vwapData.length > 0) {
      vwapSeries.setData(vwapData);
    }

    // ======================================
    // FIT CHART TO AVAILABLE DATA
    // ======================================

    if (uniqueCandles.length > 0) {
      chart.timeScale().fitContent();
    }

    // ======================================
    // RESPONSIVE RESIZE
    // ======================================

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) {
        return;
      }

      chart.applyOptions({
        width: containerRef.current.clientWidth,
      });
    });

    resizeObserver.observe(container);

    // ======================================
    // CLEANUP
    // ======================================

    return () => {
      resizeObserver.disconnect();

      chart.remove();
    };
  }, [candles]);

  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (!candles.length) {
    return (
      <div
        className="
          candlestick-chart
          candlestick-chart-empty
        "
      >
        No candle data available
      </div>
    );
  }

  // ==========================================
  // CHART CONTAINER
  // ==========================================

  return <div ref={containerRef} className="candlestick-chart" />;
}
