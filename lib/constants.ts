export type CategoryGroup = {
  group: string;
  items: string[];
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    group: 'Building Materials',
    items: [
      'Insulation Rigid',
      'Plastering & Compounds',
      'Roofing Products',
      'Building Materials General',
      'Cement',
      'Insulation Rolls & Slabs',
      'Steel',
      'Bricks and Blocks',
      'Drainage',
      'Air Tightness',
      'DPM & Geotextiles',
      'Aggregates',
      'EWI',
    ],
  },
  {
    group: 'DIY & Hardware',
    items: [
      'Paint',
      'Ironmongery',
      'Building Chemicals',
      'Hand Tools',
      'Workwear',
      'Garden Power',
      'Power Tools',
      'Electrical Accessories',
      'Paint Accessories',
      'Door Furniture',
      'Ladders',
      'Screws & Nails',
      'Fixings & Fasteners',
      'Rope',
      'Tapes',
      'Toolboxes & Tool Storage',
    ],
  },
  {
    group: 'Timber',
    items: [
      'Rough Timber',
      'Sheet Materials',
      'Flooring',
      'Planed Timber',
      'Doors',
      'Decking',
      'Sleepers',
      'Acoustic Panels',
    ],
  },
  {
    group: 'Heating & Plumbing',
    items: [
      'Boilers',
      'Plumbing Fittings',
      'Copper & Qualpex',
      'Renewables',
      'Radiators',
      'Cylinders',
      'Multi Layer',
      'Soil & Waste',
      'Sewer',
    ],
  },
  {
    group: 'Bathrooms',
    items: ["WC's", 'Basin & Ped', 'Vanity Unit', 'Brassware', 'Showers', 'Trays', 'Tiles'],
  },
  {
    group: 'Outdoor Living',
    items: [
      'Horticulture',
      'Garden Furniture',
      'Garden Accessories',
      'Garden Tools',
      'BBQ & Accessories',
      'Garden Watering',
      'Composite',
    ],
  },
];

// Standalone categories that don't belong to a group
export const UNGROUPED_CATEGORIES = ['Agri', 'Other'];

// Flat list of every selectable category (used for validation/filter logic)
export const CATEGORIES = [
  ...CATEGORY_GROUPS.flatMap((g) => g.items),
  ...UNGROUPED_CATEGORIES,
];

export const COUNTIES = [
  'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry',
  'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
  'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
  'Waterford', 'Westmeath', 'Wexford', 'Wicklow', 'Antrim', 'Armagh', 'Down',
  'Fermanagh', 'Londonderry', 'Tyrone',
];
