module.exports = {
  headers: async () => [
    {
      source: '/images/src/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, must-revalidate',
        },
      ],
    },
  ],
}