export const environment = {
  production: true,
  api: {
    url: 'https://#{ECONTRATO_URL}#/api/'
  },
  api_backoffice: {
    url: 'https://#{BACKOFFICE_URL}#/api/'
  },
  auth: {
    url: 'https://#{KEYCLOAK_URL}#/auth',
    realm: '#{KEYCLOAK_REALM}#',
    clientId: '#{KEYCLOAK_CLIENT_ID}#'
  },
  hubs: {
    url: 'https://#{NOTIFICATION_URL}#/',
    econtrato: {
      eContrato: 'econtratohub'
    }
  }
};
