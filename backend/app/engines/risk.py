def calculate_risk(vix, breadth, futures, trend_score):
    missing=[]; score=0
    score += min(35, max(0, (vix-12)*2.5))
    score += min(30, abs(trend_score-50)*0.6)
    if breadth:
        total=breadth["advances"]+breadth["declines"]
        if total: score += abs(breadth["advances"]-breadth["declines"])/total*20
    else: missing.append("Market breadth data is unavailable.")
    if futures is None: missing.append("NIFTY futures quote/OI is unavailable.")
    score=round(min(100,score))
    level="HIGH" if score>=70 else "ELEVATED" if score>=45 else "MODERATE" if score>=25 else "LOW"
    env="DATA INCOMPLETE" if missing else ("RISK-OFF" if score>=70 else "CAUTIOUS" if score>=45 else "NORMAL")
    if missing:
        reasons=missing
    elif level == "LOW":
        reasons=["No elevated risk condition is detected from the available volatility, breadth, futures and trend inputs."]
    elif level == "MODERATE":
        reasons=["Some risk pressure is present in the available volatility, breadth, futures or trend inputs."]
    else:
        reasons=["Elevated risk conditions are detected in the available market inputs."]
    return score,level,env,reasons
