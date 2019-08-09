const styles = theme => ({
  form: {
    width: '480px'
  },
  textField: {
    margin: '20px 0px 20px 0px'
  },
  closeIcon: {
    color: '#777777',
    fontSize: '20px'
  },
  closeBtn: {
    padding: '0px',
    margin: '0px',
    alignSelf: 'flex-end'
  },
  title: {
    color: '#333333',
    fontSize: '24px'
  },
  dialogTitle: {
    padding: '20px 40px 0px 40px'
  },
  dialogContent: {
    padding: '30px 40px 0px 40px'
  },
  dialogAction: {
    padding: '40px'
  },
  saveBtn: {
    marginLeft: '20px',
    textTransform: 'none'
  },
  cancelBtn: {
    marginRight: '20px',
    textTransform: 'none',
    backgroundColor: 'transparent',
    color: '#777777',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  deleteBtn: {
    margin: '0px',
    textTransform: 'none',
    backgroundColor: '#E23F3F',
    color: 'white'
  },
  deleteText: {
    marginBottom: '20px'
  }
})

export default styles
