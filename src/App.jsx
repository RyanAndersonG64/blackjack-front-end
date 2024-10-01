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
      setBust(true)
      setWinStatement(`${firstName} busts`)
      setDealerTurn(true)
    } else if (playerSum > 21 && playerAces > 0) {
      setPlayerAces(playerAces - 1)
      setPlayerSum(playerSum - 10)
    }
  }, [playerSum])

  useEffect(() => {
    if (dealerSum > 21 && dealerAces == 0) {
      setWinStatement(`Dealer busts`)
    } else if (dealerSum > 21 && dealerAces > 0) {
      setDealerAces(dealerAces - 1)
      setDealerSum(dealerSum - 10)
      dealerGameplay()
    }
  }, [dealerSum])

  useEffect(() => {
    
    if (dealerTurn && !bust) {
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



  function endRound() {
    console.log('endRound has fired')
    if (!bust) {
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
      setWinStatement(`${firstName} has blackjack`)
    } else if (sum(dealerHand) == 21 && sum(playerHand) != 21) {
      setWinStatement(`Dealer has blackjack`)
    } else if (sum(dealerHand) == 21 && sum(playerHand) == 21) {
      setWinStatement(`Both players have blackjack`)
    }
  }

  function hit() {
    if (!dealerTurn && winStatement === ``) {
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
      endRound()
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
      <h6>
        Total: {playerSum}
      </h6>


      {playerHand && playerHand.map(card => (
        <h4>
          {card.value} of {card.suit}
        </h4>
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
            if (!dealerTurn && winStatement === ``) {
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
                  if (winStatement === '') {
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
        </div>
      )}
      <br></br><br></br>
      <h1>
        Dealer
      </h1>

      {dealerTurn ?
        <h6>
          Total: {dealerSum}
        </h6>

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

      {winStatement !== '' && (
        <button onClick={() => {
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
          setBust(false)
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
// split