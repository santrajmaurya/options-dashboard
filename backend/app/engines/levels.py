def calculate_levels(candles, current_price, option_chain=None):
    if not candles:
        step=50; supports=[current_price-step,current_price-2*step]; resistances=[current_price+step,current_price+2*step]
    else:
        lookback=candles[-36:]
        lows=sorted({round(c.low/50)*50 for c in lookback if c.low<current_price}, reverse=True)
        highs=sorted({round(c.high/50)*50 for c in lookback if c.high>current_price})
        supports=(lows+[round(current_price/50)*50-50,round(current_price/50)*50-100])[:2]
        resistances=(highs+[round(current_price/50)*50+50,round(current_price/50)*50+100])[:2]
    if option_chain:
        puts=sorted([x for x in option_chain if x["strike"]<=current_price],key=lambda x:x.get("put_oi",0),reverse=True)
        calls=sorted([x for x in option_chain if x["strike"]>=current_price],key=lambda x:x.get("call_oi",0),reverse=True)
        if puts: supports=[x["strike"] for x in puts[:2]]
        if calls: resistances=[x["strike"] for x in calls[:2]]
    return supports[:2],resistances[:2]
