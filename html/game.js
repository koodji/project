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
var enemies;
var music;
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
    prepareAnimationEnemy(enemy);
    //  We need to enable physics on the ennemy
    game.physics.enable(enemy, Phaser.Physics.ARCADE);
    enemy.body.collideWorldBounds = true;
    enemy.physicsBodyType = Phaser.Physics.ARCADE;
    enemy.enableBody = true;
    enemy.info = new CharacterInformation("e1");

    enemies = game.add.physicsGroup();
    for (var i = 0; i <= 3; i++) {
        var e = enemies.create(game.rnd.between(100, 770), game.rnd.between(0, 570), 'dude2', game.rnd.between(0, 35));
        e.info = new CharacterInformation("ia" + i);
        prepareAnimationEnemy(e);
    }

    enemies.forEach(function(iaGuy) {
        logger(iaGuy.info.name);
    });

    //---------------------------------SWORD part------------------------------//
    createSword(player);
    createSword(enemy);

    enemy.info.sword.x = 55;
    player.info.sword.x = 10;


    cursors = game.input.keyboard.createCursorKeys();

    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

}

function createSword(character) {
    character.info.sword = game.add.sprite(character.x, character.y, 'sword');

    //  We need to enable physics on the ennemy
    game.physics.enable(character.info.sword, Phaser.Physics.ARCADE);
    character.info.sword.body.collideWorldBounds = true;
    character.info.sword.physicsBodyType = Phaser.Physics.ARCADE;
    character.info.sword.enableBody = true;
    character.info.sword.visible = false;
}

function prepareAnimationEnemy(characterEn) {

    //  Our two animations, walking left and right.
    characterEn.animations.add('left', [4, 5, 6, 7], 10, true);
    characterEn.animations.add('right', [8, 9, 10, 11], 10, true);
    characterEn.animations.add('up', [12, 13, 14, 15], 10, true);
    characterEn.animations.add('down', [0, 1, 2, 3], 10, true);
}

function prepareAnimationPlayer() {

    //  Our two animations, walking left and right.
    player.animations.add('left', [4, 5, 6, 7], 10, true);
    player.animations.add('right', [8, 9, 10, 11], 10, true);
    player.animations.add('up', [12, 13, 14, 15], 10, true);
    player.animations.add('down', [0, 1, 2, 3], 10, true);
}

function pdvMin(player) {
    player.info.moveBlocked = true;
    logger("Name of player wich is touch " + player.info.name);
    logger("Max pv player " + player.info.life + "/" + player.info.maxPv);
    player.info.takeDamage(enemy.info.attq);
    logger("Max pv player " + player.info.life + "/" + player.info.maxPv);

    // Removes the star from the screen
    logger("player touch enemy and get Back");
    var getBack = 18;
    switch (player.info.player_dir) {
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
    game.time.events.add(Phaser.Timer.SECOND * 1, function() {
        logger("delockMove");
        player.info.moveBlocked = false;
    }, this);
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

function update() {

    game.physics.arcade.collide(player, enemies);
    game.physics.arcade.collide(enemy, enemies);
    game.physics.arcade.collide(enemies);

    //  Collide the player and the stars with the platforms
    game.physics.arcade.overlap(player, enemies, pdvMin, null, this);
    game.physics.arcade.collide(player, walls);
    game.physics.arcade.collide(enemy, walls);

    enemies.forEach(function(iaGuy) {
        artificialIntelligence(iaGuy);
    });



    //---------------------------------------update coord foratt anime--------------------------------------//

    attaque_anim.x = player.x - 20;
    attaque_anim.y = player.y;
    //---------------------------------------CONTROL PART--------------------------------------//
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    attq_button_pressed();
    if (!player.info.moveBlocked) {
        if (cursors.left.isDown) {
            //  Move to the left
            player.body.velocity.x = -2;
            player.x -= 2;

            player.animations.play('left');
            dashTo("left");
            player.info.player_dir = "left";
            attq_button_pressed();
        } else if (cursors.right.isDown) {
            //  Move to the right
            player.body.velocity.x = 2;
            player.x += 2;

            player.animations.play('right');
            dashTo("right");
            player.info.player_dir = "right";
            attq_button_pressed();
        } else if (cursors.up.isDown) {
            //  Move to the right
            player.body.velocity.y = -2;
            player.y -= 2;

            player.animations.play('up');
            dashTo("up");
            player.info.player_dir = "up";
            attq_button_pressed();
        } else if (cursors.down.isDown) {
            //  Move to the right
            player.body.velocity.y = 2;
            player.y += 2;

            player.animations.play('down');
            dashTo("down");
            player.info.player_dir = "down";
            attq_button_pressed();
        } else {
            //  Stand still
            player.animations.stop();
            player.body.velocity.y = 0;
            player.body.velocity.x = 0;
            //player.frame = 4;
            player.animations.play(player.info.player_dir);
        }

        if (player.info.sword.visible) {
            swordAtt(player);
        }
        if (enemy.info.sword.visible) {
            swordAtt(enemy);
        }
    }
    if (player.info.life <= 0) {

        player.kill();
    }
    if (enemy.info.life <= 0) {

        enemy.kill();
    }
}

function artificialIntelligence(character) {

    //----------------------------------ennemy follow--------------------------//
    var distance = Math.sqrt(Math.pow(character.x - player.x, 2) + Math.pow(character.y - player.y, 2));
    var speed = 1;
    if (distance > 50 && !character.info.moveBlocked) {
        if (Math.abs(character.x - player.x) > Math.abs(character.y - player.y) + 10) {
            character.body.velocity.y = 0;
            if (character.x < player.x) {
                character.info.player_dir = "right";
                character.body.velocity.x = speed;
                character.x += speed;
                character.animations.play("right");
            } else {
                character.info.player_dir = "left";
                character.body.velocity.x = -speed;
                character.x -= speed;
                character.animations.play("left");
            }
        } else {

            character.body.velocity.x = 0;
            if (character.y > player.y) {
                character.info.player_dir = "up";
                character.body.velocity.y = -speed;
                character.y -= speed;
                character.animations.play("up");
            } else {
                character.info.player_dir = "down";
                character.body.velocity.y = +speed;
                character.y += speed;
                character.animations.play("down");
            }
        }
    } else {
        character.animations.stop();
        character.body.velocity.x = 0;
        character.body.velocity.y = 0;
        character.animations.play(character.info.player_dir);
    }
}

function attq_button_pressed() {
    if (spaceKey.isDown && player.info.canAttack) {
        //ia_attack(enemy);
        swordAtt(player);

        game.physics.arcade.overlap(player.info.sword, enemy, function() {
            touch_att(enemy);
        }, null, this);
        game.time.events.add(Phaser.Timer.SECOND * 0.5, fadeSword, this, player);
        game.time.events.add(Phaser.Timer.SECOND * 0.5, attackAgain, this, player);
    }
}

function ia_attack(iaGuy) {
    if (iaGuy.info.canAttack) {
        swordAtt(iaGuy);
        game.physics.arcade.overlap(iaGuy.info.sword, player, function() {
            touch_att(player);
        }, null, this);
        game.time.events.add(Phaser.Timer.SECOND * 0.5, fadeSword, this, iaGuy);
        game.time.events.add(Phaser.Timer.SECOND * 0.5, attackAgain, this, iaGuy);
    }
}

function attackAgain(character) {
    character.info.canAttack = true;
}

function touch_att(characterHit) {
    logger("Sword touch ennemy " + characterHit.info.name);
    pdvMin(characterHit);
    var text = game.add.text(characterHit.x, characterHit.y, characterHit.info.attq, {
        font: "10pt Courier",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2
    });
    game.time.events.add(Phaser.Timer.SECOND * 0.5, fadeText, this, text);
    changeTintWhenTouch(characterHit);
}

function fadeText(text) {
    text.visible = false;

}

function changeTintWhenTouch(character) {
    characterTint = character;
    characterTint.tint = '0xff0000';
    game.time.events.add(Phaser.Timer.SECOND * 0.3, resetTint, this);
}

function resetTint(character) {
    characterTint.tint = '0xFFFFFF';
}

function swordAtt(attackPlayer) {
    if (attackPlayer.info.player_dir === "up") {
        attackPlayer.info.sword.angle = 0;
        attackPlayer.info.sword.x = attackPlayer.x;
        attackPlayer.info.sword.y = attackPlayer.y - 10;
    } else if (attackPlayer.info.player_dir === "down") {
        attackPlayer.info.sword.x = attackPlayer.x + 20;
        attackPlayer.info.sword.y = attackPlayer.y + 70;
        attackPlayer.info.sword.angle = 180;
    } else if (attackPlayer.info.player_dir === "left") {
        attackPlayer.info.sword.x = attackPlayer.x - 20;
        attackPlayer.info.sword.y = attackPlayer.y + 35;
        attackPlayer.info.sword.angle = -90;
    } else if (attackPlayer.info.player_dir === "right") {
        attackPlayer.info.sword.x = attackPlayer.x + 55;
        attackPlayer.info.sword.y = attackPlayer.y + 20;
        attackPlayer.info.sword.angle = 90;
    }
    attackPlayer.info.sword.visible = true;
}

function fadeSword(character) {
    logger("fadeSword charname = " + character.info.name);
    character.info.sword.visible = false;
}

function logger(text) {
    if (debug) {
        console.log(text);
    }
}

function render() {

    game.debug.text("pdv " + player.info.name + " : " + player.info.life + " - dir " + player.info.player_dir, 32, 32);
    game.debug.text("pdv " + enemy.info.name + " : " + enemy.info.life + " - dir " + enemy.info.player_dir, 32, 52);
    game.debug.text("move " + player.info.moveBlocked);
    //game.debug.text("x / y " + enemy.x + " : " + enemy.y, 32, 92);

}