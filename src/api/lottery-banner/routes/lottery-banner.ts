/**
 * lottery-banner router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/lottery-banners/active',
      handler: 'lottery-banner.findActive',
      config: {
        auth: false,
      },
    },
  ],
}; 