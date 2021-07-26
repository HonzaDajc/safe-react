import { makeStyles } from '@material-ui/core/styles'
import cn from 'classnames'
import * as React from 'react'
import Link from 'src/components/layout/Link'
import { screenSm, sm } from 'src/theme/variables'

const useStyles = makeStyles({
  footer: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    flexShrink: '1',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin: '0 auto',
    maxWidth: '100%',
    padding: `20px ${sm} 20px`,
    width: `${screenSm}px`,
  },
  item: {
    color: 'rgba(0, 0, 255, 0.54)',
    fontSize: '13px',
  },
  link: {
    color: 'rgba(0, 0, 255, 0.54)',
    textDecoration: 'none',

    '&:hover': {
      textDecoration: 'underline',
    },
  },
  sep: {
    color: 'rgba(0, 0, 0, 0.54)',
    margin: '0 10px',
  },
  buttonLink: {
    padding: '0',
  },
} as any)

const appVersion = process.env.REACT_APP_APP_VERSION ? `v${process.env.REACT_APP_APP_VERSION} ` : 'Versions'

const Footer = (): React.ReactElement => {
  const date = new Date()
  const classes = useStyles()

  return (
    <footer className={classes.footer}>
      <span className={classes.item}>©{date.getFullYear()} Fantom Foundation</span>
      <span className={classes.sep}>|</span>
      <Link className={cn(classes.item, classes.link)} target="_blank" to="https://fantom.foundation/terms-of-service/">
        Terms of Service
      </Link>
      <span className={classes.sep}>|</span>
      <Link className={cn(classes.item, classes.link)} target="_blank" to="https://fantom.foundation/privacy-policy/">
        Privacy Policy
      </Link>
      <span className={classes.sep}>|</span>
      <span className={classes.item}>{appVersion}</span>
    </footer>
  )
}

export default Footer
