export default {
  kind: 'collectionType',
  collectionName: 'subscription_plans',
  info: {
    singularName: 'subscription-plan',
    pluralName: 'subscription-plans',
    displayName: 'Subscription Plan',
    description: '认购计划配置',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    amountUSDT: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    productQuantity: {
      type: 'integer',
      required: true,
      min: 0,
    },
    durationDays: {
      type: 'integer',
      required: true,
      min: 1,
    },
    staticReturnRate: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    aiTokenRate: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    goldRushCount: {
      type: 'integer',
      required: true,
      min: 0,
    },
    maxPurchaseCount: {
      type: 'integer',
      required: true,
      min: 1,
    },
    isActive: {
      type: 'boolean',
      default: true,
    },
    sortOrder: {
      type: 'integer',
      default: 0,
    },
  },
}; 