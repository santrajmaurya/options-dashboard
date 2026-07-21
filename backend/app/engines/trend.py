from app.services.market_data.base import MarketCandle


def _ema(values, period):
    if not values: return 0.0
    k=2/(period+1); e=values[0]
    for v in values[1:]: e=v*k+e*(1-k)
    return e

def analyze_candles(candles: list[MarketCandle], label: str):
    closes=[c.close for c in candles]
    if len(closes)<3:
        return {"timeframe":label,"direction":"FLAT","score":50,"status":"UNAVAILABLE"}
    e9=_ema(closes,9); e21=_ema(closes,21); last=closes[-1]
    momentum=(last/closes[max(0,len(closes)-6)]-1)*100 if closes[max(0,len(closes)-6)] else 0
    score=50 + (15 if last>e9 else -15) + (15 if e9>e21 else -15) + max(-20,min(20,momentum*10))
    score=round(max(0,min(100,score)))
    if score>=75: status="Strong Bullish"
    elif score>=58: status="Bullish"
    elif score<=25: status="Strong Bearish"
    elif score<=42: status="Bearish"
    else: status="Neutral"
    direction="UP" if score>55 else "DOWN" if score<45 else "FLAT"
    return {"timeframe":label,"direction":direction,"score":score,"status":status}

def resample(candles, factor):
    out=[]
    for i in range(0,len(candles),factor):
        g=candles[i:i+factor]
        if len(g)<factor: continue
        out.append(MarketCandle(timestamp=g[-1].timestamp,open=g[0].open,high=max(x.high for x in g),low=min(x.low for x in g),close=g[-1].close,volume=sum(x.volume for x in g),open_interest=g[-1].open_interest,vwap=g[-1].vwap))
    return out

def calculate_trend(candles):
    frames=[analyze_candles(candles,"5 Min"),analyze_candles(resample(candles,3),"15 Min"),analyze_candles(resample(candles,12),"1 Hour")]
    valid=[x for x in frames if x["status"]!="UNAVAILABLE"]
    overall=round(sum(x["score"] for x in valid)/len(valid)) if valid else 50
    status="STRONG BULLISH" if overall>=75 else "BULLISH" if overall>=58 else "STRONG BEARISH" if overall<=25 else "BEARISH" if overall<=42 else "NEUTRAL"
    return overall,status,frames
