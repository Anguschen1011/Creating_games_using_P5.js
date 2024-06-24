class Player {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.x = this.i * w + w / 2;
        this.y = this.j * w + w / 2;
        this.r = w / 2.2; // 玩家大小
        this.moveDelay = 150; // 移动延迟，以毫秒为单位
        this.lastMoveTime = 0; // 上一次移动的时间
        this.direction = 'RIGHT'; // 初始方向
        this.mouthOpen = true; // 初始状态，嘴巴张开
        this.teleport = false; //傳送
        this.targetX = this.x;
        this.targetY = this.y;
        this.smoothMoveSpeed = 0.15; // 控制平滑移动的速度
        this.HP = 3; // 玩家初始HP
        this.lastCollisionTime = 0; // 新增变量记录上一次碰撞时间
        this.collisionDelay = 500; // 0.5秒的延迟时间
        this.collisionDelay2 = 2000; // 2秒的延迟时间
        this.teleportCooldown = 0; // 添加传送冷却时间属性
    }

    updatePosition() {
        this.x = this.i * w + w / 2;
        this.y = this.j * w + w / 2;
        this.targetX = this.x;
        this.targetY = this.y;
    }

    show() {
        // 平滑移动
        this.x += (this.targetX - this.x) * this.smoothMoveSpeed;
        this.y += (this.targetY - this.y) * this.smoothMoveSpeed;
        if(this.x == 460 && this.y == 300){
          this.targetX = 460;
          this.targetY = 300;
          // 延迟 100 毫秒后启用平滑移动
          setTimeout(() => {
              this.smoothMoveSpeed = 0.15;
          }, 0.1);
        }else if(this.x == 20 && this.y == 300){
          this.targetX = 20;
          this.targetY = 300;
          // 延迟 100 毫秒后启用平滑移动
          setTimeout(() => {
              this.smoothMoveSpeed = 0.15;
          }, 0.1);
        }

        fill(255, 255, 0);
        noStroke();

        // 绘制带缺口的圆形或完整的圆形
        let startAngle, endAngle;
        if (this.mouthOpen) {
            switch (this.direction) {
                case 'UP':
                    startAngle = -PI / 4;
                    endAngle = PI + PI / 4;
                    break;
                case 'DOWN':
                    startAngle = PI * 3 / 4;
                    endAngle = TWO_PI + PI / 4;
                    break;
                case 'LEFT':
                    startAngle = PI + PI / 4;
                    endAngle = TWO_PI + PI * 3 / 4;
                    break;
                case 'RIGHT':
                default:
                    startAngle = PI / 4;
                    endAngle = TWO_PI - PI / 4;
                    break;
            }
        } else {
            startAngle = 0;
            endAngle = TWO_PI;
        }

        arc(this.x, this.y, this.r * 2, this.r * 2, startAngle, endAngle, PIE);

        
    }

    move() {
        this.checkPortal();
      
        let currentTime = millis();
        if (currentTime - this.lastMoveTime < this.moveDelay) {
            return; // 如果未达到移动延迟时间，则不移动
        }

        let nextI = this.i;
        let nextJ = this.j;
        let newDirection = this.direction;

        if (keyIsDown(UP_ARROW)) {
            nextJ--;
            newDirection = 'UP';
            currentDirection = 'UP';
        } else if (keyIsDown(DOWN_ARROW)) {
            nextJ++;
            newDirection = 'DOWN';
            currentDirection = 'DOWN';
        } else if (keyIsDown(LEFT_ARROW)) {
            nextI--;
            newDirection = 'LEFT';
            currentDirection = 'LEFT';
        } else if (keyIsDown(RIGHT_ARROW)) {
            nextI++;
            newDirection = 'RIGHT';
            currentDirection = 'RIGHT';
        } else {
            this.mouthOpen = true; // 如果没有按键按下，保持嘴巴张开的状态
            return; // 如果没有按键按下，则不移动
        }
      
        /*if (predictions.length > 0) {
            let thumbTipX = predictions[0].landmarks[8][0]; // 食指尖端的 X 座標
            let thumbTipY = predictions[0].landmarks[8][1]; // 食指尖端的 Y 座標
            let thumbCMCX = predictions[0].landmarks[6][0]; // 食指 CMC 關節的 X 座標
            let thumbCMCY = predictions[0].landmarks[6][1]; // 食指 CMC 關節的 Y 座標

            let threshold = 10; // 方向檢測的閾值
            let yRange = 20; // 左右檢測的 Y 座標範圍
            let xRange = 20; // 左右檢測的 X 座標範圍
            // 檢查方向並更新控制變量
            if (thumbTipX > thumbCMCX + threshold && abs(thumbTipY - thumbCMCY) < yRange) {
              newDirection = 'LEFT';
              currentDirection = 'LEFT';
              nextI--; // 假設這是控制方式 
              //console.log('大拇指指向左');
            } else if (thumbTipX < thumbCMCX - threshold && abs(thumbTipY - thumbCMCY) < yRange) {
              newDirection = 'RIGHT';
              currentDirection = 'RIGHT';
              nextI++; // 假設這是控制方式
              //console.log('大拇指指向右');
            } else if (thumbCMCY > thumbTipY + threshold && abs(thumbTipX - thumbCMCX) < xRange) {
              newDirection = 'UP';
              currentDirection = 'UP';
              nextJ--; // 假設這是控制方式
              //console.log('大拇指指向上');
            } else if (thumbCMCY < thumbTipY - threshold && abs(thumbTipX - thumbCMCX) < xRange) {
              newDirection = 'DOWN';
              currentDirection = 'DOWN';
              nextJ++; // 假設這是控制方式
              //console.log('大拇指指向下');
            } else {
              this.mouthOpen = true; // 如果没有手勢方向，保持嘴巴张开的状态
              return; // 如果没有手勢方向，则不移动
            }
          }*/

        // 确保玩家不会穿墙
        if (nextI >= 0 && nextI < cols && nextJ >= 0 && nextJ < rows) {
            let currentCell = grid[index(this.i, this.j)];
            let nextCell = grid[index(nextI, nextJ)];

            if ((newDirection === 'UP' && !currentCell.walls[0]) || 
                (newDirection === 'DOWN' && !currentCell.walls[2]) || 
                (newDirection === 'LEFT' && !currentCell.walls[3]) || 
                (newDirection === 'RIGHT' && !currentCell.walls[1])) {

                this.i = nextI;
                this.j = nextJ;
                this.direction = newDirection;
                this.targetX = this.i * w + w / 2;
                this.targetY = this.j * w + w / 2;
                this.lastMoveTime = currentTime; // 更新上一次移动的时间
                this.mouthOpen = !this.mouthOpen; // 切换嘴巴的状态
            }
        }
      
        //this.checkPortal();
      
        
    }
  
    checkPortal() {
        for (let portal of portals) {
            if (dist(this.x, this.y, portal.i * w + w / 2, portal.j * w + w / 2) < this.r + w / 2) {
                if (millis() - this.teleportCooldown > 3000) {
                    // 将 smoothMoveSpeed 设置为 0，即禁用平滑移动
                    this.smoothMoveSpeed = 0;
                    // 传送到目标位置
                    this.i = portal.targetI;
                    this.j = portal.targetJ;
                    this.x = this.i * w + w / 2;
                    this.y = this.j * w + w / 2;
                    this.teleportCooldown = millis(); // 更新传送冷却时间
                    // 设置传送门为不可见
                    let portalCell = grid[index(0, 7)];
                    let portalCell2 = grid[index(11, 7)];
                    portalCell.visible = false;
                    portalCell2.visible = false;

                    // 延迟3秒后重新设置传送门为可见
                    setTimeout(() => {
                        portalCell.visible = true;
                        portalCell2.visible = true;
                    }, 3000);
                    
                    
                           
                }
            }
        }
    }

    checkCollision() {
        let currentTime = millis(); // 获取当前时间
      
        for (let dot of dots) {
            if (!dot.eaten && dist(this.x, this.y, dot.x, dot.y) < this.r + dot.r) {
                dot.eat();
                // 增加得分或其他逻辑
                score += 10; // 吃一个小豆子加10分
            }
        }

        for (let pellet of powerPellets) {
            if (!pellet.eaten && dist(this.x, this.y, pellet.x, pellet.y) < this.r + pellet.r) {
                pellet.eat();
                if (soundPowereatEffect.isPlaying()) {
                    soundPowereatEffect.stop(); // 停止之前的播放，防止多次叠加播放
                }
                soundPowereatEffect.play(); // 播放音效
                setTimeout(() => {
                    soundPowereatEffect.stop(); // 在一秒後停止播放音效
                }, 1000); // 1000 毫秒等於 1 秒
                // 激活大豆子的效果，例如暂时让敌人可被吃掉
                // 更新鬼魂的状态为被大豆子影响
               
                for (let ghost of ghosts) {
                      ghost.setVulnerable();
                  }
                
            }
        }
      
       for (let ghost of ghosts) {
            if (dist(this.x, this.y, ghost.x, ghost.y) < this.r + ghost.r) {
                if (ghost.vulnerable) {
                    if (currentTime - this.lastCollisionTime >= this.collisionDelay) {
                        if (soundGhosteatEffect.isPlaying()) {
                            soundGhosteatEffect.stop(); // 停止之前的播放，防止多次叠加播放
                        }
                        soundGhosteatEffect.play(); // 播放音效
                        setTimeout(() => {
                            soundGhosteatEffect.stop(); // 在一秒後停止播放音效
                        }, 1000); // 1000 毫秒等於 1 秒
                        ghostsEatenDuringPowerUp++;
                        let points = 200 * Math.pow(2, ghostsEatenDuringPowerUp - 1);
                        score += points;
                        ghost.eaten = true;
                        console.log(ghost.type);
                        ghost.color = color(51);
                        ghost.moveDelay = 200;
                        this.lastCollisionTime = currentTime;
                    }
                } else {
                    if (currentTime - this.lastCollisionTime >= this.collisionDelay2) {
                        //this.HP--;
                        if (soundHPEffect.isPlaying()) {
                            soundHPEffect.stop(); // 停止之前的播放，防止多次叠加播放
                        }
                        soundHPEffect.play(); // 播放音效
                        setTimeout(() => {
                            soundHPEffect.stop(); // 在0.5秒后停止播放音效
                        }, 500); // 500 毫秒等於 0.5 秒

                        if (this.HP <= 0) {
                            addScore(savename, score);
                            showingInstructions = 5;
                            console.log("Game Over");
                            soundGameMusicEffect.stop();
                            RankMusic.play();
                            //noLoop();
                        }

                        // 在玩家被碰撞时，暂停所有鬼的移动2秒钟
                        for (let ghost of ghosts) {
                            ghost.pauseMove();
                        }

                        // 2秒后恢复鬼的移动
                        setTimeout(() => {
                            for (let ghost of ghosts) {
                                ghost.resumeMove();
                            }
                        }, 2000);

                        this.lastCollisionTime = currentTime;
                    }
                }
            }
        }


    }
}




class Ghost {
    constructor(i, j, initialI, initialJ , color) {
        this.i = i;
        this.j = j;
        this.updatePosition();
        this.initialI = initialI; // 初始位置的 i 坐标
        this.initialJ = initialJ; // 初始位置的 j 坐标
        this.r = w / 2; // 鬼魂大小
        this.moveDelay = 400; // 移动延迟，以毫秒为单位
        this.lastMoveTime = 0; // 上一次移动的时间
        this.color = color; // 鬼魂颜色
        this.direction = 'RIGHT'; // 初始方向
        this.vulnerable = false; // 鬼魂是否处于脆弱状态
        this.eaten = false;
        this.movePaused = false;
    }

    updatePosition() {
        this.x = this.i * w + w / 2;
        this.y = this.j * w + w / 2;
    }
  
    setVulnerable() {
        this.vulnerable = true;
        this.color = color(0, 0, 255); // 设置为蓝色
      
         let blinkInterval; // 定义一个变量来存储setInterval的ID

          // 7秒后开始闪烁
          setTimeout(() => {
              blinkInterval = setInterval(() => {
                  for (let ghost of ghosts) {
                      if (ghost.vulnerable) {
                          // 交替变为原来的颜色和蓝色
                          ghost.color = color(255, 255, 255);
                          setTimeout(() => {
                            ghost.color = color(0, 0, 255);
                          }, 250);
                          
                      }
                  }
              }, 500); // 每1000毫秒闪烁一次
          }, 7000);
      
        setTimeout(function() {
            clearInterval(blinkInterval); // 停止闪烁
            // 在这里放置延迟后执行的代码
            this.vulnerable = false;
            // 根据类型属性来区分并对每个鬼对象执行不同的操作
              for (let ghost of ghosts) {
                  if (ghost.type === "red") {
                      // 对红色鬼对象执行操作
                    ghost.color = color(255, 0, 0);
                    ghost.vulnerable = false;
                  } else if (ghost.type === "pink") {
                      // 对粉红色鬼对象执行操作
                    ghost.color = color(255, 182, 193);
                    ghost.vulnerable = false;
                  } else if (ghost.type === "lightblue") {
                      // 对浅蓝色鬼对象执行操作
                    ghost.color = color(0, 255, 255);
                    ghost.vulnerable = false;
                  } else if (ghost.type === "orange") {
                      // 对橘色鬼对象执行操作
                    ghost.color = color(255, 165, 0);
                    ghost.vulnerable = false;
                  }
              }
            ghostsEatenDuringPowerUp = 0; // 重置计数器
        }, 10000); // 10000毫秒即10秒
        
    }

    show() {
        fill(this.color);
        noStroke();

        // 绘制上半部分的半圆
        arc(this.x, this.y, this.r * 2, this.r * 2, PI, 0);
      
        // 绘制中间的矩形
        rect(this.x - 20, this.y, 40, 5);

        // 绘制下半部分的波浪
        arc(this.x, this.y + 5, this.r - 5 , this.r , 0, PI);
        arc(this.x + 12.2, this.y + 5, this.r - 5 , this.r , 0, PI);
        arc(this.x - 12.2, this.y + 5, this.r - 5 , this.r , 0, PI);

        // 绘制眼睛
        fill(255);
        let eyeOffsetX = this.r / 4;
        let eyeOffsetY = this.r / 4;
        ellipse(this.x - eyeOffsetX, this.y - eyeOffsetY, this.r / 2, this.r / 2);
        ellipse(this.x + eyeOffsetX, this.y - eyeOffsetY, this.r / 2, this.r / 2);

        // 绘制眼睛的瞳孔，根据方向调整位置
        fill(0);
        let pupilOffsetX = eyeOffsetX / 2;
        let pupilOffsetY = eyeOffsetY / 2;

        switch (this.direction) {
            case 'UP':
                pupilOffsetX = 0;
                pupilOffsetY = -eyeOffsetY / 2;
                break;
            case 'DOWN':
                pupilOffsetX = 0;
                pupilOffsetY = eyeOffsetY / 2;
                break;
            case 'LEFT':
                pupilOffsetX = -eyeOffsetX / 2;
                pupilOffsetY = 0;
                break;
            case 'RIGHT':
                pupilOffsetX = eyeOffsetX / 2;
                pupilOffsetY = 0;
                break;
        }

        ellipse(this.x - eyeOffsetX + pupilOffsetX, this.y - eyeOffsetY + pupilOffsetY, this.r / 4, this.r / 4);
        ellipse(this.x + eyeOffsetX + pupilOffsetX, this.y - eyeOffsetY + pupilOffsetY, this.r / 4, this.r / 4);
    }

    move(targetI, targetJ) {
        if (this.movePaused) {
            return; // 如果移动被暂停，不执行移动操作
        }
        let currentTime = millis();
        if (currentTime - this.lastMoveTime < this.moveDelay) {
            return; // 如果未达到移动延迟时间，则不移动
        }

        let queue = [];
        let visited = new Set();
        queue.push({i: this.i, j: this.j, path: []});
        visited.add(`${this.i},${this.j}`);

        let directions = [
            {i: -1, j: 0, direction: 'LEFT'}, // 左
            {i: 1, j: 0, direction: 'RIGHT'},  // 右
            {i: 0, j: -1, direction: 'UP'}, // 上
            {i: 0, j: 1, direction: 'DOWN'}   // 下
        ];

        while (queue.length > 0) {
            let current = queue.shift();
            let currentI = current.i;
            let currentJ = current.j;
            let path = current.path;

            if (currentI === targetI && currentJ === targetJ) {
                if (path.length > 0) {
                    let nextMove = path[0];
                    this.i = nextMove.i;
                    this.j = nextMove.j;
                    this.direction = nextMove.direction;
                    this.updatePosition();
                }
                this.lastMoveTime = currentTime;
                return;
            }

            for (let dir of directions) {
                let newI = currentI + dir.i;
                let newJ = currentJ + dir.j;

                if (newI >= 0 && newI < cols && newJ >= 0 && newJ < rows && !visited.has(`${newI},${newJ}`)) {
                    let currentCell = grid[index(currentI, currentJ)];
                    let nextCell = grid[index(newI, newJ)];

                    if ((dir.i === -1 && !currentCell.walls[3]) || 
                        (dir.i === 1 && !currentCell.walls[1]) || 
                        (dir.j === -1 && !currentCell.walls[0]) || 
                        (dir.j === 1 && !currentCell.walls[2])) {

                        queue.push({i: newI, j: newJ, path: path.concat([{i: newI, j: newJ, direction: dir.direction}])});
                        visited.add(`${newI},${newJ}`);
                    }
                }
            }
        }

        this.lastMoveTime = currentTime; // 更新上一次移动的时间
    }
  
  randomMove() {
        let currentTime = millis();
        if (currentTime - this.lastMoveTime < this.moveDelay) {
            return; // 如果未达到移动延迟时间，则不移动
        }

        let directions = [
            {i: -1, j: 0}, // 左
            {i: 1, j: 0},  // 右
            {i: 0, j: -1}, // 上
            {i: 0, j: 1}   // 下
        ];

        shuffle(directions, true);

        for (let dir of directions) {
            let newI = this.i + dir.i;
            let newJ = this.j + dir.j;

            if (newI >= 0 && newI < cols && newJ >= 0 && newJ < rows) {
                let currentCell = grid[index(this.i, this.j)];
                let nextCell = grid[index(newI, newJ)];

                if ((dir.i === -1 && !currentCell.walls[3]) || 
                    (dir.i === 1 && !currentCell.walls[1]) || 
                    (dir.j === -1 && !currentCell.walls[0]) || 
                    (dir.j === 1 && !currentCell.walls[2])) {

                    this.i = newI;
                    this.j = newJ;
                    this.updatePosition();
                    this.lastMoveTime = currentTime; // 更新上一次移动的时间
                    return;
                }
            }
        }
    }
  
    reset() {
      // 设置目标位置为初始位置
      let targetI = this.initialI;
      let targetJ = this.initialJ;

      let currentTime = millis();
        if (currentTime - this.lastMoveTime < this.moveDelay) {
            return; // 如果未达到移动延迟时间，则不移动
        }

        let queue = [];
        let visited = new Set();
        queue.push({i: this.i, j: this.j, path: []});
        visited.add(`${this.i},${this.j}`);

        let directions = [
            {i: -1, j: 0, direction: 'LEFT'}, // 左
            {i: 1, j: 0, direction: 'RIGHT'},  // 右
            {i: 0, j: -1, direction: 'UP'}, // 上
            {i: 0, j: 1, direction: 'DOWN'}   // 下
        ];

        while (queue.length > 0) {
            let current = queue.shift();
            let currentI = current.i;
            let currentJ = current.j;
            let path = current.path;

            if (currentI === targetI && currentJ === targetJ) {
                if (path.length > 0) {
                    let nextMove = path[0];
                    this.i = nextMove.i;
                    this.j = nextMove.j;
                    this.direction = nextMove.direction;
                    this.updatePosition();
                }
                if (queue.length == 0){
                  this.eaten = false;
                    console.log(this.type);
                    if (this.type === "red") {
                            // 对红色鬼对象执行操作
                          this.color = color(255, 0, 0);
                          this.vulnerable = false;
                          this.moveDelay = 400;
                        } else if (this.type === "pink") {
                            // 对粉红色鬼对象执行操作
                          this.color = color(255, 182, 193);
                          this.vulnerable = false;
                          this.moveDelay = 400;
                        } else if (this.type === "lightblue") {
                            // 对浅蓝色鬼对象执行操作
                          this.color = color(0, 255, 255);
                          this.vulnerable = false;
                          this.moveDelay = 400;
                        } else if (this.type === "orange") {
                            // 对橘色鬼对象执行操作
                          this.color = color(255, 165, 0);
                          this.vulnerable = false;
                          this.moveDelay = 400;
                        }
                  
                }
                this.lastMoveTime = currentTime;
      
                return;
            }

            for (let dir of directions) {
                let newI = currentI + dir.i;
                let newJ = currentJ + dir.j;

                if (newI >= 0 && newI < cols && newJ >= 0 && newJ < rows && !visited.has(`${newI},${newJ}`)) {
                    let currentCell = grid[index(currentI, currentJ)];
                    let nextCell = grid[index(newI, newJ)];

                    if ((dir.i === -1 && !currentCell.walls[3]) || 
                        (dir.i === 1 && !currentCell.walls[1]) || 
                        (dir.j === -1 && !currentCell.walls[0]) || 
                        (dir.j === 1 && !currentCell.walls[2])) {

                        queue.push({i: newI, j: newJ, path: path.concat([{i: newI, j: newJ, direction: dir.direction}])});
                        visited.add(`${newI},${newJ}`);
                    }
                }
            }
        }

      
        this.lastMoveTime = currentTime; // 更新上一次移动的时间
    }
  
    pauseMove() {
        this.movePaused = true;
    }

    resumeMove() {
        this.movePaused = false;
    }

  
    
}
class RedGhost extends Ghost {
    constructor(i, j, initialI, initialJ) {
        super(i, j, initialI, initialJ, color(255, 0, 0));
    }

    move(player) {
        if (this.eaten){
            this.reset();
            return;
        }
        if (this.vulnerable) {
            this.randomMove();
            return;
        }
        super.move(player.i, player.j);
    }
}

class PinkGhost extends Ghost {
    constructor(i, j, initialI, initialJ) {
        super(i, j, initialI, initialJ , color(255, 182, 193)); // 粉红色
    }

    move(player) {
        if (this.eaten){
            this.reset();
            return;
        }
        if (this.vulnerable) {
            this.randomMove();
            return;
        }
      
        let targetI = player.i;
        let targetJ = player.j;

        switch (player.direction) {
            case 'LEFT':
                targetI -= 2;
                break;
            case 'RIGHT':
                targetI += 2;
                break;
            case 'UP':
                targetJ -= 2;
                break;
            case 'DOWN':
                targetJ += 2;
                break;
        }

        let distance = abs(this.i - player.i) + abs(this.j - player.j);

        if (distance <= 2) {
            targetI = player.i;
            targetJ = player.j;
        }

        targetI = constrain(targetI, 0, cols - 1);
        targetJ = constrain(targetJ, 0, rows - 1);

        super.move(targetI, targetJ);
    }
}

class LightBlueGhost extends Ghost {
    constructor(i, j, initialI, initialJ) {
        super(i, j, initialI, initialJ, color(0, 255, 255)); // 浅蓝色
    }

    move(player, redGhost) {
        if (this.eaten){
            this.reset();
            return;
        }
        if (this.vulnerable) {
            this.randomMove();
            return;
        }
        let vectorI = player.i - redGhost.i;
        let vectorJ = player.j - redGhost.j;
        let targetI = redGhost.i + 2 * vectorI;
        let targetJ = redGhost.j + 2 * vectorJ;

        let distance = abs(this.i - player.i) + abs(this.j - player.j);

        if (distance <= 2) {
            targetI = player.i;
            targetJ = player.j;
        }

        targetI = constrain(targetI, 0, cols - 1);
        targetJ = constrain(targetJ, 0, rows - 1);

        super.move(targetI, targetJ);
    }
}

class OrangeGhost extends Ghost {
    constructor(i, j, initialI, initialJ) {
        super(i, j, initialI, initialJ, color(255, 165, 0)); // 橘色
    }

    move(player) {
        if (this.movePaused) {
            return; // 如果移动被暂停，不执行移动操作
        }
        
        if (this.eaten){
            this.reset();
            return;
        }
        if (this.vulnerable) {
            this.randomMove();
            return;
        }
      
        let currentTime = millis();
        if (currentTime - this.lastMoveTime < this.moveDelay) {
            return; // 如果未达到移动延迟时间，则不移动
        }

        let distance = abs(this.i - player.i) + abs(this.j - player.j);

        if (distance > 8) {
            super.move(player.i, player.j);
        } else {
            this.randomMove2();
        }

        this.lastMoveTime = currentTime; // 更新上一次移动的时间
    }

    randomMove2() {
        let directions = [
            {i: -1, j: 0}, // 左
            {i: 1, j: 0},  // 右
            {i: 0, j: -1}, // 上
            {i: 0, j: 1}   // 下
        ];

        shuffle(directions, true);

        for (let dir of directions) {
            let newI = this.i + dir.i;
            let newJ = this.j + dir.j;

            if (newI >= 0 && newI < cols && newJ >= 0 && newJ < rows) {
                let currentCell = grid[index(this.i, this.j)];
                let nextCell = grid[index(newI, newJ)];

                if ((dir.i === -1 && !currentCell.walls[3]) || 
                    (dir.i === 1 && !currentCell.walls[1]) || 
                    (dir.j === -1 && !currentCell.walls[0]) || 
                    (dir.j === 1 && !currentCell.walls[2])) {

                    this.i = newI;
                    this.j = newJ;
                    this.updatePosition();
                    return;
                }
            }
        }
    }
}
