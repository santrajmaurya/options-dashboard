from dataclasses import asdict
from datetime import datetime
from zoneinfo import ZoneInfo

from app.services.market_data import get_market_data_provider
from app.market.models import *
from app.engines.trend import calculate_trend
from app.engines.levels import calculate_levels
from app.engines.positioning import summarize_option_chain

class DashboardService:
    def get_dashboard(self) -> DashboardResponse:
        provider=get_market_data_provider(); nifty=provider.get_nifty_snapshot(); vix=provider.get_vix_snapshot(); candles=provider.get_nifty_candles(); sectors=[SectorData(**asdict(x)) for x in provider.get_sector_snapshots()]
        try: chain=provider.get_nifty_option_chain() if hasattr(provider,"get_nifty_option_chain") else []
        except Exception: chain=[]
        atm=round(nifty.ltp/50)*50; atm_rows=sorted(chain,key=lambda x:abs(x["strike"]-atm))[:11] if chain else []
        atm_rows=sorted(atm_rows,key=lambda x:x["strike"]); pos=summarize_option_chain(atm_rows)
        overall,overall_status,frames=calculate_trend(candles)
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
        components=[RegimeComponent(parameter="Trend Score",score=overall,status=overall_status.title()),RegimeComponent(parameter="Futures Positioning",score=0,status="UNAVAILABLE"),RegimeComponent(parameter="Options Positioning",score=option_score,status=option_status),RegimeComponent(parameter="Market Breadth",score=0,status="UNAVAILABLE"),RegimeComponent(parameter="Volatility",score=vol_score,status=vol_status.title()),RegimeComponent(parameter="Price Structure",score=price_score,status=price_status)]
        valid=[overall,option_score if pos else None,vol_score,price_score]; valid=[x for x in valid if x is not None]; regime_score=round(sum(valid)/len(valid)); direction="BULLISH" if regime_score>=58 else "BEARISH" if regime_score<=42 else "NEUTRAL"
        atm_row=min(atm_rows,key=lambda x:abs(x["strike"]-atm)) if atm_rows else None; atm_iv=round(((atm_row.get("call_iv",0)+atm_row.get("put_iv",0))/2),2) if atm_row and (atm_row.get("call_iv") or atm_row.get("put_iv")) else None
        return DashboardResponse(market=MarketStatus(status="OPEN",timestamp=datetime.now(ZoneInfo("Asia/Kolkata")).isoformat()),nifty=NiftyData(**asdict(nifty)),vix=VixData(**asdict(vix)),candles=[asdict(x) for x in candles],regime=MarketRegime(score=regime_score,direction=direction,volatility=vol_status,final_regime=f"{direction} + {vol_status} VOLATILITY",components=components),trend=TrendData(overall_score=overall,overall_status=overall_status,timeframes=[TrendTimeframe(**x) for x in frames]),futures=FuturesData(price=None,basis=None,oi=None,oi_change_percent=None,signal="UNAVAILABLE"),option_chain=OptionChainSummary(atm_strike=atm,max_call_oi_strike=pos["max_call"]["strike"] if pos else 0,max_put_oi_strike=pos["max_put"]["strike"] if pos else 0,max_call_oi=pos["max_call"]["call_oi"] if pos else 0,max_put_oi=pos["max_put"]["put_oi"] if pos else 0,pcr_oi=pos["pcr_oi"] if pos else None,pcr_volume=pos["pcr_volume"] if pos else None,strikes=[OptionChainStrike(strike=x["strike"],call_oi=x["call_oi"],call_oi_change=x["call_oi_change"],put_oi=x["put_oi"],put_oi_change=x["put_oi_change"]) for x in atm_rows]),levels=LevelsData(support_1=s1,support_2=s2,resistance_1=r1,resistance_2=r2,vwap=latest_vwap),volatility=VolatilityData(atm_iv=atm_iv,iv_percentile=None,iv_rank=None,regime=vol_status if atm_iv is not None else "UNAVAILABLE"),breadth=BreadthData(advances=0,declines=0,unchanged=0,advance_decline_ratio=0,new_52_week_high=0,new_52_week_low=0,stocks_above_200_dma=0),sectors=sectors,entry=EntryData(status="WAIT",entry_low=s1.strike,entry_high=r1.strike,current_price=nifty.ltp,invalidation=s2.strike,reasons=["Waiting for validated strategy and risk inputs."]),risk=RiskData(score=0,level="UNAVAILABLE",environment="DATA INCOMPLETE",reasons=["Futures OI and breadth inputs are not yet available."]),strategies=StrategyData(preferred=[],neutral=[],avoid=[]))

dashboard_service=DashboardService()
