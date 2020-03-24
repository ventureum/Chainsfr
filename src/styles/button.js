import { btnTexts } from './typography'
import { uiColors, fontColors } from './color'
import { spacing } from './base'

export const buttons = {
  primary: {
    fontFamily: btnTexts.btnTextLight.fontFamily,
    fontWeight: btnTexts.btnTextLight.fontWeight,
    fontSize: btnTexts.btnTextLight.fontSize,
    lineHeight: btnTexts.btnTextLight.lineHeight,
    color: btnTexts.btnTextLight.color,
    backgroundColor: uiColors.primary,
    textTransform: 'capitalize',

    paddingTop: spacing.s,
    paddingBottom: spacing.s,
    paddingLeft: spacing.m,
    paddingRight: spacing.m,

    '&:hover': {
      backgroundColor: uiColors.primaryDark
    },

    '&:disabled': {
      backgroundColor: uiColors.backgroundDisabled
    }
  },

  secondary: {
    fontFamily: btnTexts.btnTextPrimary.fontFamily,
    fontWeight: btnTexts.btnTextPrimary.fontWeight,
    fontSize: btnTexts.btnTextPrimary.fontSize,
    lineHeight: btnTexts.btnTextPrimary.lineHeight,
    color: btnTexts.btnTextPrimary.color,
    backgroundColor: uiColors.backgroundTint,
    textTransform: 'capitalize',
    border: 'solid 1px',
    borderColor: uiColors.primary,

    paddingTop: spacing.s,
    paddingBottom: spacing.s,
    paddingLeft: spacing.m,
    paddingRight: spacing.m,

    '&:hover': {
      borderColor: uiColors.primaryDark,
      color: uiColors.primaryDark,
      backgroundColor: uiColors.background
    },

    '&:disabled': {
      borderColor: uiColors.border,
      color: btnTexts.btnTextDark.color
    }
  },

  link: {
    fontFamily: btnTexts.btnTextLight.fontFamily,
    fontWeight: btnTexts.btnTextLight.fontWeight,
    fontSize: btnTexts.btnTextLight.fontSize,
    lineHeight: btnTexts.btnTextLight.lineHeight,
    color: fontColors.white,
    backgroundColor: uiColors.white
  },

  dangerous: {
    fontFamily: btnTexts.btnTextLight.fontFamily,
    fontWeight: btnTexts.btnTextLight.fontWeight,
    fontSize: btnTexts.btnTextLight.fontSize,
    lineHeight: btnTexts.btnTextLight.lineHeight,
    color: btnTexts.btnTextLight.color,
    backgroundColor: uiColors.dangerous
  }
}
