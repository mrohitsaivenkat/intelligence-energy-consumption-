// Pre-configured appliance catalog, efficiency ratings, alternatives, and benchmark presets for 'Before You Buy'

export const APPLIANCE_CATALOG = {
  'Cooling & Ventilation': [
    {
      id: 'ac_1_5_ton',
      name: 'Air Conditioner (1.5 Ton)',
      category: 'Cooling & Ventilation',
      defaultHours: 8,
      defaultDays: 30,
      description: 'Major cooling unit for bedrooms & living rooms (120-180 sq ft)',
      ratings: [
        { label: '5-Star Inverter (Twin Rotary)', power: 1100, price: 42990, star: 5, ecoGrade: 'A++' },
        { label: '4-Star Inverter', power: 1350, price: 37990, star: 4, ecoGrade: 'A+' },
        { label: '3-Star Inverter', power: 1550, price: 32990, star: 3, ecoGrade: 'B' },
        { label: '3-Star Non-Inverter (Fixed Speed)', power: 1800, price: 27990, star: 3, ecoGrade: 'C' },
        { label: 'Unrated / Older Window AC', power: 2150, price: 22990, star: 1, ecoGrade: 'D' }
      ],
      efficientAlternative: {
        targetRatingIndex: 0,
        recommendedName: '5-Star Twin-Inverter AC (1100W)',
        reason: 'Consumes ~40% less power by throttling compressor down to 20% once set temperature is reached.',
        typicalPaybackMonths: 14
      }
    },
    {
      id: 'ac_1_ton',
      name: 'Air Conditioner (1.0 Ton)',
      category: 'Cooling & Ventilation',
      defaultHours: 7,
      defaultDays: 30,
      description: 'Suited for smaller bedrooms or study rooms (up to 120 sq ft)',
      ratings: [
        { label: '5-Star Inverter', power: 850, price: 33990, star: 5, ecoGrade: 'A++' },
        { label: '3-Star Inverter', power: 1150, price: 27990, star: 3, ecoGrade: 'B' },
        { label: 'Non-Inverter Standard', power: 1400, price: 22990, star: 2, ecoGrade: 'C' }
      ],
      efficientAlternative: {
        targetRatingIndex: 0,
        recommendedName: '5-Star Inverter AC (850W)',
        reason: 'Saves ~300 units per cooling season compared to standard units.',
        typicalPaybackMonths: 16
      }
    },
    {
      id: 'ac_2_ton',
      name: 'Air Conditioner (2.0 Ton)',
      category: 'Cooling & Ventilation',
      defaultHours: 8,
      defaultDays: 30,
      description: 'Heavy duty cooling for large halls, open-plan spaces (200-280 sq ft)',
      ratings: [
        { label: '5-Star Inverter Heavy Duty', power: 1550, price: 54990, star: 5, ecoGrade: 'A++' },
        { label: '3-Star Inverter', power: 2100, price: 44990, star: 3, ecoGrade: 'B' },
        { label: '3-Star Non-Inverter', power: 2600, price: 37990, star: 2, ecoGrade: 'C' }
      ],
      efficientAlternative: {
        targetRatingIndex: 0,
        recommendedName: '5-Star Inverter AC 2.0 Ton (1550W)',
        reason: 'Prevents massive demand spikes on home electrical panels during heatwaves.',
        typicalPaybackMonths: 12
      }
    },
    {
      id: 'ceiling_fan',
      name: 'Ceiling Fan',
      category: 'Cooling & Ventilation',
      defaultHours: 12,
      defaultDays: 30,
      description: 'All-day circulating airflow',
      ratings: [
        { label: '5-Star BLDC Motor (Brushless DC)', power: 28, price: 3200, star: 5, ecoGrade: 'A++' },
        { label: '3-Star Modern Induction Fan', power: 52, price: 2100, star: 3, ecoGrade: 'B' },
        { label: 'Standard Conventional Induction Fan', power: 75, price: 1450, star: 1, ecoGrade: 'D' }
      ],
      efficientAlternative: {
        targetRatingIndex: 0,
        recommendedName: '5-Star BLDC Motor Fan (28W)',
        reason: 'Uses 62% less electricity than standard 75W fans and runs 3x longer on home inverters.',
        typicalPaybackMonths: 11
      }
    },
    {
      id: 'air_cooler',
      name: 'Air Cooler (Desert / Tower)',
      category: 'Cooling & Ventilation',
      defaultHours: 8,
      defaultDays: 30,
      description: 'Evaporative cooling for dry and moderate climates',
      ratings: [
        { label: 'Inverter Honeycomb Desert Cooler', power: 150, price: 9500, star: 4, ecoGrade: 'A' },
        { label: 'Standard Desert Cooler', power: 230, price: 6200, star: 2, ecoGrade: 'C' },
        { label: 'Compact Personal Tower Cooler', power: 110, price: 4800, star: 3, ecoGrade: 'B' }
      ]
    },
    {
      id: 'table_stand_fan',
      name: 'Table / Pedestal Fan',
      category: 'Cooling & Ventilation',
      defaultHours: 6,
      defaultDays: 30,
      description: 'Portable high-velocity directional airflow',
      ratings: [
        { label: 'High-Efficiency BLDC Pedestal Fan', power: 30, price: 3400, star: 5, ecoGrade: 'A++' },
        { label: 'Standard Induction Pedestal Fan', power: 55, price: 1800, star: 3, ecoGrade: 'B' }
      ]
    },
    {
      id: 'exhaust_fan',
      name: 'Kitchen / Bathroom Exhaust Fan',
      category: 'Cooling & Ventilation',
      defaultHours: 4,
      defaultDays: 30,
      description: 'Air extraction and moisture removal',
      ratings: [
        { label: 'BLDC High-CFM Silent Exhaust', power: 18, price: 1850, star: 5, ecoGrade: 'A+' },
        { label: 'Standard Metallic Exhaust Fan', power: 45, price: 950, star: 2, ecoGrade: 'C' }
      ]
    }
  ],

  'Kitchen': [
    {
      id: 'refrigerator_double_door',
      name: 'Double Door Refrigerator (~260-340L)',
      category: 'Kitchen',
      defaultHours: 24,
      defaultDays: 30,
      description: 'Continuous 24/7 cooling for family groceries',
      ratings: [
        { label: '5-Star Smart Inverter Compressor', power: 75, price: 29990, star: 5, ecoGrade: 'A++' },
        { label: '3-Star Inverter Compressor', power: 110, price: 23990, star: 3, ecoGrade: 'B' },
        { label: '2-Star Non-Inverter Compressor', power: 165, price: 18990, star: 2, ecoGrade: 'C' }
      ],
      efficientAlternative: {
        targetRatingIndex: 0,
        recommendedName: '5-Star Smart Inverter Refrigerator (75W average)',
        reason: 'Linear inverter compressor modulates cooling output, saving ~220 kWh annually with whisper-quiet operation.',
        typicalPaybackMonths: 18
      }
    },
    {
      id: 'refrigerator_single_door',
      name: 'Single Door Refrigerator (~190L)',
      category: 'Kitchen',
      defaultHours: 24,
      defaultDays: 30,
      description: 'Compact continuous cooling for couples or small families',
      ratings: [
        { label: '5-Star Inverter Direct Cool', power: 50, price: 17990, star: 5, ecoGrade: 'A++' },
        { label: '3-Star Direct Cool', power: 85, price: 13990, star: 3, ecoGrade: 'B' },
        { label: '2-Star Conventional', power: 120, price: 11490, star: 2, ecoGrade: 'C' }
      ]
    },
    {
      id: 'refrigerator_side_by_side',
      name: 'Side-by-Side Refrigerator (~550-680L)',
      category: 'Kitchen',
      defaultHours: 24,
      defaultDays: 30,
      description: 'Large premium multi-door refrigeration unit',
      ratings: [
        { label: '5-Star AI Inverter Multi-Door', power: 130, price: 74990, star: 5, ecoGrade: 'A+' },
        { label: 'Standard Inverter Side-by-Side', power: 195, price: 54990, star: 3, ecoGrade: 'B' }
      ]
    },
    {
      id: 'induction_cooktop',
      name: 'Induction Cooktop',
      category: 'Kitchen',
      defaultHours: 1.5,
      defaultDays: 30,
      description: 'Flameless electromagnetic rapid cooking',
      ratings: [
        { label: 'High-Efficiency Inverter IGBT Induction', power: 1500, price: 3800, star: 5, ecoGrade: 'A+' },
        { label: 'Standard Induction Cooktop (2000W peak)', power: 1900, price: 2400, star: 3, ecoGrade: 'B' }
      ]
    },
    {
      id: 'microwave_oven',
      name: 'Microwave Oven (Convection)',
      category: 'Kitchen',
      defaultHours: 0.5,
      defaultDays: 30,
      description: 'Quick reheating, baking, and grilling',
      ratings: [
        { label: 'Inverter Convection Microwave', power: 950, price: 16500, star: 5, ecoGrade: 'A' },
        { label: 'Standard Convection Microwave', power: 1400, price: 10990, star: 3, ecoGrade: 'B' },
        { label: 'Solo Microwave (Reheating only)', power: 800, price: 5990, star: 3, ecoGrade: 'B' }
      ]
    },
    {
      id: 'electric_kettle',
      name: 'Electric Kettle (1.5 - 1.8L)',
      category: 'Kitchen',
      defaultHours: 0.3,
      defaultDays: 30,
      description: 'Instant water boiling for beverages',
      ratings: [
        { label: 'Fast Boiling Concealed Element Kettle', power: 1500, price: 1290, star: 4, ecoGrade: 'A' },
        { label: 'Heavy Duty Rapid Boil Kettle', power: 2000, price: 1890, star: 3, ecoGrade: 'B' }
      ]
    },
    {
      id: 'mixer_grinder',
      name: 'Mixer / Grinder / Food Processor',
      category: 'Kitchen',
      defaultHours: 0.4,
      defaultDays: 30,
      description: 'Grinding, blending, and spice prep',
      ratings: [
        { label: 'Copper Motor 500W Mixer', power: 500, price: 2490, star: 4, ecoGrade: 'A' },
        { label: 'Heavy Duty 750W Mixer', power: 750, price: 3490, star: 3, ecoGrade: 'B' },
        { label: 'Commercial 1000W Food Processor', power: 1000, price: 5990, star: 2, ecoGrade: 'C' }
      ]
    },
    {
      id: 'dishwasher',
      name: 'Dishwasher (12-14 Place)',
      category: 'Kitchen',
      defaultHours: 1,
      defaultDays: 30,
      description: 'Automated dishwashing with heated sanitation',
      ratings: [
        { label: 'A+++ BLDC Inverter Dishwasher (Eco 50°)', power: 900, price: 38990, star: 5, ecoGrade: 'A++' },
        { label: 'Standard Resistance Heated Dishwasher', power: 1450, price: 27990, star: 3, ecoGrade: 'B' }
      ]
    }
  ],

  'Laundry & Cleaning': [
    {
      id: 'washing_machine_front_load',
      name: 'Washing Machine (Front Load 7-8 kg)',
      category: 'Laundry & Cleaning',
      defaultHours: 1,
      defaultDays: 24,
      description: 'High mechanical tumble cleaning with steam & water heater',
      ratings: [
        { label: '5-Star AI Direct Drive Inverter', power: 450, price: 34990, star: 5, ecoGrade: 'A++' },
        { label: '4-Star Inverter Front Load', power: 650, price: 28990, star: 4, ecoGrade: 'A' },
        { label: 'Standard Belt-Driven Front Load', power: 850, price: 22990, star: 2, ecoGrade: 'C' }
      ],
      efficientAlternative: {
        targetRatingIndex: 0,
        recommendedName: '5-Star Direct Drive Inverter Front Load',
        reason: 'Consumes less water, generates zero belt friction, and cuts electricity use by over 45% per wash cycle.',
        typicalPaybackMonths: 15
      }
    },
    {
      id: 'washing_machine_top_load',
      name: 'Washing Machine (Top Load 7 kg)',
      category: 'Laundry & Cleaning',
      defaultHours: 1,
      defaultDays: 24,
      description: 'Vertical drum pulsator washing',
      ratings: [
        { label: '5-Star Smart Inverter Top Load', power: 360, price: 21990, star: 5, ecoGrade: 'A' },
        { label: '3-Star Standard Top Load', power: 580, price: 16990, star: 3, ecoGrade: 'B' },
        { label: 'Semi-Automatic Twin Tub', power: 420, price: 10990, star: 2, ecoGrade: 'C' }
      ]
    },
    {
      id: 'clothes_dryer',
      name: 'Dedicated Clothes Dryer',
      category: 'Laundry & Cleaning',
      defaultHours: 1.2,
      defaultDays: 16,
      description: 'Rapid moisture removal for laundry',
      ratings: [
        { label: 'A+++ Heat Pump Dryer', power: 650, price: 46990, star: 5, ecoGrade: 'A++' },
        { label: 'Standard Condenser Heating Dryer', power: 2200, price: 26990, star: 2, ecoGrade: 'D' }
      ]
    },
    {
      id: 'vacuum_cleaner',
      name: 'Vacuum Cleaner / Robotic Vacuum',
      category: 'Laundry & Cleaning',
      defaultHours: 0.7,
      defaultDays: 20,
      description: 'Floor and upholstery cleaning',
      ratings: [
        { label: 'Li-ion Smart Robotic Vacuum', power: 40, price: 21990, star: 5, ecoGrade: 'A++' },
        { label: 'Cordless Brushless Stick Vacuum', power: 250, price: 14990, star: 4, ecoGrade: 'A' },
        { label: 'Traditional Canister Vacuum', power: 1400, price: 4990, star: 2, ecoGrade: 'C' }
      ]
    },
    {
      id: 'electric_iron',
      name: 'Electric Steam / Dry Iron',
      category: 'Laundry & Cleaning',
      defaultHours: 0.5,
      defaultDays: 20,
      description: 'Garment pressing and crease removal',
      ratings: [
        { label: 'Thermostat Steam Iron (1200W)', power: 1200, price: 1490, star: 4, ecoGrade: 'A' },
        { label: 'Heavy Dry Iron (1000W)', power: 1000, price: 890, star: 3, ecoGrade: 'B' },
        { label: 'High-Wattage Steam Generator (2000W)', power: 2000, price: 3490, star: 2, ecoGrade: 'C' }
      ]
    }
  ],

  'Heating & Water': [
    {
      id: 'water_heater_storage',
      name: 'Storage Geyser (15-25 Litres)',
      category: 'Heating & Water',
      defaultHours: 1.2,
      defaultDays: 30,
      description: 'Insulated hot water tank for bathrooms',
      ratings: [
        { label: 'Heat Pump Hybrid Geyser', power: 550, price: 44990, star: 5, ecoGrade: 'A++' },
        { label: '5-Star High-Density PUF Storage Geyser', power: 1800, price: 11490, star: 5, ecoGrade: 'A' },
        { label: '3-Star Standard Storage Geyser', power: 2000, price: 7990, star: 3, ecoGrade: 'B' },
        { label: 'Instant Geyser (3-5 Litres)', power: 3000, price: 3990, star: 2, ecoGrade: 'C' }
      ],
      efficientAlternative: {
        targetRatingIndex: 1,
        recommendedName: '5-Star High-Density PUF Storage Geyser',
        reason: 'Superior polyurethane insulation retains heat for 24+ hours, slashing standing loss by 50%.',
        typicalPaybackMonths: 12
      }
    },
    {
      id: 'instant_water_heater',
      name: 'Instant Water Heater (3 Litres)',
      category: 'Heating & Water',
      defaultHours: 0.6,
      defaultDays: 30,
      description: 'On-demand rapid heating for kitchens or small bathrooms',
      ratings: [
        { label: 'Smart Thermostat Instant Geyser (3kW)', power: 3000, price: 3490, star: 3, ecoGrade: 'B' },
        { label: 'Standard High-Speed Instant Geyser (4.5kW)', power: 4500, price: 4290, star: 2, ecoGrade: 'C' }
      ]
    },
    {
      id: 'water_pump_submersible',
      name: 'Water Pump / Submersible (1 HP)',
      category: 'Heating & Water',
      defaultHours: 1,
      defaultDays: 30,
      description: 'Lifting ground or sump water to overhead rooftop tanks',
      ratings: [
        { label: '5-Star High-Efficiency Submersible Pump', power: 750, price: 9500, star: 5, ecoGrade: 'A' },
        { label: 'Standard Local Induction Motor Pump', power: 1100, price: 5800, star: 2, ecoGrade: 'C' }
      ]
    },
    {
      id: 'water_purifier_ro',
      name: 'Water Purifier (RO + UV + TDS)',
      category: 'Heating & Water',
      defaultHours: 3,
      defaultDays: 30,
      description: 'Multi-stage drinking water purification with booster pump',
      ratings: [
        { label: 'Eco Recovery High-Efficiency RO', power: 35, price: 16990, star: 5, ecoGrade: 'A+' },
        { label: 'Standard 8-Stage RO Purifier', power: 60, price: 11490, star: 4, ecoGrade: 'A' }
      ]
    },
    {
      id: 'room_heater',
      name: 'Room Heater (Winter Space Heating)',
      category: 'Heating & Water',
      defaultHours: 4,
      defaultDays: 30,
      description: 'Space heating during cold winter months',
      ratings: [
        { label: 'Oil Filled Radiator (OFR with Thermostat)', power: 1400, price: 8900, star: 4, ecoGrade: 'A' },
        { label: 'Halogen / Carbon Infrared Heater', power: 1200, price: 2600, star: 3, ecoGrade: 'B' },
        { label: 'Fan Blower Resistance Heater', power: 2000, price: 1400, star: 1, ecoGrade: 'D' }
      ]
    }
  ],

  'Entertainment & Computing': [
    {
      id: 'smart_tv_55',
      name: 'Smart Television 55"-65"',
      category: 'Entertainment & Computing',
      defaultHours: 5,
      defaultDays: 30,
      description: 'Living room primary entertainment 4K display',
      ratings: [
        { label: '5-Star Eco LED / Mini-LED (Eco Mode)', power: 85, price: 42990, star: 5, ecoGrade: 'A+' },
        { label: '4K OLED Display (High HDR brightness)', power: 145, price: 89990, star: 4, ecoGrade: 'A' },
        { label: 'Standard 55" LED Backlit TV', power: 125, price: 29990, star: 3, ecoGrade: 'B' }
      ]
    },
    {
      id: 'smart_tv_43',
      name: 'Smart Television 32"-43"',
      category: 'Entertainment & Computing',
      defaultHours: 4,
      defaultDays: 30,
      description: 'Bedroom or secondary display',
      ratings: [
        { label: '5-Star 43" Smart LED TV', power: 55, price: 23990, star: 5, ecoGrade: 'A++' },
        { label: 'Standard 32" HD LED TV', power: 45, price: 12990, star: 4, ecoGrade: 'A+' },
        { label: 'Older / Unrated 43" LED TV', power: 80, price: 17990, star: 3, ecoGrade: 'B' }
      ]
    },
    {
      id: 'desktop_computer',
      name: 'Personal Computer / Workstation',
      category: 'Entertainment & Computing',
      defaultHours: 7,
      defaultDays: 26,
      description: 'Home office or gaming rig',
      ratings: [
        { label: 'High-Efficiency Mini PC / M-Series Workstation', power: 45, price: 54990, star: 5, ecoGrade: 'A++' },
        { label: 'Standard Office Desktop (Integrated Graphics)', power: 140, price: 38990, star: 4, ecoGrade: 'A' },
        { label: 'High-Performance Gaming Rig (RTX GPU)', power: 480, price: 95000, star: 2, ecoGrade: 'C' }
      ]
    },
    {
      id: 'laptop_computer',
      name: 'Laptop / Ultrabook Computer',
      category: 'Entertainment & Computing',
      defaultHours: 8,
      defaultDays: 26,
      description: 'Portable work and study computing',
      ratings: [
        { label: 'Energy-Efficient Ultrabook (Type-C 45W)', power: 35, price: 49990, star: 5, ecoGrade: 'A++' },
        { label: 'High-Performance Work Laptop (65W-90W)', power: 65, price: 69990, star: 4, ecoGrade: 'A' }
      ]
    },
    {
      id: 'wifi_router',
      name: 'Wi-Fi 6 Router / Fiber ONT Modem',
      category: 'Entertainment & Computing',
      defaultHours: 24,
      defaultDays: 30,
      description: 'Continuous 24/7 home internet connectivity',
      ratings: [
        { label: 'Smart Green Wi-Fi 6 Router with Eco Standby', power: 10, price: 3490, star: 5, ecoGrade: 'A++' },
        { label: 'Dual-Band Standard Gigabit Router', power: 15, price: 1990, star: 4, ecoGrade: 'A' }
      ]
    }
  ],

  'Lighting': [
    {
      id: 'room_lighting',
      name: 'Room Lighting Fixtures (Batten / Bulb)',
      category: 'Lighting',
      defaultHours: 6,
      defaultDays: 30,
      description: 'Illumination across living or work spaces',
      ratings: [
        { label: 'High-Lumen LED Batten / Downlights (20W)', power: 20, price: 420, star: 5, ecoGrade: 'A++' },
        { label: 'Fluorescent T8 Tube Light (40W)', power: 40, price: 180, star: 2, ecoGrade: 'C' },
        { label: 'Incandescent Filament Fixtures (60W)', power: 60, price: 60, star: 1, ecoGrade: 'E' }
      ]
    },
    {
      id: 'smart_led_bulb',
      name: 'Smart RGB LED Bulb (9W - 12W)',
      category: 'Lighting',
      defaultHours: 5,
      defaultDays: 30,
      description: 'Wi-Fi scheduled mood & ambient illumination',
      ratings: [
        { label: 'Smart Dimmable LED Bulb (9W)', power: 9, price: 599, star: 5, ecoGrade: 'A++' },
        { label: 'Standard White LED Bulb (12W)', power: 12, price: 149, star: 5, ecoGrade: 'A+' }
      ]
    }
  ]
};

// Quick 2-3 Appliance Comparison Scenarios (Pre-configured shortcuts)
export const PREBUILT_COMPARISONS = [
  {
    id: 'ac_showdown',
    title: '1.5 Ton AC Efficiency Showdown',
    category: 'Cooling & Ventilation',
    hours: 8,
    days: 30,
    options: [
      {
        name: '5-Star Twin-Inverter AC',
        category: 'Cooling & Ventilation',
        efficiency: '5-Star BEE Inverter',
        power: 1100,
        price: 42990,
        highlight: 'Lowest Running Cost'
      },
      {
        name: '3-Star Inverter AC',
        category: 'Cooling & Ventilation',
        efficiency: '3-Star BEE Inverter',
        power: 1550,
        price: 32990,
        highlight: 'Popular Mid-Tier'
      },
      {
        name: '3-Star Non-Inverter (Fixed Speed)',
        category: 'Cooling & Ventilation',
        efficiency: 'Older Non-Inverter',
        power: 1800,
        price: 27990,
        highlight: 'Lowest Sticker Price'
      }
    ]
  },
  {
    id: 'fan_comparison',
    title: 'Ceiling Fan: BLDC vs Standard Induction',
    category: 'Cooling & Ventilation',
    hours: 14,
    days: 30,
    options: [
      {
        name: '5-Star BLDC Smart Fan',
        category: 'Cooling & Ventilation',
        efficiency: 'Brushless DC Motor (5-Star)',
        power: 28,
        price: 3200,
        highlight: 'Saves 62% Electricity'
      },
      {
        name: '3-Star Induction Fan',
        category: 'Cooling & Ventilation',
        efficiency: 'Standard Induction (3-Star)',
        power: 52,
        price: 2100,
        highlight: 'Moderate Efficiency'
      },
      {
        name: 'Conventional Local Fan',
        category: 'Cooling & Ventilation',
        efficiency: 'Unrated Induction Motor',
        power: 75,
        price: 1450,
        highlight: 'High Heat Loss'
      }
    ]
  },
  {
    id: 'geyser_comparison',
    title: 'Water Heater: Heat Pump vs 5-Star Geyser vs Instant',
    category: 'Heating & Water',
    hours: 1.5,
    days: 30,
    options: [
      {
        name: 'Hybrid Heat Pump Water Heater',
        category: 'Heating & Water',
        efficiency: 'Heat Pump (COP 3.5)',
        power: 550,
        price: 44990,
        highlight: 'Ultra-Low 550W Draw'
      },
      {
        name: '5-Star PUF Storage Geyser (25L)',
        category: 'Heating & Water',
        efficiency: '5-Star High Insulation',
        power: 1800,
        price: 11490,
        highlight: 'Best Balance of Cost & Power'
      },
      {
        name: 'Instant Water Heater (3L)',
        category: 'Heating & Water',
        efficiency: 'Rapid Resistance Heating',
        power: 3000,
        price: 3990,
        highlight: 'High Peak Demand Spike'
      }
    ]
  },
  {
    id: 'fridge_comparison',
    title: 'Refrigerator: 5-Star Smart Inverter vs Standard 2-Star',
    category: 'Kitchen',
    hours: 24,
    days: 30,
    options: [
      {
        name: '5-Star Smart Inverter Fridge',
        category: 'Kitchen',
        efficiency: '5-Star Linear Inverter (75W avg)',
        power: 75,
        price: 29990,
        highlight: 'Whisper Quiet, Low Energy'
      },
      {
        name: '3-Star Inverter Fridge',
        category: 'Kitchen',
        efficiency: '3-Star Inverter (110W avg)',
        power: 110,
        price: 23990,
        highlight: 'Standard Family Choice'
      },
      {
        name: '2-Star Non-Inverter Fridge',
        category: 'Kitchen',
        efficiency: '2-Star Fixed Speed (165W avg)',
        power: 165,
        price: 18990,
        highlight: 'High Continuous Consumption'
      }
    ]
  }
];

// Typical benchmark estimates for 'Other Appliance' when wattage is unknown
export const UNKNOWN_WATTAGE_BENCHMARKS = [
  { label: 'Small Electronics / Charger', watts: 65, desc: 'Laptops, routers, tablets, small audio' },
  { label: 'Medium Motor / Kitchen Tool', watts: 350, desc: 'Food processors, blenders, dehumidifiers, fans' },
  { label: 'Cooking & Heating Appliance', watts: 1200, desc: 'Air fryers, toasters, small space heaters, kettles' },
  { label: 'Heavy Compressor / Motor', watts: 2000, desc: 'Heavy pumps, welders, fast ovens, industrial units' }
];
