import { fontFamily, fontWeight, fontSize, textTransform } from './base'
import { fontColors, uiColors } from './color'

export const baseFont = {
  fontFamily: fontFamily.fontFamily,
  fontSize: fontSize.base
}

export const headers = {
  h1: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.xl.size,
    lineHeight: fontSize.xl.lineHeight,
    color: fontColors.primary,
    textTransform: textTransform.titleCase
  },

  h2: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.l.size,
    lineHeight: fontSize.l.lineHeight,
    color: fontColors.primary,
    textTransform: textTransform.titleCase
  },

  h3: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.m.size,
    lineHeight: fontSize.m.lineHeight,
    color: fontColors.primary,
    textTransform: textTransform.titleCase
  },

  h4: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: fontColors.primary,
    textTransform: textTransform.titleCase
  },
  h5: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: fontColors.primary,
    textTransform: textTransform.titleCase
  },
  // table header
  h6: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.xs.size,
    lineHeight: fontSize.xs.lineHeight,
    color: fontColors.secondary,
    textTransform: textTransform.titleCase
  }
}

// description is one level less than header (fontWeight, fontSize, lineHeight, color)
export const descriptions = {
  d1: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.l.size,
    lineHeight: fontSize.l.lineHeight,
    color: fontColors.secondary,
    textTransform: textTransform.default
  },

  d2: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.m.size,
    lineHeight: fontSize.m.lineHeight,
    color: fontColors.secondary,
    textTransform: textTransform.default
  },

  d3: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: fontColors.primary,
    textTransform: textTransform.default
  },

  d4: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: fontColors.secondary,
    textTransform: textTransform.default
  },

  d5: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.xs.size,
    lineHeight: fontSize.xs.lineHeight,
    color: fontColors.secondary,
    textTransform: textTransform.default
  }
}

export const textValues = {
  fontFamily: fontFamily.fontFamily,
  fontWeight: fontWeight.regular,
  default: {
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: fontColors.primary
  },
  large: {},
  small: {
    fontSize: fontSize.xs.size,
    lineHeight: fontSize.xs.lineHeight,
    color: fontColors.primary
  }
}

export const labels = {
  fontFamily: fontFamily.fontFamily,
  fontWeight: fontWeight.regular,
  labelDefault: {
    fontSize: fontSize.l.size,
    lineHeight: fontSize.l.lineHeight,
    color: fontColors.secondary
  },

  labelLarge: {
    fontSize: fontSize.l.size,
    lineHeight: fontSize.l.lineHeight,
    color: fontColors.secondary
  },

  labelSmall: {
    fontSize: fontSize.l.size,
    lineHeight: fontSize.l.lineHeight,
    color: fontColors.primary
  }
}

export const btnTexts = {
  fontFamily: fontFamily.fontFamily,
  fontWeight: fontWeight.semiBold,
  textTransform: textTransform.titleCase,
  btnTextLight: {
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: fontColors.white
  },
  btnTextLightSmall: {
    fontSize: fontSize.xs.size,
    lineHeight: fontSize.xs.lineHeight,
    color: fontColors.white
  },
  btnTextDark: {
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: fontColors.black
  },
  btnTextLink: {
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: uiColors.primary
  },
  btnTextPrimary: {
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: uiColors.primary
  },
  btnTextSmall: {
    fontSize: fontSize.xs.size,
    lineHeight: fontSize.xs.lineHeight
  }
}
