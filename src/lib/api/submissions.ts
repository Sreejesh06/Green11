import supabase from "@/lib/supabaseClient";

export type CreateSubmissionInput = {
  challengeId: string;
  file: File;
  description: string;
};

export type Submission = {
  id: string;
  user_id: string;
  challenge_id: string;
  description: string | null;
  proof_url: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
};

export async function createSubmission(input: CreateSubmissionInput): Promise<Submission> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  // Upload file to Storage bucket 'proofs'
  const filePath = `${userId}/${Date.now()}_${input.file.name}`;
  const { error: uploadError } = await supabase.storage.from("proofs").upload(filePath, input.file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from("proofs").getPublicUrl(filePath);
  const proofUrl = publicUrlData?.publicUrl ?? null;

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      user_id: userId,
      challenge_id: input.challengeId,
      description: input.description,
      proof_url: proofUrl,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Submission;
}


