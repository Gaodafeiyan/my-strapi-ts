import { nanoid } from 'nanoid';

export default {
  beforeCreate(event) {
    // 生成9位数字邀请码
    event.params.data.yaoqingMa = nanoid(9);
  },
  
  afterCreate(event) {
    // 创建用户钱包
    strapi.service('api::qianbao-yue.qianbao-yue').getUserWallet(event.result.id);
  }
}; 