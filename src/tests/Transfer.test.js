import until from 'enzyme-shallow-until'
import ShallowWrapper from 'enzyme/ShallowWrapper'

import Transfer from '../components/TransferComponent'
import WalletSelection from '../containers/WalletSelectionContainer'

ShallowWrapper.prototype.until = until

describe('TransferComponent', () => {
  const history = { location: '/transfer' }

  it('step = 0', () => {
    const wrapper = shallow(
      <Transfer step={0} history={history} />
    ).until(WalletSelection)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('step = 1', () => {
    const wrapper = shallow(
      <Transfer step={1} history={history} />
    ).until(WalletSelection)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('step = 2', () => {
    const wrapper = shallow(
      <Transfer step={2} history={history} />
    ).until(WalletSelection)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('step = 3', () => {
    const wrapper = shallow(
      <Transfer step={3} history={history} />
    ).until(WalletSelection)
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('step = 4', () => {
    const wrapper = shallow(
      <Transfer step={4} history={history} />
    ).until(WalletSelection)
    expect(toJson(wrapper)).toMatchSnapshot()
  })
})
