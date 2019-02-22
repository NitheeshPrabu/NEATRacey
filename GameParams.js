class GameParams {

    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	//constructor
    constructor() {
        this.tileSize = 50;
        this.xoff = 80;
        this.yoff = 100;

        //human playing vars
        this.humanPlaying = false;
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.p;

        //arrays
        this.tiles = [];
        this.shortGoals = [];
        this.solids = [];
        this.dots = [];
        this.savedDots = [];

        this.showBest = false;
        this.showNothing = true;

        this.winArea;

        //gen replay vars
        this.replayGens = false;
        this.genPlayer;
        this.upToGenPos = 0;

        //population vars
        this.numberOfSteps = 10;
        this.testPopulation;

        this.winCounter = -1;

        //population size vars
        this.populationSize = 500;
        this.popPlus;
        this.popMinus;

        //mutation rate vars
        this.mutationRate = 0.01;
        this.mrPlus;
        this.mrMinus;

        //evolution speed vars
        this.evolutionSpeed = 100;
        this.speedPlus;
        this.speedMinus;

        this.increaseMovesBy = 5;
        this.movesPlus;
        this.movesMinus;

        this.increaseEvery = 5;
        this.everyPlus;
        this.everyMinus;

        this.nextConnectionNo = 1000;

        this.firstClick = true;
        this.showedCoins = false;

        this.pxm;
        this.pym;
        this.hasCoins;

        this.distanceParam = 2; //1 - Manhatten, 2 - Euclidean, 3 - Minkowski

        this.playerThreshold = 1;
        this.currentSimDetails = null;
        this.simGenLimit = 100;
    }
}