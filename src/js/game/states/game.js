(function() {
  var Game = function (game) {

  };

  Game.prototype = {

    create: function () {
        console.log(Phaser);
        console.log(this);
        // Game functions
        this.setupBackground();
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.setupPlayer();
        this.setupEnemies();
        this.setupBullets();
        this.setupExplosions();
        this.setupPlayerIcons();
        this.setupText();
        //this.setupAudio();
        
        // Create four arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Instruction Text to display at Game start
        this.instructions = this.add.text( 400, 500, 'Use Arrow Keys to Move, Press Z to Fire\n' + 'Tapping/clicking does both', { font: '20px monospace', fill: '#fff', align: 'center' } );
        this.instructions.anchor.setTo(0.5, 0.5);
        this.instExpire = this.time.now + 10000;
    },
    update: function () {
        this.checkCollisions();
        //this.spawnEnemies();
        //this.enemyFire();
        this.processPlayerInput();
        this.processDelayedEffects(); 
    },
    render: function(){
        // debug blocks around sprites and sheit
        //this.game.debug.body(this.player);
        //this.game.debug.body(this.bullet);  
        //this.game.debug.body(this.enemy);
    },
    // create()- related functions
    setupBackground: function () {
        //this.sea = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'sea');
        //this.sea.autoScroll(0, 12);
        this.background = this.game.add.sprite(0, 0, 'milkyway');
    },
    setupPlayer: function () {
        this.player = this.add.sprite(this.game.width / 2, this.game.height - 50, 'frigate_03');
        this.physics.enable(this.player, Phaser.Physics.P2JS);
        //this.game.physics.p2.enable(this.player);
        this.player.anchor.setTo(0.5, 0.5);
        this.player.animations.add('fly', [ 0, 1, 2 ], 20, true);
        this.player.animations.add('ghost', [ 3, 0, 3, 1 ], 20, true);
        this.player.play('fly');
        this.player.speed = 300;
        this.player.body.collideWorldBounds = true;
        // Player Properties
        this.weaponLevel = 0;
    },
    setupEnemies: function () {
        // Green enemy 'enemy'
        this.enemyPool = this.add.group();
        this.enemyPool.enableBody = true;
        this.enemyPool.physicsBodyType = Phaser.Physics.P2JS;
        this.enemyPool.createMultiple(50, 'frigate_02');
        this.enemyPool.setAll('anchor.x', 0.5);
        this.enemyPool.setAll('anchor.y', 0.5);
        this.enemyPool.setAll('outOfBoundsKill', true);
        this.enemyPool.setAll('checkWorldBounds', true);
        this.enemyPool.setAll('reward', 100, false, false, 0, true);
        this.enemyPool.setAll('dropRate', 0.2, false, false, 0, true);

        // Set the animation for each sprite
        this.enemyPool.forEach(function (enemy) {
            enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
            enemy.animations.add('hit', [ 3, 1, 3, 2 ], 20, false);
            enemy.events.onAnimationComplete.add( function (e) {
                e.play('fly');
            }, this);
        });
        this.nextEnemyAt = 0;
        this.enemyDelay = Phaser.Timer.SECOND;
        // White enemy 'shooter'
        this.shooterPool = this.add.group();
        this.shooterPool.enableBody = true;
        this.shooterPool.physicsBodyType = Phaser.Physics.P2JS;
        this.shooterPool.createMultiple(20, 'frigate_01');
        this.shooterPool.setAll('anchor.x', 0.5);
        this.shooterPool.setAll('anchor.y', 0.5);
        this.shooterPool.setAll('outOfBoundsKill', true);
        this.shooterPool.setAll('checkWorldBounds', true);
        this.shooterPool.setAll('reward', 200, false, false, 0, true);
        this.shooterPool.setAll('dropRate', 0.2, false, false, 0, true);
        
        // Set the animation for each sprite
        this.shooterPool.forEach(function (enemy) {
            enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
            enemy.animations.add('hit', [ 3, 1, 3, 2 ], 20, false);
            enemy.events.onAnimationComplete.add( function (e) {
                e.play('fly');
            }, this);
        });
        // start spawning 5 seconds into the game
        this.nextShooterAt = this.time.now + Phaser.Timer.SECOND * 5;
        this.shooterDelay = Phaser.Timer.SECOND * 3;
        // Boss sprite pool
        this.bossPool = this.add.group();
        this.bossPool.enableBody = true;
        this.bossPool.physicsBodyType = Phaser.Physics.P2JS;
        this.bossPool.createMultiple(1, 'boss');
        this.bossPool.setAll('anchor.x', 0.5);
        this.bossPool.setAll('anchor.y', 0.5);
        this.bossPool.setAll('outOfBoundsKill', true);
        this.bossPool.setAll('checkWorldBounds', true);
        this.bossPool.setAll('reward', 5000, false, false, 0, true);
        this.bossPool.setAll('dropRate', 0, false, false, 0, true);
        // Set the animation for each sprite
        this.bossPool.forEach(function (enemy) {
            enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
            enemy.animations.add('hit', [ 3, 1, 3, 2 ], 20, false);
            enemy.events.onAnimationComplete.add( function (e) {
                e.play('fly');
            }, this);
        });
        this.boss = this.bossPool.getTop();
        this.bossApproaching = false;
    },
    setupBullets: function () {
        this.enemyBulletPool = this.add.group();
        this.enemyBulletPool.enableBody = true;
        this.enemyBulletPool.physicsBodyType = Phaser.Physics.P2JS;
        this.enemyBulletPool.createMultiple(100, 'enemyBullet');
        this.enemyBulletPool.setAll('anchor.x', 0.5);
        this.enemyBulletPool.setAll('anchor.y', 0.5);
        this.enemyBulletPool.setAll('outOfBoundsKill', true);
        this.enemyBulletPool.setAll('checkWorldBounds', true);
        this.enemyBulletPool.setAll('reward', 0, false, false, 0, true);
        // Add an empty sprite group into our game
        this.bulletPool = this.add.group();
        // Enable physics to the whole sprite group
        this.bulletPool.enableBody = true;
        this.bulletPool.physicsBodyType = Phaser.Physics.P2JS;
        // Add 100 'bullet' sprites in the group.
        // By default this uses the first frame of the sprite sheet and
        //   sets the initial state as non-existing (i.e. killed/dead)
        this.bulletPool.createMultiple(100, 'bullet');
        // Sets anchors of all sprites
        this.bulletPool.setAll('anchor.x', 0.5);
        this.bulletPool.setAll('anchor.y', 0.5);
        // Automatically kill the bullet sprites when they go out of bounds
        this.bulletPool.setAll('outOfBoundsKill', true);
        this.bulletPool.setAll('checkWorldBounds', true);
        // Rate of fire
        this.nextShotAt = 0;
        this.shotDelay = Phaser.Timer.SECOND * 0.1;
    },
    setupExplosions: function () {
        this.explosionPool = this.add.group();
        this.explosionPool.enableBody = true;
        this.explosionPool.physicsBodyType = Phaser.Physics.P2JS;
        this.explosionPool.createMultiple(100, 'explosion');
        this.explosionPool.setAll('anchor.x', 0.5);
        this.explosionPool.setAll('anchor.y', 0.5);
        this.explosionPool.forEach(function (explosion) {
            explosion.animations.add('boom');
        });
    },
    setupPlayerIcons: function () {
        // Setup sprite group for Power-Ups
        this.powerUpPool = this.add.group();
        this.powerUpPool.enableBody = true;
        this.powerUpPool.physicsBodyType = Phaser.Physics.P2JS;
        this.powerUpPool.createMultiple(5, 'powerup1');
        this.powerUpPool.setAll('anchor.x', 0.5);
        this.powerUpPool.setAll('anchor.y', 0.5);
        this.powerUpPool.setAll('outOfBoundsKill', true);
        this.powerUpPool.setAll('checkWorldBounds', true);
        this.powerUpPool.setAll('reward', 100, false, false, 0, true);

        this.lives = this.add.group();
        // calculate location of first life icon
        var firstLifeIconX = this.game.width - 10 - (3 * 30);
        for (var i = 0; i < 3; i++) {
            var life = this.lives.create(firstLifeIconX + (30 * i), 30, 'player');
            life.scale.setTo(0.5, 0.5);
            life.anchor.setTo(0.5, 0.5);
        }
    },
    setupText: function () {
        this.instructions = this.add.text( this.game.width / 2, this.game.height - 100, 'Use Arrow Keys to Move, Press Z to Fire\n' + 'Tapping/clicking does both', { font: '20px monospace', fill: '#fff', align: 'center' });
        this.instructions.anchor.setTo(0.5, 0.5);
        this.instExpire = this.time.now + 6000;
        this.score = 0;
        this.scoreText = this.add.text(this.game.width / 2, 30, '' + this.score, { font: '20px monospace', fill: '#fff', align: 'center' } );
        this.scoreText.anchor.setTo(0.5, 0.5);
    },
    setupAudio: function () {
        this.explosionSFX = this.add.audio('explosion');
        this.playerExplosionSFX = this.add.audio('playerExplosion');
        this.enemyFireSFX = this.add.audio('enemyFire');
        this.playerFireSFX = this.add.audio('playerFire');
        this.powerUpSFX = this.add.audio('powerUp');
    },
    // update()- related functions
    checkCollisions: function () {
        this.physics.arcade.overlap(this.bulletPool, this.enemyPool, this.enemyHit, null, this);
        this.physics.arcade.overlap(this.bulletPool, this.shooterPool, this.enemyHit, null, this);
        this.physics.arcade.overlap(this.player, this.enemyPool, this.playerHit, null, this);
        this.physics.arcade.overlap(this.player, this.shooterPool, this.playerHit, null, this);
        this.physics.arcade.overlap(this.player, this.enemyBulletPool, this.playerHit, null, this);
        this.physics.arcade.overlap(this.player, this.powerUpPool, this.playerPowerUp, null, this);
        if (this.bossApproaching === false) {
            this.physics.arcade.overlap(this.bulletPool, this.bossPool, this.enemyHit, null, this);
            this.physics.arcade.overlap(this.player, this.bossPool, this.playerHit, null, this);
        }
    },
    spawnEnemies: function () {
        if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
            this.nextEnemyAt = this.time.now + this.enemyDelay;
            var enemy = this.enemyPool.getFirstExists(false);
            // spawn at a random location top of the screen
            enemy.reset(this.rnd.integerInRange(20, this.game.width - 20), 0, 2);
            // also randomize the speed
            enemy.body.velocity.y = this.rnd.integerInRange(30, 60);
            enemy.angle = 180;
            enemy.play('fly');
        }
        if (this.nextShooterAt < this.time.now && this.shooterPool.countDead() > 0) {
            this.nextShooterAt = this.time.now + this.shooterDelay;
            var shooter = this.shooterPool.getFirstExists(false);
            // spawn at a random location at the top  
            shooter.reset(
            this.rnd.integerInRange(20, this.game.width - 20), 0, 5 );
            // choose a random target location at the bottom
            var target = this.rnd.integerInRange(20, this.game.width - 20);
            // move to target and rotate the sprite accordingly  
            shooter.rotation = this.physics.arcade.moveToXY(
            shooter, target, this.game.height,
            this.rnd.integerInRange( 35, 80 )) - Math.PI / 2;

            shooter.play('fly');
            // each shooter has their own shot timer 
            shooter.nextShotAt = 0;
        }
    },
    enemyFire: function() {
        this.shooterPool.forEachAlive(function (enemy) {
            if (this.time.now > enemy.nextShotAt && this.enemyBulletPool.countDead() > 0) {
                var bullet = this.enemyBulletPool.getFirstExists(false);
                bullet.reset(enemy.x, enemy.y);
                this.physics.arcade.moveToObject(bullet, this.player, 150);
                enemy.nextShotAt = this.time.now + Phaser.Timer.SECOND * 2;
                //this.enemyFireSFX.play();
            }
        }, this);
        // Boss fire code
        if (this.bossApproaching === false && this.boss.alive && this.boss.nextShotAt < this.time.now && this.enemyBulletPool.countDead() >= 10)
        {
            this.boss.nextShotAt = this.time.now + Phaser.Timer.SECOND;
            //this.enemyFireSFX.play();
            for (var i = 0; i < 5; i++) {
                // process 2 bullets at a time
                var leftBullet = this.enemyBulletPool.getFirstExists(false);
                leftBullet.reset(this.boss.x - 10 - i * 10, this.boss.y + 20);
                var rightBullet = this.enemyBulletPool.getFirstExists(false);
                rightBullet.reset(this.boss.x + 10 + i * 10, this.boss.y + 20);
                if (this.boss.health > 200 / 2) {
                    // aim directly at the player
                    this.physics.arcade.moveToObject(leftBullet, this.player, 150);
                    this.physics.arcade.moveToObject(rightBullet, this.player, 150);
                } else {
                    // aim slightly off center of the player
                    this.physics.arcade.moveToXY(leftBullet, this.player.x - i * 100, this.player.y, 150 );
                    this.physics.arcade.moveToXY(rightBullet, this.player.x + i * 100, this.player.y, 150 );
                }
            }
        }
    },
    processPlayerInput: function () {
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        if (this.cursors.left.isDown || this.input.keyboard.isDown(Phaser.Keyboard.A)) {
            this.player.body.velocity.x = -this.player.speed;
        }else if (this.cursors.right.isDown || this.input.keyboard.isDown(Phaser.Keyboard.D)) {
            this.player.body.velocity.x = this.player.speed;
        }
        if (this.cursors.up.isDown || this.input.keyboard.isDown(Phaser.Keyboard.W)) {
            this.player.body.velocity.y = -this.player.speed;
        } else if (this.cursors.down.isDown || this.input.keyboard.isDown(Phaser.Keyboard.S)) {
            this.player.body.velocity.y = this.player.speed;
        }
        // Move the player in the direction they click
        /*if (this.input.activePointer.isDown && this.physics.arcade.distanceToPointer(this.player) > 15) {
            this.physics.arcade.moveToPointer(this.player, this.player.speed);
        }*/
        if (this.input.keyboard.isDown(Phaser.Keyboard.Z) || this.input.activePointer.isDown) {
            if (this.returnText && this.returnText.exists) {
                this.quitGame();
            } else {
                this.fire();
            }
        }
    },
    processDelayedEffects: function () {
        if (this.instructions.exists && this.time.now > this.instExpire) {
            this.instructions.destroy();
        }
        if (this.ghostUntil && this.ghostUntil < this.time.now) {
            this.ghostUntil = null;
            this.player.play('fly');
        }
        if (this.showReturn && this.time.now > this.showReturn) {
            this.returnText = this.add.text(this.game.width / 2, this.game.height / 2 + 20, 'Press Z or Tap Game to go back to Main Menu', { font: '16px sans-serif', fill: '#fff'});
            this.returnText.anchor.setTo(0.5, 0.5);
            this.showReturn = false;
        }
        if (this.bossApproaching && this.boss.y > 80) {
            this.bossApproaching = false;
            this.boss.nextShotAt = 0;
            this.boss.body.velocity.y = 0;
            this.boss.body.velocity.x = 200;
            // allow bouncing off world bounds
            this.boss.body.bounce.x = 1;
            this.boss.body.collideWorldBounds = true;
        }
    },
    enemyHit: function(bullet, enemy){
        bullet.kill();
        this.damageEnemy(enemy, 1);
    },
    playerHit: function(player, enemy){
        // check first if this.ghostUntil is not not undefined or null 
        if (this.ghostUntil && this.ghostUntil > this.time.now) {
            return;
        }
        //this.playerExplosionSFX.play();
        // crashing into an enemy only deals 5 damage
        this.damageEnemy(enemy, 5);
        this.explode(player);
        player.kill();
        var life = this.lives.getFirstAlive();
        if (life !== null) {
            life.kill();
            this.weaponLevel = 0;
            this.ghostUntil = this.time.now + Phaser.Timer.SECOND * 3;
            this.player.play('ghost');
        } else {
            this.explode(player);
            player.kill();
            this.displayEnd(false);
        }
    },
    damageEnemy: function (enemy, damage) {
        enemy.damage(damage);
        if (enemy.alive) {
            enemy.play('hit');
        } else {
            this.explode(enemy);
            //this.explosionSFX.play();
            this.spawnPowerUp(enemy);
            this.addToScore(enemy.reward);
            // We check the sprite key (e.g. 'greenEnemy') to see if the sprite is a boss
            // For full games, it would be better to set flags on the sprites themselves
            if (enemy.key === 'boss') {
                this.enemyPool.destroy();
                this.shooterPool.destroy();
                this.bossPool.destroy();
                this.enemyBulletPool.destroy();
                this.displayEnd(true);
            }
        }
    },
    addToScore: function (score) {
        this.score += score;
        this.scoreText.text = this.score;
        // this approach prevents the boss from spawning again upon winning
        if (this.score >= 20000 && this.bossPool.countDead() == 1) {
            this.spawnBoss();
        }
    },
    playerPowerUp: function (player, powerUp) {
        this.addToScore(powerUp.reward);
        powerUp.kill();
        //this.powerUpSFX.play();
        if (this.weaponLevel < 5) {
            this.weaponLevel++;
        }
    },
    displayEnd: function (win) {
        // you can't win and lose at the same time
        if (this.endText && this.endText.exists) {
            return;
        }
        
        var msg = win ? 'You Win! Greeaat Jooob!!!' : 'Game Over nub!';
        this.endText = this.add.text(this.game.width / 2, this.game.height / 2 - 60, msg, { font: '72px serif', fill: '#fff' } );
        this.endText.anchor.setTo(0.5, 0);

        this.showReturn = this.time.now + Phaser.Timer.SECOND * 2;
    },
    explode: function(sprite){
        if(this.explosionPool.countDead() === 0){
            return;
        }
        var explosion = this.explosionPool.getFirstExists(false);
        explosion.reset(sprite.x, sprite.y);
        explosion.play('boom', 15, false, true);
        // Add the original sprite's velocity to the explosion
        explosion.body.velocity.x = sprite.body.velocity.x;
        explosion.body.velocity.y = sprite.body.velocity.y;
    },
    spawnPowerUp: function (enemy) {
        if (this.powerUpPool.countDead() === 0 || this.weaponLevel === 5) { 
            return;
        }
        if (this.rnd.frac() < enemy.dropRate) {
            var powerUp = this.powerUpPool.getFirstExists(false);
            powerUp.reset(enemy.x, enemy.y);
            powerUp.body.velocity.y = 100;
        }
    },
    spawnBoss: function () {
        this.bossApproaching = true;
        this.boss.reset(this.game.width / 2, 0, 250);
        this.physics.enable(this.boss, Phaser.Physics.P2JS);
        this.boss.body.velocity.y = 15;
        this.boss.play('fly');
    },
    fire: function(){
        // Rate of fire
        if(!this.player.alive || this.nextShotAt > this.time.now){
            return;
        }
        // Rate of fire
        this.nextShotAt = this.time.now + this.shotDelay;
        //this.playerFireSFX.play();
        var bullet;
        if (this.weaponLevel === 0) {
            if (this.bulletPool.countDead() === 0) {
                return;
            }
            bullet = this.bulletPool.getFirstExists(false);
            bullet.reset(this.player.x, this.player.y - 25);
            bullet.body.velocity.y = -500;
        } else {
            if (this.bulletPool.countDead() < this.weaponLevel * 2) {
                return;
            }
            for (var i = 0; i < this.weaponLevel; i++) {
                bullet = this.bulletPool.getFirstExists(false);
                // spawn left bullet slightly left off center
                bullet.reset(this.player.x - (10 + i * 6), this.player.y - 20);
                // the left bullets spread from -95 degrees to -135 degrees
                this.physics.arcade.velocityFromAngle(-95 - i * 10, 500, bullet.body.velocity);

                bullet = this.bulletPool.getFirstExists(false);
                // spawn right bullet slightly right off center
                bullet.reset(this.player.x + (10 + i * 6), this.player.y - 20);
                // the right bullets spread from -85 degrees to -45
                this.physics.arcade.velocityFromAngle(-85 + i * 10, 500, bullet.body.velocity);
            }
        }
    },
    quitGame: function (pointer) {
        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
        this.sea.destroy();
        this.player.destroy();
        this.enemyPool.destroy();
        this.bulletPool.destroy();
        this.explosionPool.destroy();
        this.shooterPool.destroy();
        this.enemyBulletPool.destroy();
        this.powerUpPool.destroy();
        this.bossPool.destroy();
        this.instructions.destroy();
        this.scoreText.destroy();
        this.endText.destroy();
        this.returnText.destroy();
        //  Then let's go back to the main menu.
        this.state.start('MainMenu');
    },

  };
  module.exports = Game;

}).call(this);
