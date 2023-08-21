export default {
  meEndpoint: process.env.NEXT_PUBLIC_AUTH_URL+'getUserDetails',
  loginEndpoint: process.env.NEXT_PUBLIC_AUTH_URL+'authenticate',
  registerEndpoint: process.env.NEXT_PUBLIC_AUTH_URL+'register',
  companyEndPoint: process.env.NEXT_PUBLIC_API_URL+'company',
  storageTokenKeyName: 'accessToken'
}