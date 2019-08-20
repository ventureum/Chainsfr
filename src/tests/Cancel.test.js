import until from 'enzyme-shallow-until'
import ShallowWrapper from 'enzyme/ShallowWrapper'

import Cancel from '../components/CancelComponent'
import CancelReview from '../containers/CancelReviewContainer'

ShallowWrapper.prototype.until = until

describe('CancelComponent', () => {
  const history = { location: { search: '?id=9e9a520d-f364-4dc2-897e-cba51f37e78a' } }

  it('step = 0', () => {
    const wrapper = shallow(
      <Cancel step={0} history={history} />
    ).until(CancelReview)
    expect(wrapper.find(CancelReview).props().transferId).toEqual('9e9a520d-f364-4dc2-897e-cba51f37e78a')
    expect(toJson(wrapper)).toMatchSnapshot()
  })

  it('step = 1', () => {
    const wrapper = shallow(
      <Cancel step={1} history={history} />
    ).until(CancelReview)
    expect(toJson(wrapper)).toMatchSnapshot()
  })
})
