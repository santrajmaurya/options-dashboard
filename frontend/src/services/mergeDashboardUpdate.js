export function mergeDashboardUpdate(current, update) {
  if (!current) {
    return current;
  }

  if (!update || update.type !== "market_update") {
    return current;
  }

  const next = {
    ...current,
  };

  if (update.market) {
    next.market = {
      ...(current.market ?? {}),
      ...update.market,
    };
  }

  if (update.nifty) {
    next.nifty = {
      ...(current.nifty ?? {}),
      ...update.nifty,
    };
  }

  if (update.vix) {
    next.vix = {
      ...(current.vix ?? {}),
      ...update.vix,
    };
  }

  if (update.watchlist) {
    next.watchlist = {
      ...(current.watchlist ?? {}),
      ...update.watchlist,
    };
  }

  if (Array.isArray(update.sectors)) {
    const existing = new Map(
      (current.sectors ?? []).map((sector) => [
        sector.instrument_key ?? sector.name,
        sector,
      ])
    );

    update.sectors.forEach((sector) => {
      const key = sector.instrument_key ?? sector.name;

      existing.set(key, {
        ...(existing.get(key) ?? {}),
        ...sector,
      });
    });

    next.sectors = Array.from(existing.values());
  }

  return next;
}
