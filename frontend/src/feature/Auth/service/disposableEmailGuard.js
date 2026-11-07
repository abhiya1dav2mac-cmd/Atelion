/**
 * Frontend Disposable & Temporary Email Blocker
 * Prevents disposable email signups with instant client-side feedback.
 */

const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  '10minmail.com',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'tempmail.net',
  'tempmailgen.com',
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'sharklasers.com',
  'grr.la',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'throwawaymail.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.org',
  'trashmail.me',
  'dispostable.com',
  'fakeinbox.com',
  'generator.email',
  'emailondeck.com',
  'mohmal.com',
  'getairmail.com',
  'mytempemail.com',
  'crazymailing.com',
  'burnermail.io',
  'inboxkitten.com',
  'tempr.email',
  'discard.email',
  'spambog.com',
  'tmail.ws',
  'dropmail.me',
  'fakemailgenerator.com',
  'getnada.com',
  'maildrop.cc',
  'nada.ltd',
  'mailforspam.com',
  'safetymail.info',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'einrot.com',
  'throwaway.email',
  'trash-mail.com',
  'tempinbox.com',
  'binkmail.com',
  'bobmail.info',
  'chammy.info',
  'devnullmail.com',
  'letthemeatspam.com',
  'mailin8r.com',
  'mailinator2.com',
  'notmailinator.com',
  'reallymymail.com',
  'reconmail.com',
  'sogetthis.com',
  'suremail.info',
  'thisisnotmyrealemail.com',
  'zippymail.info',
  'mailsac.com',
  'harakirimail.com',
  'mintemail.com',
  'tempmailaddress.com',
  'burner.email',
  'burnermail.com',
  'fastmail.fm',
  'spam4.me',
  'pokemail.net',
  'emailfake.com',
  'anonymbox.com',
]);

const DISPOSABLE_PATTERNS = [
  /temp.*mail/i,
  /mail.*temp/i,
  /dispos(able)?/i,
  /throwaway/i,
  /fakemail/i,
  /trash.*mail/i,
  /minute.*mail/i,
  /10min/i,
  /burner/i,
  /guerrilla/i,
  /spambox/i,
  /fakeinbox/i,
  /sharklaser/i,
  /yopmail/i,
  /mailinator/i,
];

export function isTempEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1].trim();

  if (DISPOSABLE_DOMAINS.has(domain)) return true;

  for (const known of DISPOSABLE_DOMAINS) {
    if (domain.endsWith('.' + known)) return true;
  }

  for (const pattern of DISPOSABLE_PATTERNS) {
    if (pattern.test(domain)) return true;
  }

  return false;
}
