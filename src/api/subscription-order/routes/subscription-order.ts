export default {
  routes: [
    {
      method: 'POST',
      path: '/subscription-orders',
      handler: 'subscription-order.create',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
    {
      method: 'GET',
      path: '/subscription-orders/my',
      handler: 'subscription-order.my',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
  ],
}; 