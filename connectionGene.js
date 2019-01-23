//a connection between 2 nodes
class connectionGene {

	//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	//constructor
	constructor(from, to, w, inno) {
		// console.log("Creating new connection gene with: ");
		// console.log("fromNode: " + from);
		// console.log("toNode: " + to);
		// console.log("weight: " + w);
		// console.log("innovationNo: " + inno);
		this.fromNode = from;
		this.toNode = to;
		this.weight = w;
		this.innovationNo = inno;
		this.enabled = true;
	}

	//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	//changes the weight
	mutateWeight() {
		var oldWeight = this.weight;
		var rand2 = random(1);
		if (rand2 < 0.1) {//10% of the time completely change the weight
			this.weight = random(-1, 1);
		} else {//otherwise slightly change it
			this.weight += randomGaussian() / 50;
			//keep weight between bounds
			if (this.weight > 1) {
				this.weight = 1;
			}
			if (this.weight < -1) {
				this.weight = -1;
			}
		}
		// console.log("Mutating the weights. Old weight = " + oldWeight + ", New weight = " + this.weight);
	}

	//----------------------------------------------------------------------------------------------------------
	//returns a copy of this connectionGene
	clone(from, to) {
		var clone = new connectionGene(from, to, this.weight, this.innovationNo);
		clone.enabled = this.enabled;
		return clone;
	}
}