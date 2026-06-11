import { defineCloudflareConfig } from '@opennextjs/cloudflare';

const config = {
  ...defineCloudflareConfig(),
  buildOutputPath: '.cf-next',
};

export default config;
