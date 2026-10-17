/** No adapter or third-party script is loaded by default. Never pass personal data. */
export type BusinessEvent =
  | 'ai_chatbot_hero_cta'
  | 'ai_chatbot_conversation_view'
  | 'ai_chatbot_whatsapp_section'
  | 'ai_chatbot_final_cta'
  | 'ai_automation_hero_cta'
  | 'ai_automation_workflow_view'
  | 'ai_automation_use_case'
  | 'ai_automation_final_cta'
  | 'hero_book_call'
  | 'hero_view_work'
  | 'project_view'
  | 'service_view'
  | 'insight_view'
  | 'faq_contact'
  | 'final_cta_start_project'
  | 'contact_submit'
  | 'book_call_click'
  | 'see_work_click'
  | 'contact_click'
  | 'form_start'
  | 'form_submit_success'
  | 'service_to_case_study'
  | 'case_study_to_cta'
  | 'insight_to_service';
export interface EventContext {
  path: string;
  source: 'direct' | 'organic' | 'ai_referral' | 'other';
  label?: string;
}
export type AnalyticsAdapter = (
  event: BusinessEvent,
  context: EventContext,
) => void;
let adapter: AnalyticsAdapter | undefined;
export function configureAnalytics(next: AnalyticsAdapter | undefined): void {
  adapter = next;
}
export function trackEvent(event: BusinessEvent, context: EventContext): void {
  // Strip queries/fragments to avoid leaking identifiers from inbound links.
  adapter?.(event, { ...context, path: context.path.split(/[?#]/)[0] ?? '/' });
}
