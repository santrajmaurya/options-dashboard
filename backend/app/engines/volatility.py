import json
from pathlib import Path
from app.config import settings

def calculate_iv_metrics(atm_iv):
    if atm_iv is None or atm_iv <= 0: return None, None
    path=Path(settings.IV_HISTORY_FILE)
    try: hist=[float(x) for x in json.loads(path.read_text())]
    except Exception: hist=[]
    hist.append(float(atm_iv)); hist=hist[-1000:]
    try: path.write_text(json.dumps(hist))
    except Exception: pass
    if len(hist) < 20: return None, None
    percentile=100*sum(x <= atm_iv for x in hist)/len(hist)
    lo,hi=min(hist),max(hist); rank=100*(atm_iv-lo)/(hi-lo) if hi>lo else 50.0
    return round(percentile,2), round(rank,2)
