import TextField from '@material-ui/core/TextField'

import CloudWalletUnlock from '../components/CloudWalletUnlockComponent'
import LinearProgress from '@material-ui/core/LinearProgress'
import Button from '@material-ui/core/Button'

const initialProps = {
  open: true,
  cryptoType: 'ethereum',
  handleClose: () => {},
  handleSubmit: () => {},
  actionsPending: {
    decryptCloudWallet: false
  }
}

let wrapper
describe('CloudWalletUnlockComponent Render', () => {
  beforeEach(() => {
    wrapper = mount(<CloudWalletUnlock {...initialProps} />)
  })

  it('should render without error', () => {
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })

  it('should render decryptCloudWallet progress', () => {
    wrapper.setProps({ actionsPending: { decryptCloudWallet: true } })
    expect(wrapper.find(LinearProgress)).toHaveLength(1)
  })

  it('should respond to textfiled input changes', () => {
    const change = 'abc'
    wrapper.find(TextField).props().onChange({ target: { value: change } })
    wrapper.update()
    expect(wrapper.find(TextField).prop('value')).toEqual(change)
  })

  it('should handle close', () => {
    const mockFunction = jest.fn()
    wrapper.setProps({ handleClose: mockFunction })
    wrapper.find(Button).filter('#cancel').simulate('click')
    expect(mockFunction.mock.calls.length).toEqual(1)
  })

  it('should handle submit', () => {
    const change = 'abc'
    const mockFunction = jest.fn()
    wrapper.setProps({ handleSubmit: mockFunction })
    wrapper.find(TextField).props().onChange({ target: { value: change } })
    wrapper.update()
    wrapper.find(Button).filter('#submit').simulate('click')
    expect(mockFunction.mock.calls[0][0]).toEqual(change)
  })
})
