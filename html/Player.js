function CharacterInformation(name) {
	this.name = name;
	this.attq = 50;
	this.def = 30;
	this.maxLife = 500;
	this.life = this.maxLife;
	this.player_dir = 'NA';
	this.moveBlocked = false;
	this.sword;

	this.takeDamage = function(damage) {
		logger(this.name + " take Damage " + damage + " game = " + game);
		this.life -= damage;
	}

	this.changeDir = function(direction) {
		this.player_dir = direction;
	}
}