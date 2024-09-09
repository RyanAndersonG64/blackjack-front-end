import { Link } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "./authContext"

function Header() {

  const { auth } = useContext(AuthContext)

  return (
    <div style={{ margin: 10 }}>
      <Link style={{ marginRight: 20 }} to='/'>Home</Link>
      <Link 
        onClick={() => {
          auth.setAccessToken(undefined)
        }}
        to='/login'>Log out</Link>
    </div>
  )
}

export default Header