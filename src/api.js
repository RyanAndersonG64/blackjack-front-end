import axios from 'axios'
import { useNavigate } from "react-router-dom"

const baseUrl = 'http://127.0.0.1:8000'

export const createUser = ({ username, password, firstName, lastName }) => {
  axios({
    method: 'post',
    url: `${baseUrl}/create-user/`,
    data: {
      username,
      password,
      first_name: firstName,
      last_name: lastName,
    }
  })
    .then(response => {
      console.log('CREATE USER RESPONSE: ', response)
    })
    .catch(error => console.log('ERROR: ', error))
}

export const fetchUser = ({ auth }) => {
  return axios({
    method: 'get',
    url: `${baseUrl}/get-profile/`,
    headers: {
      Authorization: `Bearer ${auth.accessToken}`
    }
  }).then(response => {
    console.log('FETCH USER RESPONSE: ', response)
    return response
  }).catch(error => console.log('ERROR: ', error))
}

export const getToken = ({ auth, username, password }) => {
  return axios.post(`${baseUrl}/token/`, {
    username,
    password
  })
    .then(response => {
      console.log('GET TOKEN RESPONSE: ', response)
      auth.setAccessToken(response.data.access)
    })
    .catch(error => console.log('ERROR: ', error))
}


// card stuff from backend

export const getDecks = ({auth, deckNumber}) => {
  return axios({
    method: 'get',
    url: `${baseUrl}/get-decks/?deck_number=${deckNumber}`,
    headers: {
      Authorization: `Bearer ${auth.accessToken}`
    },
  }).then(response => {
    console.log('GET DECKS RESPONSE: ', response.data)
    return response
  }).catch(error => console.log('ERROR: ', error))
}