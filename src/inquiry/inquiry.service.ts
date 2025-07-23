import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { Inquiry } from 'src/types/types';

@Injectable()
export class InquiryService {
  private readonly logger = new Logger(InquiryService.name);

  constructor(private readonly mailerService: MailerService) {}

  public async sendInquiry(inquiry: Inquiry) {
    try {
      const sendMailParams: ISendMailOptions = {
        to: inquiry.to,
        from: process.env.SMTP_FROM,
        subject: inquiry.subject,
        text: inquiry.text,
        context: inquiry.context
      };
      const response = await this.mailerService.sendMail(sendMailParams);
      this.logger.log(
        `Email sent successfully to recipients with the following parameters : ${JSON.stringify(
          sendMailParams,
        )}`,
        response,
      );
      return `Inquiry sent successfully to: ${inquiry.to}`
    } catch (error) {
      this.logger.error(
        `Error while sending mail with the following parameters : ${JSON.stringify(
          inquiry,
        )}`,
        error,
      );
    }
  }
}