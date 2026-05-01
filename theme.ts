// Nobi brand tokens
export const colors = {
  nightGreen: '#2e4447',
  morningGreen: '#37928b',
  morningGreenDark: '#2e7d77',
  sand: '#faf6ee',
  sandBorder: '#e8e2d2',
  muted: '#7a8587',
  white: '#ffffff',
  bg: '#f4efe5',
  danger: '#d96450',
  dangerBg: '#fde8e4',
};

export const fonts = {
  light: 'Hanken-Light',
  regular: 'Hanken',
  bold: 'Hanken-Bold',
};

export const radius = {
  sm: 11,
  md: 14,
  lg: 22,
};

// vCard for "My Card" QR — edit these once with your details
export const myCard = {
  firstName: 'Bert',
  lastName: 'De Haes',
  function: 'Co-Founder',
  company: 'Nobi NV',
  email: 'bert@nobi.life',
  phone: '+32 ...',
  mobile: '+32 ...',
  website: 'https://nobi.life',
  address: 'Boechout, Belgium',
};

export function buildVCard(c: typeof myCard): string {
  // RFC 6350 vCard 3.0 — broadly compatible with iOS + Android
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${c.lastName};${c.firstName};;;`,
    `FN:${c.firstName} ${c.lastName}`,
    `ORG:${c.company}`,
    `TITLE:${c.function}`,
    `EMAIL;TYPE=WORK:${c.email}`,
    c.phone ? `TEL;TYPE=WORK,VOICE:${c.phone}` : '',
    c.mobile ? `TEL;TYPE=CELL:${c.mobile}` : '',
    c.website ? `URL:${c.website}` : '',
    c.address ? `ADR;TYPE=WORK:;;${c.address};;;;` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\n');
}
