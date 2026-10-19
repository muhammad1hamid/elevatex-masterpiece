/** Publication requires owner approval of the actual wording and material facts. */
export const legalApproval: Readonly<{
  status: 'draft' | 'approved';
  approvedAt: string;
  approvedRevision: string;
  revision: string;
  operatorConfirmed: boolean;
  retentionConfirmed: boolean;
  providerSettingsOwnerConfirmed: boolean;
}> = {
  status: 'approved',
  approvedAt: '2026-10-19',
  approvedRevision: 'legal-2026-10-19-v1',
  revision: 'legal-2026-10-19-v1',
  operatorConfirmed: true,
  retentionConfirmed: true,
  providerSettingsOwnerConfirmed: true,
};
export const isLegalApproved = (record: typeof legalApproval): boolean =>
  record.status === 'approved' &&
  /^\d{4}-\d{2}-\d{2}$/.test(record.approvedAt) &&
  record.approvedRevision === record.revision &&
  record.operatorConfirmed &&
  record.retentionConfirmed;
export const legalPublished = isLegalApproved(legalApproval);

export const privacyContact = {
  tradingName: 'ElevateX Lab',
  country: 'Pakistan',
  number: '+92 335 6709222',
  href: 'https://wa.me/923356709222',
} as const;
export const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy/' },
  { label: 'Website Terms', href: '/terms/' },
  { label: 'Cookie Policy', href: '/cookies/' },
] as const;
