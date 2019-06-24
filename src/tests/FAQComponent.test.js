import Button from '@material-ui/core/Button'
import Fab from '@material-ui/core/Fab'
import Dialog from '@material-ui/core/Dialog'

import FAQComponent from '../components/FAQComponent'

const initialProps = {
  docId: 'general',
  fullScreen: false
}

let wrapper

describe('FAQComponent', () => {
  it('should render in non-fullscreen', () => {
    wrapper = mount(<FAQComponent {...initialProps} />)
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })

  it('should render in fullscreen', () => {
    wrapper = mount(<FAQComponent {...initialProps} />)
    wrapper.setProps({ fullScreen: true })
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })

  it('should handlec open', () => {
    wrapper = mount(shallow(<FAQComponent {...initialProps} />).get(0))
    wrapper.find(Fab).simulate('click')
    expect(wrapper.state().open).toEqual(true)
  })

  it('should handlec close', () => {
    wrapper = shallow(<FAQComponent {...initialProps} />).dive()
    wrapper.find(Dialog).dive().find(Button).simulate('click')
    expect(wrapper.state().open).toEqual(false)
  })
})
