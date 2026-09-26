const PRESETS = [
  {
    key: 'cyclone',
    title: 'Severe Cyclonic Storm "DANA" Imminent Landfall',
    category: 'Meteorological',
    severity: 'Extreme',
    urgency: 'Immediate',
    issuingAuthority: 'India Meteorological Department (IMD) & NDMA',
    rawTechnicalBulletin: `BULLETIN NO. 18 / MET-EOC-2024:
DEEP DEPRESSION OVER EAST-CENTRAL BAY OF BENGAL INTENSIFIED INTO A SEVERE CYCLONIC STORM "DANA".
SYSTEM PRESENTLY CENTRED AT LATITUDE 19.8°N AND LONGITUDE 85.8°E, APPROXIMATELY 180 KM SOUTH-SOUTHEAST OF PURI.
EXPECTED ISOBARIC PRESSURE MINIMA REACHING 972 HPA.
CONVECTIVE CYCLOGENESIS EXHIBITING SQUALLY WINDS WITH GALE SPEED COMMENCING 120-130 KMPH GUSTING TO 145 KMPH.
ASTRONOMICAL TIDE COUPLING ANTICIPATES INUNDATION BY STORM SURGE OF HEIGHT 1.5 TO 2.0 METERS OVER ASTRONOMICAL TIDE.
TOTAL PRECIPITATION EXCEEDING 250MM IN LOCALIZED ZONES.
ALL MARITIME TRAFFIC ORDERED TO VACATE. MANDATORY RELOCATION PROTOCOLS COMMENCED FOR LOW-LYING RIPARIAN COMMUNITES.`,
    affectedArea: {
      name: 'Puri & Jagatsinghpur Coastal Belt',
      state: 'Odisha',
      coordinates: {
        lat: 19.8135,
        lng: 85.8312,
      },
      radiusKm: 55,
    },
    visualAssets: {
      colorCode: '#FF0055',
      iconType: 'cyclone',
      evacuationShelters: [
        {
          id: 'SHELTER-01',
          name: 'Puri Multi-Purpose Cyclone Shelter #4',
          distanceKm: 2.4,
          capacity: 1200,
          occupied: 850,
          lat: 19.824,
          lng: 85.821,
          status: 'Open',
        },
        {
          id: 'SHELTER-02',
          name: 'Konark Government High School Pucca Relief Center',
          distanceKm: 8.7,
          capacity: 800,
          occupied: 420,
          lat: 19.891,
          lng: 86.094,
          status: 'Open',
        },
        {
          id: 'SHELTER-03',
          name: 'Astaranga Coastal Community Bunker',
          distanceKm: 14.2,
          capacity: 1500,
          occupied: 1100,
          lat: 19.982,
          lng: 86.265,
          status: 'Open',
        },
      ],
    },
  },
  {
    key: 'flood',
    title: 'Catastrophic Flash Flood & Embankment Breach',
    category: 'Hydrological',
    severity: 'Severe',
    urgency: 'Immediate',
    issuingAuthority: 'Central Water Commission (CWC) & State Disaster Management',
    rawTechnicalBulletin: `CWC EMERGENCY HYDRO-BULLETIN #42:
UNPRECEDENTED DISCHARGE OF 1.15 MILLION CUSECS RECORDED AT MUNDALI WEIR OWING TO CONTINUOUS GAUGE RISES IN UPPER CATCHMENT BASIN.
DANGER LEVEL (DL) BREACHED AT 97.4 FT. MAJOR EMBANKMENT INTEGRITY COMPROMISE NOTED AT RIGHT DYKE CHAINAGE 4.2 KM.
HYDRAULIC PRESSURE GENERATING UNCONTROLLED SHEET INUNDATION ACROSS ADJACENT PANCHAYATS.
DISCHARGE VELOCITY ESTIMATED AT 4.8 M/S. IMMEDIATE SUBMERSION OF RESIDENTIAL LOW-GRADIENT SETTLEMENTS IMMINENT.
COMMENCE EVACUATION OF DOMESTIC MAMMAL POPULATION AND VULNERABLE CITIZENRY TO ELEVATED REINFORCED BUNDS.`,
    affectedArea: {
      name: 'Mahanadi Lower Basin & Cuttack Delta',
      state: 'Odisha',
      coordinates: {
        lat: 20.4625,
        lng: 85.8828,
      },
      radiusKm: 35,
    },
    visualAssets: {
      colorCode: '#00F2FE',
      iconType: 'flood',
      evacuationShelters: [
        {
          id: 'SHELTER-FL-1',
          name: 'Mahanadi High Bund Relief Camp',
          distanceKm: 1.8,
          capacity: 900,
          occupied: 620,
          lat: 20.471,
          lng: 85.875,
          status: 'Open',
        },
        {
          id: 'SHELTER-FL-2',
          name: 'Choudwar Polytech High Altitude Ground',
          distanceKm: 5.6,
          capacity: 1400,
          occupied: 710,
          lat: 20.523,
          lng: 85.912,
          status: 'Open',
        },
      ],
    },
  },
  {
    key: 'chemical',
    title: 'Industrial Toxic Ammonia / Chlorine Vapor Plume',
    category: 'Industrial',
    severity: 'Extreme',
    urgency: 'Immediate',
    issuingAuthority: 'State Pollution Control Board & District Collector',
    rawTechnicalBulletin: `HAZMAT SATELLITE DISPATCH ALERT:
CATASTROPHIC RUPTURE DETECTED IN STORAGE TANK V-401 CONTAINING HIGH-PRESSURE LIQUEFIED ANHYDROUS AMMONIA.
TOXIC PLUME DISPERSION ESTIMATED WITH GROUND LEVEL CONCENTRATION EXCEEDING 350 PPM (IDLH THRESHOLD).
WIND VECTOR 240 DEGREES AT 14 KNOTS PROPELLING TOXIC CLOUD TOWARDS HABITATIONS.
INHALATION RISKS ACUTE PULMONARY EDEMA AND CORNEA LACERATION.
IMMEDIATE DEPLOYMENT OF WATER CURTAIN SCRUBBERS. RESIDENTS ENJOINED TO RESIDE IN AIRTIGHT RECESSES.`,
    affectedArea: {
      name: 'Paradeep Industrial Port Area',
      state: 'Odisha',
      coordinates: {
        lat: 20.2644,
        lng: 86.6713,
      },
      radiusKm: 25,
    },
    visualAssets: {
      colorCode: '#FFB703',
      iconType: 'chemical',
      evacuationShelters: [
        {
          id: 'SHELTER-CHEM-1',
          name: 'Paradeep Upwind Civil Hospital Medical Bunker',
          distanceKm: 3.1,
          capacity: 650,
          occupied: 280,
          lat: 20.281,
          lng: 86.643,
          status: 'Open',
        },
      ],
    },
  },
];

module.exports = { PRESETS };
