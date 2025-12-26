import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for storage
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn(
        "⚠️ Supabase credentials not configured. File uploads will fail."
    );
    console.warn(
        "   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file."
    );
} else {
    // Use service role key for server-side operations (bypasses RLS)
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

export default supabase;
