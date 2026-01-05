import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

/**
 * POST /api/send-email
 * Sends policy summary via email using AWS SES SMTP
 *
 * @param {string} email - Recipient email address
 * @param {string} policyTitle - Title of the policy
 * @param {string[]} sections - Policy sections
 * @param {string} summary - Policy summary
 * @param {object} compliance - Compliance analysis with scores
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, policyTitle, sections, summary, compliance } = body

    // Validate required fields
    if (!email || !policyTitle || !sections || !compliance) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: email, policyTitle, sections, and compliance are required',
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email address',
        },
        { status: 400 }
      )
    }

    // Check if SMTP credentials are configured
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUsername = process.env.SMTP_USERNAME
    const smtpPassword = process.env.SMTP_PASSWORD
    const sesEmail = process.env.SES_SENDER_EMAIL

    // If no SMTP provider configured, return success but skip sending
    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword || !sesEmail) {
      console.warn('No SMTP service configured (SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SES_SENDER_EMAIL required). Email feature disabled.')
      return NextResponse.json(
        {
          success: true,
          message: 'Policy generated successfully. Email service not configured.',
          email_sent: false,
        },
        { status: 200 }
      )
    }

    // Build email HTML content
    const complianceSectionHtml = `
      <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
        <h3 style="color: #1f2937; margin-top: 0;">Compliance Analysis</h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase;">US Compliance Score</p>
            <p style="color: #2563eb; font-size: 32px; font-weight: bold; margin: 0;">${compliance.us_score}%</p>
          </div>

          <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #16a34a;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase;">India Compliance Score</p>
            <p style="color: #16a34a; font-size: 32px; font-weight: bold; margin: 0;">${compliance.india_score}%</p>
          </div>
        </div>

        ${
          compliance.critical_issues && compliance.critical_issues.length > 0
            ? `
            <h4 style="color: #1f2937; margin-top: 15px;">Critical Issues</h4>
            <ul style="color: #374151; line-height: 1.6;">
              ${compliance.critical_issues.map((issue: string) => `<li>${issue}</li>`).join('')}
            </ul>
          `
            : ''
        }

        ${
          compliance.key_recommendations && compliance.key_recommendations.length > 0
            ? `
            <h4 style="color: #1f2937; margin-top: 15px;">Key Recommendations</h4>
            <ul style="color: #374151; line-height: 1.6;">
              ${compliance.key_recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
            </ul>
          `
            : ''
        }
      </div>
    `

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #374151; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1e3a8a; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${policyTitle}</h1>
          </div>
          <div class="content">
            ${summary ? `<p style="color: #4b5563; line-height: 1.8; font-size: 14px;">${summary}</p>` : ''}

            <div class="section">
              <h2>Policy Content</h2>
              ${sections
                .map(
                  (section: string, idx: number) => `
                <div style="margin-bottom: 15px;">
                  <p style="color: #374151; white-space: pre-wrap; line-height: 1.8;">${section}</p>
                </div>
              `
                )
                .join('')}
            </div>

            ${complianceSectionHtml}

            <div class="footer">
              <p>This policy was generated by Policy Manager Pro</p>
              <p>Generated on ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    let emailSent = false
    let messageId = null

    // Create nodemailer transporter with AWS SES SMTP
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort as string, 10),
        secure: true, // TLS
        auth: {
          user: smtpUsername,
          pass: smtpPassword,
        },
      })

      // Send email
      const mailOptions = {
        from: sesEmail,
        to: email,
        subject: `Policy Document: ${policyTitle}`,
        html: htmlContent,
      }

      const info = await transporter.sendMail(mailOptions)
      messageId = info.messageId
      emailSent = true
      console.log('Email sent via AWS SES SMTP:', messageId)
    } catch (error) {
      console.error('Error sending via AWS SES SMTP:', error)
    }

    // Return response
    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Policy sent to email successfully'
        : 'Policy generated successfully. Email service unavailable.',
      email_sent: emailSent,
      messageId,
    })
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process email request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
