export default {
  routes: [
    {
      method: 'GET',
      path: '/qianbao-yues/my-wallet',
      handler: 'qianbao-yue.myWallet',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    {
      method: 'POST',
      path: '/qianbao-yues/recharge',
      handler: 'qianbao-yue.recharge',
      config: {
        auth: {
          scope: ['admin']
        }
      }
    }
  ]
}; 