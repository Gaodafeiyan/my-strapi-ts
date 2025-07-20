export default {
  routes: [
    {
      method: 'GET',
      path: '/subscription-plans',
      handler: 'subscription-plan.find',
      config: {
        auth: false, // 公开接口
      },
    },
  ],
}; 