export default {
  routes: [
    {
      method: 'GET',
      path: '/referral-rewards/my',
      handler: 'referral-reward.my',
      config: {
        auth: {
          scope: ['authenticated'],
        },
      },
    },
  ],
}; 