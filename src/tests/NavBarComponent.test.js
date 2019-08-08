import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'

import NavBar from '../components/NavBarComponent'

const initialProps = {
  backToHome: () => {},
  profile: {
    isAuthenticated: false
  },
  onLogout: () => {},
  clearWalleState: () => {},
  actionsPending: { createCloudWallet: false }
}
const profileObjWithAvatar = {
  imageUrl: 'https://images.pexels.com/photos/2341290/pexels-photo-2341290.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  email: 'abc@gmail.com'
}
const profileObjWithoutAvatar = {
  email: 'abc@gmail.com'
}

jest.mock('react-router-dom', () => () => ({
  Link: 'Link'
}))

let wrapper

describe('NavBarComponent', () => {
  beforeEach(() => {
    wrapper = mount(<NavBar {...initialProps} />)
  })

  it('should render without error with initial props', () => {
    expect(toJson(wrapper.render())).toMatchSnapshot()
  })

  it('should render when user is loginned', () => {
    wrapper.setProps({
      profile: {
        isAuthenticated: true,
        profileObj: profileObjWithAvatar
      }
    })
    expect(wrapper.find(Avatar)).toHaveLength(1)
    wrapper.find(Button).filter('#avatarBtn').simulate('click')
    expect(wrapper.find(Button).filter('#logout')).toHaveLength(1)

    wrapper.setProps({
      profile: {
        isAuthenticated: true,
        profileObj: profileObjWithoutAvatar
      }
    })
    expect(wrapper.find(Button).filter('#logout')).toHaveLength(1)
  })

  it('should handle logout', () => {
    let mockFunction = jest.fn()
    wrapper.setProps({
      onLogout: mockFunction,
      profile: {
        isAuthenticated: true,
        profileObj: profileObjWithoutAvatar
      }
    })
    wrapper.find(Button).filter('#avatarBtn').simulate('click')
    wrapper.find(Button).filter('#logout').simulate('click')
    expect(mockFunction.mock.calls.length).toEqual(1)
  })

  it('should handle backToHome', () => {
    let mockFunction = jest.fn()
    wrapper.setProps({
      backToHome: mockFunction
    })
    wrapper.find(Button).filter('#back').simulate('click')
    expect(mockFunction.mock.calls.length).toEqual(1)
  })
})
