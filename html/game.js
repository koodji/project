var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
	game.load.image('sky', 'assets/topwall.png');
    game.load.image('wall', 'assets/wall.png');
    game.load.spritesheet('dude2', 'assets/dude.png', 32, 48);
    game.load.spritesheet('dude', 'assets/52.png', 32, 48);

    game.load.audio('boden', ['assets/audio/music1.mp3']);
}

var walls;
var player;
var enemy;
var moveBlocked=false;
var music;

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
         var wall = walls.create(i*40, 0, 'wall');
        wall.scale.setTo(1,1);
        wall.body.immovable=true;
    }

    for (var i = 0; i <= 20; i++) {
         var wall = walls.create(i*40, game.world.height-40, 'wall');
        wall.scale.setTo(1,1);
        wall.body.immovable=true;
    }

    for (var i = 0; i <= 15; i++) {
         var wall = walls.create(0, i*40, 'wall');
        wall.scale.setTo(1,1);
        wall.body.immovable=true;
    }

    for (var i = 0; i <= 15; i++) {
         var wall = walls.create(game.world.width-40, i*40, 'wall');
        wall.scale.setTo(1,1);
        wall.body.immovable=true;
    }
   

    
    //---------------------------------PLAYER part------------------------------//
    // The player and its settings
    player = game.add.sprite(320, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;
    player.enableBody = true;
    player.maxPv=350;
    //  Player physics properties. Give the little guy a slight bounce.
   

    //  Our two animations, walking left and right.
    player.animations.add('left', [4, 5, 6, 7], 10, true);
    player.animations.add('right', [8, 9, 10, 11], 10, true);
    player.animations.add('up', [12, 13, 14, 15], 10, true);
    player.animations.add('down', [0, 1, 2, 3], 10, true);

//---------------------------------ENEMY part------------------------------//
    // The player and its settings
    enemy=game.add.sprite(100, game.world.height - 150, 'dude2');
   
    //  We need to enable physics on the player
    game.physics.enable(enemy, Phaser.Physics.ARCADE);
    enemy.body.collideWorldBounds = true;
    enemy.physicsBodyType = Phaser.Physics.ARCADE;
    enemy.enableBody = true;

    
}

function pdvMin (player, enemy) {
    moveBlocked=true;

    console.log("Max pv player "+player.maxPv);
    player.maxPv-=20;
    console.log("Max pv player "+player.maxPv);

    // Removes the star from the screen
    console.log("player touch enemy and get Back");
    var getBack = 18;

    if (cursors.left.isDown)
    {
        //  Move to the left
         player.body.velocity.x = getBack;
        player.x += getBack;
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
         player.body.velocity.x = -getBack;
        player.x -= getBack;
    }
    else if (cursors.up.isDown)
    {
        //  Move to the right
         player.body.velocity.y = getBack;
        player.y += getBack;
    }
    else if (cursors.down.isDown)
    {
        //  Move to the right
        player.body.velocity.y = -getBack;
        player.y -= getBack;
    }

     player.animations.stop();
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    //add timer when stun by hit
    game.time.events.add(Phaser.Timer.SECOND * 1, delockMove, this)
}

function dashTo(direction){
    console.log("dash" + cursors.up.shiftKey);
    if (cursors.up.shiftKey)
    {
        switch(direction){
            case 'up':
                console.log("dash up");
                player.body.velocity.y = -2;
                player.y -= 20;
                break;
            case 'down':
                console.log("dash down");
                player.body.velocity.y = 2;
                player.y += 20;
                break;
            case 'left':
                console.log("dash left");
                player.body.velocity.x = -2;
                player.x -= 20;
                break;
            case 'right':
                console.log("dash right");
                player.body.velocity.x = 2;
                player.x += 20;
                break;
        }
    }
}

function delockMove(){
    console.log("delockMove");
    moveBlocked=false;
}

function update() {
	//  Collide the player and the stars with the platforms
    game.physics.arcade.overlap(player, enemy, pdvMin, null, this);
    game.physics.arcade.collide(player, walls);
   
    
    //---------------------------------------CONTROL PART--------------------------------------//
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
	cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
    if (!moveBlocked){
        if (cursors.left.isDown)
        {
            //  Move to the left
            player.body.velocity.x = -2;
            player.x -= 2;

            player.animations.play('left');
            dashTo("left");
        }
        else if (cursors.right.isDown)
        {
            //  Move to the right
            player.body.velocity.x = 2;
            player.x += 2;

            player.animations.play('right');
            dashTo("rigth");
        }
        else if (cursors.up.isDown)
        {
            //  Move to the right
            player.body.velocity.y = -2;
            player.y -= 2;

            player.animations.play('up');
            dashTo("up");

        }
        else if (cursors.down.isDown)
        {
            //  Move to the right
            player.body.velocity.y = 2;
            player.y += 2;

            player.animations.play('down');
            dashTo("down");
        }
        else
        {
            //  Stand still
            player.animations.stop();
            player.body.velocity.y = 0;
            player.body.velocity.x = 0;
            player.frame = 4;
        }
       

        if ( player.maxPv<=0) {

           player.kill();
        }
    }
}