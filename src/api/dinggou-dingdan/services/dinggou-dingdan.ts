import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::dinggou-dingdan.dinggou-dingdan', ({ strapi }) => ({

  /* 创建订单：扣钱包 + 写订单 + 送抽奖次数 */
  async createWithChecks(yonghuId: number, jihuaId: number) {
    const jihua = await strapi.entityService.findOne('api::dinggou-jihua.dinggou-jihua', jihuaId);
    if (!jihua?.kaiqi) throw new Error('JIHUA_OFF');

    // 余额检查 & 扣钱
    await strapi.service('api::qianbao-yue.qianbao-yue').deduct(yonghuId, jihua.benjinUSDT, { txType: 'dinggou' });

    // 写订单
    const start = new Date();
    const end   = new Date(start.getTime() + jihua.zhouQiTian * 86400_000);

    return await strapi.entityService.create('api::dinggou-dingdan.dinggou-dingdan', {
      data: {
        benjinUSDT   : jihua.benjinUSDT,
        kaishiShiJian: start,
        jieshuShiJian: end,
        aiShuliang   : (Number(jihua.benjinUSDT) * Number(jihua.aiBili) / 100).toFixed(4),
        yonghu       : yonghuId,
        jihua        : jihuaId,
      },
    });
  },

  /* 到期赎回：静态收益 + AI + 推荐奖励 */
  async redeem(orderId: number) {
    const dingdan = await strapi.entityService.findOne(
      'api::dinggou-dingdan.dinggou-dingdan',
      orderId,
      { populate: { yonghu: { populate: ['shangji'] }, jihua: true } }
    );
    if (dingdan.zhuangtai === 'finished') return dingdan;
    if (new Date() < new Date(dingdan.jieshuShiJian)) throw new Error('NOT_EXPIRED');

    // ① 本人静态收益
    const staticProfit = (Number(dingdan.benjinUSDT) * Number(dingdan.jihua.jingtaiBili) / 100).toFixed(4);

    await strapi.service('api::qianbao-yue.qianbao-yue')
          .add(dingdan.yonghu.id, staticProfit, { txType: 'jingtaishouyi' });
    await strapi.service('api::qianbao-yue.qianbao-yue')
          .add(dingdan.yonghu.id, dingdan.benjinUSDT, { txType: 'benjin_fanhui' });
    await strapi.service('api::qianbao-yue.qianbao-yue')
          .addAi(dingdan.yonghu.id, dingdan.aiShuliang, { txType: 'ai_bonus' });

    // ② 推荐奖励
    const inviter = dingdan.yonghu.shangji;
    if (inviter) await strapi.service('api::yaoqing-jiangli.yaoqing-jiangli')
          .createReward(inviter.id, dingdan);

    // ③ 更新订单
    return await strapi.entityService.update('api::dinggou-dingdan.dinggou-dingdan', orderId, {
      data: { zhuangtai: 'finished', jingtaiShouyi: staticProfit },
    });
  },

})); 