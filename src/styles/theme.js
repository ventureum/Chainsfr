import { createMuiTheme } from '@material-ui/core/styles'
import { uiColors, fontColors } from './color'
import { baseFont, btnTexts, headers } from './typography'
import { componentMargins, componentPaddings, componentAlignments, componentSizes, radius } from './layout'
import { spacing } from './base'

export const theme = createMuiTheme({
  spacing: spacing.base,
  palette: {
    primary: {
      main: uiColors.primary,
      dark: uiColors.primaryDark,
      contrastText: uiColors.white
    },
    secondary: {
      main: uiColors.secondary,
      dark: uiColors.secondaryDark,
      contrastText: fontColors.primary
    },
    background: {
      default: uiColors.backgroundTint,
      paper: uiColors.white
    },
    error: {
      main: uiColors.error,
      dark: uiColors.errorDark,
      contrastText: uiColors.white
    }
  },
  typography: {
    fontFamily: baseFont.fontFamily,
    fontSize: baseFont.fontSize,
    h1: {
      fontSize: headers.h1.fontSize,
      fontWeight: headers.h1.fontWeight,
      lineHeight: headers.h1.lineHeight,
      color: headers.h1.color,
      textTransform: headers.h1.textTransform
    },
    h2: {
      fontSize: headers.h2.fontSize,
      fontWeight: headers.h2.fontWeight,
      lineHeight: headers.h2.lineHeight,
      color: headers.h2.color,
      textTransform: headers.h2.textTransform
    },
    h3: {
      fontSize: headers.h3.fontSize,
      fontWeight: headers.h3.fontWeight,
      lineHeight: headers.h3.lineHeight,
      color: headers.h3.color,
      textTransform: headers.h3.textTransform
    },
    h4: {
      fontSize: headers.h4.fontSize,
      fontWeight: headers.h4.fontWeight,
      lineHeight: headers.h4.lineHeight,
      color: headers.h4.color,
      textTransform: headers.h4.textTransform
    },
    button: {
      fontWeight: btnTexts.fontWeight,
      fontSize: btnTexts.btnTextLight.fontSize,
      lineHeight: btnTexts.btnTextLight.lineHeight,
      textTransform: btnTexts.textTransform
    }
  },
  shape: {
    borderRadius: radius.buttonRadius
  },
  MuiButton: {
    root: {
      paddingTop: componentPaddings.buttons.default.paddingTop,
      paddingBottom: componentPaddings.buttons.default.paddingBottom,
      paddingLeft: componentPaddings.buttons.default.paddingLeft,
      paddingRight: componentPaddings.buttons.default.paddingRight
    },
    outlined: {
      paddingTop: componentPaddings.buttons.default.paddingTop,
      paddingBottom: componentPaddings.buttons.default.paddingBottom,
      paddingLeft: componentPaddings.buttons.default.paddingLeft,
      paddingRight: componentPaddings.buttons.default.paddingRight
    }
  }
})
