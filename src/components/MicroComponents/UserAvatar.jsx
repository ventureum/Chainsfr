import React from 'react'
import Avatar from '@material-ui/core/Avatar'

const UserAvatar = props => {
  const { src, name, style } = props
  if (src) {
    return <Avatar src={src} style={style} />
  } else if (name) {
    return <Avatar style={style}>{name.charAt(0).toUpperCase()}</Avatar>
  } else {
    return <Avatar />
  }
}

export default UserAvatar
