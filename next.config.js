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

module.exports = withPWA(nextConfig)
