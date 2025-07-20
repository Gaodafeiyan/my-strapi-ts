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
    amountUSDT: { 
      type: 'decimal', 
      precision: 40, 
      scale: 8, 
      required: true 
    },
    /** ↘ 多对一：指向推荐人 */
    referrer: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'referralRewards'       // ←*** 一定要和 user 里保持一致 ***
    },
    /** ↘ 多对一：下级用户 */
    fromUser: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
    },
    fromOrder: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::subscription-order.subscription-order',
    },
  },
}; 