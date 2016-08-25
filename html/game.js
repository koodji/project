var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

function preload() {
    game.load.image('sky', 'assets/topwall.png');
    game.load.image('wall', 'assets/wall.png');
    game.load.spritesheet('dude2', 'assets/enemy.png', 32, 48);
    game.load.image('sword', 'assets/sword_test.png');
    game.load.spritesheet('dude', 'assets/52.png', 32, 48);
    game.load.audio('boden', ['assets/audio/music1.mp3']);
}

var walls;
var player;
var enemy;
var moveBlocked = false;
var music;
var player_dir;
var sword;
var attaque_anim = "NA";
var debug = true;
var spaceKey;
var characterTint;

function create() {

    music = game.add.audio('boden');

    //decomment line for music
    //music.play();

    //  We're going to be using physics, so enable the Arcade Physics system / physics mise en place
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');
    //  The platforms group contains the ground and the 2 ledges we can jump on
    walls = game.add.group();

    //  We will enable physics for any object that is created in this group
    walls.enableBody = true;

    // Top wall
    for (var i = 0; i <= 20; i++) {
        var wall = walls.create(i * 40, 0, 'wall');
        wall.scale.setTo(1, 1);
        wall.body.immovable = true;
    }

    for (var i = 0; i <= 20; i++) {
        var wall = walls.create(i * 40, game.world.height - 40, 'wall');
        wall.scale.setTo(1, 1);
        wall.body.immovable = true;
    }

    for (var i = 0; i <= 15; i++) {
        var wall = walls.create(0, i * 40, 'wall');
        wall.scale.setTo(1, 1);
        wall.body.immovable = true;
    }

    for (var i = 0; i <= 15; i++) {
        var wall = walls.create(game.world.width - 40, i * 40, 'wall');
        wall.scale.setTo(1, 1);
        wall.body.immovable = true;
    }



    //---------------------------------PLAYER part------------------------------//
    // The player and its settings
    player = game.add.sprite(320, game.world.height - 150, 'dude');

    prepareAnimationPlayer();
    //  We need to enable physics on the player
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;
    player.enableBody = true;
    player.info = new CharacterInformation("p1");
    //  Player physics properties. Give the little guy a slight bounce.



    //---------------------------------ENEMY part------------------------------//
    // The ennemy and its settings
    enemy = game.add.sprite(100, game.world.height - 150, 'dude2');
    prepareAnimationEnemy();
    //  We need to enable physics on the ennemy
    game.physics.enable(enemy, Phaser.Physics.ARCADE);
    enemy.body.collideWorldBounds = true;
    enemy.physicsBodyType = Phaser.Physics.ARCADE;
    enemy.enableBody = true;
    enemy.info = new CharacterInformation("e1");

    //---------------------------------SWORD part------------------------------//
    sword = game.add.sprite(player.x, player.y, 'sword');

    //  We need to enable physics on the ennemy
    game.physics.enable(sword, Phaser.Physics.ARCADE);
    sword.body.collideWorldBounds = true;
    sword.physicsBodyType = Phaser.Physics.ARCADE;
    sword.enableBody = true;
    sword.visible = false;

    cursors = game.input.keyboard.createCursorKeys();

    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

}

function prepareAnimationEnemy() {

    //  Our two animations, walking left and right.
    enemy.animations.add('left', [4, 5, 6, 7], 10, true);
    enemy.animations.add('right', [8, 9, 10, 11], 10, true);
    enemy.animations.add('up', [12, 13, 14, 15], 10, true);
    enemy.animations.add('down', [0, 1, 2, 3], 10, true);
}

function prepareAnimationPlayer() {

    //  Our two animations, walking left and right.
    player.animations.add('left', [4, 5, 6, 7], 10, true);
    player.animations.add('right', [8, 9, 10, 11], 10, true);
    player.animations.add('up', [12, 13, 14, 15], 10, true);
    player.animations.add('down', [0, 1, 2, 3], 10, true);
}

function pdvMin(player) {
    moveBlocked = true;

    logger("Max pv player " + player.info.life + "/" + player.info.maxPv);
    player.info.takeDamage(enemy.info.attq);
    logger("Max pv player " + player.info.life + "/" + player.info.maxPv);

    // Removes the star from the screen
    logger("player touch enemy and get Back");
    var getBack = 18;
    switch (player_dir) {
        case 'up':
            //  Move to the right
            player.body.velocity.y = getBack;
            player.y += getBack;
            break;
        case 'down':
            //  Move to the right
            player.body.velocity.y = -getBack;
            player.y -= getBack;
            break;
        case 'left':
            //  Move to the left
            player.body.velocity.x = getBack;
            player.x += getBack;
            break;
        case 'right':
            //  Move to the right
            player.body.velocity.x = -getBack;
            player.x -= getBack;
            break;
    }

    player.animations.stop();
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    //add timer when stun by hit
    game.time.events.add(Phaser.Timer.SECOND * 1, delockMove, this);
}

function dashTo(direction) {
    var valueDash = 10;
    logger("dash" + cursors.up.shiftKey);
    if (cursors.up.shiftKey) {
        switch (direction) {
            case 'up':
                logger("dash up");
                player.body.velocity.y = -2;
                player.y -= valueDash;
                break;
            case 'down':
                logger("dash down");
                player.body.velocity.y = 2;
                player.y += valueDash;
                break;
            case 'left':
                logger("dash left");
                player.body.velocity.x = -2;
                player.x -= valueDash;
                break;
            case 'right':
                logger("dash right");
                player.body.velocity.x = 2;
                player.x += valueDash;
                break;
        }
    }
}

function delockMove() {
    logger("delockMove");
    moveBlocked = false;
}



function update() {

    //----------------------------------ennemy follow--------------------------//
    var distance = Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2));
    if (distance > 50) {
        if (Math.random()>0.5) {
            if (enemy.x < player.x) {
                enemy.body.velocity.x = 2;
                enemy.x += 2;
                enemy.animations.play("right");
            } else {
                enemy.body.velocity.x = -2;
                enemy.x -= 2;
                enemy.animations.play("left");
            }
        } else {
            if (enemy.y > player.y) {
                enemy.body.velocity.y = -2;
                enemy.y -= 2;
                enemy.animations.play("up");
            } else  {
                enemy.body.velocity.y = +2;
                enemy.y += 2;
                enemy.animations.play("down");
            }
        }
    } else {
        enemy.animations.stop();
        enemy.body.velocity.x = 0;
    }
    //logger(distance);
    // if (distance > 50) {
    //     game.physics.arcade.moveToObject(enemy, player, 100);
    //     //game.add.tween(enemy).to({x:player.x,y:player.y},2000,Phaser.Easing.Quadratic.InOut, true);
    // }
    // else {
    //     game.physics.arcade.moveToObject(enemy, player, 0);
    // }


    //  Collide the player and the stars with the platforms
    game.physics.arcade.overlap(player, enemy, pdvMin, null, this);
    game.physics.arcade.collide(player, walls);
    game.physics.arcade.collide(enemy, walls);

    //---------------------------------------update coord foratt anime--------------------------------------//

    attaque_anim.x = player.x - 20;
    attaque_anim.y = player.y;
    //---------------------------------------CONTROL PART--------------------------------------//
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    attq_button_pressed();
    if (!moveBlocked) {
        if (cursors.left.isDown) {
            //  Move to the left
            player.body.velocity.x = -2;
            player.x -= 2;

            player.animations.play('left');
            dashTo("left");
            player_dir = "left";
            attq_button_pressed();
        } else if (cursors.right.isDown) {
            //  Move to the right
            player.body.velocity.x = 2;
            player.x += 2;

            player.animations.play('right');
            dashTo("right");
            player_dir = "right";
            attq_button_pressed();
        } else if (cursors.up.isDown) {
            //  Move to the right
            player.body.velocity.y = -2;
            player.y -= 2;

            player.animations.play('up');
            dashTo("up");
            player_dir = "up";
            attq_button_pressed();
        } else if (cursors.down.isDown) {
            //  Move to the right
            player.body.velocity.y = 2;
            player.y += 2;

            player.animations.play('down');
            dashTo("down");
            player_dir = "down";
            attq_button_pressed();
        } else {
            //  Stand still
            player.animations.stop();
            player.body.velocity.y = 0;
            player.body.velocity.x = 0;
            player.frame = 4;
        }

        if (sword.visible) {
            swordAtt();
        }
    }
    if (player.info.life <= 0) {

        player.kill();
    }
    if (enemy.info.life <= 0) {

        enemy.kill();
    }
}

function attq_button_pressed() {
    //TODO => timer le coup + collision
    if (spaceKey.isDown) {

        swordAtt();

        sword.visible = true;
        game.physics.arcade.overlap(sword, enemy, touch_att, null, this);
        game.time.events.add(Phaser.Timer.SECOND * 0.5, fadeSword, this);
    }
}

function touch_att() {
    logger("Sword touch ennemy");
    pdvMin(enemy);
    changeTintWhenTouch(enemy);
}

function changeTintWhenTouch(character) {
    characterTint = character;
    characterTint.tint = '0xff0000';
    game.time.events.add(Phaser.Timer.SECOND * 0.3, resetTint, this);
}

function resetTint(character) {
    characterTint.tint = '0xFFFFFF';
}

function swordAtt() {
    if (player_dir === "up") {
        sword.angle = 0;
        sword.x = player.x;
        sword.y = player.y - 10;
    } else if (player_dir === "down") {
        sword.x = player.x + 20;
        sword.y = player.y + 70;
        sword.angle = 180;
    } else if (player_dir === "left") {
        sword.x = player.x - 20;
        sword.y = player.y + 35;
        sword.angle = -90;
    } else if (player_dir === "right") {
        sword.x = player.x + 55;
        sword.y = player.y + 20;
        sword.angle = 90;
    }
}

function fadeSword() {
    sword.visible = false;
}

function logger(text) {
    if (debug) {
        console.log(text);
    }
}

function render() {

    game.debug.text("pdv " + player.info.name + " : " + player.info.life, 32, 32);
    game.debug.text("pdv " + enemy.info.name + " : " + enemy.info.life, 32, 52);

}