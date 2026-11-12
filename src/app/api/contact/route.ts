import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";
import { seedContent } from "@/lib/mock/site";
import supabase from "@/lib/supabase";
import { contactSchema } from "@/lib/validation/schemas";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact details" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("Unable to load contact email", error);
    return NextResponse.json({ error: "Contact service is temporarily unavailable" }, { status: 503 });
  }

  let storedContent: unknown = data?.content ?? {};
  if (typeof storedContent === "string") {
    try {
      storedContent = JSON.parse(storedContent);
    } catch (parseError) {
      console.error("Unable to parse site contact content", parseError);
      return NextResponse.json({ error: "Contact service is temporarily unavailable" }, { status: 503 });
    }
  }

  const contact = isRecord(storedContent) && isRecord(storedContent.contact)
    ? storedContent.contact
    : undefined;
  const recipient = typeof contact?.email === "string" && contact.email.trim()
    ? contact.email.trim()
    : seedContent.contact.email;

  try {
    await sendContactEmail({ to: recipient, ...parsed.data, phone: parsed.data.phone ?? "" });
  } catch (sendError) {
    console.error("Contact email delivery failed", sendError);
    return NextResponse.json({ error: "Contact service is temporarily unavailable" }, { status: 503 });
  }

  return NextResponse.json({ sent: true });
}
