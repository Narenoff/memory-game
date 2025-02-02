// Getting references to the audio elements
const flipSound = document.getElementById("flip-sound");
const matchSound = document.getElementById("match-sound");
const notMatchSound = document.getElementById("not-match-sound");
const backgroundMusic = document.getElementById("background-music");

let isMusicPlaying = false; // To track if music is playing
const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false; // To prevent clicking while checking matches
let score = 0;
let highScore = localStorage.getItem("highScore") || 0; // Fetch high score from localStorage
let matchedPairs = 0; // Initialize matched pairs count

// Display the initial score and high score
document.querySelector(".score").textContent = score;
document.querySelector(".high-score").textContent = highScore;

// Show the instructions popup on game load
window.onload = showInstructions;

// Function to show the instructions popup
function showInstructions() {
  const modal = document.getElementById("game-instructions");
  modal.style.display = "flex"; // Show the modal
}

// Function to start the game and hide the popup
function startGame() {
  const modal = document.getElementById("game-instructions");
  modal.style.display = "none"; // Hide the modal
  restart(); // Start the game
}

// Fetch card data from JSON file
fetch("./data/cards.json")
  .then((res) => res.json())
  .then((data) => {
    cards = [...data, ...data]; // Duplicate cards for matching
    shuffleCards();
    generateCards();
  });

// Shuffle the cards using Fisher-Yates shuffle
function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    [cards[currentIndex], cards[randomIndex]] = [cards[randomIndex], cards[currentIndex]];
  }
}

// Generate card elements and add to the grid
function generateCards() {
  gridContainer.innerHTML = ""; // Clear the grid
  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);
    cardElement.innerHTML = `
      <div class="front">
        <img class="front-image" src=${card.image} />
      </div>
      <div class="back"></div>
    `;
    gridContainer.appendChild(cardElement);
    cardElement.addEventListener("click", flipCard); // Attach click event
  }
}

// Handle card flipping
function flipCard() {
  if (lockBoard) return; // Ignore clicks if the board is locked
  if (this === firstCard) return; // Ignore clicks on the same card

  this.classList.add("flipped"); // Flip the card
  flipSound.play(); // Play flip sound

  if (!firstCard) {
    firstCard = this; // Set the first card
    return;
  }

  secondCard = this; // Set the second card
  score++;
  document.querySelector(".score").textContent = score;

  lockBoard = true; // Lock the board while checking for a match
  checkForMatch();
}

// Check if two flipped cards match
function checkForMatch() {
  const isMatch = firstCard.dataset.name === secondCard.dataset.name;

  if (isMatch) {
    matchSound.play(); // Play match sound
    disableCards(); // Disable matched cards
    matchedPairs++; // Increment matched pairs count

    if (matchedPairs === cards.length / 2) {
      // Check if all pairs are matched
      setTimeout(() => {
        // Update high score if the current score is better
        if (score < highScore || highScore === 0) {
          highScore = score;
          localStorage.setItem("highScore", highScore); // Save to localStorage
          document.querySelector(".high-score").textContent = highScore; // Update on the page
        }
        flipAllCards();
      }, 1000);
    } else {
      resetBoard(); // Reset the board for the next turn
    }
  } else {
    notMatchSound.play(); // Play not match sound
    unflipCards(); // Unflip unmatched cards
  }
}

// Disable matched cards to prevent further interaction
function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);
  resetBoard();
}

// Unflip unmatched cards after a delay
function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000); // Adjust delay for unflipping animation
}

// Flip all cards and show a winning message
function flipAllCards() {
  document.querySelectorAll(".card").forEach((card) => card.classList.add("flipped"));
  setTimeout(() => {
    alert("Congratulations, you won!");
  }, 500); // Show message after flipping all cards
}

// Reset the board state for the next turn
function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

// Restart the game
function restart() {
  resetBoard();
  shuffleCards();
  score = 0;
  matchedPairs = 0;
  document.querySelector(".score").textContent = score;
  document.querySelector(".high-score").textContent = highScore; // Keep high score consistent
  generateCards();
}

// Toggle background music on/off
function toggleMusic() {
  if (isMusicPlaying) {
    backgroundMusic.pause();
  } else {
    backgroundMusic.play();
  }
  isMusicPlaying = !isMusicPlaying; // Update music state
}
