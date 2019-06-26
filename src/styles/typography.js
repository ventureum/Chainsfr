import { fontFamily, fontWeight, fontSize } from './base'
import { fontColors, uiColors } from './color'

export const headers = {
  h1: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.xl.size,
    lineHeight: fontSize.xl.lineHeight,
    color: fontColors.primary
  },

  h2: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.l.size,
    lineHeight: fontSize.l.lineHeight,
    color: fontColors.primary
  },

  h3: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.m.size,
    lineHeight: fontSize.m.lineHeight,
    color: fontColors.primary
  },

  h4: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: fontColors.primary
  }

}

// description is one level less than header (fontWeight, fontSize, lineHeight, color)
export const descriptions = {
  d1: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.l.size,
    lineHeight: fontSize.l.lineHeight,
    color: fontColors.secondary
  },

  d2: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.l.size,
    lineHeight: fontSize.l.lineHeight,
    color: fontColors.primary
  },

  d3: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.m.size,
    lineHeight: fontSize.m.lineHeight,
    color: fontColors.primary
  },

  d4: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: fontColors.primary
  }
}

export const textValues = {
  textDefault: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.l.size,
    lineHeight: fontSize.l.lineHeight,
    color: fontColors.secondary
  },

  textLarge: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.l.size,
    lineHeight: fontSize.l.lineHeight,
    color: fontColors.primary
  },

  textSmall: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.m.size,
    lineHeight: fontSize.m.lineHeight,
    color: fontColors.primary
  }
}

export const labels = {
  labelDefault: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.l.size,
    lineHeight: fontSize.l.lineHeight,
    color: fontColors.secondary
  },

  labelLarge: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.l.size,
    lineHeight: fontSize.l.lineHeight,
    color: fontColors.secondary
  },

  labelSmall: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.l.size,
    lineHeight: fontSize.l.lineHeight,
    color: fontColors.primary
  }
}

export const btnTexts = {
  btnTextLight: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: fontColors.white
  },
  btnTextLightSmall: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.xs.size,
    lineHeight: fontSize.xs.lineHeight,
    color: fontColors.white
  },
  btnTextDark: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: fontColors.black
  },
  btnTextLink: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: uiColors.primary
  },
  btnTextPrimary: {
    fontFamily: fontFamily.fontFamily,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.s.size,
    lineHeight: fontSize.s.lineHeight,
    color: uiColors.primary
  }

}
