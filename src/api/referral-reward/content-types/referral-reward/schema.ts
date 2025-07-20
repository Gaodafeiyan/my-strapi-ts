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
      inversedBy: 'referral-rewards',
    },
    fromUser: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
    },
    fromOrder: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::subscription-order.subscription-order',
    },
    amount: {
      type: 'decimal',
      required: true,
      min: 0,
    },
  },
}; 