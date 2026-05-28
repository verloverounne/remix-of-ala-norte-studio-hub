import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-export-secret",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EXPORT_SECRET = Deno.env.get("EXPORT_SECRET")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: corsHeaders,
  });
}

async function listAllRows(table: string, pageSize = 1000) {
  const rows: unknown[] = [];
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, to);

    if (error) {
      throw new Error(`Error exporting table "${table}": ${error.message}`);
    }

    if (!data || data.length === 0) break;

    rows.push(...data);

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

async function getPublicTables() {
  const { data, error } = await supabase.rpc("exec_sql", {
    sql: `
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_type = 'BASE TABLE'
      order by table_name;
    `,
  });

  if (!error && Array.isArray(data)) {
    return data.map((row: Record<string, unknown>) => String(row.table_name));
  }

  const fallbackTables = [
    "profiles",
    "users",
    "reservations",
    "quotes",
    "equipment",
    "categories",
    "assets",
  ];

  return fallbackTables;
}

async function listAllAuthUsers(perPage = 100) {
  const users: unknown[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Error listing auth users: ${error.message}`);
    }

    const batch = data?.users ?? [];
    users.push(...batch);

    if (batch.length < perPage) break;
    page += 1;
  }

  return users;
}

async function listStorageObjects(bucketName: string, limit = 1000) {
  const allObjects: unknown[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list("", {
        limit,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      throw new Error(
        `Error listing storage objects for bucket "${bucketName}": ${error.message}`,
      );
    }

    const batch = data ?? [];
    allObjects.push(...batch);

    if (batch.length < limit) break;
    offset += limit;
  }

  return allObjects;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "GET") {
      return json({ error: "Method not allowed" }, 405);
    }

    const secret = req.headers.get("x-export-secret");
    if (!EXPORT_SECRET || secret !== EXPORT_SECRET) {
      return json({ error: "Unauthorized" }, 401);
    }

    const url = new URL(req.url);
    const onlyTable = url.searchParams.get("table");

    const exportData: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      project_url: SUPABASE_URL,
      tables: {},
      auth_users: [],
      storage: {
        buckets: [],
        objects_by_bucket: {},
      },
    };

    const tableNames = onlyTable ? [onlyTable] : await getPublicTables();

    for (const table of tableNames) {
      try {
        const rows = await listAllRows(table);
        (exportData.tables as Record<string, unknown>)[table] = {
          row_count: rows.length,
          rows,
        };
      } catch (err) {
        (exportData.tables as Record<string, unknown>)[table] = {
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }

    try {
      const authUsers = await listAllAuthUsers();
      exportData.auth_users = authUsers;
    } catch (err) {
      exportData.auth_users = [
        {
          error: err instanceof Error ? err.message : String(err),
        },
      ];
    }

    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();

      if (error) {
        throw new Error(error.message);
      }

      exportData.storage = {
        buckets: buckets ?? [],
        objects_by_bucket: {},
      };

      for (const bucket of buckets ?? []) {
        try {
          const objects = await listStorageObjects(bucket.name);
          (
            exportData.storage as {
              buckets: unknown[];
              objects_by_bucket: Record<string, unknown>;
            }
          ).objects_by_bucket[bucket.name] = objects;
        } catch (err) {
          (
            exportData.storage as {
              buckets: unknown[];
              objects_by_bucket: Record<string, unknown>;
            }
          ).objects_by_bucket[bucket.name] = {
            error: err instanceof Error ? err.message : String(err),
          };
        }
      }
    } catch (err) {
      exportData.storage = {
        error: err instanceof Error ? err.message : String(err),
      };
    }

    return json(exportData, 200);
  } catch (err) {
    return json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      500,
    );
  }
});
