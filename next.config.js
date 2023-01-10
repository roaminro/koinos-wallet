const nextTranslate = require('next-translate')

const withPWA = require('next-pwa')({
  dest: 'public'
})

const { version } = require('./package.json')


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  publicRuntimeConfig: {
    version,
  },
}

const pwaConfig = withPWA(nextConfig)

module.exports = nextTranslate(pwaConfig)
