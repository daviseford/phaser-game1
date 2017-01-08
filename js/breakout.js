'use strict';
document.addEventListener("DOMContentLoaded", function (event) {
  run();
});

/*
 Run using MAMP (OSX) or XAMPP (Win)
 eg http://localhost:8888/phaser-game1/
 */

var run = function () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, null, {preload: preload, create: create, update: update});
  var ball1, ball2, paddle1, paddle2;
  var bricks, newBrick, brickInfo;
  var lives = 3;
  var score = 0;
  var scoreText, startButton, livesText, lifeLostText;
  var playing = false;


  function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = '#eee';
    game.load.crossOrigin = "Anonymous";
    game.load.image('ball', 'img/ball.png');
    game.load.image('paddle', 'img/paddle.png');
    game.load.image('brick', 'img/brick.png');
    game.load.spritesheet('ball', 'img/wobble.png', 20, 20);
    game.load.spritesheet('button', 'img/button.png', 120, 40);
  }


  function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.checkCollision.down = false;

    // Give ball some physics
    ball1 = game.add.sprite(game.world.width * 0.5, game.world.height - 25, 'ball');
    ball1.animations.add('wobble', [0, 1, 0, 2, 0, 1, 0, 2, 0], 24);
    ball1.anchor.set(0.5);
    game.physics.enable(ball1, Phaser.Physics.ARCADE);
    ball1.body.bounce.set(1);
    ball1.body.collideWorldBounds = true;

    ball2 = game.add.sprite(game.world.width * 0.5 + 80, game.world.height - 35, 'ball');
    changeTint(ball2);
    ball2.animations.add('wobble', [0, 1, 0, 2, 0, 1, 0, 2, 0], 24);
    ball2.anchor.set(0.5);
    game.physics.enable(ball2, Phaser.Physics.ARCADE);
    ball2.body.bounce.set(1);
    ball2.body.collideWorldBounds = true;

    // Define ball limits
    ball1.checkWorldBounds = true;
    ball1.events.onOutOfBounds.add(ballLeavesBounds, this);

    ball2.checkWorldBounds = true;
    ball2.events.onOutOfBounds.add(ballLeavesBounds, this);


    // Paddle and buttons
    paddle1 = game.add.sprite(game.world.width * 0.5, game.world.height - 5, 'paddle');
    paddle1.anchor.set(0.5, 1);
    game.physics.enable(paddle1, Phaser.Physics.ARCADE);
    paddle1.body.immovable = true;

    // Bricks
    initBricks();

    // Score
    var textStyle = {font: '18px Arial', fill: '#0095DD'};
    scoreText = game.add.text(5, 5, 'Points: ' + score, textStyle);
    livesText = game.add.text(game.world.width - 5, 5, 'Lives: ' + lives, textStyle);
    livesText.anchor.set(1, 0);
    lifeLostText = game.add.text(game.world.width * 0.5, game.world.height * 0.5, 'Life lost, click to continue', textStyle);
    lifeLostText.anchor.set(0.5);
    lifeLostText.visible = false;

    // Button
    startButton = game.add.button(game.world.width * 0.5, game.world.height * 0.5, 'button', startGame, this, 1, 0, 2);
    startButton.anchor.set(0.5);

    // Paddle2
    paddle2 = game.add.sprite(game.world.width * 0.2, game.world.height - 90, 'paddle');
    paddle2.tint = '#CCC';
    paddle2.anchor.set(0.5, 1);
    game.physics.enable(paddle2, Phaser.Physics.ARCADE);
    paddle2.body.immovable = true;
    paddle2.x = game.world.width * 0.2;
    paddle2.body.velocity.set(90, 0);
    paddle2.body.collideWorldBounds = true;
    paddle2.body.bounce.set(1);

  }

  function changeTint(ball) {
    ball.tint = Math.random() * 0xffffff;
  }

  function ballLeavesBounds() {
    lives--;
    if (lives) {
      livesText.setText('Lives: ' + lives);
      lifeLostText.visible = true;
      ball1.reset(game.world.width * 0.5, game.world.height - 25);
      ball2.reset(game.world.width * 0.5 + 40, game.world.height - 45);
      paddle1.reset(game.world.width * 0.5, game.world.height - 5);
      game.input.onDown.addOnce(function () {
        lifeLostText.visible = false;
        ball1.body.velocity.set(150, -150);
        ball2.body.velocity.set(-120, -120);
      }, this);
    }
    else {
      alert('You lost, game over!');
      document.location.reload();
    }
  }

  function update() {
    game.physics.arcade.collide(ball1, paddle1, ballHitPaddle);
    game.physics.arcade.collide(ball2, paddle1, ballHitPaddle);
    game.physics.arcade.collide(ball1, paddle2, ballHitPaddle);
    game.physics.arcade.collide(ball2, paddle2, ballHitPaddle);
    game.physics.arcade.collide(ball1, bricks, ballHitBrick);
    game.physics.arcade.collide(ball2, bricks, ballHitBrick);
    game.physics.arcade.collide(ball1, ball2, ballHitBall);
    if (playing) {
      paddle1.x = game.input.x || game.world.width * 0.5;
    }
  }

  function startGame() {
    startButton.destroy();
    ball1.body.velocity.set(150, -150);
    ball2.body.velocity.set(140, -140);
    playing = true;
  }

  function initBricks() {
    brickInfo = {
      width: 50,
      height: 20,
      count: {row: 12, col: 9},
      offset: {top: 50, left: 60},
      padding: 10
    };
    bricks = game.add.group();
    for (var c = 0; c < brickInfo.count.col; c++) {
      for (var r = 0; r < brickInfo.count.row; r++) {
        var brickX = (r * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
        var brickY = (c * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;
        newBrick = game.add.sprite(brickX, brickY, 'brick');
        game.physics.enable(newBrick, Phaser.Physics.ARCADE);
        newBrick.body.immovable = true;
        newBrick.anchor.set(0.5);
        bricks.add(newBrick);
      }
    }
  }

  function ballHitPaddle(ball, paddle) {
    ball.animations.play('wobble');
  }

  function ballHitBall(ball1, ball2) {
    ball1.animations.play('wobble');
    ball2.animations.play('wobble');
    changeTint(ball2);
  }

  function ballHitBrick(ball, brick) {
    var killTween = game.add.tween(brick.scale);
    killTween.to({x: 0, y: 0}, 200, Phaser.Easing.Linear.None);
    killTween.onComplete.addOnce(function () {
      brick.kill();
      checkGameWinCondition();
    });
    killTween.start();
    score += 10;
    scoreText.setText('Points: ' + score);
  }

  function brickHasLiveChildren() {
    var num_children = bricks.children.length;
    for (var i = 0; i < num_children; i++) {
      if (bricks.children[i].alive) {
        return true
      }
    }
    return false;
  }

  function checkGameWinCondition() {
    if (!brickHasLiveChildren()) {
      alert('You win! Score: ' + score);
      document.location.reload();
    }
  }
};