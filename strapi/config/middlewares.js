module.exports = [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', '*.s3.ap-northeast-1.amazonaws.com'],
          'media-src': ["'self'", 'data:', 'blob:', '*.s3.ap-northeast-1.amazonaws.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
];
