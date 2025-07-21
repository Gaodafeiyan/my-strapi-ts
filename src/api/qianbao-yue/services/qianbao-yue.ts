import { factories } from '@strapi/strapi';
import { Decimal } from 'decimal.js';

export default factories.createCoreService('api::qianbao-yue.qianbao-yue', ({ strapi }) => ({
  
  // 增加USDT余额
  async add(userId: number, amount: string | number, options: { txType?: string } = {}) {
    const qianbao = await strapi.db.query('api::qianbao-yue.qianbao-yue').findOne({
      where: { yonghu: userId }
    });
    
    if (!qianbao) {
      // 创建钱包
      return await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
        data: {
          usdtYue: amount,
          yonghu: userId
        }
      });
    }
    
    const newBalance = new Decimal(qianbao.usdtYue || 0).plus(amount).toFixed(4);
    
    return await strapi.entityService.update('api::qianbao-yue.qianbao-yue', qianbao.id, {
      data: { usdtYue: newBalance }
    });
  },
  
  // 扣除USDT余额
  async deduct(userId: number, amount: string | number, options: { txType?: string } = {}) {
    const qianbao = await strapi.db.query('api::qianbao-yue.qianbao-yue').findOne({
      where: { yonghu: userId }
    });
    
    if (!qianbao) {
      throw new Error('钱包不存在');
    }
    
    const currentBalance = new Decimal(qianbao.usdtYue || 0);
    const deductAmount = new Decimal(amount);
    
    if (currentBalance.lessThan(deductAmount)) {
      throw new Error('余额不足');
    }
    
    const newBalance = currentBalance.minus(deductAmount).toFixed(4);
    
    return await strapi.entityService.update('api::qianbao-yue.qianbao-yue', qianbao.id, {
      data: { usdtYue: newBalance }
    });
  },
  
  // 增加AI余额
  async addAi(userId: number, amount: string | number, options: { txType?: string } = {}) {
    const qianbao = await strapi.db.query('api::qianbao-yue.qianbao-yue').findOne({
      where: { yonghu: userId }
    });
    
    if (!qianbao) {
      // 创建钱包
      return await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
        data: {
          aiYue: amount,
          yonghu: userId
        }
      });
    }
    
    const newBalance = new Decimal(qianbao.aiYue || 0).plus(amount).toFixed(4);
    
    return await strapi.entityService.update('api::qianbao-yue.qianbao-yue', qianbao.id, {
      data: { aiYue: newBalance }
    });
  },
  
  // 获取用户钱包
  async getUserWallet(userId: number) {
    let qianbao = await strapi.db.query('api::qianbao-yue.qianbao-yue').findOne({
      where: { yonghu: userId }
    });
    
    if (!qianbao) {
      // 创建默认钱包
      qianbao = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
        data: {
          usdtYue: 0,
          aiYue: 0,
          yonghu: userId
        }
      });
    }
    
    return qianbao;
  }
})); 