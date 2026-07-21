from dataclasses import asdict
from datetime import datetime
from zoneinfo import ZoneInfo
from statistics import median

from app.services.market_data import get_market_data_provider
from app.market.models import *
from app.engines.trend import calculate_trend
from app.engines.levels import calculate_levels
from app.engines.positioning import summarize_option_chain
from app.engines.volatility import calculate_iv_metrics
from app.engines.risk import calculate_risk
from app.engines.strategy import calculate_strategies
from app.engines.entry import calculate_entry

class DashboardService:
    def get_dashboard(self) -> DashboardResponse:
        provider=get_market_data_provider(); nifty=provider.get_nifty_snapshot(); vix=provider.get_vix_snapshot(); candles=provider.get_nifty_candles(); sectors=[SectorData(**asdict(x)) for x in provider.get_sector_snapshots()]
        try: chain=provider.get_nifty_option_chain() if hasattr(provider,"get_nifty_option_chain") else []
        except Exception: chain=[]
        atm=round(nifty.ltp/50)*50; atm_rows=sorted(chain,key=lambda x:abs(x["strike"]-atm))[:11] if chain else []
        atm_rows=sorted(atm_rows,key=lambda x:x["strike"]); pos=summarize_option_chain(atm_rows)
        overall,overall_status,frames=calculate_trend(candles)
        try: futures_raw=provider.get_nifty_futures_snapshot() if hasattr(provider,"get_nifty_futures_snapshot") else None
        except Exception: futures_raw=None
        try: breadth_raw=provider.get_breadth_snapshot() if hasattr(provider,"get_breadth_snapshot") else None
        except Exception: breadth_raw=None
        supports,resistances=calculate_levels(candles,nifty.ltp,atm_rows)
        latest_vwap=candles[-1].vwap if candles and candles[-1].vwap is not None else nifty.ltp
        def level(strike,kind):
            row=next((x for x in atm_rows if x["strike"]==strike),{})
            oi=row.get("put_oi" if kind=="support" else "call_oi",0); ch=row.get("put_oi_change" if kind=="support" else "call_oi_change",0)
            maxoi=max([x.get("put_oi" if kind=="support" else "call_oi",0) for x in atm_rows] or [0]); score=round(50+50*oi/maxoi) if maxoi else 50
            d=strike-nifty.ltp
            return LevelDetail(strike=strike,score=min(100,score),oi=oi,oi_change=ch,distance=round(d,2),distance_percent=round(d/nifty.ltp*100,2) if nifty.ltp else 0)
        s1,s2=level(supports[0],"support"),level(supports[1],"support"); r1,r2=level(resistances[0],"resistance"),level(resistances[1],"resistance")
        price_score=70 if nifty.ltp>latest_vwap else 30; price_status="Above VWAP" if nifty.ltp>latest_vwap else "Below VWAP"
        option_score=50; option_status="UNAVAILABLE"
        if pos and pos["pcr_oi"] is not None:
            option_score=max(0,min(100,round(50+(pos["pcr_oi"]-1)*35))); option_status="Put OI Dominant" if pos["pcr_oi"]>1.05 else "Call OI Dominant" if pos["pcr_oi"]<0.95 else "Balanced"
        vol_status="LOW" if vix.value<12 else "NORMAL" if vix.value<18 else "ELEVATED" if vix.value<25 else "HIGH"; vol_score=max(0,min(100,round(100-vix.value*2)))
        fut_score=50; fut_status="UNAVAILABLE"
        if futures_raw:
            basis=futures_raw["price"]-nifty.ltp
            fut_score=max(0,min(100,round(50+basis/2)))
            fut_status="PREMIUM" if basis>0 else "DISCOUNT" if basis<0 else "FLAT"
        breadth_score=None; breadth_status="UNAVAILABLE"
        if breadth_raw:
            total=breadth_raw["advances"]+breadth_raw["declines"]+breadth_raw["unchanged"]
            breadth_score=round(100*breadth_raw["advances"]/total) if total else 50
            breadth_status="BROAD BULLISH" if breadth_score>=60 else "BROAD BEARISH" if breadth_score<=40 else "MIXED"
        components=[RegimeComponent(parameter="Trend Score",score=overall,status=overall_status.title()),RegimeComponent(parameter="Futures Positioning",score=fut_score if futures_raw else 0,status=fut_status),RegimeComponent(parameter="Options Positioning",score=option_score,status=option_status),RegimeComponent(parameter="Market Breadth",score=breadth_score or 0,status=breadth_status),RegimeComponent(parameter="Volatility",score=vol_score,status=vol_status.title()),RegimeComponent(parameter="Price Structure",score=price_score,status=price_status)]
        valid=[overall,option_score if pos else None,fut_score if futures_raw else None,breadth_score,vol_score,price_score]; valid=[x for x in valid if x is not None]; regime_score=round(sum(valid)/len(valid)); direction="BULLISH" if regime_score>=58 else "BEARISH" if regime_score<=42 else "NEUTRAL"
        # Use a robust near-ATM IV median. Reject clearly invalid/unstable IV
        # values rather than allowing one bad option quote to report 100%+ IV.
        near_iv = []
        for row in sorted(atm_rows, key=lambda x: abs(x["strike"] - atm))[:5]:
            for field in ("call_iv", "put_iv"):
                value = row.get(field)
                if value is not None and 1.0 <= float(value) <= 100.0:
                    near_iv.append(float(value))
        atm_iv = round(median(near_iv), 2) if near_iv else None
        iv_percentile,iv_rank=calculate_iv_metrics(atm_iv)
        risk_score,risk_level,risk_env,risk_reasons=calculate_risk(vix.value,breadth_raw,futures_raw,overall)
        preferred,neutral,avoid=calculate_strategies(direction,vix.value,pos["pcr_oi"] if pos else None,risk_env)
        entry_status,entry_reasons=calculate_entry(nifty.ltp,s1.strike,r1.strike,preferred,risk_env)
        return DashboardResponse(market=MarketStatus(status="OPEN",timestamp=datetime.now(ZoneInfo("Asia/Kolkata")).isoformat()),nifty=NiftyData(**asdict(nifty)),vix=VixData(**asdict(vix)),candles=[asdict(x) for x in candles],regime=MarketRegime(score=regime_score,direction=direction,volatility=vol_status,final_regime=f"{direction} + {vol_status} VOLATILITY",components=components),trend=TrendData(overall_score=overall,overall_status=overall_status,timeframes=[TrendTimeframe(**x) for x in frames]),futures=FuturesData(price=futures_raw["price"] if futures_raw else None,basis=round(futures_raw["price"]-nifty.ltp,2) if futures_raw else None,oi=futures_raw["oi"] if futures_raw else None,oi_change_percent=futures_raw.get("oi_change_percent") if futures_raw else None,signal=fut_status),option_chain=OptionChainSummary(atm_strike=atm,max_call_oi_strike=pos["max_call"]["strike"] if pos else 0,max_put_oi_strike=pos["max_put"]["strike"] if pos else 0,max_call_oi=pos["max_call"]["call_oi"] if pos else 0,max_put_oi=pos["max_put"]["put_oi"] if pos else 0,pcr_oi=pos["pcr_oi"] if pos else None,pcr_volume=pos["pcr_volume"] if pos else None,strikes=[OptionChainStrike(strike=x["strike"],call_oi=x["call_oi"],call_oi_change=x["call_oi_change"],put_oi=x["put_oi"],put_oi_change=x["put_oi_change"]) for x in atm_rows]),levels=LevelsData(support_1=s1,support_2=s2,resistance_1=r1,resistance_2=r2,vwap=latest_vwap),volatility=VolatilityData(atm_iv=atm_iv,iv_percentile=iv_percentile,iv_rank=iv_rank,regime=vol_status if atm_iv is not None else "UNAVAILABLE"),breadth=BreadthData(**breadth_raw) if breadth_raw else BreadthData(advances=0,declines=0,unchanged=0,advance_decline_ratio=0,new_52_week_high=0,new_52_week_low=0,stocks_above_200_dma=0),sectors=sectors,entry=EntryData(status=entry_status,entry_low=s1.strike,entry_high=r1.strike,current_price=nifty.ltp,invalidation=s2.strike,reasons=entry_reasons),risk=RiskData(score=risk_score,level=risk_level,environment=risk_env,reasons=risk_reasons),strategies=StrategyData(preferred=preferred,neutral=neutral,avoid=avoid))

dashboard_service=DashboardService()
