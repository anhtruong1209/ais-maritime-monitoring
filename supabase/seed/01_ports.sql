-- Major Vietnamese ports. Coordinates are approximate port/anchorage
-- locations, sufficient for map display at this zoom level.
insert into public.ports (name, code, country, latitude, longitude) values
  ('Hai Phong', 'VNHPH', 'VN', 20.8449, 106.6881),
  ('Cai Lan', 'VNCLN', 'VN', 20.9700, 107.0450),
  ('Da Nang', 'VNDAD', 'VN', 16.1067, 108.2208),
  ('Quy Nhon', 'VNUIH', 'VN', 13.7820, 109.2340),
  ('Nha Trang', 'VNNHA', 'VN', 12.2388, 109.1967),
  ('Ho Chi Minh City', 'VNSGN', 'VN', 10.7769, 106.7009),
  ('Vung Tau', 'VNVUT', 'VN', 10.3460, 107.0843),
  ('Can Tho', 'VNVCA', 'VN', 10.0333, 105.7833)
on conflict (code) do nothing;
