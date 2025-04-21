
import { supabase } from "@/integrations/supabase/client";

// Use this function to fetch a mapping of patientId -> patientName for lookups
export async function fetchPatientMap(): Promise<{ [id: string]: string }> {
  const { data, error } = await supabase
    .from("patients")
    .select("id, name");
  if (error) {
    return {};
  }
  const map: { [id: string]: string } = {};
  for (const pat of data || []) {
    map[pat.id] = pat.name;
  }
  return map;
}
