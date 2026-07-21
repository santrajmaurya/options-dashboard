def calculate_entry(price, support, resistance, strategies, risk_environment):
    if risk_environment == "DATA INCOMPLETE" or not strategies:
        return "WAIT", ["Waiting for complete futures/breadth inputs and a validated strategy."]
    if support <= price <= resistance: return "READY", ["Price is inside the current support/resistance entry zone."]
    return "WAIT", ["Price is outside the current entry zone."]
