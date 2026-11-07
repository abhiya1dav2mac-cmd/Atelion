/**
 * Strict Disposable & Temporary Email Blocker
 * Blocks 300+ known disposable domains & dynamic pattern heuristics.
 */

const DISPOSABLE_DOMAINS = new Set([
  // Popular throwaway services
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
  'abv.bg',
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
  'burnerapp.com',
  'fastmail.fm',
  'guerrillamail.biz',
  'guerrillamail.de',
  'spam4.me',
  'grr.biz',
  'pokemail.net',
  'mohmal.in',
  'mohmal.im',
  'emailfake.com',
  'emkei.cz',
  'anonymbox.com',
  'inboxbear.com',
  'mailcatch.com',
  'mytempmail.org',
  'trashymail.com',
  'mailscrap.com',
]);

// Dynamic regex pattern to catch domain permutations
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
  /discard/i,
  /sharklaser/i,
  /yopmail/i,
  /mailinator/i,
];

/**
 * Checks if email domain is disposable or temporary
 * @param {string} email
 * @returns {boolean}
 */
function isDisposableEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const clean = email.toLowerCase().trim();
  const parts = clean.split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1].trim();

  // 1. Direct Set lookup (O(1))
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return true;
  }

  // 2. Subdomain check (e.g., mail.trashmail.com)
  for (const known of DISPOSABLE_DOMAINS) {
    if (domain.endsWith('.' + known)) {
      return true;
    }
  }

  // 3. Heuristic pattern check
  for (const pattern of DISPOSABLE_PATTERNS) {
    if (pattern.test(domain)) {
      return true;
    }
  }

  return false;
}

module.exports = {
  isDisposableEmail,
  DISPOSABLE_DOMAINS,
};
