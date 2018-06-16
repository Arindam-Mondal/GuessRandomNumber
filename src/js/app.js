App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.

    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
    App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('GuessNumber.json', function(guessNumber) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var GuessNumber = guessNumber;
      App.contracts.GuessNumber = TruffleContract(GuessNumber);

      // Set the provider for our contract
      App.contracts.GuessNumber.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      App.displayGeneralInformation();
      App.listenForGuessed(); 
    });
  },

  //listen for emitted events
  listenForGuessed: function(){
    var guessInstance;
    App.contracts.GuessNumber.deployed().then(function(instance){
      guessInstance = instance;
      guessInstance.Guessed({},{
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error,event){
        console.log("Event Triggered:: " + JSON.stringify(event));
        
        if (!error){
          var guessResult = event.args._randomNumber.toNumber() === event.args._guess.toNumber() ? "Won" : " Lost";
          $("#lastPlayedBy").html(event.args._from);
          $("#lastPlayerGuess").html(event.args._guess.toNumber());
          $("#gameResult").html(guessResult);
        }

        App.reloadData();
      });
    });
  },

  displayGeneralInformation: function() {
    var guessInstance;

    //Load the account address
    web3.eth.getCoinbase(function(err,account){
      if( err === null) {
        App.account = account;
        console.log("Account**" + App.account);
        $('#accountAddress').html(account);
        return App.account;
      }
    });
    web3.eth.getBalance(web3.eth.coinbase, web3.eth.defaultBlock, function(err,result){
      var bal = web3.fromWei(result,'ether').toFixed(2);
      $('#accountBalance').html(bal);
    });

    App.contracts.GuessNumber.deployed().then(function(instance){
      guessInstance = instance;
      return guessInstance.range();
    }).then(function(range){
      $("#range").html(range.toNumber() - 1);
    });
  },

  checkMyGuess: function() {
    var guessInstance;
    var guessedNumber = parseInt($('#myGuess').val());
    console.log($('#myGuess').val());
    console.log($('#myGuess').val());
    var account = web3.eth.coinbase;
    App.contracts.GuessNumber.deployed().then(function(instance){
      guessInstance = instance;
      return guessInstance.guessIt(guessedNumber, {from: account});
    }).then(function(receipt){
      var guessResult;
      if (receipt.logs.length == 1) {
        guessResult = receipt.logs[0].args._randomNumber.toNumber() === receipt.logs[0].args._guess.toNumber() ? "Congrats!! You Guessed it correct" 
                          : "Sorry!! I thought it was " + receipt.logs[0].args._randomNumber.toNumber() + ".<br/> Better luck next time.";
      }
      $("#guessResult").html(guessResult);
    });
  },

  reloadData: function(){
    var guessInstance;
     App.contracts.GuessNumber.deployed().then(function(instance){
      guessInstance = instance;
      return guessInstance.guesses(web3.eth.coinbase);
     }).then(function(guess){
        $("#gamesPlayed").html(guess[2].toNumber() + guess[3].toNumber());
        $("#lastGuess").html(guess[0].toNumber());
        $("#lastCorrectGuess").html(guess[1].toNumber());
        $("#correctGuessCount").html(guess[2].toNumber());
        $("#wrongGuessCount").html(guess[3].toNumber());

        if (guess[2].toNumber() >= 2) {
          $("#bronze").html('<img src="images/Bronze-r.png" alt="badge" class="myBadge">');
        }
        if (guess[2].toNumber() >= 4) {
          $("#silver").html('<img src="images/Silver-r.png" alt="badge" class="myBadge">');
        }
        if (guess[2].toNumber() >= 5) {
          $("#gold").html('<img src="images/Gold-r.png" alt="badge" class="myBadge">');
        }
        if (guess[2].toNumber() >= 7) {
          $("#platinum").html('<img src="images/Platinum-r.png" alt="badge" class="myBadge">');
        }
        
        return guessInstance.totalNoOfGuesses(); 
     }).then(function(totalGuess){
       $("#totalGames").html(totalGuess.toNumber());
       var netMessage = "So far <span class='gamesCount'>" + totalGuess.toNumber() + "</span> games has already been played in this network.";
       $("#net-message").html(netMessage);
     });
     App.displayGeneralInformation();
  }
};



$(function() {
  $(window).load(function() {
    App.init();
  });
});
