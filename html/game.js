var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update
});

function preload() {
    game.load.image('sky', 'assets/topwall.png');
    game.load.image('wall', 'assets/wall.png');
    game.load.spritesheet('dude2', 'assets/dude.png', 32, 48);
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
    player.maxPv = 350;
    //  Player physics properties. Give the little guy a slight bounce.



    //---------------------------------ENEMY part------------------------------//
    // The ennemy and its settings
    enemy = game.add.sprite(100, game.world.height - 150, 'dude2');

    //  We need to enable physics on the ennemy
    game.physics.enable(enemy, Phaser.Physics.ARCADE);
    enemy.body.collideWorldBounds = true;
    enemy.physicsBodyType = Phaser.Physics.ARCADE;
    enemy.enableBody = true;

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

function prepareAnimationPlayer() {

    //  Our two animations, walking left and right.
    player.animations.add('left', [4, 5, 6, 7], 10, true);
    player.animations.add('right', [8, 9, 10, 11], 10, true);
    player.animations.add('up', [12, 13, 14, 15], 10, true);
    player.animations.add('down', [0, 1, 2, 3], 10, true);
}

function pdvMin(player, enemy) {
    moveBlocked = true;

    logger("Max pv player " + player.maxPv);
    player.maxPv -= 20;
    logger("Max pv player " + player.maxPv);

    // Removes the star from the screen
    logger("player touch enemy and get Back");
    var getBack = 18;

    if (cursors.left.isDown) {
        //  Move to the left
        player.body.velocity.x = getBack;
        player.x += getBack;
    } else if (cursors.right.isDown) {
        //  Move to the right
        player.body.velocity.x = -getBack;
        player.x -= getBack;
    } else if (cursors.up.isDown) {
        //  Move to the right
        player.body.velocity.y = getBack;
        player.y += getBack;
    } else if (cursors.down.isDown) {
        //  Move to the right
        player.body.velocity.y = -getBack;
        player.y -= getBack;
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

function touch_att() {
    logger("touch");

}

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.overlap(player, enemy, pdvMin, null, this);
    game.physics.arcade.collide(player, walls);

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
        if (player.maxPv <= 0) {

            player.kill();
        }
        // if (sword.visible){
        //     sword.x = player.x;
        //     sword.y = player.y-10;
        // }
    }
}

function attq_button_pressed() {
    //TODO => timer le coup + collision
    if (spaceKey.isDown) {

        swordAtt();

        sword.visible = true;
        game.time.events.add(Phaser.Timer.SECOND * 0.7, fadeSword, this);
    }
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