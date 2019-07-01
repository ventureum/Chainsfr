
// Typography

export const fontFamily = {
  fontFamily: "'Lato', Roboto', sans-serif;",
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
  xs: spacingBaseUnit - 4,
  s: spacingBaseUnit,
  m: spacingBaseUnit * 2,
  l: spacingBaseUnit * 3,
  xl: spacingBaseUnit * 4,
  xxl: spacingBaseUnit * 6
}

// color, 100-lightest, 900-darkest
export const baseColors = {
  black: '#333',
  grey: {
    g600: '#666',
    g500: '#a8a8a8',
    g400: '#c4c4c4',
    g300: '#d2d2d2',
    g200: '#e9e9e9',
    g100: '#f8f8f8'

  },
  purple: {
    p400: '#452bd6',
    p700: '#3118bd'
  },
  red: {
    r500: '#dc1434',
    r700: '#dc1434'
  },
  white: '#fff',
  blue: {
    b100: '#f6f9fe',
    b400: '#4285F4', // primary
    b500: '#396EC8',
    b600: '#1266f1', // temp
    b700: '#1266f1'
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
