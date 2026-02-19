

// GLOBAL VARIABLES
let pets = [];
const historyBox = document.querySelector("#history");
const createPetBtn = document.querySelector("#create-pet-btn");
const restartBtn = document.querySelector("#restart-btn");


class Pet {
    constructor(name, animalType) {
        this.name = name;
        this.animalType = animalType;
        this.energy = 50;
        this.fullness = 50;
        this.happiness = 50;
        this.timer = null; 
        this.isAlive = true;
    }

    nap() {
        this.energy += 40;
        this.fullness -= 10;
        this.happiness -= 10;

        this.clampStats();
        updatePetStats(this);
        addToHistory(`You took a nap with ${this.name}.`); 
        this.checkIfRunAway();
    }

    play() {
        this.happiness += 30;
        this.fullness -= 10;
        this.energy -= 10;

        this.clampStats();
        updatePetStats(this);
        addToHistory(`You played with ${this.name}.`); 
        this.checkIfRunAway();
    }

    eat() {
        this.happiness += 5;
        this.fullness += 30;
        this.energy -= 15;

        this.clampStats();
        updatePetStats(this);
        addToHistory(`You fed ${this.name}.`); 
        this.checkIfRunAway();
    }

    clampStats() {
        this.energy = Math.max(0, Math.min(100, this.energy));
        this.fullness = Math.max(0, Math.min(100, this.fullness));
        this.happiness = Math.max(0, Math.min(100, this.happiness));
    }

    startTimer() {
        if (!this.isAlive) return; 

        this.timer = setTimeout(() => { 
            if (!this.isAlive) return; 

            this.energy -= 10;
            this.fullness -= 10;
            this.happiness -= 10;

            this.clampStats(); 
            updatePetStats(this); 
            addToHistory(`${this.name} is getting tired, hungry, and bored...`); 
            this.checkIfRunAway(); 

            this.startTimer(); 
        }, 10000);
    }

    checkIfRunAway() {
        if (this.energy === 0 || this.fullness === 0 || this.happiness === 0) {
            removePet(this); 
        } 
    } 
} 

const fetchRandomName = async () => {
    try {
        let response = await fetch("https://randomuser.me/api/0.8");

        if (!response.ok) {
            throw new Error("API svarade inte");
        }

        let json = await response.json();
        return json.results[0].user.name.first;

    } catch (error) {
        addToHistory("Opps, Fel uppstod vid hämtning av namn.");
        return "Not-API";
    }
};

// GAME LOGIC FUNCTIONS
async function createPet() {
    const useRandom = document.querySelector("#random-name").checked;
    const inputName = document.querySelector("#name-input").value;
    const selectedAnimal = document.querySelector("#animal-type").value;

    let name;

    if (useRandom) {
        name = await fetchRandomName();
    } else {
        if (!inputName.trim()) {
            alert("Skriv ett namn eller välj random 😊");
            return;
        }
        name = inputName;
    }

    if (pets.length >= 4) {
        alert("You can only have 4 pets!");
        return;
    }

    const newPet = new Pet(name, selectedAnimal);
    pets.push(newPet);
    renderPet(newPet);
    newPet.startTimer();
}

function removePet(pet) {
    pet.isAlive = false;
    clearTimeout(pet.timer); 

    const cards = document.querySelectorAll(".pet-card");

    cards.forEach(card => {
        if (card.innerText.includes(pet.name)) {
            card.remove();
        }
    });

    pets = pets.filter(p => p !== pet);
    addToHistory(`${pet.name} ran away due to neglect 😢`);
}

function restartGame() {
    pets.forEach(pet => {
        clearTimeout(pet.timer);
    });

    pets = [];

    const container = document.querySelector("#pet-container");
    container.innerHTML = "";

    historyBox.innerHTML = "";

    addToHistory("Game restarted! Create a new pet 😊");
}

function renderPet(pet) {
    const container = document.querySelector("#pet-container");

    const animalImages = {
        dog: "images/dog.webp",
        cat: "images/cat-2.webp",
        rabbit: "images/rabbit-2.webp",
        chicken: "images/chicken.webp"
    };

    const petCard = document.createElement("div");
    petCard.classList.add("pet-card");

    petCard.innerHTML = `
        <h2>Hi I am "${pet.name}", the happy ${pet.animalType}</h2>

        <div class="pet-images">
            <img src="${animalImages[pet.animalType]}" 
                 alt="${pet.animalType}" 
                 width="250">
        </div>

        <div class="activity-buttons">
            <button class="nap-btn">💤Nap</button>  
            <button class="play-btn">🎾Play</button>
            <button class="eat-btn">🍖Eat</button>
        </div>

        <p class="mood">
            Energy: ${pet.energy}, 
            Fullness: ${pet.fullness}, 
            Happiness: ${pet.happiness}
        </p>
    `;

    container.appendChild(petCard);

    petCard.querySelector(".nap-btn").addEventListener("click", () => pet.nap());
    petCard.querySelector(".play-btn").addEventListener("click", () => pet.play());
    petCard.querySelector(".eat-btn").addEventListener("click", () => pet.eat());
}


function updatePetStats(pet) {
    const cards = document.querySelectorAll(".pet-card");

    cards.forEach(card => {
        if (card.innerText.includes(pet.name)) {
            const mood = card.querySelector(".mood");

            mood.textContent = `
                Energy: ${pet.energy},
                Fullness: ${pet.fullness},
                Happiness: ${pet.happiness}
            `;
        }
    });
}

function addToHistory(message) {
    const p = document.createElement("p");
    p.textContent = message;
    historyBox.appendChild(p);
}

createPetBtn.addEventListener("click", createPet);
restartBtn.addEventListener("click", restartGame);
