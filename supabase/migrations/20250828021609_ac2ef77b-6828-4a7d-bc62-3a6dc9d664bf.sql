-- Limpeza completa dos dados de teste
-- Primeiro, limpar tabelas dependentes
DELETE FROM uso_cupons;
DELETE FROM coupon_redemptions;
DELETE FROM preco_combustiveis;
DELETE FROM fuel_prices;
DELETE FROM station_ratings;
DELETE FROM favorites;
DELETE FROM admin_logs;

-- Limpar tabelas principais
DELETE FROM cupons;
DELETE FROM coupons;
DELETE FROM postos;
DELETE FROM perfis;
DELETE FROM profiles;
DELETE FROM stations;
DELETE FROM stations_new;
DELETE FROM drivers;

-- Limpar tabelas de backup e teste
DELETE FROM profiles_backup;
DELETE FROM profiles_new;
DELETE FROM ratings;
DELETE FROM "Profilles-Logo";