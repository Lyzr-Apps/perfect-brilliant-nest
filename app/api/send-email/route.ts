import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/send-email
 * Sends policy summary via email using Resend service
 * or configured email provider
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

    // Check if email service is configured
    const resendApiKey = process.env.RESEND_API_KEY
    const sendgridApiKey = process.env.SENDGRID_API_KEY
    const emailProvider = process.env.EMAIL_PROVIDER || 'resend'

    // If no email provider configured, return success but skip sending
    if (!resendApiKey && !sendgridApiKey) {
      console.warn('No email service configured (RESEND_API_KEY or SENDGRID_API_KEY). Email feature disabled.')
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

    // Use Resend if available
    if (resendApiKey && emailProvider === 'resend') {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Policy Manager <noreply@policymanager.com>',
            to: email,
            subject: `Policy Document: ${policyTitle}`,
            html: htmlContent,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          messageId = data.id
          emailSent = true
          console.log('Email sent via Resend:', messageId)
        } else {
          const errorData = await response.text()
          console.error('Resend API error:', errorData)
        }
      } catch (error) {
        console.error('Error sending via Resend:', error)
      }
    }

    // Fallback: Use SendGrid if Resend fails or not configured
    if (!emailSent && sendgridApiKey) {
      try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email }],
                subject: `Policy Document: ${policyTitle}`,
              },
            ],
            from: {
              email: 'noreply@policymanager.com',
              name: 'Policy Manager',
            },
            content: [
              {
                type: 'text/html',
                value: htmlContent,
              },
            ],
          }),
        })

        if (response.ok || response.status === 202) {
          emailSent = true
          messageId = `sendgrid-${Date.now()}`
          console.log('Email sent via SendGrid')
        } else {
          const errorData = await response.text()
          console.error('SendGrid API error:', errorData)
        }
      } catch (error) {
        console.error('Error sending via SendGrid:', error)
      }
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
