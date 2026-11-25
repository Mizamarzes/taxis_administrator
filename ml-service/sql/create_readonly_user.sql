CREATE ROLE ml_readonly WITH LOGIN PASSWORD 'cambia_esta_clave';
GRANT CONNECT ON DATABASE taxis_db TO ml_readonly;
GRANT USAGE ON SCHEMA public TO ml_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ml_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ml_readonly;
ALTER ROLE ml_readonly SET default_transaction_read_only = on;
