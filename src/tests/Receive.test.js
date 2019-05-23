import until from 'enzyme-shallow-until'
import ShallowWrapper from 'enzyme/ShallowWrapper'

import Receive from '../components/ReceiveComponent'
import ReceiveWalletSelection from '../containers/ReceiveWalletSelectionContainer'

ShallowWrapper.prototype.until = until

describe('ReceiveComponent', () => {
  const history = { location: '/receive' }

  it('step = 1', () => {
    const wrapper = shallow(
      <Receive step={1} history={history} />
    ).until(ReceiveWalletSelection)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('step = 2', () => {
    const wrapper = shallow(
      <Receive step={2} history={history} />
    ).until(ReceiveWalletSelection)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('step = 3', () => {
    const wrapper = shallow(
      <Receive step={3} history={history} />
    ).until(ReceiveWalletSelection)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('step = 4', () => {
    const wrapper = shallow(
      <Receive step={4} history={history} />
    ).until(ReceiveWalletSelection)
    expect(toJson(wrapper)).toMatchSnapshot()
  })
})
