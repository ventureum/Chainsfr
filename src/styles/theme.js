import { createMuiTheme } from '@material-ui/core/styles'
import { uiColors, fontColors } from './color'
import { baseFont, btnTexts, descriptions, headers, textValues } from './typography'
import { componentMargins, componentPaddings, componentSizes, radius } from './layout'
import { spacing, borderRadius } from './base'

export const themeChainsfr = createMuiTheme({
  spacing: spacing.base,
  palette: {
    primary: {
      main: uiColors.primary,
      dark: uiColors.primaryDark,
      contrastText: uiColors.white
    },
    secondary: {
      main: fontColors.secondary,
      dark: fontColors.secondaryDark,
      contrastText: fontColors.secondary
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
    h6: {
      fontSize: headers.h6.fontSize,
      fontWeight: headers.h6.fontWeight,
      lineHeight: headers.h6.lineHeight,
      color: headers.h6.color,
      textTransform: headers.h6.textTransform
    },
    subtitle1: {
      fontSize: descriptions.d1.fontSize,
      fontWeight: descriptions.d1.fontWeight,
      lineHeight: descriptions.d1.lineHeight,
      color: descriptions.d1.color,
      textTransform: descriptions.d1.textTransform
    },
    subtitle2: {
      fontSize: descriptions.d3.fontSize,
      fontWeight: descriptions.d3.fontWeight,
      lineHeight: descriptions.d3.lineHeight,
      color: descriptions.d3.color,
      textTransform: descriptions.d3.textTransform
    },
    body1: {
      fontSize: descriptions.d3.fontSize,
      fontWeight: descriptions.d3.fontWeight,
      lineHeight: descriptions.d3.lineHeight,
      color: descriptions.d3.color,
      textTransform: descriptions.d3.textTransform
    },
    body2: {
      fontSize: descriptions.d4.fontSize,
      fontWeight: descriptions.d4.fontWeight,
      lineHeight: descriptions.d4.lineHeight,
      color: descriptions.d4.color,
      textTransform: descriptions.d4.textTransform
    },
    caption: {
      fontSize: descriptions.d5.fontSize,
      fontWeight: descriptions.d5.fontWeight,
      lineHeight: descriptions.d5.lineHeight,
      color: descriptions.d5.color,
      textTransform: descriptions.d5.textTransform
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
  divider: {
    color: uiColors.border
  },
  overrides: {
    MuiAvatar: {
      root: {
        width: componentSizes.avatar.default.width,
        height: componentSizes.avatar.default.height
      }
    },
    MuiButton: {
      root: {
        paddingTop: componentPaddings.buttons.default.paddingTop,
        paddingBottom: componentPaddings.buttons.default.paddingBottom,
        paddingLeft: componentPaddings.buttons.default.paddingLeft,
        paddingRight: componentPaddings.buttons.default.paddingRight,

        '&.warning': {
          backgroundColor: uiColors.error,
          color: uiColors.white,

          '&:hover': {
            backgroundColor: uiColors.errorDark
          }
        }
      },
      text: {
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
      },
      sizeSmall: {
        paddingTop: componentPaddings.buttons.small.paddingTop,
        paddingBottom: componentPaddings.buttons.small.paddingBottom,
        paddingLeft: componentPaddings.buttons.small.paddingLeft,
        paddingRight: componentPaddings.buttons.small.paddingRight,
        fontSize: btnTexts.btnTextSmall.fontSize,
        lineHeight: btnTexts.btnTextSmall.lineHeight
      }
    },
    MuiCard: {
      root: {
        paddingTop: componentPaddings.card.default.paddingTop,
        paddingBottom: componentPaddings.card.default.paddingBottom,
        marginBottom: componentMargins.card.default.marginBottom,
        backgroundColor: uiColors.white,
        borderRadius: borderRadius.m,
        boxShadow: `0px 2px 4px rgba(51, 51, 51, 0.1)`
      }
    },
    MuiContainer: {
      root: {
        paddingTop: componentPaddings.container.default.paddingTop,
        paddingBottom: componentPaddings.container.default.paddingBottom
      },
      maxWidthLg: {
        '@media (min-width: 1280px)': {
          maxWidth: 1080
        }
      }
    },
    MuiDialogActions: {
      root: {
        paddingTop: componentPaddings.modal.clearfix.none,
        paddingBottom: componentPaddings.modal.default.paddingBottom,
        paddingLeft: componentPaddings.modal.default.paddingLeft,
        paddingRight: componentPaddings.modal.default.paddingRight
      }
    },
    MuiDialogContent: {
      root: {
        paddingLeft: componentPaddings.modal.default.paddingLeft,
        paddingRight: componentPaddings.modal.default.paddingRight,

        '&.dialog-form': {
          paddingTop: componentPaddings.modal.contentForm.paddingTop,
          paddingBottom: componentPaddings.modal.contentForm.paddingBottom
        },

        '&.dialog-content': {
          paddingTop: componentPaddings.modal.clearfix.none,
          paddingBottom: componentPaddings.modal.contentText.paddingBottom
        }
      }
    },
    MuiDialogTitle: {
      root: {
        paddingTop: componentPaddings.modal.title.paddingTop,
        paddingBottom: componentPaddings.modal.title.paddingBottom,
        paddingLeft: componentPaddings.modal.default.paddingLeft,
        paddingRight: componentPaddings.modal.title.paddingRight
      }
    },
    MuiFormLabel: {
      root: {
        fontSize: 14
      }
    },
    MuiFormControl: {
      marginNormal: {
        marginTop: componentMargins.textField.default.marginTop,
        marginBottom: componentMargins.textField.default.marginBottom
      },
      marginDense: {
        marginTop: componentMargins.textField.dense.marginTop,
        marginBottom: componentMargins.textField.dense.marginBottom
      }
    },
    MuiIcon: {
      root: {
        fontSize: 12
      },
      fontSizeLarge: {
        fontSize: 32
      }
    },
    MuiInputBase: {
      root: {
        fontSize: textValues.default.fontSize
      }
    },
    MuiInputAdornment: {
      root: {
        fontSize: textValues.default.fontSize
      }
    },
    MuiMenuItem: {
      root: {
        fontSize: textValues.default.fontSize,
        lineHeight: textValues.default.lineHeight,
        color: textValues.default.color
      },
      gutters: {
        paddingTop: componentPaddings.menuItem.default.paddingTop,
        paddingBottom: componentPaddings.menuItem.default.paddingBottom
      }
    },
    MuiSvgIcon: {
      fontSizeLarge: {
        fontSize: 32
      }
    },
    MuiTextField: {
      root: {
        fontSize: textValues.default.fontSize
      }
    },
    MuiToolbar: {
      gutters: {
        '@media (min-width: 600px)': {
          paddingLeft: componentPaddings.toolbar.default.paddingLeft,
          paddingRight: componentPaddings.toolbar.default.paddingRight
        }
      }
    }
  },
  zIndex: {
    mobileStepper: 60,
    speedDial: 65,
    appBar: 70,
    drawer: 80,
    modal: 90,
    snackbar: 100,
    tooltip: 110
  }
})
