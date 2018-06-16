pragma solidity ^0.4.17;

contract GuessNumber {

  uint public range;
  uint public totalNoOfGuesses;

  //structure to store the Guess
  struct Guess {
    uint lastGuess;
    uint lastCorrectGuess;
    uint correctGuessCount;
    uint wrongGuessCount;
    uint lastGuessAt;
  }

  mapping(address => Guess) public guesses;

  event Guessed (
    address indexed _from,
    uint _randomNumber,
    uint _guess
  );

  //Initiazed the range between which a number should be guessed.
  function GuessNumber(uint _range) public {
    range = _range;
  }

  //function to store the guess in the mapping when a guess is made.
  function guessIt(uint _guess) public returns (bool) {
    //Need to check if the guess number is less than or equal tp range
    require(_guess <= range);
    uint random = generateRandomNumber(range);
    // uint random = 10;
    if (random == _guess) {
      Guess storage correctGuess = guesses[msg.sender];
      
      correctGuess.lastGuess = _guess;
      correctGuess.lastCorrectGuess = _guess;
      correctGuess.correctGuessCount = correctGuess.correctGuessCount + 1;
      correctGuess.lastGuessAt = now;
      totalNoOfGuesses = totalNoOfGuesses + 1;

      Guessed(msg.sender,random, _guess);

      return true;

    } else {
      Guess storage wrongGuess = guesses[msg.sender];
      
      wrongGuess.lastGuess = _guess;
      wrongGuess.wrongGuessCount = wrongGuess.wrongGuessCount + 1;
      wrongGuess.lastGuessAt = now;
      totalNoOfGuesses = totalNoOfGuesses + 1;

      Guessed(msg.sender,random, _guess);
    }
    return false;
  }

  function generateRandomNumber(uint _range) public returns (uint) {
    return uint(sha3(block.timestamp)) % _range;
  }

}