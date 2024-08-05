import { useRouteError } from "react-router-dom"

function ErrorPage() {
  const error = useRouteError()
  console.error(error)

  let errorMessage = undefined
  if (error.statusText) {
    errorMessage = error.statusText
  } else if (error.message) {
    errorMessage = error.message
  }

  return (
    <div className="text-center p-5 m-5">
      <h1>Oops!</h1>
      <h2>An error occurred.</h2>
      {errorMessage ? (
        <p>{errorMessage}</p>
      ) : null}
    </div>
  )
}

export default ErrorPage
