class connectionHistory {

	//---------------------------------------------------------------------------------------------------------------------------------------------------------
	//constructor
	constructor(from,to,inno,innovationNos) {
		// console.log("Creating a connection history with:");
		// console.log("fromNode: " + from);
		// console.log("toNode: " + to);
		// console.log("innovationNumber: " + inno);
		// console.log("innovationNumbers: " + innovationNos);
		this.fromNode = from;
		this.toNode = to;
		this.innovationNumber = inno;
		this.innovationNumbers = [];
		for (var i = 0; i < innovationNos.length; i++) {
			this.innovationNumbers.push(innovationNos[i]);
		}
	}

	//---------------------------------------------------------------------------------------------------------------------------------------------------------
	//returns whether the genome matches the original genome and the connection is between the same nodes
	matches(genome,from,to) {
		if (genome.genes.length == this.innovationNumbers.length) { 
			
			//if the number of connections are different then the genoemes aren't the same
			if (from.number == this.fromNode && to.number == this.toNode) {

				//next check if all the innovation numbers match from the genome
				for (var i = 0; i < genome.genes.length; i++) {
					if (!this.innovationNumbers.includes(genome.genes[i].innovationNo)) {
						//console.log("Genome matches? False");
						return false;
					}
				}

				//if reached this far then the innovationNumbers match the genes innovation numbers and the connection is between the same nodes
				//so it does match
				// console.log("Genome matches? True");
				return true;
			}
		}
		// console.log("Genome matches? False");
		return false;
	}
}