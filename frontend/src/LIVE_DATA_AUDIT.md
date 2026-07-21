# Live Data Mapping Audit

## Already mapped from dashboard state
- Topbar: `market` + `nifty`
- MarketRegime: `regime`
- MultiTimeframeTrend: `trend`
- PriceAndLevels: `nifty`, `levels`, `candles`
- FuturesOI: `futures`
- OptionChain: `option_chain`, `nifty`
- SupportResistance: `levels`, `nifty`, `option_chain`
- PCRVolatility: `option_chain`, `vix`
- IVMetrics: `volatility`
- MarketBreadth: `breadth`
- SectorStrength: `sectors`
- StrategyEnvironment: `strategies`
- EntryStatus: `entry`
- RiskEvents: `risk`

## Still hardcoded/mock on the frontend
- Sidebar watchlist imports `watchlist` from `src/data/mockData.js`.
- Sidebar mini trend bars use hardcoded pattern arrays.
- Topbar notification badge is hardcoded to `3`.
- Topbar trading mode is a local select default (`expiry`), not backend-driven.
- Footer data source/quality labels are static strings.
- EntryStatus's `15 Min Close` invalidation note is static presentation text.

## Important real-time limitation
`mergeDashboardUpdate.js` currently merges only:
- `market`
- `nifty`
- `vix`
- `sectors`

Therefore the following sections can be real on initial REST load but will NOT recalculate live from partial WebSocket updates unless the backend sends updated values and the merge function handles them:
- `regime`
- `trend`
- `candles`
- `futures`
- `option_chain`
- `levels`
- `volatility`
- `breadth`
- `entry`
- `risk`
- `strategies`

For true live dashboard behavior, the next backend/WebSocket step is to publish these derived sections when their inputs change, then extend `mergeDashboardUpdate.js` to merge them.
