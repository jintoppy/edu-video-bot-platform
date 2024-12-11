// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, consultancy, email, scale, challenges } = body;

    // 1. Store in leads table
    const newLead = await db.insert(leads).values({
      contactName: name,
      consultancyName: consultancy,
      email: email,
      operationsScale: scale,
      challenges: challenges,
      status: 'new',
      metadata: {
        submittedAt: new Date().toISOString(),
        source: 'website_form'
      }
    }).returning();

    // 2. Send email notification to admin
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL!,
      subject: 'New Partnership Request - ' + consultancy,
      html: `
        <h1>New Partnership Request</h1>
        <h2>Contact Details:</h2>
        <ul>
          <li><strong>Contact Person:</strong> ${name}</li>
          <li><strong>Consultancy:</strong> ${consultancy}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Current Scale:</strong> ${scale}</li>
        </ul>
        <h2>Challenges:</h2>
        <p>${challenges}</p>
        <br/>
        <p>Lead ID: ${newLead[0].id}</p>
        <p>Submitted at: ${new Date().toLocaleString()}</p>
      `
    });

    // 3. Send auto-response to the lead
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Thank you for your interest in EduBot',
      html: `
        <h1>Thank you for reaching out!</h1>
        <p>Dear ${name},</p>
        <p>Thank you for your interest in transforming ${consultancy} with our AI-powered education consultancy platform.</p>
        <p>Our team will review your information and get back to you within 1-2 business days to discuss how we can help achieve your goals.</p>
        <p>In the meantime, if you have any urgent questions, please don't hesitate to reply to this email.</p>
        <br/>
        <p>Best regards,</p>
        <p>The EduBot Team</p>
      `
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Partnership request received',
      leadId: newLead[0].id
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    );
  }
}