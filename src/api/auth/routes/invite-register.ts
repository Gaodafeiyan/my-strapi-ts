export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/invite-register',
      handler: 'invite-register.inviteRegister',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/auth/verify-invite/:yaoqingMa',
      handler: 'invite-register.verifyInviteCode',
      config: {
        auth: false
      }
    }
  ]
}; 