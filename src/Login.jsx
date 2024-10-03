import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "./authContext"
import { createUser, getToken } from "./api"

const CreateUserInput = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const submit = () => {
    createUser({ username, password, firstName, lastName })
  }

  return (
    <div className="p-5">
      <h1>Create User</h1>
      <div>
        <div>Username:</div>
        <input
          onChange={e => setUsername(e.target.value)}
          value={username}
        />
      </div>
      <div>
        <div>Password:</div>
        <input
          onChange={e => setPassword(e.target.value)}
          value={password}
        />
      </div>
      <div>
        <div>First Name:</div>
        <input
          onChange={e => setFirstName(e.target.value)}
          value={firstName}
        />
      </div>
      <div>
        <div>Last Name:</div>
        <input
          onChange={e => setLastName(e.target.value)}
          value={lastName}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => submit()}>Submit</button>
      </div>

    </div>
  )
}

function Login() {
  const { auth } = useContext(AuthContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const submit = () => {
    getToken({ auth, username, password })
    .then(response => {
      navigate('/app')
    })
  }

  return (
    <div className="p-5">
      <h1>Login</h1>
      <div>
        <div>Username:</div>
        <input
          onChange={e => setUsername(e.target.value)}
          value={username}
        />
      </div>
      <div>
        <div>Password:</div>
        <input
          onChange={e => setPassword(e.target.value)}
          value={password}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => {
          submit()
        }
        }>Submit</button>
      </div>

      <hr />

      <CreateUserInput />

    </div>
  )
}


export default Login
