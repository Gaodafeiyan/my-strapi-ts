'use strict';

module.exports = {
  async up(db) {
    const plans = [
      {
        planCode: 'PLAN500',
        principalUSDT: 500,
        boxes: 1,
        cycle_days: 30,
        staticPct: 6,
        referralPct: 10,
        tokenBonusPct: 3,
        maxPurchase: 10,
        spinQuota: 3,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        planCode: 'PLAN1K',
        principalUSDT: 1000,
        boxes: 2,
        cycle_days: 30,
        staticPct: 6,
        referralPct: 10,
        tokenBonusPct: 3,
        maxPurchase: 5,
        spinQuota: 6,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        planCode: 'PLAN2K',
        principalUSDT: 2000,
        boxes: 4,
        cycle_days: 30,
        staticPct: 6,
        referralPct: 10,
        tokenBonusPct: 3,
        maxPurchase: 3,
        spinQuota: 12,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        planCode: 'PLAN5K',
        principalUSDT: 5000,
        boxes: 10,
        cycle_days: 30,
        staticPct: 6,
        referralPct: 10,
        tokenBonusPct: 3,
        maxPurchase: 1,
        spinQuota: 30,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const plan of plans) {
      await db.collection('subscription_plans').insertOne(plan);
    }
  },

  async down(db) {
    await db.collection('subscription_plans').deleteMany({});
  },
}; 