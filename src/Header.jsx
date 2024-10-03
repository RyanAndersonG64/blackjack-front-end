import { Link } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "./authContext"

function Header() {

  const { auth } = useContext(AuthContext)

  return (
    <div style={{ margin: 10 }}>
      <Link style={{ marginRight: 20, color: 'black' }} to='/app'>Home</Link>
      <Link style={{ color: 'black' }}
        onClick={() => {
          auth.setAccessToken(undefined)
        }}
        to='/'>Log out</Link>
    </div>
  )
}

export default Header

// only navigate if token 