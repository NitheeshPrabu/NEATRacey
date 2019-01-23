class DistanceMetrics {
	
	getDistance(x1,y1,x2,y2,p) {
		console.log(p);
		return Math.pow(Math.pow(Math.abs(x2-x1),p)+Math.pow(Math.abs(y2-y1),p), 1/p)
	}

	manhatten(x1,y1,x2,y2) {
		return this.getDistance(x1,y1,x2,y2,1);
	}

	euclidean(x1,y1,x2,y2) {
		return this.getDistance(x1,y1,x2,y2,2);
	}

	minkowski(x1,y1,x2,y2) {
		return this.getDistance(x1,y1,x2,y2,3);
	}
}