let cols, rows;
let w = 40; // 单元格大小
let grid = [];
let stack = [];
let maxPassages = 2; // 每次移动最多打通的墙壁数量
let fps = 60; // 帧率
let dots = [];
let powerPellets = [];
let portals = []; // 存储传送门的位置
let ghosts = []
let player;
let redGhost;
let pinkGhost;
let lightblueGhost;
let orangeGhost;
let score = 0; // 初始化得分
let ghostsEatenDuringPowerUp = 0;
let dsBisonShadowFont; // 字体变量
let ChineseFont; // 字体变量
let currentDirection = ''; // 用于存储当前的方向
// 在全局定義中加入圖片
let portalImage;
let heartAnimation; // 宣告一個動畫變數
// 手勢的
let video;
let handpose;
let predictions = [];
//音效
let soundGameMusicEffect;
let soundPowereatEffect;
let soundScoreEffect;
let soundHPEffect;
let soundGhosteatEffect;

//起始畫面
let img;
let ENFont;
let Lobbysong;
let showingInstructions = 0; // 控制显示哪个页面的变量

let up;
let right;
let left;
let down;
let bg;
let UpHand;
let DownHand;
let RightHand;
let LeftHand;

let isModelReady = false; // 控制是否开始执行draw函数的变量
let isStart = false;
let Detect = true;
let GameStart = false;

let blue_enemy;
let pink_enemy;
let red_enemy;
let orange_enemy;
let pacman;
let heart;
let bg_rule;

let RankMusic;
let streamers_L;
let streamers_R;
let FirstRank;
let SecondRank;
let ThirdRank;

let savename;

// 從 LocalStorage 中讀取已有的資料
let savedData = JSON.parse(localStorage.getItem('userData')) || {};

function preload() {
    // 在 preload 函數中載入傳送門圖片
    portalImage = loadImage("portal.png");
    // 載入 GIF 檔案
    heartAnimation = createImg("heart.gif","");
    heartAnimation.hide();
    // 载入字体
    dsBisonShadowFont = loadFont("Mantey-Black.ttf");
    ChineseFont = "Microsoft YaHei";
    // 載入音效
    soundGameMusicEffect = loadSound('GameMusic2.mp4');
    soundPowereatEffect = loadSound('大豆豆被吃.mp3');
    soundScoreEffect = loadSound('得分.mp3');
    soundHPEffect = loadSound('被吃扣血.mp3');
    soundGhosteatEffect = loadSound('鬼被吃.mp3');
  
    //起始畫面
    img = loadImage("Startbg.jpg");
    ENFont = loadFont('Mantey-Black.ttf');
    Lobbysong = loadSound('lobby_music.mp3');

    bg = loadImage('images/inro_bg.jpg');
    up = loadImage('images/up.jpg');
    left = loadImage('images/left.jpg');
    right = loadImage('images/right.jpg');
    down = loadImage('images/down.jpg');

    UpHand = loadImage('images/up_h.jpg');
    DownHand = loadImage('images/down_h.jpg');
    RightHand = loadImage('images/right_h.jpg');
    LeftHand = loadImage('images/left_h.jpg');

    red_enemy = loadImage('images/red_enemy.jpg');
    pink_enemy = loadImage('images/pink_enemy.jpg');
    lnky_enemy = loadImage('images/blue_enemy.jpg');
    clyde_enemy = loadImage('images/clyde_enemy.jpg');
    pacman = loadImage('images/pacman.jpg');
    heart = loadImage('images/heart_n.jpg');
    bg_rule = loadImage('images/rule_intro.jpg');
  
    RankMusic = loadSound('RankMusic.mp3');
    streamers_L = loadImage('images/streamers_L.png');
    streamers_R = loadImage('images/streamers_R.png');
    streamers_T = loadImage('images/streamers_top.png');
    FirstRank = loadImage('images/FirstRank.png');
    SecondRank = loadImage('images/SecondRank.png');
    ThirdRank = loadImage('images/ThirdRank.png');
  
}

function setup() {
    createCanvas(640, 570);
    frameRate(fps); // 设置帧率
    cols = floor(480 / w); // 计算列数
    rows = floor(560 / w); // 计算行数

    // 初始化网格
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            let cell = new Cell(i, j);
            grid.push(cell);
        }
    }

    generateMaze(); // 生成迷宫
  
   

    // 打开固定的墙壁
    let fixedWalls = [
        {i: 5, j: 0},
        {i: 5, j: 3},
        {i: 5, j: 6},
        {i: 5, j: 9},
        {i: 5, j: 12}
    ];
    for (let wall of fixedWalls) {
        grid[index(wall.i, wall.j)].walls[1] = false;
        grid[index(wall.i + 1, wall.j)].walls[3] = false;
    }
  
    // 初始化传送门
    portals = [
        {i: 0, j: 7, targetI: 11, targetJ: 7}, // 左侧传送门
        {i: 11, j: 7, targetI: 0, targetJ: 7}  // 右侧传送门
    ];
    for (let portal of portals) {
        let idx = index(portal.i, portal.j);
        if (idx !== -1) {
            grid[idx].portal = true;
            grid[idx].targetI = portal.targetI;
            grid[idx].targetJ = portal.targetJ;
            grid[idx].visible = true;
        }
    }

    // 初始化豆子
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            dots.push(new Dot(i * w + w / 2, j * w + w / 2));
        }
    }

    // 在指定位置生成4颗大豆子
    let powerPelletPositions = [
        {i: 1, j: 1},
        {i: cols - 2, j: 1},
        {i: 1, j: rows - 2},
        {i: cols - 2, j: rows - 2}
    ];

    for (let pos of powerPelletPositions) {
        let idx = index(pos.i, pos.j);
        powerPellets.push(new PowerPellet(pos.i * w + w / 2, pos.j * w + w / 2));
        // 移除指定位置的普通豆子
        dots = dots.filter(dot => !(dot.x === pos.i * w + w / 2 && dot.y === pos.j * w + w / 2));
    }
  
  for (let portal of portals) {
      // 移除傳送門位置的豆子
      dots = dots.filter(dot => dot.x !== portal.i * w + w / 2 || dot.y !== portal.j * w + w / 2);
  }

    player = new Player(5, 6); // 初始化玩家位置
    redGhost = new RedGhost(0, 0 , 0, 0); // 初始化红鬼位置
    pinkGhost = new PinkGhost(11, 0 , 11, 0); // 初始化粉鬼位置
    lightblueGhost = new LightBlueGhost(11, 13 , 11, 13); // 初始化浅蓝鬼位置
    orangeGhost = new OrangeGhost(0, 13 , 0, 13); // 初始化橘鬼位置
    // 创建鬼对象时为每个对象设置类型属性
    redGhost.type = "red";
    pinkGhost.type = "pink";
    lightblueGhost.type = "lightblue";
    orangeGhost.type = "orange";
    ghosts = [redGhost, pinkGhost, lightblueGhost, orangeGhost];
  
    //手勢的
    video = createCapture(VIDEO);
    video.size(width, 480);
    video.hide();

    handpose = ml5.handpose(video, modelReady);
    handpose.on('predict', gotPredictions);
  
  
    soundGameMusicEffect.setVolume(0.02);
    soundPowereatEffect.setVolume(0.2);
    soundScoreEffect.setVolume(0.2);
    soundHPEffect.setVolume(0.2);
    soundGhosteatEffect.setVolume(0.2);
  
    soundGameMusicEffect.setLoop(true); // 确保循环播放
    soundGameMusicEffect.loop(0, 1, 1, 0, soundGameMusicEffect.duration()); // 循环播放整个音效
    soundGameMusicEffect.stop();
  
     // Create a div container
    let container = createDiv();
    container.position(0, 0);
    container.style('position', 'absolute');
    container.style('left', '50%');
    container.style('top', '300px');
    container.style('transform', 'translateX(-50%)');

    // Create an input field inside the container
    input = createInput();
    input.parent(container);
    input.style('display', 'block');
    input.style('margin', '0 auto');

    // Create a button to save the name inside the container
    button = createButton('Save Name');
    button.parent(container);
    button.mousePressed(saveName);
    button.style('display', 'block');
    button.style('margin', '0 auto');

    button.hide();
    input.hide();


    Lobbysong.setVolume(0.2)
    Lobbysong.loop();
  
    RankMusic.setVolume(0.2);
    //RankMusic.loop();
    RankMusic.stop();

}

function draw() {
  if (isModelReady) { // 只有在模型准备好之后才开始执行draw函数
    if(Detect){
      detectFingerGesture();
    }
    
    if(showingInstructions == 5){
      drawRank();
    }
    else if(isStart && showingInstructions == 4){
      Detect = false;
      drawgame();
      if(GameStart === false){
        Lobbysong.stop();
        soundGameMusicEffect.play();
        GameStart = true;
      }
    }    
    else if (showingInstructions == 3) { // 如果showingInstructions为3，则显示操作说明页面
      background(bg);
      drawInstructions();
      button.hide();
      input.hide();
      isStart = false;
    }else if (showingInstructions == 2) { // 如果showingInstructions为2，则显示遊戲说明页面
      drawIntro();
      button.hide();
      input.hide();
      isStart = true;
    }
    else{ // 否则显示开始页面
      background(img);
      drawStartPage();
      button.show();
      input.show();
      isStart = false;
    }
  }   
}

function drawgame(){
  background(51);
    for (let cell of grid) {
        cell.show(); // 显示所有单元格
    }

    // 显示豆子
    for (let dot of dots) {
        dot.show();
    }

    // 显示大豆子
    for (let pellet of powerPellets) {
        pellet.show();
    }

    player.show();
    player.move();
    player.checkCollision();

    redGhost.show();
    redGhost.move(player);

    pinkGhost.show();
    setTimeout(() => {
        pinkGhost.move(player);
    }, 5000);

    lightblueGhost.show();
    setTimeout(() => {
        lightblueGhost.move(player, redGhost);
    }, 10000);

    orangeGhost.show();
    setTimeout(() => {
        orangeGhost.move(player);
    }, 15000);
  
    // 顯示得分
    fill(255);
    textSize(24);
    textFont(dsBisonShadowFont); // 设置字体
    textAlign(RIGHT, TOP); // 將文本對齊方式修改為右上角
    text('Score: ' + score, width - 10, 10); // 文本的 x 座標設置為畫布的寬度減去一些偏移量
    //text(`HP: ${player.HP}`, width - 10, 50);
    // 顯示 GIF 檔案作為血條
    let heartSize = 40; // 愛心圖片的大小
    let heartPadding = 10; // 愛心之間的間距
    let heartX = width - heartSize - heartPadding + 25; // GIF 檔案的初始 x 座標
    let heartY = 60; // GIF 檔案的 y 座標
    // 显示玩家血量对应数量的愛心图标
    for (let i = 0; i < player.HP; i++) {
        let x = heartX - (heartSize + heartPadding) * i;
        image(heartAnimation, x, heartY, heartSize, heartSize);
    }
    
  
     // 显示当前方向
    let arrowSize = 50;
    if (currentDirection === 'UP') {
        rect(width-80,height/2-10,20,50);
        triangle(
            width-45, height/2 - 10,
            width-70, height/2 - 60,
            width-95, height/2 - 10
        );
    } else if (currentDirection === 'DOWN') {
      rect(width-80,height/2-60,20,50);
        triangle(
            width-45, height/2 - 10,
            width-70, height/2 + 40,
            width-95, height/2 - 10
        );
       
    } else if (currentDirection === 'LEFT') {
      rect(width-80,height/2-10,50,20);
        triangle(
            width-80, height/2 - 25,
            width-130, height/2 - 0,
            width-80, height/2 + 25
        );
        
    } else if (currentDirection === 'RIGHT') {
      rect(width-130,height/2-10,50,20);
        triangle(
            width-80, height/2 - 25,
            width-30, height/2 - 0,
            width-80, height/2 + 25
        );
        
    }

  
    // 检查豆子是否都被吃完
    checkAllDotsEaten();
}



//判斷遊戲結束
function checkAllDotsEaten() {
    let allDotsEaten = dots.every(dot => dot.eaten);
    let allPowerPelletsEaten = powerPellets.every(pellet => pellet.eaten);

    if (allDotsEaten && allPowerPelletsEaten) {
        // 所有豆子都被吃完了，执行一些操作
        fill(255);
        textSize(32);
        textFont(ChineseFont); // 设置字体
        textAlign(CENTER, CENTER);
        text('恭喜過關!', width / 2, height / 2);
        noLoop(); // 停止 draw 循环
      
        setTimeout(() => {
            resetGame(); // 延迟一段时间后重置游戏
        }, 3000); // 延迟 3 秒后重置游戏
    }
}

function drawPortal(x, y, width, height, frameColor, portalColor, visible) {
     if (visible) {
        // 传送门的中心图片
        imageMode(CENTER);
        image(portalImage, x, y + 5, width * 3, height * 3);
    }
}


function generateMaze() {
    current = grid[0]; // 从第一个单元格开始
    current.visited = true;
    while (true) {
        let passages = 0;
        while (passages < maxPassages) {
            let next = current.checkNeighbors();
            if (next) {
                if (!next.visited) { // 检查目标单元格是否已被访问
                    next.visited = true;
                    stack.push(current);
                    removeWalls(current, next);
                    current = next;
                    passages++;
                }
            } else {
                // 检查是否遇到死路
                let wallCount = current.walls.filter(wall => wall).length;
                if (wallCount >= 3) {
                    let unvisitedWalls = [];
                    for (let i = 0; i < 4; i++) {
                        if (current.walls[i]) {
                            unvisitedWalls.push(i);
                        }
                    }
                    if (unvisitedWalls.length > 0) {
                      let randomWall = random(unvisitedWalls);
                      let [neighborI, neighborJ] = [current.i, current.j];
                      switch (randomWall) {
                          case 0: // 上墙壁
                              if (neighborJ > 0) { // 边界判断
                                  current.walls[randomWall] = false;
                                  neighborJ--;
                                  let neighbor = grid[index(neighborI, neighborJ)];
                                  removeWalls(current, neighbor);
                              }
                              break;
                          case 1: // 右墙壁
                              if (neighborI < cols - 1) { // 边界判断
                                  current.walls[randomWall] = false;
                                  neighborI++;
                                  let neighbor = grid[index(neighborI, neighborJ)];
                                  removeWalls(current, neighbor);
                              }
                              break;
                          case 2: // 下墙壁
                              if (neighborJ < rows - 1) { // 边界判断
                                  current.walls[randomWall] = false;
                                  neighborJ++;
                                  let neighbor = grid[index(neighborI, neighborJ)];
                                  removeWalls(current, neighbor);
                              }
                              break;
                          case 3: // 左墙壁
                              if (neighborI > 0) { // 边界判断
                                  current.walls[randomWall] = false;
                                  neighborI--;
                                  let neighbor = grid[index(neighborI, neighborJ)];
                                  removeWalls(current, neighbor);
                              }
                              break;
                      }
                  }
                }
                if (stack.length > 0) {
                    current = stack.pop();
                } else {
                    return; // 迷宫生成完成
                }
            }
        }
    }
}

function index(i, j) {
    if (i < 0 || j < 0 || i >= cols || j >= rows) {
        return -1;
    }
    return i + j * cols;
}

function Cell(i, j) {
    this.i = i;
    this.j = j;
    this.walls = [true, true, true, true];
    this.visited = false;
    this.portal = false;
    this.targetI = -1;
    this.targetJ = -1;
    this.visible = true;


    this.checkNeighbors = function () {
        let neighbors = [];

        let directions = [
            {i: 0, j: -1}, // 上
            {i: 1, j: 0},  // 右
            {i: 0, j: 1},  // 下
            {i: -1, j: 0}  // 左
        ];

        for (let dir of directions) {
            let neighbor = grid[index(this.i + dir.i, this.j + dir.j)];
            if (neighbor && !neighbor.visited) {
                neighbors.push(neighbor);
            }
        }

        if (neighbors.length > 0) {
            return neighbors[floor(random(0, neighbors.length))];
        } else {
            return undefined;
        }
    }

    this.show = function () {
    let x = this.i * w;
    let y = this.j * w;
    let wallThickness = 6; // 新增：墙壁的厚度

    stroke(0,150,0,150);
    strokeWeight(wallThickness); // 设置线条粗细

    if (this.walls[0]) {
        line(x - wallThickness / 2, y - wallThickness / 2, x + w + wallThickness / 2, y - wallThickness / 2); // 修改：向内移动线条的起点和终点
    }
    if (this.walls[1]) {
        line(x + w + wallThickness / 2, y - wallThickness / 2, x + w + wallThickness / 2, y + w + wallThickness / 2);
    }
    if (this.walls[2]) {
        line(x + w + wallThickness / 2, y + w + wallThickness / 2, x - wallThickness / 2, y + w + wallThickness / 2);
    }
    if (this.walls[3]) {
        line(x - wallThickness / 2, y + w + wallThickness / 2, x - wallThickness / 2, y - wallThickness / 2);
    }

    if (this.visited) {
        noStroke();
        fill(0, 0, 0 , 0);
        rect(x, y, w, w);
    }
      
    if (this.portal) {
        drawPortal(x + w / 2, y + w / 2, w / 2 + 5, w / 2, color(100, 100, 255), color(255, 200, 100), this.visible);
    }
}

}

function removeWalls(a, b) {
    let x = a.i - b.i;
    if (x === 1) {
        a.walls[3] = false;
        b.walls[1] = false;
    } else if (x === -1) {
        a.walls[1] = false;
        b.walls[3] = false;
    }
    let y = a.j - b.j;
    if (y === 1) {
        a.walls[0] = false;
        b.walls[2] = false;
    } else if (y === -1) {
        a.walls[2] = false;
        b.walls[0] = false;
    }

    let symmetricA = grid[index(cols - 1 - a.i, a.j)];
    let symmetricB = grid[index(cols - 1 - b.i, b.j)];
    if (x === 1) {
        symmetricB.walls[3] = false;
        symmetricA.walls[1] = false;
    } else if (x === -1) {
        symmetricB.walls[1] = false;
        symmetricA.walls[3] = false;
    }
    if (y === 1) {
        symmetricA.walls[0] = false;
        symmetricB.walls[2] = false;
    } else if (y === -1) {
        symmetricA.walls[2] = false;
        symmetricB.walls[0] = false;
    }
    symmetricA.visited = true;
    symmetricB.visited = true;
}

// 豆子的逻辑
class Dot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 5; // 豆子的半径
        this.eaten = false;
    }

    show() {
        if (!this.eaten) {
            fill(255);
            noStroke();
            ellipse(this.x, this.y, this.r * 2);
        }
    }

    eat() {
        this.eaten = true;
    }
    
}

class PowerPellet extends Dot {
    constructor(x, y) {
        super(x, y);
        this.r = 10; // 大豆子的半径
    }

    show() {
        if (!this.eaten) {
            fill(255, 255, 0);
            noStroke();
            ellipse(this.x, this.y, this.r * 2);
        }
    }
}

function resetGame() {
    grid = [];
    stack = [];
    dots = [];
    powerPellets = [];
    ghosts = [];

    // 重新初始化网格
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            let cell = new Cell(i, j);
            grid.push(cell);
        }
    }

    generateMaze(); // 重新生成迷宫

    // 重新打开固定的墙壁
    let fixedWalls = [
        {i: 5, j: 0},
        {i: 5, j: 3},
        {i: 5, j: 6},
        {i: 5, j: 9},
        {i: 5, j: 12}
    ];
    for (let wall of fixedWalls) {
        grid[index(wall.i, wall.j)].walls[1] = false;
        grid[index(wall.i + 1, wall.j)].walls[3] = false;
    }

    // 重新初始化传送门
    for (let portal of portals) {
        let idx = index(portal.i, portal.j);
        if (idx !== -1) {
            grid[idx].portal = true;
            grid[idx].targetI = portal.targetI;
            grid[idx].targetJ = portal.targetJ;
            grid[idx].visible = true;
        }
    }

    // 重新初始化豆子
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            dots.push(new Dot(i * w + w / 2, j * w + w / 2));
        }
    }

    // 重新生成大豆子
    let powerPelletPositions = [
        {i: 1, j: 1},
        {i: cols - 2, j: 1},
        {i: 1, j: rows - 2},
        {i: cols - 2, j: rows - 2}
    ];

    for (let pos of powerPelletPositions) {
        let idx = index(pos.i, pos.j);
        powerPellets.push(new PowerPellet(pos.i * w + w / 2, pos.j * w + w / 2));
        // 移除指定位置的普通豆子
        dots = dots.filter(dot => !(dot.x === pos.i * w + w / 2 && dot.y === pos.j * w + w / 2));
    }

    for (let portal of portals) {
        // 移除传送门位置的豆子
        dots = dots.filter(dot => dot.x !== portal.i * w + w / 2 || dot.y !== portal.j * w + w / 2);
    }

    player = new Player(5, 6); // 初始化玩家位置
    redGhost = new RedGhost(0, 0 , 0, 0); // 初始化红鬼位置
    pinkGhost = new PinkGhost(11, 0 , 11, 0); // 初始化粉鬼位置
    lightblueGhost = new LightBlueGhost(11, 13 , 11, 13); // 初始化浅蓝鬼位置
    orangeGhost = new OrangeGhost(0, 13 , 0, 13); // 初始化橘鬼位置
    // 创建鬼对象时为每个对象设置类型属性
    redGhost.type = "red";
    pinkGhost.type = "pink";
    lightblueGhost.type = "lightblue";
    orangeGhost.type = "orange";
    ghosts = [redGhost, pinkGhost, lightblueGhost, orangeGhost];
    loop(); // 重新开始 draw 循环
}


//手勢的
function modelReady() {
  console.log('模型已準備好！');
  isModelReady = true; // 设置变量为true，以开始执行draw函数
}

function gotPredictions(results) {
  predictions = results;
}

function drawStartPage() {
  noStroke();
  fill(255);
  textSize(80);
  textFont(ENFont)
  text("Pacman", 180, 100);
  
  fill(255);
  textSize(50);
  textFont(ENFont)
  text("Enter your name:", 130, 200);

  fill(255);
  circle(220, 400, 150);
  textSize(40);
  fill(0);
  textFont("Microsoft YaHei");
  text("開始", 180, 415);

  fill(255);
  circle(420, 400, 150);
  textSize(40);
  fill(0);
  textFont("Microsoft YaHei");
  text("操作", 380, 395);
  text("說明", 380, 435);
  
  
}

function drawInstructions() {
  textSize(50);
  textFont('Microsoft YaHei');
  fill(255);
  text('操作說明',220,70);
  textSize(35);  
  text('上下左右的手勢範例',150,130);
  
  // 显示手势示例图片
  image(up,60,170,120,160);
  image(down,330,170,120,160);
  image(left,20,400,160,110);
  image(right,330,400,160,110);
  
  // 显示手势图片
  image(UpHand,200,170,100,170);
  image(DownHand,470,170,100,170);
  image(LeftHand,190,400,130,100);
  image(RightHand,500,400,130,100);
}

function drawIntro(){
  background(bg_rule);
  textSize(50);
  textFont('Microsoft YaHei');
  fill(255);
  text('遊戲規則介紹',170,70);
  textSize(20);  
  text('在每次遊戲開始時，會自動生成一個地圖',20,130);
  text('{Blinky (紅色)、Pinky (粉色)、Inky (淺藍色)、Clyde (橘色)}',20,175)
  text('主角Pacman (黃色)並由玩家透過手勢進行上下左右移動',20,220)
  text('如果主角碰到鬼一次就會扣一顆愛心，每次開始遊玩會有3顆愛心',20,265)
  text('當3顆愛心都消失時，則闖關失敗，當全部豆子都被吃光，則遊戲通關。',20,310)
  image(red_enemy,90,330,100,100);
  image(pink_enemy,210,330,100,100);
  image(lnky_enemy,330,330,100,100);
  image(clyde_enemy,450,330,100,100);
  image(pacman,150,450,120,100);
  image(heart,330,450,180,100);
}

function drawRank() {
  background(255,192,203);
  image(streamers_T, width / 2, 115, 550, 200); // 调整顶部装饰图像的位置
  
  fill(0);
  textSize(50);
  textFont('Microsoft YaHei');
  textAlign(CENTER); // 居中对齐文本
  text("排行榜", width / 2, 80);
  
  fill(0);
  textSize(30);
  textFont('Microsoft YaHei');
  textAlign(CENTER); // 居中对齐文本
  text("你的分數: " + score, width / 2, 165);
  
  fill(224,255,255);
  stroke(255,165,0); 
  strokeWeight(5);
  rect(width / 2 - 175, 210, 350, 280, 50); // 调整排名框的位置
  
  stroke(0);
  strokeWeight(1);
  fill(0);
  textSize(20);
  textFont('Microsoft YaHei');
  textAlign(LEFT); // 左对齐文本
  text("排名", width / 2 - 120, 250);
  text("名字", width / 2 - 20, 250);
  text("分數", width / 2 + 80, 250);
  
  getAllScores();
  let keys = Object.keys(savedData); // 獲取所有鍵
  
  fill(0);
  textSize(20);
  textAlign(CENTER); // 居中对齐文本
  image(FirstRank, width / 2 - 100, 300, 30, 50); // 调整排名图像的位置
  text(keys[0], width / 2 , 300);
  text(savedData[keys[0]], width / 2 + 100, 300);
  
  fill(0);
  textSize(20);
  image(SecondRank, width / 2 - 100, 375, 30, 50); // 调整排名图像的位置
  text(keys[1], width / 2 , 370);
  text(savedData[keys[1]], width / 2 + 100, 370);
  
  fill(0);
  textSize(20);
  image(ThirdRank, width / 2 - 100, 450, 30, 50); // 调整排名图像的位置
  text(keys[2], width / 2 , 450);
  text(savedData[keys[2]], width / 2 + 100, 450);
  
  image(streamers_L, 90, 360, 160, 200); // 调整左侧装饰图像的位置
  image(streamers_R, 540, 360, 160, 200); // 调整右侧装饰图像的位置
}


function saveName() {
  const name = input.value();
  if (name) {    
    savename = name;
    input.value('saved');
  }
}

function detectFingerGesture() {
  if (predictions.length > 0) {
    // 食指
    let indexTipX = predictions[0].landmarks[8][0]; // 食指尖端的 X 座標
    let indexTipY = predictions[0].landmarks[8][1]; // 食指尖端的 Y 座標
    let indexCMCX = predictions[0].landmarks[5][0]; // 食指 CMC 關節的 X 座標
    let indexCMCY = predictions[0].landmarks[5][1]; // 食指 CMC 關節的 Y 座標
    
    // 中指
    let middleTipX = predictions[0].landmarks[12][0]; // 中指尖端的 X 座標
    let middleTipY = predictions[0].landmarks[12][1]; // 中指尖端的 Y 座標
    let middleCMCX = predictions[0].landmarks[9][0]; // 中指 CMC 關節的 X 座標
    let middleCMCY = predictions[0].landmarks[9][1]; // 中指 CMC 關節的 Y 座標
    
    // 无名指
    let ringTipX = predictions[0].landmarks[16][0]; // 无名指尖端的 X 座標
    let ringTipY = predictions[0].landmarks[16][1]; // 无名指尖端的 Y 座標
    let ringCMCX = predictions[0].landmarks[13][0]; // 无名指 CMC 關節的 X 座標
    let ringCMCY = predictions[0].landmarks[13][1]; // 无名指 CMC 關節的 Y 座標
    
    // 小指
    let pinkyTipX = predictions[0].landmarks[20][0]; // 小指尖端的 X 座標
    let pinkyTipY = predictions[0].landmarks[20][1]; // 小指尖端的 Y 座標
    let pinkyCMCX = predictions[0].landmarks[17][0]; // 小指 CMC 關節的 X 座標
    let pinkyCMCY = predictions[0].landmarks[17][1]; // 小指 CMC 關節的 Y 座標

    let threshold = 30; // 方向檢測的閾值
    let yRange = 30; // 上下检测的 Y 座標范围
    
    // 检查方向
    if (indexTipY < indexCMCY - threshold && middleTipY < middleCMCY - threshold && ringTipY < ringCMCY - threshold && pinkyTipY < pinkyCMCY - threshold) {
      //console.log('比4手势');
      showingInstructions = 4;
    } else if (indexTipY < indexCMCY - threshold && middleTipY < middleCMCY - threshold && ringTipY < ringCMCY - threshold) {
      //console.log('比3手势');
       showingInstructions = 3;
    } else if (indexTipY < indexCMCY - threshold && middleTipY < middleCMCY - threshold) {
      //console.log('比2手势');
      showingInstructions = 2;
    } else if (indexTipY < indexCMCY - threshold) {
      //console.log('比1手势');
      showingInstructions = 1;
    }
  }
}

// 添加新的姓名和分數
function addScore(name, score) {
    savedData[name] = score;
    // 排序分數
    sortScores();
    // 只保留前三高的分數
    keepTopThree();
    localStorage.setItem('userData', JSON.stringify(savedData));
}

// 排序分數
function sortScores() {
    //console.log('Sorting scores...');
    const sortedEntries = Object.entries(savedData).sort((a, b) => {
        //console.log('Comparing:', a[1], b[1]);
        return b[1] - a[1];
    });
    savedData = Object.fromEntries(sortedEntries);
    //console.log('Sorted scores:', savedData);
}


// 只保留前三高的分數
function keepTopThree() {
    const entries = Object.entries(savedData);
    if (entries.length > 3) {
        savedData = Object.fromEntries(entries.slice(0, 3));
    }
}

// 獲取特定姓名的分數
function getScore(name) {
    return savedData[name];
}

// 獲取所有的姓名及其對應的分數
function getAllScores() {
    return savedData;
}



