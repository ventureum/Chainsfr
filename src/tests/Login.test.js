import React from 'react'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import { store } from '../configureStore'

import LoginContainer from '../containers/LoginContainer'

it('render Login page', () => {
  const tree = renderer.create(
    <Provider store={store}>
      <LoginContainer />
    </Provider>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
