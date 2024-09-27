import { useContext, useState, useEffect } from "react"
import { AuthContext } from "./authContext"
import { fetchUser, getDecks } from "./api"


function App() {
  const { auth } = useContext(AuthContext)
  const [user, setUser] = useState([])
  const [firstName, setFirstName] = useState([])

  const [shoe, setShoe] = useState([])
  const [playerHand, setPlayerHand] = useState([])
  const [dealerHand, setDealerHand] = useState([])
  const [shoePosition, setShoePosition] = useState(0)
  const [aces, setAces] = useState(0)
  const [winStatement, setWinStatement] = useState(' ')

  const [cardsDealt, setCardsDealt] = useState(false)
  const [dealerTurn, setDealerTurn] = useState(false)
  const [bust, setBust] = useState(false)

  useEffect(
    () => {
      if (!auth.accessToken) {
        navigate('/')
      }
    },
    []
  )

  useEffect(
    () => {
      fetchUser({ auth })
        .then(response => {
          setUser(`${response.data.first_name} ${response.data.last_name}`)
          setFirstName(`${response.data.first_name}`)
        })
      getDecks({ auth, deckNumber: 6 })
        .then(response => {
          setShoe(response.data)
        })
    },
    []
  )

  function valueConversion(card) {
    switch (card) {
      case '2':
        return 2;
      case '3':
        return 3;
      case '4':
        return 4;
      case '5':
        return 5;
      case '6':
        return 6;
      case '7':
        return 7;
      case '8':
        return 8;
      case '9':
        return 9;
      case '10':
        return 10;
      case 'J':
        return 10;
      case 'Q':
        return 10;
      case 'K':
        return 10;
      case 'A':
        return 11;
    }
  }



  function sum(arr) {
    return arr.reduce((acc, cur) => acc + valueConversion(cur.value), 0)
  }



  function dealerGameplay() {
    console.log('dealer gameplay has fired')
    if (sum(dealerHand) > 21) {
      setWinStatement('Dealer busts')
      console.log('dealer busts so end round should fire')
      endRound()
    } else if (sum(dealerHand) > 16) {
      console.log('end round should fire')
      endRound()
    } else {
      console.log('drawing another card')
      setDealerHand([...dealerHand, shoe[shoePosition]])
      setShoePosition(shoePosition + 1)
    }
  }

  useEffect(() => {
    if (dealerTurn) {
      setTimeout(() => {
        dealerGameplay();
      }, 1000);
    }
  }, [dealerHand, dealerTurn]);

  function endRound() {
    console.log('end round has fired')
    if (!bust) {
      if (sum(dealerHand) > 21) {
        setWinStatement(`Dealer busts`)
      } else if (sum(playerHand) > sum(dealerHand)) {
        setWinStatement(`${firstName} wins`)
      } else if (sum(playerHand) < sum(dealerHand)) {
        setWinStatement(`Dealer wins`)
      } else {
        setWinStatement('Push')
      }
    }
  }

  useEffect(() => {
    if (sum(playerHand) > 21) {
      setBust(true)
      setWinStatement(`${firstName} busts`)
      endRound()
    }
  }, [playerHand]);


  return (
    <div className="p-5">
      <h1>
        {firstName}
      </h1>
      <h6>
        Total: {sum(playerHand)}
      </h6>


      {playerHand && playerHand.map(card => (
        <h4>
          {card.value} of {card.suit}
        </h4>
      ))}
      {cardsDealt && (
        <div className='game-buttons'>
          <button onClick={() => {
            if (!dealerTurn) {
              setPlayerHand([...playerHand, shoe[shoePosition]])
              setShoePosition(shoePosition + 1)
              if (sum(playerHand) + valueConversion(shoe[shoePosition].value) > 21) {
                setBust(true)
                setWinStatement(`${firstName} busts`)
                endRound()
              }
            }
          }}

          >
            Hit
          </button>
          &nbsp;&nbsp;

          <button onClick={() => {
            if (!dealerTurn) {
              setDealerTurn(true)
              dealerGameplay()
            }
          }}

          >
            Stay
          </button>
        </div>
      )}
      <br></br><br></br>
      <h1>
        Dealer
      </h1>


      <h6>
        Total: {sum(dealerHand)}
      </h6>

      {dealerHand && dealerHand.map(card => (
        <h4>
          {card.value} of {card.suit}
        </h4>
      ))}
      <br></br><br></br>

      {winStatement !== '' && (
        <button onClick={() => { //might be firing even if accidentally clicked mid round
          setWinStatement('')
          setAces(0)
          setPlayerHand([shoe[shoePosition], shoe[shoePosition + 2]])
          setDealerHand([shoe[shoePosition + 1], shoe[shoePosition + 3]])
          setShoePosition(shoePosition + 4)
          setCardsDealt(true)
          setBust(false)
          setDealerTurn(false)
        }}

        >
          Deal Cards
        </button>
      )}
      {winStatement && (
        <h5>
          {winStatement}
        </h5>
      )}
    </div>
  )
}


export default App

// add profile page to deposit, withdraw and view total earnings
// make it so aces are 1 or 11 at the right time
// hide dealers second card