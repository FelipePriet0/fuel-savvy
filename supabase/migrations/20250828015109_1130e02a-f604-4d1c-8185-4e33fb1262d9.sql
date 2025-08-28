-- Remove manager fields from stations_new table
ALTER TABLE stations_new 
DROP COLUMN IF EXISTS manager_name,
DROP COLUMN IF EXISTS manager_phone;