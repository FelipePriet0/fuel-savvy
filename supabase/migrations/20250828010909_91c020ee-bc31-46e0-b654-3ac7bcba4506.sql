-- Create profiles table for all users
CREATE TABLE IF NOT EXISTS public.profiles_new (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  role text CHECK (role IN ('driver','station')) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create drivers table for driver-specific data
CREATE TABLE IF NOT EXISTS public.drivers (
  id uuid PRIMARY KEY REFERENCES public.profiles_new(id) ON DELETE CASCADE,
  cpf text UNIQUE NOT NULL,
  license_plate text,
  city text,
  state text,
  payment_method text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create stations table for station-specific data  
CREATE TABLE IF NOT EXISTS public.stations_new (
  id uuid PRIMARY KEY REFERENCES public.profiles_new(id) ON DELETE CASCADE,
  cnpj text UNIQUE NOT NULL,
  station_name text NOT NULL,
  brand text,
  manager_name text,
  manager_phone text,
  place_id text,
  formatted_address text,
  lat numeric,
  lng numeric,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  geo geography(Point,4326),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for geographic searches
CREATE INDEX IF NOT EXISTS stations_new_geo_gix ON public.stations_new USING gist(geo);

-- Enable RLS
ALTER TABLE public.profiles_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations_new ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles_new
CREATE POLICY "Users can manage their own profile"
ON public.profiles_new
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- RLS policies for drivers
CREATE POLICY "Drivers can manage their own data"
ON public.drivers
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- RLS policies for stations_new
CREATE POLICY "Stations can manage their own data"
ON public.stations_new
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Everyone can view approved stations"
ON public.stations_new
FOR SELECT
USING (status = 'approved');

-- Create trigger to update geo column when lat/lng changes
CREATE OR REPLACE FUNCTION update_station_geo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geo = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_station_geo_trigger
  BEFORE INSERT OR UPDATE ON public.stations_new
  FOR EACH ROW
  EXECUTE FUNCTION update_station_geo();

-- Create trigger to update updated_at column
CREATE TRIGGER update_profiles_new_updated_at
  BEFORE UPDATE ON public.profiles_new
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stations_new_updated_at
  BEFORE UPDATE ON public.stations_new
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();