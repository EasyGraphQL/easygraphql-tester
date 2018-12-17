const UserType = require('../types/userType')

module.exports = {
  type: UserType,
  description: 'This query will get the current user',
  resolve (obj, args, ctx) {
    return {
      email: 'demo@demo.com',
      username: 'demo',
      fullName: 'demo'
    }
  }
}
