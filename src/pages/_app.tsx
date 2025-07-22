import React from 'react'
import type { AppProps } from 'next/app'
import App from '../App'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return <App {...pageProps} />
}

export default MyApp
