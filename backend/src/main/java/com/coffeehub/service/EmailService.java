package com.coffeehub.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@javabite.com}")
    private String fromEmail;

    /**
     * Send invitation email to new staff member
     */
    public void sendInvitationEmail(String to, String name, String token, String role) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Invitation to Join JavaBite Coffee Team");

            String invitationLink = frontendUrl + "/accept-invitation?token=" + token;
            String htmlContent = buildInvitationEmail(name, invitationLink, role);
            helper.setText(htmlContent, true);

            mailSender.send(message);

            log.info("✅ Invitation email sent successfully to {}", to);
        } catch (MessagingException e) {
            log.error("❌ Failed to send invitation email to {}", to, e);
            throw new RuntimeException("Failed to send invitation email: " + e.getMessage());
        }
    }

    /**
     * Build HTML email template for invitation
     */
    private String buildInvitationEmail(String name, String invitationLink, String role) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: white;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #8b6f47 0%%, #6d5635 100%%);
                        color: white;
                        padding: 30px 20px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                    }
                    .header p {
                        margin: 10px 0 0 0;
                        opacity: 0.9;
                    }
                    .content {
                        padding: 40px 30px;
                        background: #ffffff;
                    }
                    .content h2 {
                        color: #8b6f47;
                        margin-top: 0;
                    }
                    .role-badge {
                        display: inline-block;
                        padding: 8px 16px;
                        background: #f0e6d6;
                        color: #8b6f47;
                        border-radius: 20px;
                        font-weight: bold;
                        margin: 10px 0;
                    }
                    .button {
                        display: inline-block;
                        padding: 15px 40px;
                        background: #8b6f47;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 25px 0;
                        font-weight: bold;
                        transition: background 0.3s;
                    }
                    .button:hover {
                        background: #6d5635;
                    }
                    .info-box {
                        background: #f8f9fa;
                        border-left: 4px solid #8b6f47;
                        padding: 15px;
                        margin: 20px 0;
                    }
                    .footer {
                        background: #f8f9fa;
                        padding: 20px 30px;
                        text-align: center;
                        color: #666;
                        font-size: 14px;
                    }
                    .footer a {
                        color: #8b6f47;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>☕ JavaBite Coffee</h1>
                        <p>Premium Coffee Management System</p>
                    </div>
                    <div class="content">
                        <h2>Hello %s!</h2>
                        <p>You've been invited to join the JavaBite Coffee team as a:</p>
                        <div class="role-badge">%s</div>
                        
                        <p>We're excited to have you on board! Click the button below to accept your invitation and set up your account password:</p>
                        
                        <div style="text-align: center;">
                            <a href="%s" class="button">Accept Invitation & Set Password</a>
                        </div>
                        
                        <div class="info-box">
                            <strong>⏰ Important:</strong> This invitation will expire in 7 days. Please accept it before then.
                        </div>
                        
                        <p>Once you accept, you'll be able to:</p>
                        <ul>
                            <li>Access your dedicated dashboard</li>
                            <li>Manage orders and tasks</li>
                            <li>Collaborate with the team</li>
                            <li>Track your performance</li>
                        </ul>
                        
                        <p>If you have any questions, please contact your administrator.</p>
                    </div>
                    <div class="footer">
                        <p>If you didn't expect this invitation, please ignore this email.</p>
                        <p>© 2024 JavaBite Coffee. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, name, role, invitationLink);
    }

    /**
     * Send order notification email
     */
    public void sendOrderConfirmationEmail(String to, String customerName, Long orderId, Double total) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Order Confirmation - JavaBite Coffee");

            String htmlContent = buildOrderConfirmationEmail(customerName, orderId, total);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✅ Order confirmation email sent to {}", to);
        } catch (MessagingException e) {
            log.error("❌ Failed to send order confirmation email", e);
        }
    }

    private String buildOrderConfirmationEmail(String customerName, Long orderId, Double total) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #8b6f47; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background: #f9f9f9; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>☕ Order Confirmed</h1>
                    </div>
                    <div class="content">
                        <h2>Thank you, %s!</h2>
                        <p>Your order #%d has been confirmed.</p>
                        <p><strong>Total: $%.2f</strong></p>
                        <p>Your order is being prepared. We'll notify you when it's ready!</p>
                    </div>
                </div>
            </body>
            </html>
            """, customerName, orderId, total);
    }
}
