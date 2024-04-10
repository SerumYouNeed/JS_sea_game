// ustawienie canvas
const canvas = document.getElementById('canvas1');
// getContext() zwraca obiekt z metodami do rysowania na płutnie
const ctx = canvas.getContext('2d');
// to musi być identyczne jak w pliku css
canvas.width = 800;
canvas.height = 500;

let score = 0;
let gameFrame = 0;
ctx.font = '50px Georgia';

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
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI *2);
        ctx.fill();
        ctx.closePath();

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
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
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
    for(let i = 0; i < bubblesArray.length; i++) {
        bubblesArray[i].update();
        bubblesArray[i].draw();
    }
    // znikanie b.
    for(let j = 0; j < bubblesArray.length; j++){
        if(bubblesArray[j].y < 0 - bubblesArray[j].radius * 2) {
            bubblesArray.splice(j, 1);
        }
        // wykonaj tylko jeśli ta bańka istnieje
        if(bubblesArray[j]) {
            // kolizja - porównuje czy suma promieni bubla i playera jest większa od dist
            if(bubblesArray[j].distance < bubblesArray[j].radius + player.radius) {
                if(!bubblesArray[j].counted){
                    if(bubblesArray[j].sound == 'sound1') {
                        bubblePop1.play();
                    } else {
                        bubblePop2.play();
                    }
                    // jeśli wystąpi kolizja update score
                    score++;
                    bubblesArray[j].counted = true;
                    bubblesArray.splice(j, 1);
                }
            }
        }
    }
}

// pętla animacji
function animate() {
    // czyścimy planszę przed każdą animacją
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleBubbles();
    player.update();
    player.draw();
    ctx.fillStyle = 'black';
    ctx.fillText('score: ' + score, 10, 50);
    gameFrame++;
    requestAnimationFrame(animate);
}
animate();