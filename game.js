// Seleciona o elemento da canvas
const cvs = document.getElementById("breakout");
const ctx = cvs.getContext("2d");

// Adiciona borda ao canvas 
cvs.style.border = "1px solid #000000";

// fazer a linha ser thicc envolta do canvas
ctx.lineWidth = 3;

// variaveis e constantes 
const PADDLE_WIDTH = 100;
const PADDLE_MARGIN_BOTTOM = 50;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 8;
let LIFE = 3; // numero de vidas
let SCORE = 0;
const SCORE_UNIT = 10;
let LEVEL = 1;
const MAX_LEVEL = 3;
let GAME_OVER = false;
let leftArrow = false;
let rightArrow = false;

// criaçao do bloco 
const paddle = {
    x : cvs.width/2 - PADDLE_WIDTH/2,
    y : cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
    width : PADDLE_WIDTH,
    height : PADDLE_HEIGHT,
    dx :5
}

// Desenho do bloco 
function drawPaddle(){
    ctx.fillStyle = "#00e5ff";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// controle do bloco
document.addEventListener("keydown", function(event){
   if(event.keyCode == 37){
       leftArrow = true;
   }else if(event.keyCode == 39){
       rightArrow = true;
   }
});
document.addEventListener("keyup", function(event){
   if(event.keyCode == 37){
       leftArrow = false;
   }else if(event.keyCode == 39){
       rightArrow = false;
   }
});

// mover o bloco
function movePaddle(){
    if(rightArrow && paddle.x + paddle.width < cvs.width){
        paddle.x += paddle.dx;
    }else if(leftArrow && paddle.x > 0){
        paddle.x -= paddle.dx;
    }
}

// Criando a bola
const ball = {
    x : cvs.width/2,
    y : paddle.y - BALL_RADIUS,
    radius : BALL_RADIUS,
    speed : 4,
    dx : 3 * (Math.random() * 2 - 1),
    dy : -3
}

// Desenhando a bola
function drawBall(){
    ctx.beginPath();
    
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "#ffcd05";
    ctx.fill();
    
    ctx.strokeStyle = "#2e3548";
    ctx.stroke();
    
    ctx.closePath();
}

// Movendo a bola 
function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;
}

// detecta se a bola colidi com a parede
function ballWallCollision(){
    if(ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0){
        ball.dx = - ball.dx;
        WALL_HIT.play();
    }
    
    if(ball.y - ball.radius < 0){
        ball.dy = -ball.dy;
        WALL_HIT.play();
    }
    
    if(ball.y + ball.radius > cvs.height){
        LIFE--; // perde vida
        LIFE_LOST.play();
        resetBall();
    }
}

// Reseta a bola 
function resetBall(){
    ball.x = cvs.width/2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -3;
}

// colisao da bola e o bloco
function ballPaddleCollision(){
    if(ball.x < paddle.x + paddle.width && ball.x > paddle.x && paddle.y < paddle.y + paddle.height && ball.y > paddle.y){
        
        // toca um som ao contato
        PADDLE_HIT.play();
        
        // checa aonde a bola acertou no bloco
        let collidePoint = ball.x - (paddle.x + paddle.width/2);
        
        // normaliza os valores
        collidePoint = collidePoint / (paddle.width/2);
        
        // calcula o angulo da bola
        let angle = collidePoint * Math.PI/3;
            
            
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = - ball.speed * Math.cos(angle);
    }
}

// cria os "Bricks"
const brick = {
    row : 1,
    column : 5,
    width : 55,
    height : 20,
    offSetLeft : 20,
    offSetTop : 20,
    marginTop : 40,
    fillColor : "#4a4a4a",
    strokeColor : "#FFF"
}

let bricks = [];

function createBricks(){
    for(let r = 0; r < brick.row; r++){
        bricks[r] = [];
        for(let c = 0; c < brick.column; c++){
            bricks[r][c] = {
                x : c * ( brick.offSetLeft + brick.width ) + brick.offSetLeft,
                y : r * ( brick.offSetTop + brick.height ) + brick.offSetTop + brick.marginTop,
                status : true
            }
        }
    }
}

createBricks();

// desenha os bricks no canvas
function drawBricks(){
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];
            // se os bricks nao forem quebrados
            if(b.status){
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(b.x, b.y, brick.width, brick.height);
                
                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }
}

// colisao dos bricks
function ballBrickCollision(){
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];
            // se o brick for quebrado
            if(b.status){
                if(ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height){
                    BRICK_HIT.play();
                    ball.dy = - ball.dy;
                    b.status = false; // o brick quebrou!
                    SCORE += SCORE_UNIT;
                }
            }
        }
    }
}

// mostrar os status do jogo
function showGameStats(text, textX, textY, img, imgX, imgY){
    // desenha o texto 
    ctx.fillStyle = "#FFF";
    ctx.font = "25px Germania One";
    ctx.fillText(text, textX, textY);
    
    // desenha imagen 
    ctx.drawImage(img, imgX, imgY, width = 25, height = 25);
}

// DESENHA FUNCAO(????)
function draw(){
    drawPaddle();
    
    drawBall();
    
    drawBricks();
    
    // score
    showGameStats(SCORE, 35, 25, SCORE_IMG, 5, 5);
    // vida
    showGameStats(LIFE, cvs.width - 25, 25, LIFE_IMG, cvs.width-55, 5); 
    // level 
    showGameStats(LEVEL, cvs.width/2, 25, LEVEL_IMG, cvs.width/2 - 30, 5);
}

// fim de jogo
function gameOver(){
    if(LIFE <= 0){
        showYouLose();
        GAME_OVER = true;
    }
}

// subindo de level 
function levelUp(){
    let isLevelDone = true;
    
    // checa se todos os blocks quebraram
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            isLevelDone = isLevelDone && ! bricks[r][c].status;
        }
    }
    
    if(isLevelDone){
        WIN.play();
        
        if(LEVEL >= MAX_LEVEL){
            showYouWin();
            GAME_OVER = true;
            return;
        }
        brick.row++;
        createBricks();
        ball.speed += 0.5;
        resetBall();
        LEVEL++;
    }
}

// atualizar funçao do jogo
function update(){
    movePaddle();
    
    moveBall();
    
    ballWallCollision();
    
    ballPaddleCollision();
    
    ballBrickCollision();
    
    gameOver();
    
    levelUp();
}

// o loop 
function loop(){
    // limpa a canvas
    ctx.drawImage(BG_IMG, 0, 0);
    
    draw();
    
    update();
    
    if(! GAME_OVER){
        requestAnimationFrame(loop);
    }
}
loop();


// Seleciona o elemento do som
const soundElement  = document.getElementById("sound");

soundElement.addEventListener("click", audioManager);

function audioManager(){
    // mudar a imagen de som on/off
    let imgSrc = soundElement.getAttribute("src");
    let SOUND_IMG = imgSrc == "img/SOUND_ON.png" ? "img/SOUND_OFF.png" : "img/SOUND_ON.png";
    
    soundElement.setAttribute("src", SOUND_IMG);
    
    // funçao para mutar o som
    WALL_HIT.muted = WALL_HIT.muted ? false : true;
    PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
    BRICK_HIT.muted = BRICK_HIT.muted ? false : true;
    WIN.muted = WIN.muted ? false : true;
    LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
}

// mostrar mensagem de game over(??)
/* selecionando elementos */
const gameover = document.getElementById("gameover");
const youwin = document.getElementById("youwin");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");

// game loop(play again)
restart.addEventListener("click", function(){
    location.reload(); // recarrega a pagina 
})

// mostra que vc ganhou
function showYouWin(){
    gameover.style.display = "block";
    youwon.style.display = "block";
}

// mostra que vc perdeu(heh)
function showYouLose(){
    gameover.style.display = "block";
    youlose.style.display = "block";
}



















