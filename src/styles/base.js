
// Typography

export const fontFamily = {
  fontFamily: "'Lato', 'Roboto', 'sans-serif';",
  fontFamilySeconday: "'Source Sans Pro', sans-serif;"
}

// line-height = font-size * 1.5, rounded to closest even integer
export const fontSize = {
  xs: {
    size: '12px',
    lineHeight: '18px'
  },

  s: {
    size: '14px',
    lineHeight: '20px'
  },

  m: {
    size: '18px',
    lineHeight: '26px'
  },

  l: {
    size: '24px',
    lineHeight: '36px'
  },

  xl: {
    size: '32px',
    lineHeight: '48px'
  }
}

export const fontWeight = {
  thin: '100',
  light: '300',
  regular: '400',
  medium: '500',
  bold: '700',
  black: '900'
}

// spacing
const spacingBaseUnit = 10

export const spacing = {
  xs: `${spacingBaseUnit - 4}px`,
  s: `${spacingBaseUnit}px`,
  m: `${spacingBaseUnit * 2}px`,
  l: `${spacingBaseUnit * 3}px`,
  xl: `${spacingBaseUnit * 4}px`,
  xxl: `${spacingBaseUnit * 6}px`
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
  red: '#dc1434',
  white: '#fff',
  blue: {
    b700: '',
    b600: '#2567D3', // temp
    b400: '#4285F4' // primary
  },
  green: ''
}
