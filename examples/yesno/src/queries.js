const getMeQuery = `
  query GetMe {
    getMe {
      email
      username
      fullName
    }
  }
`
const getUsersQuery = `
  query GetUsers {
    getUsers {
      fullName
      age
    }
  }
`

module.exports = { getMeQuery, getUsersQuery }