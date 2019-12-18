// Typography

export const fontFamily = {
  fontFamily: "'Lato', 'Roboto', sans-serif;",
  fontFamilySeconday: "'Poppins', sans-serif;"
}

// line-height = font-size * 1.5, rounded to closest even integer
export const fontSize = {
  base: 14,
  xs: {
    size: 12,
    lineHeight: '18px'
  },

  s: {
    size: 14,
    lineHeight: '20px'
  },

  m: {
    size: 18,
    lineHeight: '26px'
  },

  l: {
    size: 24,
    lineHeight: '36px'
  },

  xl: {
    size: 32,
    lineHeight: '48px'
  }
}

export const fontWeight = {
  thin: 100,
  light: 300,
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  black: 900
}

// spacing
const spacingBaseUnit = 10

export const spacing = {
  base: spacingBaseUnit,
  xs: spacingBaseUnit - 2,
  s: spacingBaseUnit,
  m: spacingBaseUnit * 2,
  l: spacingBaseUnit * 3,
  xl: spacingBaseUnit * 4,
  xxl: spacingBaseUnit * 6
}

// color, 100-lightest, 900-darkest
export const baseColors = {
  black: '#333',
  white: '#fff',
  grey: {
    g100: '#f8f8f8',
    g200: '#e9e9e9',
    g300: '#d2d2d2',
    g400: '#c4c4c4',
    g500: '#a8a8a8',
    g600: '#777',
    g700: '#666',
    g800: '#333',
    g900: '#111'
  },
  purple: {
    p100: '#f5f5f9',
    p200: '#ebebf3',
    p400: '#452bd6',
    p500: '#393386', // primary
    p700: '#1D1960'
  },
  red: {
    r100: '#f8e7eb',
    r200: '#fbaba0',
    r300: '#f4726f',
    r400: '#ea4a55',
    r500: '#dc1434',
    r600: '#bd0e3a',
    r700: '#9e0a3d',
    r800: '#7f063b',
    r900: '#69033a'
  },
  blue: {
    b100: '#f6f9fe',
    b200: '#B3D8FD',
    b300: '#8DBFFB',
    b400: '#70A8F8',
    b500: '#4285F4',
    b600: '#3066D1', // temp
    b700: '#214BAF',
    b800: '#15348D',
    b900: '#0C2375'
  },
  green: ''
}

export const borderRadius = {
  s: 4,
  m: 8,
  l: 16
}

export const textTransform = {
  lowercase: 'lowercase',
  uppercase: 'uppercase',
  titlecase: 'capitalize',
  default: 'none'
}

export const elementWidth = {
  fullWidth: '100%',
  xxl: 640,
  xl: 420,
  l: 240,
  m: 120,
  s: 60,
  xs: 30
}
