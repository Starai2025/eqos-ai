import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { relationshipId } = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  const { data: relationship, error: relError } = await supabase
    .from("relationships")
    .select("*, communications(*)")
    .eq("id", relationshipId)
    .single();

  if (relError) return new Response(JSON.stringify({ error: relError.message }), { status: 400 });

  const response = await fetch("https://lovable.run/api/v1/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer INSERT_LOVABLE_WORKFLOW_SECRET_HERE`
    },
    body: JSON.stringify({
      type: "relationship_analysis",
      data: relationship
    })
  });

  const result = await response.json();
  return new Response(JSON.stringify(result), { status: 200 });
});
