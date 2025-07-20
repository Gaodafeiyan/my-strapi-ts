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
    /** 返佣金额（U）*/
    amount: { 
      type: 'decimal', 
      scale: 2, 
      required: true 
    },
    /** 产生返佣的订单 ID */
    orderId: { 
      type: 'integer', 
      required: true 
    },
    /** <= 关键：推荐人 */
    referrer: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'referralRewards',   // ⚠️ 必须与 user 侧字段同名
      required: true,
    },
  },
}; 