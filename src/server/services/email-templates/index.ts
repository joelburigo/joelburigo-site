import 'server-only';

export { magicLink } from './magic-link';
export { welcomeVss } from './welcome-vss';
export { welcomeAdvisory, type AdvisoryModalidade } from './welcome-advisory';
export {
  advisoryBookingConfirmation,
  type AdvisoryBookingConfirmationProps,
  type RenderedEmailWithAttachments,
} from './advisory-booking-confirmation';
export { formContatoConfirmation } from './form-contato-confirmation';
export { formDiagnosticoConfirmation } from './form-diagnostico-confirmation';
export {
  doubtsAdminNotification,
  type DoubtsAdminNotificationProps,
} from './doubts-admin-notification';
export {
  doubtsConfirmation,
  type DoubtsConfirmationProps,
} from './doubts-confirmation';
export { paymentPending } from './payment-pending';
export {
  advisoryApplicationAdminNotification,
  type AdvisoryApplicationAdminNotificationProps,
} from './advisory-application-admin-notification';
export {
  advisoryApplicationConfirmation,
  type AdvisoryApplicationConfirmationProps,
} from './advisory-application-confirmation';
export type { RenderedEmail } from './magic-link';
