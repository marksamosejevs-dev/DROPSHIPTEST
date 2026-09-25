# SUNPRO POWER inverters and batteries — information needed from AIDEX

The standard AIDEX packages must use SUNPRO POWER equipment only. The panels are
done (SP440-N108M10 Black Frame). The inverter and battery **cannot be selected
yet**: sunpropower.com is blocked from the build environment, and search results
did not verify a current SUNPRO residential three-phase hybrid inverter or
battery/ESS range.

## What the search could and could not confirm (September 2026)

| Finding | Source | Usable? |
|---|---|---|
| SUNPRO lists "Inverter", "Household energy storage" and "Industrial and commercial energy storage" categories, plus an ESS datasheet section | sunpropower.com (search index): `/download/datasheet/ess/`, `/sunpropower/2025/08/25/sunpro目录.pdf` (catalogue) | Confirms the categories exist, but gives no models |
| Off-grid, single-phase hybrid inverters SP1500-12S, SP3500-24S, SP11000-48L, SP11000T-48PL (48 V battery, PV 60–500 V) | SUNPRO catalogue PDF (search index) | **No.** These are off-grid, low-voltage, single-phase units, not suitable for grid-connected Latvian homes with a three-phase connection and state support |
| "Sunpro Power SP6KH3–SP12KH3" (three-phase hybrid?) and "SP3KL1–SP6KL1" | ENF directory (third party) only | **Not verified.** It is not confirmed that this is the same company (Zhejiang Sunpro Power) or a current product |
| "Sunpro Energy Tech", "SUNPRO Batteries", "sunpro-smart" battery and inverter products | Other companies with similar names | **No.** They are different manufacturers |

## Needed from you

### A. Inverter: one datasheet per model (official SUNPRO PDF)

Needed for the ~6, ~8 and ~10 kW packages (6.16 / 7.92 / 10.12 kWp DC, three-phase connection assumed):

1. Exact model names (e.g. the 6, 8 and 10/12 kW variants) and confirmation that they are **three-phase hybrid, grid-connected** inverters.
2. Rated AC power (kW) and maximum AC apparent power (kVA).
3. Maximum PV input power (kWp) and the permitted DC/AC oversizing.
4. Number of MPPTs, strings per MPPT, MPPT voltage range, maximum DC input voltage, and maximum input current per MPPT. These are needed to check 14 / 18 / 23 panels of SP440-N108M10 (Voc 38.53 V, Isc 14.43 A).
5. Battery interface: high- or low-voltage, battery voltage range, and maximum charge/discharge power.
6. Backup / EPS function: whole-home or partial, switchover time, and whether it is three-phase or single-phase on backup.
7. Maximum and European efficiency.
8. IP rating, dimensions, weight, and operating temperature range (especially the minimum winter temperature).
9. Grid codes and certificates, in particular EN 50549-1 and anything required by Sadales tīkls for Latvia.
10. Monitoring: app name and Wi-Fi/LAN/4G options.
11. Product warranty (years) and the conditions for Latvia.
12. The list of SUNPRO batteries it is compatible with.

### B. Battery / ESS: one datasheet per model (official SUNPRO PDF)

1. Exact model names, and whether they are stackable modules or a single cabinet.
2. Chemistry (e.g. LiFePO4) and high- or low-voltage.
3. Module capacity (kWh), **usable** capacity (kWh), and the possible system sizes (e.g. 5 / 10 / 15 kWh). The current benchmark uses 16 kWh, so please state the nearest real SUNPRO configuration. State support requires at least 5 kWh.
4. Nominal voltage, and maximum continuous charge/discharge power.
5. Depth of discharge and cycle life, with the test conditions.
6. Installation (wall or floor), IP rating, operating and charging temperature range (**indoor/outdoor use in Latvian winter**), dimensions, and weight.
7. Certificates (e.g. IEC 62619, UN38.3, CE).
8. Warranty: years and warranted energy throughput / end-of-warranty capacity.
9. The list of compatible SUNPRO inverters.

### C. System-level information

1. The recommended inverter and battery pairing for each package (6 / 8 / 10 kW), if SUNPRO or AIDEX engineering already has one.
2. Is any accessory needed (smart meter/CT, backup box, BMS cable, gateway), and is it included in the package?
3. Product photos or renders that AIDEX is allowed to use (see IMAGE_REQUIREMENTS.md).
4. **The exact wording we may use for the AIDEX – SUNPRO POWER relationship.** Until you supply it, the site does not use "official", "exclusive" or country-specific representative wording. It goes in `ecosystem.relationship` in `src/config/company.ts`.

## How it goes into the site (no layout changes)

- Each model is added to `inverterCatalogue` / `batteryCatalogue` in `src/data/equipment.ts`. Unknown fields stay `null` and are hidden.
- Each package gets `inverter.productId` / `battery.productId` in `src/data/packages.ts`.
- The following then update automatically:
  - the comparison table rows, which show the brand and model instead of the generic "Hybrid inverter 6 kW" / "16 kWh";
  - one product page per model: inverters under `/lv/saules-paneli/<slug>/`, batteries under `/lv/akumulatori/<slug>/`, in LV/RU/EN with hreflang, sitemap and Product JSON-LD;
  - the "SUNPRO POWER equipment in AIDEX packages" band on the solar, batteries and packages pages, which grows from 1 card (panel) to 3 (panel, inverter, battery).
