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
      minLength: 9,
      maxLength: 9,
    },
    referralCode: {
      type: 'uid',
      required: true,
      unique: true,
      minLength: 9,
      maxLength: 9,
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
    // 钱包余额关系
    walletBalance: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::wallet-balance.wallet-balance',
      mappedBy: 'user',
    },
    // 订单关系
    subscriptionOrders: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::subscription-order.subscription-order',
      mappedBy: 'user',
    },
    // 交易记录关系
    walletTxs: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::wallet-tx.wallet-tx',
      mappedBy: 'user',
    },

    // 淘金次数
    goldRushCount: {
      type: 'integer',
      required: true,
      default: 0,
      min: 0,
    },
    // 已解锁的档位
    unlockedPlans: {
      type: 'json',
      default: [],
    },
    // 各档位购买次数统计
    planPurchaseCounts: {
      type: 'json',
      default: {},
    },
  },
}; 