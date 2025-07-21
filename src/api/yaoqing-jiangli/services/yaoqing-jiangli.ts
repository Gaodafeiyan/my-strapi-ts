import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::yaoqing-jiangli.yaoqing-jiangli', ({ strapi }) => ({

  /* 依据 A 档位常量计算奖励 */
  async createReward(inviterId: number, dingdan: any) {
    // A 最高档位
    const highest = await strapi.db.query('api::dinggou-dingdan.dinggou-dingdan').findOne({
      where: { yonghu: inviterId, zhuangtai: { $in: ['active','finished'] } },
      orderBy: { benjinUSDT: 'desc' },
    });
    if (!highest) return;

    const aCap = Number(highest.benjinUSDT);        // 500 / 1000 / 2000 / 5000

    const RATE: { [key: number]: number } = { 500: 0.06, 1000: 0.07, 2000: 0.08, 5000: 0.10 };
    const REB: { [key: number]: number }  = { 500: 1.00, 1000: 0.90, 2000: 0.80, 5000: 0.70 };

    const capPrincipal = Math.min(Number(dingdan.benjinUSDT), aCap);
    const reward = (capPrincipal * RATE[aCap] * REB[aCap]).toFixed(4);

    // 写记录 + 加余额
    await strapi.entityService.create('api::yaoqing-jiangli.yaoqing-jiangli', {
      data: {
        shouyiUSDT: reward,
        tuijianRen: inviterId,
        laiyuanRen: dingdan.yonghu.id,
        laiyuanDan: dingdan.id,
      },
    });
    await strapi.service('api::qianbao-yue.qianbao-yue')
          .add(inviterId, reward, { txType: 'yaoqingjiangli' });
  },

})); 