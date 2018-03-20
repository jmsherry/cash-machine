/* eslint-disable no-var, vars-on-top, comma-dangle, no-console, func-names, object-shorthand, prefer-arrow-callback, max-len, prefer-template, no-param-reassign, no-use-before-define, consistent-return */
var prompt = require('prompt');
var chalk = require('chalk');

prompt.start();

// Entities
var users = [{
  name: 'Fred Thompson',
  card: {
    number: '8976 9876 5443 7897',
    pin: '7283'
  },
  balance: 31004
}, {
  name: 'Geoff Wallace',
  card: {
    number: '8976 9873 5423 1897',
    pin: '1432'
  },
  balance: 21527
}, {
  name: 'Suki Tardry',
  card: {
    number: '8976 9879 5449 7891',
    pin: '1874'
  },
  balance: 500091
}];

var services = [{
  name: 'Withdraw',
  action: function withdraw(user) {
    prompt.get([{
      description: 'How much would you like to withdraw (in £10s)',
      name: 'amount',
      required: true,
      message: 'Please enter an amount in whole pounds and increments of 10.',
      conform: function (amount) {
        var amountRegex = /^\d+$/;
        return amountRegex.test(amount) && parseInt(amount, 10) % 10 === 0;
      }
    }], function (err, result) {
      if (err) throw err;
      var amt = parseInt(result.amount, 10) * 100;
      if (user.balance - amt > 0) {
        user.balance -= amt;
        console.log(chalk.green('Your new balance is: ' + (user.balance / 100).toFixed(2)));
      } else {
        console.log(chalk.yellow('Insufficient funds. Please try again'));
      }
      offerService(user);
    });
  }
}, {
  name: 'Balance',
  action: function balance(user) {
    console.log('Your balance is: ' + chalk.cyan((user.balance / 100).toFixed(2)));
    offerService(user);
  }
}];

var LoginAttemptsLimit = 3;

// Processes
function exit(message) {
  console.log(chalk.red(message));
  getUser(); // re-run the whole process
}

function offerService(user) {
  var serviceString = 'Please select a service: \n';
  services.forEach(function (service, i) {
    serviceString += (i + 1 + ') ' + service.name + '\n');
  });
  serviceString += 'Or 0 to exit.';
  prompt.get([{
    description: serviceString,
    name: 'service',
    required: true,
    message: 'Please select a valid service',
    conform: function (value) {
      var serviceNumber = parseInt(value, 10);
      if (serviceNumber !== 0 && !services[serviceNumber - 1]) {
        return false;
      }
      return true;
    }
  }], function (err, result) {
    if (err) throw err;
    var serviceSelected = parseInt(result.service, 10);
    if (serviceSelected) {
      services[serviceSelected - 1].action(user);
    } else {
      return exit('Goodbye!!');
    }
  });
}

function getPIN(user, remainingTries) {
  if (!remainingTries) {
    return exit('You have failed authentication. Exiting...');
  }
  prompt.get([{
    description: 'Enter your pin number',
    name: 'pin',
    required: true,
    hidden: true,
    conform: function (value) {
      var pinRegex = /^\d{4}$/;
      if (!pinRegex.test(value)) {
        console.log(chalk.yellow('Invalid PIN Number'));
        return false;
      }
      return true;
    }
  }], function (err, result) {
    if (err) throw err;
    console.log('remainingTries', remainingTries);
    if (user.card.pin === result.pin) {
      console.log(chalk.magenta('Hello ' + user.name));
      offerService(user);
    } else {
      var newTries = remainingTries - 1;
      console.log(chalk.yellow('PIN not recognised.You have ' + newTries + ' more ' + (newTries === 1 ? 'try' : 'tries') + ' remaining!'));
      getPIN(user, newTries);
    }
  });
}

function getUser() {
  prompt.get([{
    description: 'Enter your card number',
    name: 'cardNumber',
    required: true,
    conform: function (value) {
      var cardRegex = /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?$/;
      if (!cardRegex.test(value)) {
        console.log(chalk.yellow('Invalid Card Number'));
        return false;
      }
      var userFound = users.findIndex(function (user) {
        return user.card.number === value;
      }) !== -1;
      if (!userFound) {
        console.log(chalk.yellow('Card Not found'));
        return false;
      }
      return true;
    }
  }], function (err, result) {
    if (err) throw err;
    console.log('  cardNumber: ' + result.cardNumber);

    var user = users.find(function (usr) {
      return usr.card.number === result.cardNumber;
    });

    getPIN(user, LoginAttemptsLimit);
  });
}

getUser();
