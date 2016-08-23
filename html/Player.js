function CharacterInformation(name) {
	this.name = name;
	this.attq = 50;
	this.def = 30;
	this.maxLife = 100;
	this.life = this.maxLife;

	this.takeDamage = function(damage) {
		logger(this.name + " take Damage " + damage);
		this.life -= damage;
	}
}