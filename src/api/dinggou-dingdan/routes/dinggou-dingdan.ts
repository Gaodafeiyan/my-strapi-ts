export default {
  routes: [
    {
      method: 'POST',
      path: '/dinggou-dingdans/create',
      handler: 'dinggou-dingdan.create',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'POST',
      path: '/dinggou-dingdans/:id/redeem',
      handler: 'dinggou-dingdan.redeem',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'GET',
      path: '/dinggou-dingdans/my-orders',
      handler: 'dinggou-dingdan.myOrders',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    }
  ]
}; 