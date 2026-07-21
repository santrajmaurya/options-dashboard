def summarize_option_chain(rows):
    if not rows: return None
    call=sum(x.get("call_oi",0) for x in rows); put=sum(x.get("put_oi",0) for x in rows)
    call_vol=sum(x.get("call_volume",0) for x in rows); put_vol=sum(x.get("put_volume",0) for x in rows)
    return {"pcr_oi": round(put/call,2) if call else None,"pcr_volume":round(put_vol/call_vol,2) if call_vol else None,"max_call":max(rows,key=lambda x:x.get("call_oi",0)),"max_put":max(rows,key=lambda x:x.get("put_oi",0))}
