import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Where discovery-call requests are delivered
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "";

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid work email." },
        { status: 400 }
      );
    }

    // Always log for debugging / Vercel logs
    console.log("=== Discovery Call Request ===");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Project:", project);
    console.log("Timestamp:", new Date().toISOString());
    console.log("==============================");

    // Send email when Resend is configured
    if (resend && TO_EMAIL) {
      const { error } = await resend.emails.send({
        from: "Elite-Data-Intelligence <onboarding@resend.dev>", // replace with your verified domain later
        to: [TO_EMAIL],
        replyTo: email,
        subject: `Discovery Call Request — ${name}`,
        text: [
          "New discovery call request from the website.",
          "",
          `Name: ${name}`,
          `Work email: ${email}`,
          "",
          "What they need help with:",
          project,
          "",
          `Received: ${new Date().toISOString()}`,
        ].join("\n"),
        html: `
          <h2>New Discovery Call Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Work email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>What they need help with:</strong></p>
          <p style="white-space: pre-wrap;">${project.replace(/</g, "<")}</p>
          <hr />
          <p style="color:#666;font-size:12px;">Received ${new Date().toISOString()}</p>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        return NextResponse.json(
          { error: "Unable to deliver your request. Please try again." },
          { status: 500 }
        );
      }
    } else {
      console.warn(
        "Email not sent: set RESEND_API_KEY and CONTACT_TO_EMAIL in environment variables."
      );
    }

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
