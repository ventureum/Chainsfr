import { createMuiTheme } from '@material-ui/core/styles'
import { uiColors } from './color'

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: uiColors.primary
    },
    secondary: {
      main: uiColors.secondary
    }
  }
})
