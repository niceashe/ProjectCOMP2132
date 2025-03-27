$(document).ready(function() {
  const $wordDisplay = $('#word');
  const $hintDisplay = $('#hint');
  const $keyboard = $('#keyboard');
  const $resultDisplay = $('#result');
  const $playAgainBtn = $('#play-again');
  const $hangmanImg = $('#hangman-img');
  const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  let words = [];
  let currentWord = '';
  let guessedLetters = [];
  let wrongGuesses = 0;
  const maxWrongGuesses = 7;
  let gameOver = false;

  async function fetchWords() {
    try {
      const response = await fetch('../data/words.json');

      if (!response.ok) {
        throw new Error(`Failed to load words: ${response.status}`);
      }

      words = await response.json();
      startGame();
    } catch (error) {
      console.error('Error loading words:', error);
    }
  }

  function startGame() {
    resetGame();
    const randomIndex = Math.floor(Math.random() * words.length);
    currentWord = words[randomIndex].word.toUpperCase();
    $hintDisplay.text('Hint: ' + words[randomIndex].hint);

    $wordDisplay.text('_ '.repeat(currentWord.length).trim());
    createKeyboard();
  }

  function resetGame() {
    guessedLetters = [];
    wrongGuesses = 0;
    gameOver = false;
    $hangmanImg.attr('src', `../img/start-game.png`);
    $resultDisplay.text('');
    $playAgainBtn.hide();
  }

  function createKeyboard() {
    $keyboard.empty();
    keyboardLayout.forEach(row => {
      const $row = $('<div>').addClass('keyboard-row');
      row.forEach(letter => {
        const $button = $('<button>').text(letter);
        $button.on('click', function() { handleGuess(letter, $button) });
        $row.append($button);
      });
      $keyboard.append($row);
    });
  }

  function handleGuess(letter, $button) {
    if (gameOver) return; 
    
    if (guessedLetters.includes(letter)) return;

    guessedLetters.push(letter);

    $button.prop('disabled', true);

    if (currentWord.includes(letter)) {
      revealLetter(letter);
    } else {
      wrongGuesses++;
      $hangmanImg.attr('src', `../img/wilting-plant${wrongGuesses}.png`);

      if (wrongGuesses === maxWrongGuesses) {
        endGame(false);
        gameOver = true;
      }
    }

    if ($wordDisplay.text().replace(/ /g, '') === currentWord) {
      endGame(true);
      gameOver = true;
    }
  }

  function revealLetter(letter) {
    let updatedDisplay = '';
    for (let i = 0; i < currentWord.length; i++) {
      if (guessedLetters.includes(currentWord[i])) {
        updatedDisplay += `${currentWord[i]} `;
      } else {
        updatedDisplay += '_ ';
      }
    }
    $wordDisplay.text(updatedDisplay.trim());
  }

  function endGame(won) {
    $playAgainBtn.show();
    
    $keyboard.find('button').prop('disabled', true);
  
    if (won) {
      $hangmanImg.attr('src', '../img/winning-gif.gif') 
    } else {
      $hangmanImg.attr('src', '../img/dead-garden.png'); 
    }
  }  

  $(document).on('keydown', function(event) {
    if (gameOver) return; 
    
    const letter = event.key.toUpperCase();
    if (letter >= 'A' && letter <= 'Z') {
      const $button = $keyboard.find(`button:contains(${letter})`);
      if ($button.length) {
        handleGuess(letter, $button);
      }
    }
  });

  $playAgainBtn.on('click', startGame);

  fetchWords();
});
