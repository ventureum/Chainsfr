import React from 'react'
import Avatar from '@material-ui/core/Avatar'

const UserAvatar = props => {
  const { src, name, style } = props
  if (src) {
    return <Avatar src={src} style={style} />
  } else {
    return <Avatar style={style}>{name.charAt(0).toUpperCase()}</Avatar>
  }
}

export default UserAvatar
