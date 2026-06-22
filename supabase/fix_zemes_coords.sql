-- Accurate data for Zemes iela demo houses (OpenStreetMap coords + verified counts)
update public.houses
set
  lat = 56.9420456,
  lng = 24.1961964,
  postal_code = 'LV-1082',
  apartment_count = 35,
  floors = 9
where slug = 'zemes-iela-1';

update public.houses
set
  lat = 56.9422744,
  lng = 24.1971483,
  postal_code = 'LV-1082',
  apartment_count = 108,
  floors = 9
where slug = 'zemes-iela-3';