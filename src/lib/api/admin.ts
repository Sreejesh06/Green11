import supabase from "@/lib/supabaseClient";
import { insertActivity } from "@/lib/api/activities";

export type PendingSubmission = {
  id: string;
  user_id: string;
  challenge_id: string;
  description: string | null;
  proof_url: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  user_email?: string | null;
  challenge_title?: string | null;
};

export async function getPendingSubmissions(): Promise<PendingSubmission[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select("id,user_id,challenge_id,description,proof_url,status,submitted_at")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function approveSubmission(submissionId: string) {
  const { error } = await supabase
    .from("submissions")
    .update({ status: "approved" })
    .eq("id", submissionId);
  if (error) throw error;
  await insertActivity({ type: "admin_submission_moderated", metadata: { submission_id: submissionId, new_status: "approved" } });
}

export async function rejectSubmission(submissionId: string) {
  const { error } = await supabase
    .from("submissions")
    .update({ status: "rejected" })
    .eq("id", submissionId);
  if (error) throw error;
  await insertActivity({ type: "admin_submission_moderated", metadata: { submission_id: submissionId, new_status: "rejected" } });
}


