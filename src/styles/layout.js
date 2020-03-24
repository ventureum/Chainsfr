import { borderRadius, elementWidth, spacing } from './base'

export const radius = {
  buttonRadius: borderRadius.s,
  tileRadius: borderRadius.m,
  roundedButtonRadius: borderRadius.max
}

export const componentMargins = {
  buttons: {
    small: {
      marginBottom: spacing.m
    },
    default: {
      marginBottom: spacing.m,
      marginRight: spacing.m
    },
    large: {
      marginBottom: spacing.l
    }
  },
  card: {
    default: {
      marginBottom: spacing.l
    }
  },
  textField: {
    default: {
      marginTop: 0,
      marginBottom: spacing.l
    },
    dense: {
      marginTop: 0,
      marginBottom: spacing.m
    }
  }
}

export const componentPaddings = {
  buttons: {
    extraSmall: {
      paddingTop: spacing.xs,
      paddingBottom: spacing.xs,
      paddingLeft: spacing.xs,
      paddingRight: spacing.xs
    },
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
  },
  card: {
    default: {
      paddingTop: spacing.xxl,
      paddingBottom: spacing.xl
    }
  },
  container: {
    default: {
      paddingTop: spacing.xxl,
      paddingBottom: spacing.xxl
    }
  },
  menuItem: {
    default: {
      paddingTop: spacing.s,
      paddingBottom: spacing.s
    }
  },
  modal: {
    clearfix: {
      none: 0
    },
    default: {
      paddingTop: spacing.m,
      paddingBottom: spacing.m,
      paddingLeft: spacing.l,
      paddingRight: spacing.l
    },
    title: {
      paddingTop: spacing.s,
      paddingBottom: spacing.m, // MuiDialogTitle and MuiDialogContent share the 20/30px spacing to support textfield label transformation
      paddingRight: spacing.s //for close action
    },
    contentForm: {
      paddingTop: spacing.s, // MuiDialogTitle and MuiDialogContent share the 10/30px spacing to support textfield label transformation
      paddingBottom: spacing.l
    },
    contentText: {
      paddingBottom: spacing.l
    }
  },
  textField: {
    default: {
      paddingBottom: spacing.l
    }
  },
  toolbar: {
    default: {
      paddingLeft: spacing.xxl,
      paddingRight: spacing.xxl
    },
    small: {
      paddingLeft: spacing.xs,
      paddingRight: spacing.xs
    }
  }
}

export const componentSizes = {
  avatar: {
    default: {
      width: 32,
      height: 32
    }
  },
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
