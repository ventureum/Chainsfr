// @flow
import React from 'react'
import Typography from '@material-ui/core/Typography'

export default function Title (props: { title: string }) {
  return <Typography variant='h3'> {props.title} </Typography>
}
