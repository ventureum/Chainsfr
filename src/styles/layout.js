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
      paddingRight: spacing.s   //for close action
    },
    contentForm: {
      paddingTop: spacing.s, // MuiDialogTitle and MuiDialogContent share the 10/30px spacing to support textfield label transformation
      paddingBottom: spacing.l
    },
    contentText:{
      paddingBottom: spacing.l
    }
  },
  textField: {
    default:{
      paddingBottom: spacing.l
    }
  },
  toolbar: {
    default: {
      paddingLeft: spacing.xxl,
      paddingRight: spacing.xxl
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
