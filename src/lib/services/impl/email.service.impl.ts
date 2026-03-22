import nodemailer, { SendMailOptions } from "nodemailer";
import { CustomError } from "@/lib/utils/customError.utils";

export class EmailServiceImpl {
  private transporter: nodemailer.Transporter;
  private logo: string = process.env.LOGO_URL || "";
  private name: string = process.env.APP_NAME || "Fedx Global Shipping";
  private contact: string = process.env.CONTACT_INFO || "";
  private color: string = process.env.MAJOR_COLOR || "#FF5A00";

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "465", 10),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendParcelCreatedEmail(to: string, trackingId: string): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: `"${this.name}" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Parcel Has Been Created",
      html: this.getParcelCreatedTemplate(trackingId),
    };
    await this.sendEmail(mailOptions);
  }

  async sendTimelineUpdateEmail(
    to: string,
    trackingId: string,
    message: string,
  ): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: `"${this.name}" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Update on Your Parcel",
      html: this.getTimelineUpdateTemplate(trackingId, message),
    };
    await this.sendEmail(mailOptions);
  }

  async sendLocationUpdateEmail(
    to: string,
    trackingId: string,
    lat: number,
    lng: number,
  ): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: `"${this.name}" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Live Location Update for Your Parcel",
      html: this.getLocationUpdateTemplate(trackingId, lat, lng),
    };
    await this.sendEmail(mailOptions);
  }

  async sendIssueResolvedEmail(
    to: string,
    issueTitle: string,
    resolution: string,
    trackingId?: string,
    amount?: number,
  ): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: `"${this.name}" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Issue Resolved - " + issueTitle,
      html: this.getIssueResolvedTemplate(
        issueTitle,
        resolution,
        trackingId,
        amount,
      ),
    };
    await this.sendEmail(mailOptions);
  }

  async sendContactResponseEmail(
    to: string,
    subject: string,
    response: string,
  ): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: `"${this.name}" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Re: " + subject,
      html: this.getContactResponseTemplate(subject, response),
    };
    await this.sendEmail(mailOptions);
  }

  private async sendEmail(options: SendMailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail(options);
      if (info.rejected.length > 0) {
        throw new CustomError(500, "Failed to send email");
      }
    } catch (error) {
      throw new CustomError(500, "Failed to send email");
    }
  }

  private getParcelCreatedTemplate(trackingId: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Parcel Created - ${this.name}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, ${this.color} 0%, #ff8c42 100%); padding: 40px 30px; text-align: center;">
                    <img src="${this.logo}" alt="${this.name}" style="max-height: 60px; width: auto; margin-bottom: 10px;">
                    <div style="width: 60px; height: 4px; background-color: rgba(255,255,255,0.3); margin: 20px auto; border-radius: 2px;"></div>
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">Parcel Created Successfully</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-left: 4px solid #28a745; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                      <h2 style="color: #1b5e20; font-size: 20px; margin: 0 0 10px; font-weight: 600;">✓ Your Parcel is Ready</h2>
                      <p style="color: #2e7d32; font-size: 14px; margin: 0; line-height: 1.6;">Your parcel has been successfully created and is ready for processing.</p>
                    </div>
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 25px; overflow: hidden;">
                      <tr>
                        <td style="padding: 15px; font-weight: 600; color: #333333; width: 140px; background-color: #e9ecef;">Tracking ID:</td>
                        <td style="padding: 15px; color: #666666; font-family: 'Courier New', monospace; font-size: 18px; font-weight: 600;">${trackingId}</td>
                      </tr>
                    </table>
                    <p style="color: #666666; font-size: 15px; line-height: 1.8; margin: 0 0 30px;">
                      Use this tracking ID to monitor the status of your shipment at any time. You'll receive updates as your parcel moves through our network.
                    </p>
                    <div style="text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}/tracking?id=${trackingId}" style="display: inline-block; background: linear-gradient(135deg, ${this.color} 0%, #ff8c42 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(255, 90, 0, 0.3);">Track Your Parcel</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #666666; font-size: 14px; margin: 0 0 10px; line-height: 1.6;">If you have any questions, please contact us at ${this.contact}.</p>
                    <p style="color: #999999; font-size: 12px; margin: 15px 0 0;">&copy; ${new Date().getFullYear()} ${this.name}. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getTimelineUpdateTemplate(
    trackingId: string,
    message: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shipment Update - ${this.name}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, ${this.color} 0%, #ff8c42 100%); padding: 40px 30px; text-align: center;">
                    <img src="${this.logo}" alt="${this.name}" style="max-height: 60px; width: auto; margin-bottom: 10px;">
                    <div style="width: 60px; height: 4px; background-color: rgba(255,255,255,0.3); margin: 20px auto; border-radius: 2px;"></div>
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">Shipment Update</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-left: 4px solid #2196f3; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                      <h2 style="color: #1565c0; font-size: 20px; margin: 0 0 10px; font-weight: 600;">📦 New Update Available</h2>
                      <p style="color: #1976d2; font-size: 14px; margin: 0; line-height: 1.6;">We've got an update on your parcel's journey.</p>
                    </div>
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 25px; overflow: hidden;">
                      <tr>
                        <td style="padding: 12px; font-weight: 600; color: #333333; width: 140px; background-color: #e9ecef;">Tracking ID:</td>
                        <td style="padding: 12px; color: #666666; font-family: 'Courier New', monospace;">${trackingId}</td>
                      </tr>
                    </table>
                    <h3 style="color: #333333; font-size: 18px; margin: 0 0 15px; font-weight: 600;">Status Update</h3>
                    <div style="background-color: #f8f9fa; border-left: 4px solid ${this.color}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                      <p style="color: #333333; font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-wrap;">${message}</p>
                    </div>
                    <div style="text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}/tracking?id=${trackingId}" style="display: inline-block; background: linear-gradient(135deg, ${this.color} 0%, #ff8c42 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(255, 90, 0, 0.3);">View Full Tracking</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #666666; font-size: 14px; margin: 0 0 10px; line-height: 1.6;">Need assistance? Contact us at ${this.contact}.</p>
                    <p style="color: #999999; font-size: 12px; margin: 15px 0 0;">&copy; ${new Date().getFullYear()} ${this.name}. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getLocationUpdateTemplate(
    trackingId: string,
    lat: number,
    lng: number,
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Location Update - ${this.name}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, ${this.color} 0%, #ff8c42 100%); padding: 40px 30px; text-align: center;">
                    <img src="${this.logo}" alt="${this.name}" style="max-height: 60px; width: auto; margin-bottom: 10px;">
                    <div style="width: 60px; height: 4px; background-color: rgba(255,255,255,0.3); margin: 20px auto; border-radius: 2px;"></div>
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">📍 Live Location Update</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-left: 4px solid #ff9800; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                      <h2 style="color: #e65100; font-size: 20px; margin: 0 0 10px; font-weight: 600;">🗺️ Real-Time Location</h2>
                      <p style="color: #f57c00; font-size: 14px; margin: 0; line-height: 1.6;">Your parcel's location has been updated in real-time.</p>
                    </div>
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 25px; overflow: hidden;">
                      <tr>
                        <td style="padding: 12px; font-weight: 600; color: #333333; width: 140px; background-color: #e9ecef;">Tracking ID:</td>
                        <td style="padding: 12px; color: #666666; font-family: 'Courier New', monospace;">${trackingId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px; font-weight: 600; color: #333333; background-color: #e9ecef;">Coordinates:</td>
                        <td style="padding: 12px; color: #666666; font-family: 'Courier New', monospace;">${lat.toFixed(6)}, ${lng.toFixed(6)}</td>
                      </tr>
                    </table>
                    <div style="text-align: center; margin-top: 30px;">
                      <a href="https://maps.google.com/?q=${lat},${lng}" style="display: inline-block; background: linear-gradient(135deg, ${this.color} 0%, #ff8c42 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(255, 90, 0, 0.3); margin-right: 10px;">View on Google Maps</a>
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}/tracking?id=${trackingId}" style="display: inline-block; background: #6c757d; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">Track on Website</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #666666; font-size: 14px; margin: 0 0 10px; line-height: 1.6;">For support, reach us at ${this.contact}.</p>
                    <p style="color: #999999; font-size: 12px; margin: 15px 0 0;">&copy; ${new Date().getFullYear()} ${this.name}. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getIssueResolvedTemplate(
    issueTitle: string,
    resolution: string,
    trackingId?: string,
    amount?: number,
  ): string {
    const trackingSection = trackingId
      ? `
                    <tr>
                        <td style="padding: 12px; font-weight: 600; color: #333333; width: 140px;">Tracking ID:</td>
                        <td style="padding: 12px; color: #666666;">${trackingId}</td>
                    </tr>
        `
      : "";
    const amountSection = amount
      ? `
                    <tr>
                        <td style="padding: 12px; font-weight: 600; color: #333333; width: 140px;">Resolution Amount:</td>
                        <td style="padding: 12px; color: #28a745; font-weight: 600; font-size: 18px;">$${amount.toFixed(2)}</td>
                    </tr>
        `
      : "";

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Issue Resolved - ${this.name}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, ${this.color} 0%, #ff8c42 100%); padding: 40px 30px; text-align: center;">
                    <img src="${this.logo}" alt="${this.name}" style="max-height: 60px; width: auto; margin-bottom: 10px;">
                    <div style="width: 60px; height: 4px; background-color: rgba(255,255,255,0.3); margin: 20px auto; border-radius: 2px;"></div>
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">Issue Resolved</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-left: 4px solid #28a745; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                      <h2 style="color: #1b5e20; font-size: 20px; margin: 0 0 10px; font-weight: 600;">✓ Issue Successfully Resolved</h2>
                      <p style="color: #2e7d32; font-size: 14px; margin: 0; line-height: 1.6;">We're pleased to inform you that your issue has been resolved.</p>
                    </div>
                    <h3 style="color: #333333; font-size: 18px; margin: 0 0 15px; font-weight: 600;">Issue Details</h3>
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 25px; overflow: hidden;">
                      <tr>
                        <td style="padding: 12px; font-weight: 600; color: #333333; width: 140px; background-color: #e9ecef;">Issue Title:</td>
                        <td style="padding: 12px; color: #666666;">${issueTitle}</td>
                      </tr>
                      ${trackingSection}
                      ${amountSection}
                    </table>
                    <h3 style="color: #333333; font-size: 18px; margin: 0 0 15px; font-weight: 600;">Resolution</h3>
                    <div style="background-color: #f8f9fa; border-left: 4px solid ${this.color}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                      <p style="color: #333333; font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-wrap;">${resolution}</p>
                    </div>
                    <div style="text-align: center; margin-top: 30px;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}/tracking${trackingId ? `?id=${trackingId}` : ""}" style="display: inline-block; background: linear-gradient(135deg, ${this.color} 0%, #ff8c42 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(255, 90, 0, 0.3);">Track Your Parcel</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #666666; font-size: 14px; margin: 0 0 10px; line-height: 1.6;">If you have any questions or concerns, please don't hesitate to contact us.</p>
                    <p style="color: #999999; font-size: 12px; margin: 15px 0 0;">${this.contact}</p>
                    <p style="color: #999999; font-size: 12px; margin: 5px 0 0;">&copy; ${new Date().getFullYear()} ${this.name}. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getContactResponseTemplate(
    subject: string,
    response: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Response to Your Inquiry - ${this.name}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, ${this.color} 0%, #ff8c42 100%); padding: 40px 30px; text-align: center;">
                    <img src="${this.logo}" alt="${this.name}" style="max-height: 60px; width: auto; margin-bottom: 10px;">
                    <div style="width: 60px; height: 4px; background-color: rgba(255,255,255,0.3); margin: 20px auto; border-radius: 2px;"></div>
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">Response to Your Inquiry</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-left: 4px solid #2196f3; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                      <h2 style="color: #1565c0; font-size: 20px; margin: 0 0 10px; font-weight: 600;">📧 Thank You for Contacting Us</h2>
                      <p style="color: #1976d2; font-size: 14px; margin: 0; line-height: 1.6;">We've received your inquiry and are happy to assist you.</p>
                    </div>
                    <h3 style="color: #333333; font-size: 18px; margin: 0 0 15px; font-weight: 600;">Your Inquiry</h3>
                    <div style="background-color: #f8f9fa; border-left: 4px solid #6c757d; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
                      <p style="color: #495057; font-size: 15px; margin: 0; font-weight: 600;">${subject}</p>
                    </div>
                    <h3 style="color: #333333; font-size: 18px; margin: 0 0 15px; font-weight: 600;">Our Response</h3>
                    <div style="background-color: #f8f9fa; border-left: 4px solid ${this.color}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                      <p style="color: #333333; font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-wrap;">${response}</p>
                    </div>
                    <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                      <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>💡 Need Further Assistance?</strong><br>
                        If you have any additional questions or concerns, please feel free to reply to this email or contact our support team.
                      </p>
                    </div>
                    <div style="text-align: center; margin-top: 30px;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}/contact" style="display: inline-block; background: linear-gradient(135deg, ${this.color} 0%, #ff8c42 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(255, 90, 0, 0.3);">Contact Support</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="color: #666666; font-size: 14px; margin: 0 0 10px; line-height: 1.6;">We're here to help! If you need immediate assistance, please contact us.</p>
                    <p style="color: #999999; font-size: 12px; margin: 15px 0 0;">${this.contact}</p>
                    <p style="color: #999999; font-size: 12px; margin: 5px 0 0;">&copy; ${new Date().getFullYear()} ${this.name}. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
