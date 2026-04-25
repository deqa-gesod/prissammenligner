import postgres from "postgres"

// Supabase Transaction Pooler krever prepare: false fordi PgBouncer i transaction-mode
// ikke støtter prepared statements.
const sql = postgres(process.env.DATABASE_URL, {
  prepare: false,
  ssl: "require",
})

export default sql
