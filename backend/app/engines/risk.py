def calculate_risk(vix, breadth, futures, trend_score):
    reasons=[]; score=0
    score += min(35, max(0, (vix-12)*2.5))
    score += min(30, abs(trend_score-50)*0.6)
    if breadth:
        total=breadth["advances"]+breadth["declines"]
        if total: score += abs(breadth["advances"]-breadth["declines"])/total*20
    else: reasons.append("Market breadth constituent keys are not configured.")
    if futures is None: reasons.append("NIFTY futures quote/OI is unavailable.")
    score=round(min(100,score))
    level="HIGH" if score>=70 else "ELEVATED" if score>=45 else "MODERATE" if score>=25 else "LOW"
    env="DATA INCOMPLETE" if reasons else ("RISK-OFF" if score>=70 else "CAUTIOUS" if score>=45 else "NORMAL")
    return score,level,env,reasons
