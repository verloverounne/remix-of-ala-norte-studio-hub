CREATE OR REPLACE FUNCTION public.exec_sql_list_tables()
RETURNS text[]
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(tablename ORDER BY tablename), '{}')
  FROM pg_tables
  WHERE schemaname = 'public';
$$;

REVOKE ALL ON FUNCTION public.exec_sql_list_tables() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql_list_tables() TO service_role;