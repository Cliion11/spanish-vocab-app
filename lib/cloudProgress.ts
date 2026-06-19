import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type CloudProgressPayload = {
  progress: Record<string, unknown>;
  mistakes: unknown[];
  settings: Record<string, unknown>;
  stats: Record<string, unknown>;
};

export async function getCurrentUser() {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}

export async function loadCloudProgress() {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_progress")
    .select("progress, mistakes, settings, stats, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function saveCloudProgress(payload: CloudProgressPayload) {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_progress")
    .upsert(
      {
        user_id: user.id,
        progress: payload.progress,
        mistakes: payload.mistakes,
        settings: payload.settings,
        stats: payload.stats,
      },
      {
        onConflict: "user_id",
      },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
