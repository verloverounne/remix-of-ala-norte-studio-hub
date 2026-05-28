import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-export-secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const EXPORT_SECRET = Deno.env.get("EXPORT_SECRET");

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return json({ error: "Missing SUPABASE_URL or SERVICE_ROLE_KEY" }, 500);
    }
    if (!EXPORT_SECRET) {
      return json({ error: "EXPORT_SECRET not configured" }, 500);
    }

    const provided =
      req.headers.get("x-export-secret") ?? req.headers.get("X-EXPORT-SECRET");
    if (provided !== EXPORT_SECRET) {
      return json({ error: "Unauthorized" }, 401);
    }

    const url = new URL(req.url);
    const onlyTable = url.searchParams.get("table");
    const pageSize = Math.min(
      Number(url.searchParams.get("page_size") ?? 1000),
      1000,
    );

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // Discover tables in public schema
    let tableNames: string[] = [];
    if (onlyTable) {
      tableNames = [onlyTable];
    } else {
      const { data: tablesData, error: tablesErr } = await supabase
        .rpc("exec_sql_list_tables")
        .single();
      // Fallback if RPC doesn't exist: query via PostgREST against pg_meta isn't available.
      // We use a known query through the REST `?select` on information_schema via a tiny helper:
      if (tablesErr || !tablesData) {
        // Use direct PostgREST call to information_schema
        const resp = await fetch(
          `${SUPABASE_URL}/rest/v1/rpc/exec_sql_list_tables`,
          {
            method: "POST",
            headers: {
              apikey: SERVICE_ROLE,
              Authorization: `Bearer ${SERVICE_ROLE}`,
              "Content-Type": "application/json",
            },
            body: "{}",
          },
        );
        if (resp.ok) {
          tableNames = await resp.json();
        } else {
          // Hardcoded fallback: use known schema by querying each table existence via select
          // Last resort: discover via pg_catalog through a SQL function we cannot create here.
          // We'll just attempt a fixed list query through information_schema via PostgREST exposed schema.
          // If neither works, return clear error.
          return json(
            {
              error:
                "Cannot list tables. Create helper SQL function `exec_sql_list_tables()` returning text[] of public tables, or pass ?table=<name>.",
              hint:
                "CREATE OR REPLACE FUNCTION public.exec_sql_list_tables() RETURNS text[] LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$ SELECT coalesce(array_agg(tablename),'{}') FROM pg_tables WHERE schemaname='public'; $$;",
            },
            500,
          );
        }
      } else {
        tableNames = tablesData as unknown as string[];
      }
    }

    const tables: Record<string, { row_count: number; rows: unknown[] }> = {};
    const tableErrors: Record<string, string> = {};

    for (const t of tableNames) {
      try {
        const rows: unknown[] = [];
        let from = 0;
        while (true) {
          const { data, error } = await supabase
            .from(t)
            .select("*")
            .range(from, from + pageSize - 1);
          if (error) throw error;
          if (!data || data.length === 0) break;
          rows.push(...data);
          if (data.length < pageSize) break;
          from += pageSize;
        }
        tables[t] = { row_count: rows.length, rows };
      } catch (e) {
        tableErrors[t] = (e as Error).message;
      }
    }

    // Auth users
    let authUsers: unknown[] = [];
    const authErrors: string[] = [];
    try {
      let page = 1;
      const perPage = 1000;
      while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({
          page,
          perPage,
        });
        if (error) throw error;
        const users = data?.users ?? [];
        authUsers.push(...users);
        if (users.length < perPage) break;
        page += 1;
      }
    } catch (e) {
      authErrors.push((e as Error).message);
    }

    // Storage
    const storage: {
      buckets: unknown[];
      objects_by_bucket: Record<string, unknown[]>;
    } = { buckets: [], objects_by_bucket: {} };
    const storageErrors: string[] = [];
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      storage.buckets = buckets ?? [];
      for (const b of buckets ?? []) {
        try {
          const all: unknown[] = [];
          let offset = 0;
          const limit = 1000;
          while (true) {
            const { data: objs, error: lerr } = await supabase.storage
              .from(b.name)
              .list("", { limit, offset, sortBy: { column: "name", order: "asc" } });
            if (lerr) throw lerr;
            if (!objs || objs.length === 0) break;
            all.push(...objs);
            if (objs.length < limit) break;
            offset += limit;
          }
          storage.objects_by_bucket[b.name] = all;
        } catch (e) {
          storageErrors.push(`${b.name}: ${(e as Error).message}`);
        }
      }
    } catch (e) {
      storageErrors.push((e as Error).message);
    }

    return json({
      exported_at: new Date().toISOString(),
      project_url: SUPABASE_URL,
      tables,
      table_errors: tableErrors,
      auth_users: authUsers,
      auth_errors: authErrors,
      storage,
      storage_errors: storageErrors,
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
