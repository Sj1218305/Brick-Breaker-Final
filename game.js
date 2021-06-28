const BALL_SPD = 0.5; 
const BALL_SPD_MAX = 2; 
const BALL_SPIN = 0.2; 
const BRICK_COLS = 14; 
const BRICK_GAP = 0.3; 
const BRICK_ROWS = 8; 
const GAME_LIVES = 3; 
const KEY_SCORE = "breakout_highscore"; 
const MARGIN = 6; 
const MAX_LEVEL = 10; 
const MIN_BOUNCE_ANGLE = 30; 
const PADDLE_SIZE = 2.5; 
const PADDLE_SPD = 0.5; 
const PADDLE_W = 0.1; 
const PUP_BONUS = 50;
const PUP_CHANCE = 0.1;
const PUP_SPD = 0.15; 
const WALL = 0.02; 

const COLOR_BACKGROUND = "black";
const COLOR_BALL = "#39FF14";
const COLOR_PADDLE = "white";
const COLOR_TEXT = "white";
const COLOR_WALL = "grey";


const TEXT_FONT = "Lucida Console";
const TEXT_GAME_OVER = "GAME OVER";
const TEXT_LEVEL = "Level";
const TEXT_LIVES = "Ball";
const TEXT_SCORE = "Score";
const TEXT_SCORE_HIGH = "BEST";
const TEXT_WIN = "!!! YOU WIN !!!";


const Direction = {
    LEFT: 0,
    RIGHT: 1,
    STOP: 2
}

var light_blue  = document.getElementById("light-blue");
var dark_blue  = document.getElementById("dark-blue");
var purple  = document.getElementById("purple");
var orange  = document.getElementById("orange");
var brown  = document.getElementById("brown");
var yellow  = document.getElementById("yellow");
var dark_green  = document.getElementById("dark-green");
var green  = document.getElementById("green");
var red  = document.getElementById("red");
var color_image=light_blue; 
var paddleImg=document.getElementById("paddle");
var paddleImg1=document.getElementById("paddle1");
heart=document.getElementById("heart");
superPup=document.getElementById("super");
slimePup=document.getElementById("slime");
longerPup=document.getElementById("longer");
var background=document.getElementById("bg");

const PupType = {
    paddleSize: {color: "dodgerblue"},
    life: {color: "hotpink"},
    stickyPaddle: {color: "forestgreen"},
    super: {color: "magenta"}
}

var canv = document.getElementById("canvas");
var ctx = canv.getContext("2d");

var soundBrick = new Audio("./Tiles/Breakout Tile Set Free/Sounds/brickhit.mp3");
var soundPaddle = new Audio("./Tiles/Breakout Tile Set Free/Sounds/sliderhit.mp3");
var soundPowerup = new Audio("./Tiles/Breakout Tile Set Free/Sounds/youwon.mp3");
var soundWall = soundPaddle;

var ball, bricks = [], paddle, pups = [];
var gameOver, pupExtension, pupSticky, pupSuper, win;
var level, lives, score, scoreHigh;
var numBricks, textSize;

var height, width, wall;
setDimensions();


document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
window.addEventListener("resize", setDimensions);


var timeDelta, timeLast;
requestAnimationFrame(loop);

function loop(timeNow) {
    if (!timeLast) {
        timeLast = timeNow;
    }

    
    timeDelta = (timeNow - timeLast) * 0.001; // seconds
    timeLast = timeNow;

    // update
    if (!gameOver) {
        updatePaddle(timeDelta);
        updateBall(timeDelta);
        updateBricks(timeDelta);
        updatePups(timeDelta);
    }

    drawBackground();
    drawWalls();
    drawPups();
    drawPaddle();
    drawBricks();
    drawText();
    drawBall();

    
    requestAnimationFrame(loop);
}


function applyBallSpeed(angle) {
    ball.xv = ball.spd * Math.cos(angle);
    ball.yv = -ball.spd * Math.sin(angle);
}

function createBricks() {
   
    let minY = wall;
    let maxY = ball.y - ball.h * 3.5;
    let totalSpaceY = maxY - minY;
    let totalRows = MARGIN + BRICK_ROWS + MAX_LEVEL * 2;
    let rowH = totalSpaceY / totalRows;
    let gap = wall * BRICK_GAP;
    let h = rowH - gap;
    textSize = rowH * MARGIN * 0.5;

    let totalSpaceX = width - wall * 2;
    let colW = (totalSpaceX - gap) / BRICK_COLS;
    let w = colW - gap;

    bricks = [];
    let cols = BRICK_COLS;
    let rows = BRICK_ROWS + level * 2;
    let color, left, rank, rankHigh, score, spdMult, top;
    numBricks = cols * rows;
    rankHigh = rows * 0.5 - 1;
    for (let i = 0; i < rows; i++) {
        bricks[i] = [];
        rank = Math.floor(i * 0.5);
        score = (rankHigh - rank) * 2 + 1;
        spdMult = 1 + (rankHigh - rank) / rankHigh * (BALL_SPD_MAX - 1);
        color = getBrickColor(rank, rankHigh);
        top = wall + (MARGIN + i) * rowH;
        for (let j = 0; j < cols; j++) {
            left = wall + gap + j * colW;
            bricks[i][j] = new Brick(left, top, w, h, color, score, spdMult);
        }
    }
}

function drawBackground() {
    ctx.drawImage(background,0,0,width,height)
}

function drawBall() {
    ctx.fillStyle = pupSuper ? PupType.super.color : COLOR_BALL;
    ctx.fillRect(ball.x - ball.w * 0.5, ball.y - ball.h * 0.5, ball.w, ball.h);
}

function drawBricks() {
    for (let row of bricks) {   
        for (let brick of row) {
            if (brick == null) {
                continue;
            }
        if (!brick.empty)
        {
        a=brick.color;
        switch(a)
        {
            case "rgb(255, 0, 0)":color_image=red;break;
            
            case "rgb(255, 127, 0)":color_image=orange;break;
    
            case "rgb(0, 255, 0)": color_image=dark_green;break;
    
            case "rgb(255, 254, 0)":color_image=yellow;break;
        }
        ctx.drawImage(color_image, brick.left, brick.top,brick.w,brick.h);
    }
}
    }
}

function drawPaddle() {
    if (pupSticky)
    {
        ctx.drawImage(paddleImg1, paddle.x - paddle.w * 0.5, paddle.y - paddle.h * 0.5, paddle.w, paddle.h);
    }
    else{
        ctx.drawImage(paddleImg, paddle.x - paddle.w * 0.5, paddle.y - paddle.h * 0.5, paddle.w, paddle.h);
    }

}

function drawPups() {
    ctx.lineWidth = wall * 0.35;
    for (let pup of pups) {
        // ctx.fillStyle = pup.type.color;
        // ctx.strokeStyle = pup.type.color;
        // ctx.strokeRect(pup.x - pup.w * 0.5, pup.y - pup.h * 0.5, pup.w, pup.h);
        a=heart;
        if (pup.type.color==="magenta")
        {
            a=superPup;
        }
        else if(pup.type.color=="forestgreen")
        {
            a=slimePup;
        }
        else if (pup.type.color==="dodgerblue")
        {
            a=longerPup;
        }
            ctx.drawImage(a, pup.x - pup.w * 0.5, pup.y - pup.h * 0.5,pup.w,pup.h);
    }
}

function drawText() {
    ctx.fillStyle = COLOR_TEXT;

    let labelSize = textSize * 0.5;
    let margin = wall * 2;
    let maxWidth = width - margin * 2;
    let maxWidth1 = maxWidth * 0.27;
    let maxWidth2 = maxWidth * 0.2;
    let maxWidth3 = maxWidth * 0.2;
    let maxWidth4 = maxWidth * 0.27;
    let x1 = margin;
    let x2 = width * 0.4;
    let x3 = width * 0.6;
    let x4 = width - margin;
    let yLabel = wall + labelSize;
    let yValue = yLabel + textSize * 0.9;

    ctx.font = labelSize + "px " + TEXT_FONT;
    ctx.textAlign = "left";
    ctx.fillText(TEXT_SCORE, x1, yLabel, maxWidth1);
    ctx.textAlign = "center";
    ctx.fillText(TEXT_LIVES, x2, yLabel, maxWidth2);
    ctx.fillText(TEXT_LEVEL, x3, yLabel, maxWidth3);
    ctx.textAlign = "right";
    ctx.fillText(TEXT_SCORE_HIGH, x4, yLabel, maxWidth4);
    ctx.font = textSize + "px " + TEXT_FONT;
    ctx.textAlign = "left";
    ctx.fillText(score, x1, yValue, maxWidth1);
    ctx.textAlign = "center";
    ctx.fillText(lives + "/" + GAME_LIVES, x2, yValue, maxWidth2);
    ctx.fillText(level, x3, yValue, maxWidth3);
    ctx.textAlign = "right";
    ctx.fillText(scoreHigh, x4, yValue, maxWidth4);

    if (gameOver) {
        let text = win ? TEXT_WIN : TEXT_GAME_OVER;
        ctx.font = textSize + "px " + TEXT_FONT;
        ctx.textAlign = "center";
        ctx.fillStyle="#FFFF00";
        ctx.fillText(text, width * 0.5, height*0.5, maxWidth);
    }
}

function drawWalls() {
    let hwall = wall * 0.5;
    ctx.lineWidth = wall;
    ctx.strokeStyle = COLOR_WALL;
    ctx.beginPath();
    ctx.moveTo(hwall, height);
    ctx.lineTo(hwall, hwall);
    ctx.lineTo(width - hwall, hwall);
    ctx.lineTo(width - hwall, height);
    ctx.stroke();
}

function getBrickColor(rank, highestRank) {
    let fraction = rank / highestRank;
    let r, g, b = 0;

    if (fraction <= 0.67) {
        r = 255;
        g = 255 * fraction / 0.67;
    }

    else {
        r = 255 * (1 - fraction) / 0.33;
        g = 255;
    }


    return "rgb(" + Math.round(r) + ", " + Math.round(g) + ", " + Math.round(b) + ")";
}

function keyDown(ev) {
    switch (ev.keyCode) {
        case 32: 
            serve();
            if (gameOver) {
                newGame();
            }
            break;
        case 37: 
            movePaddle(Direction.LEFT);
            break;
        case 39: 
            movePaddle(Direction.RIGHT);
            break;
    }
}

function keyUp(ev) {
    switch (ev.keyCode) {
        case 37: 
        case 39: 
            movePaddle(Direction.STOP);
            break;
    }
}

function movePaddle(direction) {
    switch (direction) {
        case Direction.LEFT:
            paddle.xv = -paddle.spd;
            break;
        case Direction.RIGHT:
            paddle.xv = paddle.spd;
            break;
        case Direction.STOP:
            paddle.xv = 0;
            break;
    }
}

function newBall() {
    pupExtension = false;
    pupSticky = false;
    pupSuper = false;
    paddle = new Paddle();
    ball = new Ball();
}

function newGame() {
    gameOver = false;
    level = 0;
    lives = GAME_LIVES;
    score = 0;
    win = false;

    let scoreStr = localStorage.getItem(KEY_SCORE);
    if (scoreStr == null) {
        scoreHigh = 0;
    } else {
        scoreHigh = parseInt(scoreStr);
    }
    
    newLevel();
}

function newLevel() {
    pups = [];
    newBall();
    createBricks();
}

function level2() {
        
        let minY = wall;
        let maxY = ball.y - ball.h * 3.5;
        let totalSpaceY = maxY - minY;
        let totalRows = MARGIN + BRICK_ROWS + MAX_LEVEL * 2;
        let rowH = totalSpaceY / totalRows;
        let gap = wall * BRICK_GAP;
        let h = rowH - gap;
        textSize = rowH * MARGIN * 0.5;
    
        let totalSpaceX = width - wall * 2;
        let colW = (totalSpaceX - gap) / BRICK_COLS;
        let w = colW - gap;
    
        bricks = [];
        let cols = BRICK_COLS;
        let rows = BRICK_ROWS + level * 2;
        let color, left, rank, rankHigh, score,empty,spdMult, top;
        numBricks = cols * rows;
        rankHigh = rows * 0.5 - 1;
        for (let i = 0; i < rows; i++) {
            bricks[i] = [];
            rank = Math.floor(i * 0.5);
            score = (rankHigh - rank) * 2 + 1;
            spdMult = 1 + (rankHigh - rank) / rankHigh * (BALL_SPD_MAX - 1);
            color = getBrickColor(rank, rankHigh);
            top = wall + (MARGIN + i) * rowH;
            empty=true;
            for (let j = 0; j < cols; j++) {
                left = wall + gap + j * colW;
                if ((i == 0 && j % 3 != 0) || (i == 1 && j % 3 == 0) || (i == 2 && (j >= 1 && j <= 5)) ||
                    (i == 3 && (j >= 2 && j <= 4)) || (i == 4 && j == 3) || (i - j == 2) || (i + j == 8)){
                    empty = false;
                    }
                bricks[i][j] = new Brick(left, top, w, h, color, score, spdMult,empty);
            }
        }
    }

                    // Brick(left, top, w, h, color, score, spdMult)
                // var image = new Image(100,100);
                //   var image  = document.getElementById("html5");
                //   ctx.drawImage(image, brickX, brickY,brickWidth,brickHeight);
                // image.src = "D:/BreakBuilder-test/Tiles/Breakout Tile Set Free/PNG/11-Breakout-Tiles.png";


function outOfBounds() {
    lives--;
    if (lives == 0) {
        gameOver = true;
    }
    newBall();
}

function serve() {

    if (ball.yv != 0) {
        return false;
    }

    let minBounceAngle = MIN_BOUNCE_ANGLE / 180 * Math.PI; // radians
    let range = Math.PI - minBounceAngle * 2;
    let angle = Math.random() * range + minBounceAngle;
    applyBallSpeed(pupSticky ? Math.PI / 2 : angle);
    soundPaddle.play();
    return true;
}

function setDimensions() {
    height = window.innerHeight;
    width = window.innerWidth;
    wall = WALL * (height < width ? height : width);
    canv.width = width;
    canv.height = height;
    ctx.textBaseline = "middle";
    newGame();
}

function spinBall() {
    let upwards = ball.yv < 0;
    let angle = Math.atan2(-ball.yv, ball.xv);
    angle += (Math.random() * Math.PI / 2 - Math.PI / 4) * BALL_SPIN;

    // minimum bounce angle
    let minBounceAngle = MIN_BOUNCE_ANGLE / 180 * Math.PI; // radians
    if (upwards) {
        if (angle < minBounceAngle) {
            angle = minBounceAngle;
        } else if (angle > Math.PI - minBounceAngle) {
            angle = Math.PI - minBounceAngle;
        }
    } else {
        if (angle > -minBounceAngle) {
            angle = -minBounceAngle;
        } else if (angle < -Math.PI + minBounceAngle) {
            angle = -Math.PI + minBounceAngle;
        }
    }
    applyBallSpeed(angle);
}

function updateBall(delta) {
    ball.x += ball.xv * delta;
    ball.y += ball.yv * delta;

    // bounce the ball off the walls
    if (ball.x < wall + ball.w * 0.5) {
        ball.x = wall + ball.w * 0.5;
        ball.xv = -ball.xv;
        soundWall.play();
        spinBall();
    } else if (ball.x > width - wall - ball.w * 0.5) {
        ball.x = width - wall - ball.w * 0.5;
        ball.xv = -ball.xv;
        soundWall.play();
        spinBall();
    } else if (ball.y < wall + ball.h * 0.5) {
        ball.y = wall + ball.h * 0.5;
        ball.yv = -ball.yv;
        soundWall.play();
        spinBall();
    }

    if (ball.y > paddle.y - paddle.h * 0.5 - ball.h * 0.5
        && ball.y < paddle.y + paddle.h * 0.5
        && ball.x > paddle.x - paddle.w * 0.5 - ball.w * 0.5
        && ball.x < paddle.x + paddle.w * 0.5 + ball.w * 0.5
    ) {
        ball.y = paddle.y - paddle.h * 0.5 - ball.h * 0.5;
        if (pupSticky) {
            ball.xv = 0;
            ball.yv = 0;
        } else {
            ball.yv = -ball.yv;
            spinBall();
        }
        soundPaddle.play();
    }

    if (ball.y > height) {
        outOfBounds();
    }
}

function updateBricks(delta) {

    OUTER: for (let i = 0; i < bricks.length; i++) {
        for (let j = 0; j < BRICK_COLS; j++) {
            if (bricks[i][j] != null && bricks[i][j].intersect(ball)) {
                updateScore(bricks[i][j].score);
                ball.setSpeed(bricks[i][j].spdMult);

                if (ball.yv < 0) { 
                    ball.y = bricks[i][j].bot + ball.h * 0.5;
                } else {
                    ball.y = bricks[i][j].top - ball.h * 0.5;
                }

                if (Math.random() <= PUP_CHANCE) {
                    let px = bricks[i][j].left + bricks[i][j].w / 2;
                    let py = bricks[i][j].top + bricks[i][j].h / 2;
                    let pSize = bricks[i][j].w / 2;
                    let pKeys = Object.keys(PupType);
                    let pKey = pKeys[Math.floor(Math.random() * pKeys.length)];
                    pups.push(new PowerUp(px, py, pSize, PupType[pKey]));
                }

                if (!pupSuper) {
                    ball.yv = -ball.yv;
                }
                bricks[i][j] = null;
                numBricks--;
                soundBrick.play();
                spinBall();
                break OUTER;
            }
        }
    }

    if (numBricks == 0) {
        if (level < MAX_LEVEL) {
            level++;
            newLevel();
        } else {
            gameOver = true;
            win = true;
            newBall();
        }
    }
}

function updatePaddle(delta) {

    let lastPaddleX = paddle.x;
    paddle.x += paddle.xv * delta;

    if (paddle.x < wall + paddle.w * 0.5) {
        paddle.x = wall + paddle.w * 0.5;
    } else if (paddle.x > width - wall - paddle.w * 0.5) {
        paddle.x = width - wall - paddle.w * 0.5;
    }

    if (ball.yv == 0) {
        ball.x += paddle.x - lastPaddleX;
    }

    for (let i = pups.length - 1; i >= 0; i--) {
        if (
            pups[i].x + pups[i].w * 0.5 > paddle.x - paddle.w * 0.5
            && pups[i].x - pups[i].w * 0.5 < paddle.x + paddle.w * 0.5
            && pups[i].y + pups[i].h * 0.5 > paddle.y - paddle.h * 0.5
            && pups[i].y - pups[i].h * 0.5 < paddle.y + paddle.h * 0.5
        ) {
            switch(pups[i].type) {
                case PupType.paddleSize:
                    if (pupExtension) {
                        score += PUP_BONUS;
                    } else {
                        pupExtension = true;
                        paddle.w *= 2;
                    }
                    break;
                case PupType.life:
                    lives++;
                    break;
                case PupType.stickyPaddle:
                    if (pupSticky) {
                        score += PUP_BONUS;
                    } else {
                        pupSticky = true;
                    }
                    break;
                case PupType.super:
                    if (pupSuper) {
                        score += PUP_BONUS;
                    } else {
                        pupSuper = true;
                    }
                    break;
            }
            pups.splice(i, 1);
            soundPowerup.play();
        }
    }
}

function updatePups(delta) {
    for (let i = pups.length - 1; i >= 0; i--) {
        pups[i].y += pups[i].yv * delta;

        // delete off-screen pups
        if (pups[i].y - pups[i].h * 0.5 > height) {
            pups.splice(i, 1);
        }
    }
}

function updateScore(brickScore) {
    score += brickScore;

    // check for a high score
    if (score > scoreHigh) {
        scoreHigh = score;
        localStorage.setItem(KEY_SCORE, scoreHigh);
    }
}

function Ball() {
    this.w = wall;
    this.h = wall;
    this.x = paddle.x;
    this.y = paddle.y - paddle.h / 2 - this.h / 2;
    this.spd = BALL_SPD * height;
    this.xv = 0;
    this.yv = 0;

    this.setSpeed = function(spdMult) {
        this.spd = Math.max(this.spd, BALL_SPD * height * spdMult);
    }
}

function Brick(left, top, w, h, color, score, spdMult,empty) {
    this.w = w;
    this.h = h;
    this.bot = top + h;
    this.left = left;
    this.right = left + w;
    this.top = top;
    this.color = color;
    this.score = score;
    this.spdMult = spdMult;
    this.empty=empty;
    this.intersect = function(ball) {
        let bBot = ball.y + ball.h * 0.5;
        let bLeft = ball.x - ball.w * 0.5;
        let bRight = ball.x + ball.w * 0.5;
        let bTop = ball.y - ball.h * 0.5;
        return this.left < bRight
            && bLeft < this.right
            && this.bot > bTop
            && bBot > this.top;
    }
}

function Paddle() {
    this.w = PADDLE_W * width;
    this.h = wall * PADDLE_SIZE;
    this.x = width / 2;
    this.y = height - wall * 3.5 + this.h / 2;
    this.spd = PADDLE_SPD * width;
    this.xv = 0;
}

function PowerUp(x, y, size, type) {
    this.w = size;
    this.h = size;
    this.x = x;
    this.y = y;
    this.type = type;
    this.yv = PUP_SPD * height;
}
