class Genome {
	constructor(size, inp, out, crossover) {
		this.directions = [];
		this.step = 0;

		this.genes = []; //a list of connections between nodes which represent the NN
		this.nodes = []; //a list of nodes
		this.inputs = inp;
		this.outputs = out;
		this.layers = 2;
		this.nextNode = 0;
		this.biasNode = 0;
		this.network = []; //a list of the nodes in the order that they need to be considered in the NN

		if (!crossover) {
			// var localNextConnectionNumber = 0;

			//create input nodes
			for (var i = 0; i < this.inputs; i++) {
				this.nodes.push(new Node(i));
				this.nextNode++;
				this.nodes[i].layer = 0;
			}

			//create output nodes
			for (var i = 0; i < this.outputs; i++) {
				this.nodes.push(new Node(i + this.inputs));
				this.nodes[i + this.inputs].layer = 1;
				this.nextNode++;
			}

			this.nodes.push(new Node(this.nextNode)); //bias node
			this.biasNode = this.nextNode;
			this.nextNode++;
			this.nodes[this.biasNode].layer = 0;

			this.randomize(size);

		}

	}
	//--------------------------------------------------------------------------------------------------------------------------------
	//sets all the vectors in directions to a random vector with length 1
	randomize(size) {
		for (var i = 0; i < size; i++) {
			this.directions[i] = this.getRandomDirection();
		}
	}

	//---------------------------------------------------------------------------------------------------------------------------------------------------------------
	//returns a random PVector
	getRandomDirection() {
		var randomNumber = floor(random(9));
		switch (randomNumber) {
			case 0:
				return createVector(0, 1);
			case 1:
				return createVector(1, 1);
			case 2:
				return createVector(1, 0);
			case 3:
				return createVector(1, -1);
			case 4:
				return createVector(0, -1);
			case 5:
				return createVector(-1, -1);
			case 6:
				return createVector(-1, 0);
			case 7:
				return createVector(-1, 1);
			case 8:
				return createVector(0, 0);
		}

		return createVector();
	}

	//-------------------------------------------------------------------------------------------------------------------------------------
	//returns a perfect copy of this brain object
	clone() {
		var clone = new Genome(this.directions.length,this.inputs,this.outputs,true);

		for (var i = 0; i < this.nodes.length; i++) { //copy nodes
			clone.nodes.push(this.nodes[i].clone());
		}

		//copy all the connections so that they connect the clone new nodes
		for (var i = 0; i < this.genes.length; i++) { //copy genes
			clone.genes.push(this.genes[i].clone(clone.getNode(this.genes[i].fromNode.number), clone.getNode(this.genes[i].toNode.number)));
		}

		// copy all previous moves
		for (var i = 0; i < this.directions.length; i++) {
			clone.directions[i] = this.directions[i].copy();
		}

		clone.layers = this.layers;
		clone.nextNode = this.nextNode;
		clone.biasNode = this.biasNode;
		clone.connectNodes();

		for (var i = 0; i < this.directions.length; i++) {
			clone.directions[i] = this.directions[i].copy();
		}
		return clone;
	}

	//----------------------------------------------------------------------------------------------------------------------------------------

	//mutates the brain by setting some of the directions to random vectors
	mutate(innovationHistory, died, deathStep) {
		if (this.genes.length == 0) {
			this.addConnection(innovationHistory);
			return;
		}
		var rand1 = random(1);
		if (rand1 < 0.8) // 80% of the time mutate weights
			for (var i = 0; i < this.genes.length; i++)
				this.genes[i].mutateWeight();

		//5% of the time add a new connection
		var rand2 = random(1);
		if (rand2 < 0.05)
			this.addConnection(innovationHistory);

		//3% of the time add a node
		var rand3 = random(1);
		if (rand3 < 0.03)
			this.addNode(innovationHistory);

		//chance that any vector in directions gets changed
		for (var i = 0; i < this.directions.length; i++) {
			var rand = random(1);
			if (died && i > deathStep - 10) {
				rand = random(0.2);
			}

			if (rand < gameParams.mutationRate) {
				//set this direction as a random direction
				this.directions[i] = this.getRandomDirection();
			}
		}
	}

	//---------------------------------------------------------------------------------------------------------------------------------------------------------
	//increases the number of elements in directions by 5
	increaseMoves() {
		for (var i = 0; i < gameParams.increaseMovesBy; i++) {
			this.directions.push(this.getRandomDirection());
		}
	}

	//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	//returns the node with a matching number
	//sometimes the nodes will not be in order
	getNode(nodeNumber) {
		for (var i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].number == nodeNumber) {
				return this.nodes[i];
			}
		}
		return null;
	}

	//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	//adds the conenctions going out of a node to that node so that it can acess the next node during feeding forward
	connectNodes() {
		// console.log("Connecting nodes of genome " + this);
		for (var i = 0; i < this.nodes.length; i++) //clear the connections
			this.nodes[i].outputConnections = [];
		for (var i = 0; i < this.genes.length; i++) {//for each connectionGene 
			this.genes[i].fromNode.outputConnections.push(this.genes[i]); //add it to node
			// console.log("Connection added to " + this.genes[i].fromNode);
		}
	}

	//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	//feeding in input values to the NN and returning output array
	feedForward(inputValues) {

		//set the outputs of the input nodes
		for (var i = 0; i < this.inputs; i++)
			this.nodes[i].outputValue = inputValues[i];
		this.nodes[this.biasNode].outputValue = 1; //output of bias is 1

		//for each node in the network engage it(see node class for what this does)
		for (var i = 0; i < this.network.length; i++)
			this.network[i].engage();

		//the outputs are nodes[inputs] to nodes [inputs+outputs-1]
		var outs = [];
		for (var i = 0; i < this.outputs; i++)
			outs.push(this.nodes[this.inputs + i].outputValue);

		//reset all the nodes for the next feed forward
		for (var i = 0; i < this.nodes.length; i++)
			this.nodes[i].inputSum = 0;
		// console.log("Perfoming feedforward. Input = " + inputValues + ", Output = " + outs);
		return outs;
	}

	//----------------------------------------------------------------------------------------------------------------------------------------
	//sets up the NN as a list of nodes in order to be engaged 
	generateNetwork() {
		// console.log("Generating the NN");
		this.connectNodes();
		this.network = [];

		//for each layer add the node in that layer, since layers cannot connect to themselves there is no need to order the nodes within a layer
		for (var l = 0; l < this.layers; l++) //for each layer
			for (var i = 0; i < this.nodes.length; i++) //for each node
				if (this.nodes[i].layer == l) //if that node is in that layer
					this.network.push(this.nodes[i]);
		// console.log("Network of the genome " + this);
	}

	//-----------------------------------------------------------------------------------------------------------------------------------------
	//mutate the NN by adding a new node
	//it does this by picking a random connection and disabling it then 2 new connections are added 
	//One between the input node of the disabled connection and the new node
	//and the other between the new node and the output of the disabled connection
	addNode(innovationHistory) {
		// console.log("Adding new nodes to the genome " + this);
		//pick a random connection to create a node between

		if (this.genes.length == 0) {
			this.addConnection(innovationHistory);
			return;
		}

		var randomConnection = floor(random(this.genes.length));

		while (this.genes[randomConnection].fromNode == this.nodes[this.biasNode] && this.genes.length != 1) { //dont disconnect bias
			randomConnection = floor(random(this.genes.length));
		}

		this.genes[randomConnection].enabled = false; //disable it

		var newNodeNo = this.nextNode;
		this.nodes.push(new Node(newNodeNo));
		this.nextNode++;

		//add a new connection to the new node with a weight of 1
		var connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.genes[randomConnection].fromNode, this.getNode(newNodeNo));
		this.genes.push(new connectionGene(this.genes[randomConnection].fromNode, this.getNode(newNodeNo), 1, connectionInnovationNumber));

		connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.getNode(newNodeNo), this.genes[randomConnection].toNode);

		//add a new connection from the new node with a weight the same as the disabled connection
		this.genes.push(new connectionGene(this.getNode(newNodeNo), this.genes[randomConnection].toNode, this.genes[randomConnection].weight, connectionInnovationNumber));
		this.getNode(newNodeNo).layer = this.genes[randomConnection].fromNode.layer + 1;


		connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.nodes[this.biasNode], this.getNode(newNodeNo));
		//connect the bias to the new node with a weight of 0 
		this.genes.push(new connectionGene(this.nodes[this.biasNode], this.getNode(newNodeNo), 0, connectionInnovationNumber));

		//if the layer of the new node is equal to the layer of the output node of the old connection then a new layer needs to be created
		//more accurately the layer numbers of all layers equal to or greater than this new node need to be incremented
		if (this.getNode(newNodeNo).layer == this.genes[randomConnection].toNode.layer) {
			for (var i = 0; i < this.nodes.length - 1; i++) { //dont include this newest node
				if (this.nodes[i].layer >= this.getNode(newNodeNo).layer) {
					this.nodes[i].layer++;
				}
			}
			this.layers++;
		}
		this.connectNodes();
	}

	//------------------------------------------------------------------------------------------------------------------
	//adds a connection between 2 nodes which aren't currently connected
	addConnection(innovationHistory) {
		// console.log("Adding connections to the genome " + this);
		//cannot add a connection to a fully connected network
		if (this.fullyConnected()) {
			// console.log("connection failed");
			return;
		}

		//get random nodes
		var randomNode1 = floor(random(this.nodes.length));
		var randomNode2 = floor(random(this.nodes.length));

		while (this.nodes[randomNode1].layer == this.nodes[randomNode2].layer
			|| this.nodes[randomNode1].isConnectedTo(this.nodes[randomNode2])) { //while the random nodes are no good
			//get new ones
			randomNode1 = floor(random(this.nodes.length));
			randomNode2 = floor(random(this.nodes.length));
		}
		// var flag = 0, randomNode1, randomNode2;
		// for (var i = 0; i < this.nodes.length; i++) {
		// 	for (var j = 0; j < this.nodes.length; j++) {
		// 		if (this.nodes[i].layer != this.nodes[j].layer && !this.nodes[i].isConnectedTo(this.nodes[j])) {
		// 			randomNode1 = i;
		// 			randomNode2 = j;
		// 			flag = 1;
		// 			break;
		// 		}
		// 	}
		// 	if (flag == 1)
		// 		break;
		// }
		var temp;
		if (this.nodes[randomNode1].layer > this.nodes[randomNode2].layer) { //if the first random node is after the second then switch
			temp = randomNode2;
			randomNode2 = randomNode1;
			randomNode1 = temp;
		}

		//get the innovation number of the connection
		//this will be a new number if no identical genome has mutated in the same way 
		var connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.nodes[randomNode1], this.nodes[randomNode2]);

		//add the connection with a random array
		this.genes.push(new connectionGene(this.nodes[randomNode1], this.nodes[randomNode2], random(-1, 1), connectionInnovationNumber));//changed this so if error here
		this.connectNodes();
	}

	//-------------------------------------------------------------------------------------------------------------------------------------------
	//returns the innovation number for the new mutation
	//if this mutation has never been seen before then it will be given a new unique innovation number
	//if this mutation matches a previous mutation then it will be given the same innovation number as the previous one
	getInnovationNumber(innovationHistory, from, to) {
		var isNew = true;
		var connectionInnovationNumber = gameParams.nextConnectionNo;
		for (var i = 0; i < innovationHistory.length; i++) { //for each previous mutation
			if (innovationHistory[i].matches(this, from, to)) { //if match found
				isNew = false; //its not a new mutation
				connectionInnovationNumber = innovationHistory[i].innovationNumber; //set the innovation number as the innovation number of the match
				break;
			}
		}

		if (isNew) { //if the mutation is new then create an arrayList of varegers representing the current state of the genome
			var innoNumbers = [];
			for (var i = 0; i < this.genes.length; i++) //set the innovation numbers
				innoNumbers.push(this.genes[i].innovationNo);

			//then add this mutation to the innovationHistory 
			innovationHistory.push(new connectionHistory(from.number, to.number, connectionInnovationNumber, innoNumbers));
			gameParams.nextConnectionNo++;
		}
		return connectionInnovationNumber;
	}

	//----------------------------------------------------------------------------------------------------------------------------------------
	//returns whether the network is fully connected or not
	fullyConnected() {
		var maxConnections = 0;
		var nodesInLayers = new Array(this.layers); //array which stored the amount of nodes in each layer

		//populate array
		for (var i = 0; i < this.nodes.length; i++)
			nodesInLayers[this.nodes[i].layer] += 1;

		//for each layer the maximum amount of connections is the number in this layer * the number of nodes infront of it
		//so lets add the max for each layer together and then we will get the maximum amount of connections in the network
		for (var i = 0; i < this.layers - 1; i++) {
			var nodesInFront = 0;
			for (var j = i + 1; j < this.layers; j++) //for each layer infront of this layer
				nodesInFront += nodesInLayers[j]; //add up nodes

			maxConnections += nodesInLayers[i] * nodesInFront;
		}

		if (maxConnections == this.genes.length) { //if the number of connections is equal to the max number of connections possible then it is full
			// console.log("Fully connected network? True");
			return true;
		}
		// console.log("Fully connected network? False");
		return false;
	}

	//---------------------------------------------------------------------------------------------------------------------------------
	//called when this Genome is better that the other parent
	crossover(parent2) {
		// console.log("Crossover of genome " + this + " with " + parent2);
		var child = new Genome(this.inputs, this.outputs, this.directions.size, true);
		child.genes = [];
		child.nodes = [];
		child.layers = this.layers;
		child.nextNode = this.nextNode;
		child.biasNode = this.biasNode;
		var childGenes = []; //list of genes to be inherrited form the parents
		var isEnabled = [];

		//all inherited genes
		for (var i = 0; i < this.genes.length; i++) {
			var setEnabled = true; //is this node in the chlid going to be enabled
			var parent2gene = this.matchingGene(parent2, this.genes[i].innovationNo);

			if (parent2gene != -1) { //if the genes match
				if (!this.genes[i].enabled || !parent2.genes[parent2gene].enabled) { //if either of the matching genes are disabled
					if (random(1) < 0.75) { //75% of the time disable the childs gene
						setEnabled = false;
					}
				}
				var rand = random(1);
				if (rand < 0.5) { //get gene from calling parent
					childGenes.push(this.genes[i]);
				} else { //get gene from parent2
					childGenes.push(parent2.genes[parent2gene]);
				}
			} else { //excess gene
				childGenes.push(this.genes[i]);
				setEnabled = this.genes[i].enabled;
			}
			isEnabled.push(setEnabled);
		}

		//since all excess and disjovar genes are inherrited from the more fit parent (this Genome) the childs structure is no different from this parent | with exception of dormant connections being enabled but this wont effect nodes
		//so all the nodes can be inherrited from this parent
		for (var i = 0; i < this.nodes.length; i++) {
			child.nodes.push(this.nodes[i].clone());
		}

		//clone all the connections so that they connect the childs new nodes
		for (var i = 0; i < childGenes.length; i++) {
			child.genes.push(childGenes[i].clone(child.getNode(childGenes[i].fromNode.number), child.getNode(childGenes[i].toNode.number)));
			child.genes[i].enabled = isEnabled[i];
		}

		// copy all previous moves
		for (var i = 0; i < this.directions.length; i++) {
			child.directions[i] = this.directions[i].copy();
		}

		child.connectNodes();
		return child;
	}

	//----------------------------------------------------------------------------------------------------------------------------------------
	//returns whether or not there is a gene matching the input innovation number  in the input genome
	matchingGene(parent2, innovationNumber) {
		for (var i = 0; i < parent2.genes.length; i++) {
			if (parent2.genes[i].innovationNo == innovationNumber) {
				return i;
			}
		}
		return -1; //no matching gene found
	}

	//----------------------------------------------------------------------------------------------------------------------------------------
	//draw the genome on the screen
	drawGenome(startX, startY, w, h) {
		var allNodes = [];
		var nodePoses = [];
		var nodeNumbers = [];

		//get the positions on the screen that each node is supposed to be in
		//split the nodes into layers
		for (var i = 0; i < this.layers; i++) {
			var temp = [];
			for (var j = 0; j < this.nodes.length; j++) { //for each node 
				if (this.nodes[j].layer == i) { //check if it is in this layer
					temp.push(this.nodes[j]); //add it to this layer
				}
			}
			allNodes.push(temp); //add this layer to all nodes
		}

		//for each layer add the position of the node on the screen to the node posses arraylist
		for (var i = 0; i < this.layers; i++) {
			fill(255, 0, 0);
			var x = startX + ((i + 1) * w) / (this.layers + 1.0);
			for (var j = 0; j < allNodes[i].length; j++) { //for the position in the layer
				var y = startY + ((j + 1.0) * h) / (allNodes[i].length + 1.0);
				nodePoses.push(createVector(x, y));
				nodeNumbers.push(allNodes[i][j].number);
			}
		}

		//draw connections 
		stroke(0);
		strokeWeight(2);
		for (var i = 0; i < this.genes.length; i++) {
			if (this.genes[i].enabled) {
				stroke(0);
			} else {
				stroke(100);
			}
			var from = nodePoses[nodeNumbers.indexOf(this.genes[i].fromNode.number)];
			var to = nodePoses[nodeNumbers.indexOf(this.genes[i].toNode.number)];
			if (this.genes[i].weight > 0) {
				stroke(255, 0, 0);
			} else {
				stroke(0, 0, 255);
			}

			//convert weight of the connection from range [0,1] to [0,5] to get thicker lines
			strokeWeight(map(abs(this.genes[i].weight), 0, 1, 0, 5));
			line(from.x, from.y, to.x, to.y);
		}

		//draw nodes last so they appear ontop of the connection lines
		for (var i = 0; i < nodePoses.length; i++) {
			fill(255);
			stroke(0);
			strokeWeight(1);
			ellipse(nodePoses[i].x, nodePoses[i].y, 20, 20);
			textSize(10);
			fill(0);
			textAlign(CENTER, CENTER);
			text(nodeNumbers[i], nodePoses[i].x, nodePoses[i].y);
		}
	}
}
