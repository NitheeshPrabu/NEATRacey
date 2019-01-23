class Player {

	//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	//constructor
	constructor() {
		this.pos = createVector(gameParams.pxm * gameParams.tileSize + gameParams.xoff, gameParams.pym * gameParams.tileSize + gameParams.yoff);
		this.vel = createVector(0, 0);
		this.size = gameParams.tileSize / 2.0;
		this.playerSpeed = gameParams.tileSize / 15.0;
		this.dead = false;
		this.reachedGoal = false;
		this.fadeCounter = 255;
		this.isBest = false;
		this.deathByDot = false;
		this.deathAtStep = 0;
		this.moveCount = 0;
		this.gen = 1;
		this.fitness = 0;
		this.shortGoals = [];
		this.fading = false;
		this.human = false;

		if (gameParams.hasCoin)
			this.coin = new Coin(gameParams.cxm * gameParams.tileSize + gameParams.xoff, gameParams.cym * gameParams.tileSize + gameParams.yoff);

		this.genomeInputs = gameParams.dots.length + gameParams.solids.length;
		this.genomeOutputs = 2;
		this.brain = new Genome(gameParams.numberOfSteps, this.genomeInputs, this.genomeOutputs, false);
		this.vision = [];
		this.decision = [];

		this.setLevelShortGoals();
	}

	setLevelShortGoals() {
		this.shortGoals[0] = new ShortGoal(gameParams.tiles[6][7], true, false);
		this.shortGoals[1] = new ShortGoal(gameParams.tiles[17][2], true, false);
		this.shortGoals[0].setDistanceToFinish(this.shortGoals[1]);
	}

	show() {
		fill(255, 0, 0, this.fadeCounter);
		if (this.isBest && !gameParams.showBest) {
			fill(0, 255, 0, this.fadeCounter);
		}
		stroke(0, 0, 0, this.fadeCounter);
		strokeWeight(4);
		rect(this.pos.x, this.pos.y, this.size, this.size);
		stroke(0);
		if (gameParams.hasCoin)
			this.coin.show();
	}

	move() {
		if (!gameParams.humanPlaying) {
			if (this.moveCount == 0) { //move in the direction for 6 frames
				if (this.brain.directions.length > this.brain.step) { //if there are still directions left then set the velocity as the next PVector in the direcitons array
					this.vel = this.brain.directions[this.brain.step];
					this.brain.step++;
				} else { //if at the end of the directions array then the player is dead
					this.dead = true;
					this.fading = true;
				}
				this.moveCount = 6;
			} else {
				this.moveCount--;
			}
		}
		var temp = createVector(this.vel.x, this.vel.y);
		temp.normalize();
		temp.mult(this.playerSpeed);
		for (var i = 0; i < gameParams.solids.length; i++) {
			temp = gameParams.solids[i].restrictMovement(this.pos, createVector(this.pos.x + this.size, this.pos.y + this.size), temp);
		}
		this.pos.add(temp);
	}

	//checks if the player
	checkCollisions() {
		if (gameParams.hasCoin)
			this.coin.collides(this.pos, createVector(this.pos.x + this.size, this.pos.y + this.size));
		for (var i = 0; i < gameParams.dots.length; i++) {
			if (gameParams.dots[i].collides(this.pos, createVector(this.pos.x + this.size, this.pos.y + this.size))) {
				this.fading = true;
				this.dead = true;
				this.deathByDot = true;
				this.deathAtStep = this.brain.step;
			}
		}
		if (gameParams.winArea.collision(this.pos, createVector(this.pos.x + this.size, this.pos.y + this.size))) {
			if (gameParams.hasCoin && this.coin.taken || !gameParams.hasCoin)
				this.reachedGoal = true;
		}
		for (var i = 0; i < this.shortGoals.length; i++) {
			this.shortGoals[i].collision(this.pos, createVector(this.pos.x + this.size, this.pos.y + this.size));
		}
	}

	//----------------------------------------------------------------------------------------------------------------------------------------------------------
	update() {
		if (!this.dead && !this.reachedGoal) {
			this.move();
			this.checkCollisions();
		} else if (this.fading) {
			if (this.fadeCounter > 0) {
				if (gameParams.humanPlaying || gameParams.replayGens) {
					this.fadeCounter -= 10;
				} else {
					this.fadeCounter = 0;

				}
			}
		}
	}

	//----------------------------------------------------------------------------------------------------------------------------------------------------------
	calculateFitness() {
		if (this.reachedGoal) { //if the dot reached the goal then the fitness is based on the amount of steps it took to get there
			this.fitness = 1.0 / 16.0 + 10000.0 / (this.brain.step * this.brain.step);
		} else { //if the dot didn't reach the goal then the fitness is based on how close it is to the goal
			var estimatedDistance = 0.0; //the estimated distance of the path from the player to the goal
			for (var i = this.shortGoals.length - 1; i >= 0; i--) {
				if (!this.shortGoals[i].reached) {
					estimatedDistance = this.shortGoals[i].distToFinish;
					estimatedDistance += distanceMetrics.getDistance(this.pos.x, this.pos.y, this.shortGoals[i].pos.x, this.shortGoals[i].pos.y, gameParams.distanceParam);
				}
			}
			if (this.deathByDot) {
				estimatedDistance *= 0.9;
			}
			this.fitness = 1.0 / (estimatedDistance * estimatedDistance);
		}
		// console.log(estimatedDistance);
		this.fitness *= this.fitness;
		if (gameParams.hasCoin && this.coin.taken) {
			this.fitness *= 1.2;
		}
	}

	//----------------------------------------------------------------------------------------------------------------------------------------------------------
	getChild() {
		var child = new Player();
		child.brain = this.brain.clone(); //babies have the same brain as their parents
		child.deathByDot = this.deathByDot;
		child.deathAtStep = this.deathAtStep;
		child.gen = this.gen;
		return child;
	}

	look() {
		// console.log("Player " + this + " is looking");
		if (this.brain.directions.length >= gameParams.numberOfSteps) {
			this.vision = new Array(this.genomeInputs);
			for (var i = 0; i < gameParams.dots.length; i++) {
				this.vision[i] = gameParams.dots[i].getDistance(this.pos, createVector(this.pos.x + this.size, this.pos.y + this.size));
			}
			var temp = createVector(this.vel.x, this.vel.y);
			temp.normalize();
			temp.mult(this.playerSpeed);
			for (var i = gameParams.dots.length; i < gameParams.dots.length + gameParams.solids.length; i++) {
				this.vision[i] = gameParams.solids[i - gameParams.dots.length].getDistance(this.pos, createVector(this.pos.x + this.size, this.pos.y + this.size), temp);
			}
		}
	}

	think() {
		// console.log("Player " + this + " is thinking");
		//get the output of the neural network
		this.decision = this.brain.feedForward(this.vision);
		//0 - up, 1 - left
		// console.log(this.vision,this.decision)
		if (this.brain.directions.length > gameParams.numberOfSteps) {
			// this.dead = true;
			// this.deathAtStep = this.brain.step;
			return;
		}
		var velVec;
		if (this.decision[0] == 1) {
			velVec = createVector(0,-1);
			this.brain.directions.push(velVec);
		} else {
			velVec = createVector(0,1);
			this.brain.directions.push(velVec);
		}
		if (this.decision[1] == 1) {
			velVec = createVector(-1,0);
			this.brain.directions.push(velVec);
		} else {
			velVec = createVector(1,0);
			this.brain.directions.push(velVec);
		}
	}
}