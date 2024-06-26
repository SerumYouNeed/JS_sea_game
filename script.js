// ustawienie canvas
const canvas = document.getElementById('canvas1');
// getContext() zwraca obiekt z metodami do rysowania na płutnie
const ctx = canvas.getContext('2d');
// to musi być identyczne jak w pliku css
canvas.width = 800;
canvas.height = 500;

let score = 0;
let gameFrame = 0;
ctx.font = '40px Georgia';
let gameSpeed = 1;
let gameOver = false;

// aktywność myszki
// zwraca wielkość canvas i pozycję w relacji do viewport a nie do początku strony
let canvasPosition = canvas.getBoundingClientRect();

const mouse = {
    x: canvas.width/2,
    y: canvas.height/2,
    click: false,
};

canvas.addEventListener('mousedown', function(event) {
    mouse.click = true;
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;
});

canvas.addEventListener('mouseup', function() {
    mouse.click = false;
})

// gracz
const playerLeft = new Image();
playerLeft.src = '__cartoon_fish_06_green_swim.png';
const playerRight = new Image();
playerRight.src = 'output-onlinepngtools.png';
class Player {
    constructor() {
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.radius = 50;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 498; 
        this.spriteHeight = 327;
    }
    // ruch w stronę kliknięcia
    update() {
        const dx = this.x - mouse.x;    
        const dy = this.y - mouse.y;
        // theta obraca sprite ryjem w stronę kliknięcia
        let theta = Math.atan2(dy, dx);
        this.angle = theta;
        if(mouse.x != this.x) {
            this.x-=dx/30;
        }
        // tu nie daję else tylko if żeby oba wykonały się jednocześnie
        if(mouse.y != this.y) {
            this.y-=dy/30; // dzielenie zmniejszy szybkość ruchu
        }
    };
    draw() {
        if(mouse.click) {
            ctx.lineWidth = 0.2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
        // czerwone kółko testowe
        // ctx.fillStyle = 'red';
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, 0, Math.PI *2);
        // ctx.fill();
        // ctx.closePath();

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        if(this.x >= mouse.x) {
            // 1-obrazek, 2,3-wycinek z obrazka, 4,5-rozmiar przypinanego obrazka, 6,7-gdzie umieszczamy, 8,9-zmniejszanie obrazka
            ctx.drawImage(playerLeft, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth/4, this.spriteHeight/4);
        } else {
            ctx.drawImage(playerRight, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth/4, this.spriteHeight/4);
        }
        ctx.restore();
    }
}

const player = new Player();

// bąbelki
const bubblesArray =[];
const bubbleImage = new Image();
bubbleImage.src = 'bubble_pop_one/bubble_pop_frame_01.png';

class Bubbel {
    constructor() {
        this.x = Math.random() * canvas.width;
        // this.y = canvas.height + Math.random() * canvas.height;
        this.y = canvas.height + 100;
        this.radius = 50;
        this.speed = Math.random() * 5 + 1;
        this.distance;
        // zmienna w celu jednorazowego liczenia punktów
        this.counted = false;
        this.sound = Math.random() <= 0.5 ? 'sound1' : 'sound2';
    }
    update() {
        this.y -= this.speed;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        // formuła na odległoć
        this. distance = Math.sqrt(dx*dx + dy*dy);
    }
    draw() {
        // to są bańki do testów
        // ctx.fillStyle = 'blue';
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // ctx.fill();
        // ctx.closePath();
        // ctx.stroke();

        // obrazek, przesunięcie x, przesyniecie y, rozmiar x, rozmiar y
        ctx.drawImage(bubbleImage, this.x -65, this.y -65, this.radius * 2.6, this.radius * 2.6);
    }
}

const bubblePop1 = document.createElement('audio');
bubblePop1.src = 'Plop.ogg';
const bubblePop2 = document.createElement('audio');
bubblePop2.src = 'Plop.ogg';

function handleBubbles() {
    // robimy coś co 50 frame
    if(gameFrame % 50 == 0) {
        bubblesArray.push(new Bubbel());
    }
    // znikanie b.
    for(let j = 0; j < bubblesArray.length; j++) {
        bubblesArray[j].update();
        bubblesArray[j].draw();
        if(bubblesArray[j].y < 0 - bubblesArray[j].radius * 2) {
            bubblesArray.splice(j, 1);
            j--; // bańka nie miga po zniknięciu ostatniej
            // wykonaj tylko jeśli ta bańka istnieje
            // kolizja - porównuje czy suma promieni bubla i playera jest większa od dist
        } else if(bubblesArray[j].distance < bubblesArray[j].radius + player.radius) {
            if(!bubblesArray[j].counted){
                if(bubblesArray[j].sound == 'sound1') {
                    // bubblePop1.play();
                } else {
                    // bubblePop2.play();
                }
                // jeśli wystąpi kolizja update score
                score++;
                bubblesArray[j].counted = true;
                bubblesArray.splice(j, 1);
                j--;
            }
        }
    }
}

// wrogowie
const enemyImage = new Image();
enemyImage.src = '__orange_cartoon_fish_01_swim.png';

class Enemy {
    constructor() {
        this.x = canvas.width + 200;
        this.y = Math.random() * (canvas.height - 150) + 90;
        this.radius = 60;
        this.speed = Math.random() * 2 + 2;
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 418;
        this.spriteHeight = 397;
    }

    draw() {
        // czerwone kółko testowe
        // ctx.fillStyle = 'red';
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // ctx.fill();
        ctx.drawImage(enemyImage, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x - 60, this.y - 75, this.spriteWidth/3, this.spriteHeight/3);
    }

    update() {
        this.x -= this.speed;
        if(this.x < 0 - this.radius * 2) {
            this.x = canvas.width + 200;
            this.y = Math.random() * (canvas.height - 150) + 90;
            this.speed = Math.random() * 2 + 2;
        }
        // co 5 framów
        //ruchy ryby wroga
        if(gameFrame % 5 == 0) {
            this.frame++;
            if(this.frame >= 12) this.frame = 0;
            if(this.frame == 3 || this.frame == 7 || this.frame == 11) {
                this.frameX = 0;
            } else {
                this.frameX++;
            }
            if(this.frame < 3) this.frameY = 0;
            else if(this.frame < 7) this.frameY = 1;
            else if(this.frame < 11) this.frameY = 2;
            else this.frameY = 0;
        }
        // kolizja ryb
        // dystans liczę z pitagorasa
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if(distance < this.radius + player.radius) {
            handleGameOver();
        }
    }
}

const enemy1 = new Enemy();
function handleEney(){
    enemy1.draw();
    enemy1.update();
}

function handleGameOver() {
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER...', 250, 150);
    ctx.fillText(`Your score: ${score}`, 250, 250);
    gameOver = true;
}

// tło
const background = new Image();
background.src = 'background1.jpg';

// obiekt tła do pętli
const BG = {
    x1: 0,
    x2: canvas.width,
    y: 0,
    width: canvas.width,
    height: canvas.height
}

// statyczne tło
function backpic() {
    ctx.drawImage(background,0, 0, canvas.width, canvas.height);
}

// pętla przesuwająca tło
function handleBackground() {
    BG.x1 -= gameSpeed;
    if(BG.x1 < -BG.width) BG.x1 = BG.width;
    BG.x2 -= gameSpeed;
    if(BG.x2 < -BG.width) BG.x2 = BG.width;
    ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
    ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height);
}

// pętla animacji
function animate() {
    // czyścimy planszę przed każdą animacją
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //handleBackground();
    backpic();
    handleBubbles();
    player.update();
    player.draw();
    handleEney();
    ctx.fillStyle = 'black';
    ctx.fillText('score: ' + score, 10, 50);
    gameFrame++;
    if(!gameOver) requestAnimationFrame(animate);
}
animate();

// zmiana wielkości okna nie powoduje buga na myszy
window.addEventListener('resize', function() {
    canvasPosition = canvas.getBoundingClientRect();
})