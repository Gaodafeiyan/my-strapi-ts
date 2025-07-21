export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/invite-register',
      handler: 'invite-register.register',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/auth/my-invite-code',
      handler: 'invite-register.getMyInviteCode',
      config: {
        policies: ['global::isAuthenticated']
      },
    },
    {
      method: 'GET',
      path: '/auth/invite-stats',
      handler: 'invite-register.getInviteStats',
      config: {
        policies: ['global::isAuthenticated']
      },
    },
    {
      method: 'GET',
      path: '/auth/invited-users',
      handler: 'invite-register.getInvitedUsers',
      config: {
        policies: ['global::isAuthenticated']
      },
    },
  ],
}; 