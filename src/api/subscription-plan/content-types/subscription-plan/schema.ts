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
      type: 'string',
      required: true,
      unique: true,
    },
    principal: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    cycle: {
      type: 'integer',
      required: true,
      min: 1,
    },
    staticPct: {
      type: 'decimal',
      required: true,
      min: 0,
    },
    maxBuy: {
      type: 'integer',
      required: true,
      min: 1,
    },
    unlockAfter: {
      type: 'string',
      required: true,
    },
    referralPct: {
      type: 'decimal',
      required: true,
      min: 0,
      max: 100,
    },
    aiPct: {
      type: 'decimal',
      required: true,
      min: 0,
      max: 100,
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