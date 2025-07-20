import { beforeAll, afterAll } from 'vitest';
import { Strapi } from '@strapi/strapi';

let strapi: any;

beforeAll(async () => {
  strapi = await Strapi().load();
});

afterAll(async () => {
  if (strapi) {
    await strapi.destroy();
  }
});

export { strapi }; 