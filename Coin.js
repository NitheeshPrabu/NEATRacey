class Coin {

	//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	//constructor
	constructor(x, y) {
		this.taken = false;
		this.pos = createVector(x, y);
		this.diameter = gameParams.tileSize / 2.0;
	}

	show() {
		if (!gameParams.showedCoins && !this.taken) {
			stroke(0);
			fill(255, 255, 0);
			ellipse(this.pos.x, this.pos.y, this.diameter);
		}
	}

	collides(ptl, pbr) { //player dimensions
		if (this.taken) {
			return false;
		}
		var topLeft = createVector(this.pos.x - this.diameter / 2, this.pos.y - this.diameter / 2);
		var bottomRight = createVector(this.pos.x + this.diameter / 2, this.pos.y + this.diameter / 2);
		if ((ptl.x < bottomRight.x && pbr.x > topLeft.x) && (ptl.y < bottomRight.y && pbr.y > topLeft.y)) {
			this.taken = true;
			return;
		}
		return;
	}

	//------------------------------------------------------------------------------------------------------------
	//returns true if the Pvectors define a square which collides with this dot
	getDistance(ptl, pbr) { //player dimensions
		return distanceMetrics.getDistance(this.pos.x, this.pos.y, (ptl.x + pbr.x) / 2.0, (ptl.y + pbr.y) / 2.0, gameParams.distanceParam)
	}
}
