export const paths = {
  tickets: {
    root: '/',
    search: '/search',
    event: (id: string) => `/event/${id}`,
    checkout: (id: string) => `/checkout/${id}`,
    privacyPolicy: '/privacy-policy',
    termsOfUse: '/terms-of-use',
    halfPriceRules: '/half-price-rules',
    serviceFees: '/service-fees',
    managementAB: '/management-ab',
    cashlessNfc: '/cashless-nfc',
    helpCenter: '/help-center',
    contactUs: '/contact-us',
  },
  dashboard: {
    root: '/dashboard',
    producer: '/producer-area',
  },
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    recoverPassword: '/recover-password/:token',
  }
};
