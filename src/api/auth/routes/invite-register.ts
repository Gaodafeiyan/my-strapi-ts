export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/invite-register',
      handler: 'invite-register.register',
      config: {
        policies: ['global::rateLimit'],
        auth: false,
      },
    },
  ],
}; 