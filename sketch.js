var gameParams = new GameParams();
var distanceMetrics = new DistanceMetrics();

var popPara;
var mrPara;
var speedPara;
var movesPara;
var everyPara;
var movesPara;

function setup() {
	var canvas = createCanvas(1440, 810);
	drawSimDetails();
	for (var i = 0; i < 22; i++) {
		gameParams.tiles[i] = [];
		for (var j = 0; j < 10; j++) {
			gameParams.tiles[i][j] = new Tile(i, j);
		}
	}

	//load level objects
	setLevelWalls();
	setLevelGoal();
	setLevelSafeArea();
	setLevelEdges();
	setLevelSolids();
	setLevelDots();

	gameParams.p = new Player();
	gameParams.testPopulation = new Population(gameParams.populationSize);

	//prevents the window from moving from the arrow keys or the spacebar
	window.addEventListener("keydown", function (e) {
		// space and arrow keys
		if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
			e.preventDefault();
		}
	}, false);
}

function draw() {
	gameParams.showedCoin = false;

	background(180, 181, 254);
	drawTiles();
	drawGameDetails();

	if (gameParams.humanPlaying) { //if the user is controlling the square
		if ((gameParams.p.dead && gameParams.p.fadeCounter <= 0) || gameParams.p.reachedGoal) {
			//reset player and dots
			if (gameParams.p.reachedGoal) {
				gameParams.winCounter = 100;
			}
			gameParams.p = new Player();
			gameParams.p.human = true;
			resetDots();
		} else {
			//update the dots and the players and show them to the screen
			moveAndShowDots();
			gameParams.p.update();
			gameParams.p.show();
		}
	} else {
		if (gameParams.replayGens) { //if replaying the best generations
			if ((gameParams.genPlayer.dead && gameParams.genPlayer.fadeCounter <= 0) || gameParams.genPlayer.reachedGoal) { //if the current gen is done
				gameParams.upToGenPos++; //next gen
				if (gameParams.testPopulation.genPlayers.length <= gameParams.upToGenPos) { //if reached the final gen
					//stop replaying gens
					gameParams.upToGenPos = 0;
					gameParams.replayGens = false;

					//return the dots to their saved position
					loadDots();
				} else { //if there are more generations to show
					//set gen player as the best player of that generation
					gameParams.genPlayer = gameParams.testPopulation.genPlayers[gameParams.upToGenPos].getChild();

					//reset the dots positions
					resetDots();
				}
			} else {//if not done
				//move and show dots
				moveAndShowDots();
				//move and update player
				gameParams.genPlayer.update();
				gameParams.genPlayer.show();
			}
		} else { //if training normaly
			if (gameParams.testPopulation.allPlayersDead()) {
				//genetic algorithm
				gameParams.testPopulation.calculateFitness();
				gameParams.testPopulation.naturalSelection();
				gameParams.testPopulation.mutateOffspring();

				//reset dots
				resetDots();

				//every 5 generations incease the number of moves by 5
				if (gameParams.testPopulation.gen % gameParams.increaseEvery == 0) {
					gameParams.testPopulation.increaseMoves();
				}
			} else {
				//update and show population
				for (var j = 0; j < gameParams.evolutionSpeed; j++) {
					for (var i = 0; i < gameParams.dots.length; i++) {
						gameParams.dots[i].move();
					}
					gameParams.testPopulation.update();
				}
				for (var i = 0; i < gameParams.dots.length; i++) {
					gameParams.dots[i].show();
				}
				gameParams.testPopulation.show();
			}
		}
	}
	if (!gameParams.humanPlaying)
		drawBrain();
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function drawBrain() { //show the brain of whatever genome is currently showing
	var startX = 950;
	var startY = 10;
	var w = 600;
	var h = 200;
	gameParams.testPopulation.players[0].brain.drawGenome(startX, startY, w, h);
}

function moveAndShowDots() {
	for (var i = 0; i < gameParams.dots.length; i++) {
		gameParams.dots[i].move();
		gameParams.dots[i].show();
	}

}

function resetDots() {
	for (var i = 0; i < gameParams.dots.length; i++) {
		gameParams.dots[i].resetDot();
	}

}

function drawTiles() {
	for (var i = 0; i < gameParams.tiles.length; i++) {
		for (var j = 0; j < gameParams.tiles[0].length; j++) {
			gameParams.tiles[i][j].show();
		}
	}
	for (var i = 0; i < gameParams.tiles.length; i++) {
		for (var j = 0; j < gameParams.tiles[0].length; j++) {
			gameParams.tiles[i][j].showEdges();
		}
	}
}

function loadDots() {
	for (var i = 0; i < gameParams.dots.length; i++) {
		gameParams.dots[i] = gameParams.savedDots[i].clone();
	}
}

function saveDots() {
	for (var i = 0; i < gameParams.dots.length; i++) {
		gameParams.savedDots[i] = gameParams.dots[i].clone();
	}
}

function drawGameDetails() {
	fill(247, 247, 255);
	textSize(20);
	noStroke();
	if (!gameParams.humanPlaying) {
		text("\tPress P to play the game yourself \t\t\t\t\t\t\t\t Press G to replay evolution highlights", 600, 580);
		text("Press SPACE to only show the best player", 600, 620);
	}
	textSize(36);
	if (gameParams.winCounter > 0) {

		textSize(100);
		stroke(0);

		text("You won!", 110, 400);
		gameParams.winCounter--;
		textSize(36);
		noStroke();
	}
	if (gameParams.replayGens) {
		text("Generation: " + gameParams.genPlayer.gen, 200, 90);
		text("Number of moves: " + gameParams.genPlayer.brain.directions.length, 700, 90);
	} else if (!gameParams.humanPlaying) {
		text("Generation: " + gameParams.testPopulation.gen, 200, 90);
		if (gameParams.testPopulation.solutionFound) {
			text("Wins in " + gameParams.testPopulation.minStep + " moves", 700, 90);
		} else {
			text("Number of moves: " + gameParams.testPopulation.players[0].brain.directions.length, 700, 90);
		}
	} else {
		text("Use the arrow keys or WASD to move.", 640, 90);
		text("Avoid dots. Collect the coin. Reach the Goal.", 640, 130);
	}
}

function keyPressed() {
	if (gameParams.humanPlaying) {
		switch (keyCode) {
			case UP_ARROW:
				gameParams.up = true;
				break;
			case DOWN_ARROW:
				gameParams.down = true;
				break;
			case RIGHT_ARROW:
				gameParams.right = true;
				break;
			case LEFT_ARROW:
				gameParams.left = true;
				break;
		}
		switch (key) {
			case 'W':
				gameParams.up = true;
				break;
			case 'S':
				gameParams.down = true;
				break;
			case 'D':
				gameParams.right = true;
				break;
			case 'A':
				gameParams.left = true;
				break;
		}
		setPlayerVelocity();
	} else { //if human is not playing
		switch (key) {
			case ' ':
				gameParams.showBest = !gameParams.showBest;
				break;
			case 'G': //replay gens
				if (gameParams.replayGens) {
					gameParams.upToGenPos = 0;
					gameParams.replayGens = false;
					loadDots();
				} else {
					if (gameParams.testPopulation.genPlayers.length > 0) {
						gameParams.replayGens = true;
						gameParams.genPlayer = gameParams.testPopulation.genPlayers[0].getChild();
						saveDots();
						resetDots();
					}
				}
				break;
		}
	}

	if (key == 'P') {
		if (gameParams.humanPlaying) {//if human is currently playing
			//reset dots to position
			gameParams.humanPlaying = false;
			loadDots();
		} else {//if AI is currently playing
			if (gameParams.replayGens) {
				gameParams.upToGenPos = 0;
				gameParams.replayGens = false;
			}
			gameParams.humanPlaying = true;
			gameParams.p = new Player();
			gameParams.p.human = true;
			//save the positions of the dots
			saveDots();
			resetDots();
		}
	}
}

function keyReleased() {
	if (gameParams.humanPlaying) {
		switch (keyCode) {
			case UP_ARROW:
				gameParams.up = false;
				break;
			case DOWN_ARROW:
				gameParams.down = false;
				break;
			case RIGHT_ARROW:
				gameParams.right = false;
				break;
			case LEFT_ARROW:
				gameParams.left = false;
				break;
		}
		switch (key) {
			case 'W':
				gameParams.up = false;
				break;
			case 'S':
				gameParams.down = false;
				break;
			case 'D':
				gameParams.right = false;
				break;
			case 'A':
				gameParams.left = false;
				break;
		}

		setPlayerVelocity();
	}

}

//set the velocity of the player based on what keys are currently down
function setPlayerVelocity() {
	gameParams.p.vel.y = 0;
	if (gameParams.up) {
		gameParams.p.vel.y -= 1;
	}
	if (gameParams.down) {
		gameParams.p.vel.y += 1;
	}
	gameParams.p.vel.x = 0;
	if (gameParams.left) {
		gameParams.p.vel.x -= 1;
	}
	if (gameParams.right) {
		gameParams.p.vel.x += 1;
	}

}

//---------------------------------------------------------------------------------------------------------------------
function drawSimDetails() {
	createElement("h2", "Simulation Parameters")
	popPara = createDiv("Population Size: " + gameParams.populationSize);
	gameParams.popMinus = createButton("-");
	gameParams.popPlus = createButton('+');

	gameParams.popPlus.mousePressed(plusPopSize);
	gameParams.popMinus.mousePressed(minusPopSize);

	mrPara = createDiv("Mutation Rate: " + gameParams.mutationRate);
	gameParams.mrMinus = createButton("1/2");
	gameParams.mrPlus = createButton('x2');
	gameParams.mrPlus.mousePressed(plusmr);
	gameParams.mrMinus.mousePressed(minusmr);

	speedPara = createDiv("Evolution Player Speed: " + gameParams.evolutionSpeed);
	gameParams.speedMinus = createButton("-");
	gameParams.speedPlus = createButton('+');
	gameParams.speedPlus.mousePressed(plusSpeed);
	gameParams.speedMinus.mousePressed(minusSpeed);

	movesPara = createElement("h4", "Increase number of player moves by " + gameParams.increaseMovesBy + " every " + gameParams.increaseEvery + " generations");
	movesPara = createDiv("Increase moves by: " + gameParams.increaseMovesBy);
	gameParams.movesMinus = createButton("-");
	gameParams.movesPlus = createButton('+');
	gameParams.movesPlus.mousePressed(plusMoves);
	gameParams.movesMinus.mousePressed(minusMoves);
	everyPara = createDiv("Increase every " + gameParams.increaseEvery + " generations");
	gameParams.everyMinus = createButton("-");
	gameParams.everyPlus = createButton('+');
	gameParams.everyPlus.mousePressed(plusEvery);
	gameParams.everyMinus.mousePressed(minusEvery);

}

function minusPopSize() {
	if (gameParams.populationSize > 100) {
		gameParams.populationSize -= 100;
		popPara.html("Population Size: " + gameParams.populationSize);
	}
}

function plusPopSize() {
	if (gameParams.populationSize < 10000) {
		gameParams.populationSize += 100;
		popPara.html("Population Size: " + gameParams.populationSize);

	}
}

function minusmr() {
	if (gameParams.mutationRate > 0.0001) {
		gameParams.mutationRate /= 2.0;
		mrPara.html("Mutation Rate: " + gameParams.mutationRate);
	}
}

function plusmr() {
	if (gameParams.mutationRate <= 0.5) {
		gameParams.mutationRate *= 2.0;
		mrPara.html("Mutation Rate: " + gameParams.mutationRate);

	}
}

function minusSpeed() {
	if (gameParams.evolutionSpeed > 1) {
		gameParams.evolutionSpeed -= 1;
		speedPara.html("Evolution Player Speed: " + gameParams.evolutionSpeed);
	}
}

function plusSpeed() {
	if (gameParams.evolutionSpeed <= 5) {
		gameParams.evolutionSpeed += 1;
		speedPara.html("Evolution Player Speed: " + gameParams.evolutionSpeed);

	}
}

function minusMoves() {
	if (gameParams.increaseMovesBy >= 1) {
		gameParams.increaseMovesBy -= 1;
		movesPara.html("Increase moves by: " + gameParams.increaseMovesBy);
		movesPara.html("Increase number of player moves by " + gameParams.increaseMovesBy + " every " + gameParams.increaseEvery + " generations");
	}
}

function plusMoves() {
	if (gameParams.increaseMovesBy <= 500) {
		gameParams.increaseMovesBy += 1;
		movesPara.html("Increase moves by: " + gameParams.increaseMovesBy);
		movesPara.html("Increase number of player moves by " + gameParams.increaseMovesBy + " every " + gameParams.increaseEvery + " generations");
	}
}

function minusEvery() {
	if (gameParams.increaseEvery > 1) {
		gameParams.increaseEvery -= 1;
		everyPara.html("Increase every " + gameParams.increaseEvery + " generations");
		movesPara.html("Increase number of player moves by " + gameParams.increaseMovesBy + " every " + gameParams.increaseEvery + " generations");
	}
}

function plusEvery() {
	if (gameParams.increaseEvery <= 100) {
		gameParams.increaseEvery += 1;
		everyPara.html("Increase every " + gameParams.increaseEvery + " generations");
		movesPara.html("Increase number of player moves by " + gameParams.increaseMovesBy + " every " + gameParams.increaseEvery + " generations");
	}
}

//--------------------------------------------------------------------------------------------------------------------------------
//this just prints the coordinates of the tile which is clicked, usefull for level building
// function mousePressed() {

//   var x = floor((mouseX - gameParams.xoff )/gameParams.tileSize);
//   var y = floor((mouseY - gameParams.yoff )/gameParams.tileSize);

//   gameParams.tiles[x][y].wall = !gameParams.tiles[x][y].wall;
//   // gameParams.tiles[x][y].safe = !gameParams.tiles[x][y].safe;
//   // gameParams.tiles[x][y].safe = !gameParams.tiles[x][y].safe;

//   //define solids
//   // if(gameParams.firstClick){
//   //   print("gameParams.solids.push(new Solid(gameParams.tiles[" + x + "]["+ y + "],");
//   // }else{
//   //   print("gameParams.tiles[" + x + "]["+ y + "]));");
//   // }
//   // gameParams.firstClick = !gameParams.firstClick;

//   print("gameParams.tiles[" + x + "]["+ y + "],");

//   // define dots
//   // if(gameParams.firstClick){
//   //   print("gameParams.dots.push(new Dot(gameParams.tiles[" + x + "]["+ y + "],");
//   // }else{
//   //   print("gameParams.tiles[" + x + "]["+ y + "], 0, 1));");
//   // }
//   //
//   // gameParams.firstClick = !gameParams.firstClick;
//   // gameParams.dots.push(new Dot(gameParams.tiles[15][6], gameParams.tiles[6][6], -1));

// }