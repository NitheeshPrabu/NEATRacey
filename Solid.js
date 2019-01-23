class Solid {

	//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	//constructor
	constructor(topL, botR) {
		var lineWidth = 1;
		this.pos = createVector(topL.pixelPos.x - lineWidth, topL.pixelPos.y - lineWidth);
		this.w = botR.pixelPos.x + gameParams.tileSize - this.pos.x + lineWidth;
		this.h = botR.pixelPos.y + gameParams.tileSize - this.pos.y + lineWidth;
		this.bottomRight = createVector(this.pos.x + this.w, this.pos.y + this.h);
	}

	restrictMovement(tl, br, movement) {//player dimensions
		//add the x first
		var x = movement.x;
		var y = movement.y;
		
		var ptl = createVector(tl.x + movement.x, tl.y);
		var pbr = createVector(br.x + movement.x, br.y);

		if ((ptl.x < this.bottomRight.x && pbr.x > this.pos.x) && (ptl.y < this.bottomRight.y && pbr.y > this.pos.y)) {
			x = 0;
		}

		//check the y movement
		ptl = createVector(tl.x, tl.y + movement.y);
		pbr = createVector(br.x, br.y + movement.y);
		if ((ptl.x < this.bottomRight.x && pbr.x > this.pos.x) && (ptl.y < this.bottomRight.y && pbr.y > this.pos.y)) {
			y = 0;
		}

		return createVector(x, y);
	}

	collision(ptl, pbr) { //player dimensions
		if ((ptl.x < this.bottomRight.x && pbr.x > this.pos.x) && (ptl.y < this.bottomRight.y && pbr.y > this.pos.y)) {
			return true;
		}
		return false;
	}

	getDistance(tl, br, movement) {
		var ptl = createVector(tl.x + movement.x, tl.y);
		var pbr = createVector(br.x + movement.x, br.y);
		if ((ptl.x < this.bottomRight.x - 1 && pbr.x > this.pos.x + 1) && (ptl.y < this.bottomRight.y - 1 && pbr.y > this.pos.y + 1)) {
			return 0;
		}

		//check the y movement
		ptl = createVector(tl.x, tl.y + movement.y);
		pbr = createVector(br.x, br.y + movement.y);
		if ((ptl.x <= this.bottomRight.x && pbr.x >= this.pos.x) && (ptl.y <= this.bottomRight.y && pbr.y >= this.pos.y)) {
			return 0;
		}
		return 1;
	}
}
