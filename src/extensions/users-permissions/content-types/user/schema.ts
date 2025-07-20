export default {
  kind: 'collectionType',
  collectionName: 'up_users',
  info: {
    name: 'user',
    description: '',
    singularName: 'user',
    pluralName: 'users',
    displayName: 'User',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    provider: {
      type: 'string',
    },
    password: {
      type: 'password',
      minLength: 6,
      private: true,
      searchable: false,
    },
    resetPasswordToken: {
      type: 'string',
      private: true,
      searchable: false,
    },
    confirmationToken: {
      type: 'string',
      private: true,
      searchable: false,
    },
    confirmed: {
      type: 'boolean',
      default: false,
    },
    blocked: {
      type: 'boolean',
      default: false,
    },
    role: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.role',
      inversedBy: 'users',
      configurable: false,
    },
    // 投资平台扩展字段
    diamondId: {
      type: 'uid',
      required: true,
      unique: true,
      minLength: 10,
      maxLength: 10,
    },
    referralCode: {
      type: 'uid',
      required: true,
      unique: true,
      minLength: 8,
      maxLength: 8,
    },
    invitedBy: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'invitees',
    },
    invitees: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'plugin::users-permissions.user',
      mappedBy: 'invitedBy',
    },
    walletBalance: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::wallet-balance.wallet-balance',
      mappedBy: 'user',
    },
    walletTxs: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::wallet-tx.wallet-tx',
      mappedBy: 'user',
    },
    subscriptionOrders: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::subscription-order.subscription-order',
      mappedBy: 'user',
    },
    'referral-rewards': {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::referral-reward.referral-reward',
      mappedBy: 'referrer',
    },
    'usdt-withdraws': {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::usdt-withdraw.usdt-withdraw',
      mappedBy: 'user',
    },
  },
}; 