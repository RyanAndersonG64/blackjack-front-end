import React, { useState, useContext } from 'react'
import ReactDOM from 'react-dom/client'
import { Navigate } from 'react-router-dom'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from 'react-router-dom'

// project styles
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import App from './App'
import Login from './Login'
import ErrorPage from './ErrorPage'
import Header from './Header'
import Footer from './Footer'

import { AuthContext } from './authContext'


function Layout() {
  return (
    <>
      <Header />
      <div id='page-content'>
        <Outlet />
      </div>
    </>
  )
}

const Protected = ({component}) => {
  const { auth } = useContext(AuthContext)
  return auth?.accessToken ? (
    <>
      {component}
    </>
  ) : (
    <Navigate to="/" replace={true} />
  )
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'app/',
        element: <Protected component = {<App />} />,
        errorElement: <ErrorPage />
      },
      {
        path: '/',
        element: <Login />
      },
    ]
  }
])

const AuthContextProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState([])

  const auth = {
    accessToken,
    setAccessToken
  }

  return (
    <AuthContext.Provider value={{ auth }} >
      {children}
    </AuthContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthContextProvider>
    <RouterProvider router={router} />
  </AuthContextProvider>
)

// navigate to login if no token