export default {
  kind: 'collectionType',
  collectionName: 'referral_rewards',
  info: {
    singularName: 'referral-reward',
    pluralName: 'referral-rewards',
    displayName: 'Referral Reward',
    description: '推荐奖励记录',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    referrer: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'referralRewards',
      required: true,
    },
    fromUser: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      required: true,
    },
    fromOrder: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::subscription-order.subscription-order',
      required: true,
    },
    amountUSDT: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    rewardRate: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    orderAmountUSDT: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    isPaid: {
      type: 'boolean',
      default: false,
    },
    paidAt: {
      type: 'datetime',
    },
  },
}; 