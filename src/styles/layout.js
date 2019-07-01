import { borderRadius, elementWidth, spacing } from './base'

export const radius = {
  buttonRadius: borderRadius.s,
  tileRadius: borderRadius.m
}

export const componentMargins = {
  buttons: {
    small: {
      marginBottom: spacing.m
    },
    regular: {
      marginBottom: spacing.m,
      marginRight: spacing.m
    },
    large: {
      marginBottom: spacing.l
    }
  }
}

export const componentPaddings = {
  buttons: {
    small: {
      paddingTop: spacing.xs,
      paddingBottom: spacing.xs,
      paddingLeft: spacing.xs * 2,
      paddingRight: spacing.xs * 2
    },
    default: {
      paddingTop: spacing.s,
      paddingBottom: spacing.s,
      paddingLeft: spacing.m,
      paddingRight: spacing.m
    },
    large: {
      paddingTop: spacing.m,
      paddingBottom: spacing.m,
      paddingLeft: spacing.l,
      paddingRight: spacing.l
    }
  }
}

export const componentSizes = {
  textField: {
    width: {
      full: elementWidth.fullWidth,
      default: elementWidth.xl
    }
  },
  table: {
    minWidth: elementWidth.xl
  }
}
