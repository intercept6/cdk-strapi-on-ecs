module.exports = ({env}) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '9180234e4a16ff49ffb294b461ec68ea'),
  },
});
