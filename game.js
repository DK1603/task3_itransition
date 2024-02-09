const crypto = require('crypto');

class CryptoHelper {
  static generateKey() {
    return crypto.randomBytes(32); // 256 bits
  }

  static generateHMAC(key, message) {
    return crypto.createHmac('sha256', key).update(message).digest('hex').toUpperCase();
  }
}

// RuleGenerator class to define game rules
class RuleGenerator {
  constructor(moves) {
    this.moves = moves;
  }

  generateRules() {
    let rules = {};
    const moveCount = this.moves.length;
    const winCount = (moveCount - 1) / 2;
    this.moves.forEach((move, index) => {
      rules[move] = {};
      for (let i = 1; i <= winCount; i++) {
        const winIndex = (index + i) % moveCount;
        const loseIndex = (index - i + moveCount) % moveCount;
        rules[move][this.moves[winIndex]] = 'Win';
        rules[move][this.moves[loseIndex]] = 'Lose';
      }
      rules[move][move] = 'Draw';
    });
    return rules;
  }
}

// TableHelper class for ASCII table generation
let chalk, Table;

// custom table settings
async function loadDependencies() {
  if (!chalk || !Table) {
    chalk = (await import('chalk')).default;
    Table = (await import('cli-table3')).default;
  }
}

class TableHelper {
  static async generateTable(moves, rules) {
    await loadDependencies(); // check if dependencies are loaded

    // table with custom style
    const table = new Table({
      head: ['v PC\\User >', ...moves.map(move => chalk.green(move))],
      style: { head: [], border: [] }, // Disable default coloring
    });

    // Populate table rows
    moves.forEach(move => {
      const row = [chalk.yellow(move)];
      moves.forEach(against => {
        let result = rules[move][against];
        if (result === 'Win') result = chalk.blue('Win');
        else if (result === 'Lose') result = chalk.red('Lose');
        else result = chalk.white('Draw');
        row.push(result);
      });
      table.push(row);
    });

    return table.toString();
  }
}

// Game class to handle game logic
class Game {
  constructor(moves) {
    this.moves = moves;
    this.rules = new RuleGenerator(moves).generateRules();
    this.key = CryptoHelper.generateKey();
    this.computerMove = moves[Math.floor(Math.random() * moves.length)];
    this.hmac = CryptoHelper.generateHMAC(this.key, this.computerMove);
  }

  displayHMAC() {
    console.log(`HMAC: ${this.hmac}`);
  }

  play(userMove) {
    const result = this.rules[this.computerMove][this.moves[userMove - 1]];
    console.log(`Your move: ${this.moves[userMove - 1]}`);
    console.log(`Computer move: ${this.computerMove}`);
    console.log(result === 'Win' ? 'You win!' : result === 'Lose' ? 'You lose!' : 'Draw!');
    console.log(`HMAC key: ${this.key.toString('hex').toUpperCase()}`);
  }

  displayMenu() {
    console.log('Available moves:');
    this.moves.forEach((move, index) => {
      console.log(`${index + 1} - ${move}`);
    });
    console.log('0 - exit');
    console.log('? - help');
  }

  async displayHelp() {
    console.log('Help - Results from the user\'s point of view:');
    console.log('Win: Your move beats the computer\'s move.');
    console.log('Lose: Your move is beaten by the computer\'s move.');
    console.log('Draw: Both you and the computer have made the same move.\n');
    const tableString = await TableHelper.generateTable(this.moves, this.rules);
    console.log(tableString);
  }

}

// Main logic for command line arguments handling and game flow
const main = () => {
  const args = process.argv.slice(2);
  if (args.length < 3 || args.length % 2 === 0 || new Set(args).size !== args.length) {
    console.error('Error: Incorrect number of moves or duplicate moves found. Please provide an odd number of unique moves, e.g. "node game.js rock paper scissors".');
    process.exit(1);
  }

  const game = new Game(args);
  game.displayHMAC();
  game.displayMenu();

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askMove = () => {
    readline.question('Enter your move: ', async (input) => { 
      if (input === '0') {
        readline.close();
        process.exit(0);
      } else if (input === '?') {
        await game.displayHelp(); // wait for the help display to complete
        askMove(); // then ask for the next move
      } else if (parseInt(input) > 0 && parseInt(input) <= args.length) {
        game.play(input);
        readline.close();
      } else {
        console.log('Invalid input. Please try again.');
        askMove();
      }
    });
  };  

  askMove();
};

main();
