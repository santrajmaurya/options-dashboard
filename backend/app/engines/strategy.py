def calculate_strategies(regime, vix, pcr, risk_environment):
    if risk_environment == "DATA INCOMPLETE": return [], [], []
    preferred=[]; neutral=[]; avoid=[]
    if vix < 12: preferred.append("Defined-risk credit spreads")
    elif vix < 20: preferred.extend(["Iron Condor", "Credit Spreads"])
    else: preferred.append("Wide defined-risk spreads")
    if regime == "BULLISH": preferred.append("Bull Put Spread")
    elif regime == "BEARISH": preferred.append("Bear Call Spread")
    else: neutral.append("Iron Condor")
    if pcr is not None and (pcr < .65 or pcr > 1.5): avoid.append("Aggressive naked option selling")
    return preferred,neutral,avoid
