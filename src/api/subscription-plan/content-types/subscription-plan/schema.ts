export default {
  kind: 'collectionType',
  collectionName: 'subscription_plans',
  info: {
    singularName: 'subscription-plan',
    pluralName: 'subscription-plans',
    displayName: 'Subscription Plan',
    description: '认购计划',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    code: {
      type: 'enumeration',
      enum: ['PLAN500', 'PLAN1K', 'PLAN2K', 'PLAN5K'],
      required: true,
      unique: true,
    },
    principalUSDT: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    boxes: {
      type: 'integer',
      required: true,
      min: 1,
    },
    cycleDays: {
      type: 'integer',
      required: true,
      min: 1,
    },
    staticPct: {
      type: 'decimal',
      required: true,
      min: 0,
      max: 100,
    },
    referralPct: {
      type: 'decimal',
      required: true,
      min: 0,
      max: 100,
    },
    tokenBonusPct: {
      type: 'decimal',
      required: true,
      min: 0,
      max: 100,
    },
    maxPurchase: {
      type: 'integer',
      required: true,
      min: 1,
    },
    unlockRule: {
      type: 'text',
      required: true,
    },
    spinQuota: {
      type: 'integer',
      required: true,
      min: 0,
    },
    orders: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::subscription-order.subscription-order',
      mappedBy: 'plan',
    },
  },
}; 