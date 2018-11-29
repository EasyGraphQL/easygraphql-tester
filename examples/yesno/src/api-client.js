const axios = require('axios')
const { getMeQuery, getUsersQuery } = require('./queries')

const API_ENDPOINT = 'http://localhost:3000/'

const getMe = async () => {
  try {
    const { data } = await axios({
      url: `${API_ENDPOINT}`,
      method: 'post',
      data: {
        query: getMeQuery
      }
    })

    return data
  } catch (err) {
    throw err
  }
}

const getUsers = async () => {
  try {
    const { data } = await axios({
      url: `${API_ENDPOINT}`,
      method: 'post',
      data: {
        query: getUsersQuery
      }
    })

    return data
  } catch (err) {
    throw err
  }
}

module.exports = { getMe, getUsers }
