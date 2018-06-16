var GuessNumber =  artifacts.require("./GuessNumber.sol");

contract("GuessNumber", function(accounts){
    var guessInstance;
    
    it("Initializes with corrrect range", function(){
        return GuessNumber.deployed().then(function(instance){
            guessInstance = instance;
            return guessInstance.range();
        }).then(function(range){
            assert.equal(range,20,"Range should be 20");
            return guessInstance.totalNoOfGuesses();
        }).then(function(totalGuess){
            assert.equal(totalGuess,0,"Initallly total guess should be 0");
            return guessInstance.guesses(accounts[0]);
        }).then(function(guess){
            console.log(guess[0].toNumber());
            assert.equal(guess[0], 0, "Initalial no guess");
        });
    });


    it("Guessing a random number to try my luck", function(){
        return GuessNumber.deployed().then(function(instance){
            guessInstance = instance;
            return guessInstance.guessIt(40);
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'error message should contain revert');
            //guessing the correct number
            return guessInstance.guessIt(10, {from : accounts[0]});
        }).then(function(receipt){
            return guessInstance.totalNoOfGuesses();
        }).then(function(totalGuesses){
            assert.equal(totalGuesses.toNumber(), 1, "Total guesses should be 1");
            return guessInstance.guesses(accounts[0]);
        }).then(function(guess){
            assert.equal(guess[0].toNumber(), 10, "Last guess should be 10");
            assert.equal(guess[1].toNumber(), 10, "Last correct guess should be 10");
            assert.equal(guess[2].toNumber(), 1, "Correct guess count should be 1");
            assert.equal(guess[3].toNumber(), 0, "Wrong Guess count should be 0");
            return guessInstance.guessIt(20, {from : accounts[0]});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers 1 event');
            assert.equal(receipt.logs[0].event, 'Guessed', 'should be "Guessed" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account who guessed the random number');
            assert.equal(receipt.logs[0].args._randomNumber.toNumber(), 10, 'Random Number is 10');
            assert.equal(receipt.logs[0].args._guess.toNumber(), 20, 'Guess Number is 20');

            return guessInstance.totalNoOfGuesses();
        }).then(function(totalGuesses){
            assert.equal(totalGuesses.toNumber(), 2, "Total guesses should be 2");
            return guessInstance.guesses(accounts[0]);
        }).then(function(guess){
            assert.equal(guess[0].toNumber(), 20, "Last guess should be 10");
            assert.equal(guess[1].toNumber(), 10, "Last correct guess should be 10");
            assert.equal(guess[2].toNumber(), 1, "Correct guess count should be 1");
            assert.equal(guess[3].toNumber(), 1, "Wrong Guess count should be 0");
        });
    });

});