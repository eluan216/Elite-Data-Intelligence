import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, project } = body;

    if (!name || !email || !project) {
      return NextResponse.json(
        { error: "Name, email, and project details are required." },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid work email." },
        { status: 400 }
      );
    }

    // Log the submission (replace with email service, CRM, or database later)
    console.log("=== Discovery Call Request ===");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Project:", project);
    console.log("Timestamp:", new Date().toISOString());
    console.log("==============================");

    // TODO: Integrate with email provider (Resend, SendGrid, etc.) or CRM
    // Example:
    // await resend.emails.send({ ... })

    return NextResponse.json(
      { success: true, message: "Request received. We will be in touch shortly." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Unable to process your request. Please try again." },
      { status: 500 }
    );
  }
}
