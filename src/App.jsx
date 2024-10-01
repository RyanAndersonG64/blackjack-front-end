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

  const [playerAces, setPlayerAces] = useState(0)
  const [dealerAces, setDealerAces] = useState(0)

  const [playerSum, setPlayerSum] = useState(0)
  const [dealerSum, setDealerSum] = useState(0)

  const [balance, setBalance] = useState(0)
  const [bet, setBet] = useState(0)
  const [winStatement, setWinStatement] = useState(' ')
  const [dealerTurn, setDealerTurn] = useState(false)
  const [roundOver, setRoundOver] = useState(true)

  useEffect(
    () => {
      if (!auth.accessToken) {
        navigate('/login')
      }
    },
    []
  )

  useEffect(
    () => {
      fetchUser({ auth })
        .then(response => {
          setUser(response.data)
          setFirstName(`${response.data.first_name}`)
          setBalance(`${response.data.balance}`)
        })
      getDecks({ auth, deckNumber: 6 })
        .then(response => {
          setShoe(response.data)
        })
    },
    []
  )

  useEffect(() => {
    if (shoePosition > shoe.length - 20) {
      getDecks({ auth, deckNumber: 6 })
        .then(response => {
          setShoe(response.data)
        })
    }
  }, [shoePosition])


  useEffect(() => {
    if (playerSum > 21 && playerAces == 0) {
      setDealerTurn(true) // reveals dealer's second card
      setRoundOver(true)
      winCheck()
    } else if (playerSum > 21 && playerAces > 0) {
      setPlayerAces(playerAces - 1)
      setPlayerSum(playerSum - 10)
    }
  }, [playerSum])

  useEffect(() => {

    if (dealerTurn && !roundOver) {
      setTimeout(() => {
        dealerGameplay()
      }, 1000)
    }
  }, [dealerHand, dealerTurn, dealerSum])

  useEffect(() => {
    if (!roundOver) {
      blackjackCheck()
    } else {
      winCheck()
    }
  }, [roundOver])




  function valueConversion(card) { // converts cards to their blackjack number values
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

  function dealCards() {
    (setBalance(balance - bet))
    setWinStatement('')

    setPlayerHand([shoe[shoePosition], shoe[shoePosition + 2]])

    if (shoe[shoePosition].value == 'A' && shoe[shoePosition + 2].value == 'A') {
      setPlayerAces(2)
    } else if ((shoe[shoePosition].value == 'A' && shoe[shoePosition + 2].value != 'A') || (shoe[shoePosition].value != 'A' && shoe[shoePosition + 2].value == 'A')) {
      setPlayerAces(1)
    } else if (shoe[shoePosition].value != 'A' && shoe[shoePosition + 2].value != 'A') {
      setPlayerAces(0)
    }
    setPlayerSum(valueConversion(shoe[shoePosition].value) + valueConversion(shoe[shoePosition + 2].value))

    setDealerHand([shoe[shoePosition + 1], shoe[shoePosition + 3]])

    if (shoe[shoePosition + 1].value == 'A' && shoe[shoePosition + 3].value == 'A') {
      setDealerAces(2)
    } else if ((shoe[shoePosition + 1].value == 'A' && shoe[shoePosition + 3].value != 'A') || (shoe[shoePosition + 1].value != 'A' && shoe[shoePosition + 3].value == 'A')) {
      setDealerAces(1)
    } else if (shoe[shoePosition + 1].value != 'A' && shoe[shoePosition + 3].value != 'A') {
      setDealerAces(0)
    }
    setDealerSum(valueConversion(shoe[shoePosition + 1].value) + valueConversion(shoe[shoePosition + 3].value))

    setShoePosition(shoePosition + 4)
    setDealerTurn(false)
  }


  function winCheck() {
    if (roundOver) {
      if (playerSum > 21) {
        setWinStatement(`${firstName} busts`)
      } else if (dealerSum > 21) {
        setWinStatement(`Dealer busts`)
        setBalance(balance + 2 * bet)
      } else {
        if (playerSum > dealerSum) {
          setWinStatement(`${firstName} wins`)
          setBalance(balance + 2 * bet)
        } else if (playerSum < dealerSum) {
          setWinStatement(`Dealer wins`)
        } else {
          setWinStatement('Push')
          setBalance(Number(balance + 1 * bet))
        }
      }
    }
  }


  function blackjackCheck() {


    if (sum(playerHand) == 21 && sum(dealerHand) != 21) {
      setDealerTurn(true) // reveals dealer's second card
      setRoundOver(true)
      setBalance(balance + 2.5 * bet)
    } else if (sum(dealerHand) == 21 && sum(playerHand) != 21) {
      setDealerTurn(true) // reveals dealer's second card
      setRoundOver(true)
    } else if (sum(dealerHand) == 21 && sum(playerHand) == 21) {
      setDealerTurn(true) // reveals dealer's second card
      setRoundOver(true)
      setBalance(balance + bet)
    }
  }

  function hit() {
    if (!dealerTurn && !roundOver) {
      setPlayerHand([...playerHand, shoe[shoePosition]])
      if (shoe[shoePosition].value == 'A') {
        setPlayerAces(playerAces + 1)
      }
      setPlayerSum(playerSum + valueConversion(shoe[shoePosition].value))
      setShoePosition(shoePosition + 1)
    }
  }

  function doubleDown() {
    if (playerHand.length == 2) {
      setBalance(balance - bet)
      setBet(2 * bet)
      hit()
      if (!roundOver) {
        setDealerTurn(true)
      }
    }
  }



  function dealerGameplay() {

    if (dealerSum < 17) {
      setDealerHand([...dealerHand, shoe[shoePosition]])
      if (shoe[shoePosition].value == 'A') {
        setDealerAces(dealerAces + 1)
      }
      setDealerSum(dealerSum + valueConversion(shoe[shoePosition].value))
      setShoePosition(shoePosition + 1)

    } else if (dealerSum > 21 && dealerAces > 0) {
      setDealerAces(dealerAces - 1)
      setDealerSum(dealerSum - 10)
      
    } else {
      setRoundOver(true)
      winCheck()

    }
  }

  return (
    <div className="p-5">
      <h1>
        {firstName} {balance}
      </h1>
      <h5>
        Bet: {bet} <br></br>
        Total: {playerSum} {playerSum == 21 && playerHand.length == 2 && ' - Blackjack'}
      </h5>


      {playerHand && playerHand.map(card => (
        <div>
          {card.image ?
            <h4>
              {card.image}
            </h4>
            :
            <h4>
              {card.value} of {card.suit}
            </h4>}
        </div>
      ))}
      {!roundOver && (
        <div className='game-buttons'>
          <button onClick={() => {
            hit()
          }}

          >
            Hit
          </button>
          &nbsp;&nbsp;

          <button onClick={() => {
            if (!dealerTurn && !roundOver) {
              setDealerTurn(true)
            }
          }}

          >
            Stay
          </button>
          &nbsp;&nbsp;
          {playerHand.length < 3 && (
            <button onClick={() => {
              if (playerSum < 12) {
                doubleDown()
              } else if (confirm(`You have ${playerSum}. Are you sure you want to double down?`)) {
                doubleDown()
              }
            }
            }

            >
              Double Down
            </button>
          )}
          &nbsp;&nbsp;
          {playerHand.length == 2 && playerHand[0]?.value == playerHand[1]?.value && (
            <button onClick={() => {
              alert('hue')
            }}

            >
              Split
            </button>
          )}
        </div>
      )}
      <br></br><br></br>
      <h1>
        Dealer
      </h1>

      {dealerTurn ?
        <h5>
          Total: {dealerSum} {dealerSum == 21 && dealerHand.length == 2 && ' - Blackjack'}
        </h5>

        :

        <h4>
          {dealerHand[0]?.value} of {dealerHand[0]?.suit}
          <br></br>
          Hidden Card
        </h4>

      }

      {dealerTurn && dealerHand.map(card => (
        <h4>
          {card.value} of {card.suit}
        </h4>
      ))}
      <br></br>

      {winStatement && (
        <h3>
          {winStatement}
        </h3>

      )}
      <br></br>

      {roundOver && (
        <div>
          <input type='number' style={{ width: 60 }} defaultValue={bet} onChange={(e) => {
            if (e.target.value < 0) {
              e.target.value = 0
            } else if (Number(e.target.value) > Number(balance)) { // for some reason it only compares first digits without Number()
              alert('You do not have enough for that bet')
              e.target.value = balance
            }
            setBet(e.target.value)
          }} >
          </input>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <button onClick={() => {
            if (bet > 0) {
              dealCards()
              setRoundOver(false)
            } else {
              alert('Place a bet!')
            }
          }}

          >
            Deal Cards
          </button>
        </div>
      )}
    </div>
  )
}


export default App

// add profile page to deposit, withdraw and view total earnings
// set up betting and appropriate payouts

// split (can only be done if cards are equal value)
//    establish splitHand variable with splitAces
//    if splitting aces, set playerAces and splitAces to 1
//    splitting sets playerHand to playerHand[1] and shoe[shoePosition]
//    sets splitHand to playerHand[2] and shoe[shoePosition + 1]
//    shoeposition += 2
// add hit, stay, double, split(?) functions for splitHand and buttons that call them