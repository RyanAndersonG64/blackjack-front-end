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

  const [winStatement, setWinStatement] = useState(' ')
  const [cardsDealt, setCardsDealt] = useState(false)
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
      setWinStatement(`${firstName} busts`)
    } else if (playerSum > 21 && playerAces > 0) {
      setPlayerAces(playerAces - 1)
      setPlayerSum(playerSum - 10)
    }
  }, [playerSum])

  useEffect(() => {
    console.log(dealerSum, dealerAces)
    if (dealerSum > 21 && dealerAces == 0) {
      setRoundOver(true)
      setWinStatement(`Dealer busts`)
    } else if (dealerSum > 21 && dealerAces > 0) {
      setDealerAces(dealerAces - 1)
      setDealerSum(dealerSum - 10)
      setTimeout(() => {
        dealerGameplay()
      }, 1000)
    } else if (dealerTurn) {
      dealerGameplay()
    }
  }, [dealerSum])

  useEffect(() => {

    if (dealerTurn && !roundOver) {
      setTimeout(() => {
        dealerGameplay()
      }, 1000)
    }
  }, [dealerHand, dealerTurn])

  useEffect(() => {
    if (cardsDealt && playerHand.length == 2 && dealerHand.length == 2) {
      blackjackCheck()
    }
  }, [playerHand, dealerHand])

  useEffect(() => {
    if (!roundOver) {
      dealCards()
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
    setCardsDealt(true)
    setDealerTurn(false)
  }


  function winCheck() {
    console.log('winCheck has fired')
    if (!roundOver) {
      if (playerSum > dealerSum) {
        setWinStatement(`${firstName} wins`)
      } else if (playerSum < dealerSum) {
        setWinStatement(`Dealer wins`)
      } else {
        setWinStatement('Push')
      }
    }
  }


  function blackjackCheck() {
    console.log('blackjack check is happening')

    if (sum(playerHand) == 21 && sum(dealerHand) != 21) {
      setDealerTurn(true) // reveals dealer's second card
      setRoundOver(true)
      setWinStatement(`${firstName} has blackjack`)
    } else if (sum(dealerHand) == 21 && sum(playerHand) != 21) {
      setDealerTurn(true) // reveals dealer's second card
      setRoundOver(true)
      setWinStatement(`Dealer has blackjack`)
    } else if (sum(dealerHand) == 21 && sum(playerHand) == 21) {
      setDealerTurn(true) // reveals dealer's second card
      setRoundOver(true)
      setWinStatement(`Both players have blackjack`)
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

  function dealerGameplay() {

    if (dealerSum > 16 && dealerSum < 22) {
      setRoundOver(true)
      winCheck()
    } else if (dealerSum < 17) {
      setDealerHand([...dealerHand, shoe[shoePosition]])
      if (shoe[shoePosition].value == 'A') {
        setDealerAces(dealerAces + 1)
      }
      setDealerSum(dealerSum + valueConversion(shoe[shoePosition].value))
      setShoePosition(shoePosition + 1)
    }
  }

  return (
    <div className="p-5">
      <h1>
        {firstName}
      </h1>
      <h5>
        Total: {playerSum}
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
      {cardsDealt && (
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
              setTimeout(() => {
                dealerGameplay()
              }, 1000);
            }
          }}

          >
            Stay
          </button>
          &nbsp;&nbsp;
          {playerHand.length < 3 && (
            <button onClick={() => {
              if (playerHand.length == 2) {
                hit()
                setTimeout(() => {
                  if (!roundOver) {
                    setDealerTurn(true)
                    dealerGameplay()
                  }
                }, 1000);
              }
            }}

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
          Total: {dealerSum}
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
        <button onClick={() => {
          setRoundOver(false)
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
          setCardsDealt(true)
          setDealerTurn(false)
        }}

        >
          Deal Cards
        </button>
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