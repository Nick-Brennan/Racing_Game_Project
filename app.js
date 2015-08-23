
$(function(){
    //instantiate a new game
    var game = new Game();
    //set canvas widths to the Div widths so that we can change them dynamically
    $('.fore').attr("width", $('div').width()) 
    //keeps track of the width of the tracks
    var canvasWidth = $('#canvas1-front').width();
    var canvasHeight = 200;
    //initialize the race tracks
    var tracks = new Tracks($('#canvas1-front'),$('#canvas2-front'));

    /*CHANGE THESE TO TWEAK GAME-PLAY*///=====================================
    //difficulty: Lower is Harder! 1 === asteroids off. 0 === impossible!!!
    //Speed multiplier: small changes make a large impact.
    //adjust if altering FPS (setInterval time value) or to make ships snappier
    //Lowering finish position brings it closer to the start.
    var difficulty = 0.97;
    var speedMultiplier = 0.15;
    var finishPosition = .9;
    //=========================================================================
    
    var images = {
        xWing : $('#xWing')[0],
        interceptor : $('#interceptor')[0],
        asteroidImg : $('#asteroid')[0]
    }
       
    //asteroid prep
    var topAsteroids = [];
    var bottomAsteroids = [];
    
    //instantiating both players
    var player1 = new Player(tracks.topTrackCanvasContext, images['xWing']);
    var player2 = new Player(tracks.bottomTrackCanvasContext, images['interceptor']);
    
    //drawing the players in the start position
    player1.drawPlayer();
    player2.drawPlayer();
    
    //Setting up event listeners for keyboard input====TO DO: PACKAGE IN "GAME" OBJECT or keyboard?==
    var keysDown = {};

    addEventListener("keydown", function(e) {
        keysDown[e.keyCode] = true;
    }, false);

    addEventListener("keyup", function(e) {
        delete keysDown[e.keyCode];
    }, false);

   //set player positions based on keyDown info
    var setPlayerPositions = function (player1, player2, multiplier) {
        if (38 in keysDown) { // Player holding up arrow
            player2.position[1] -= player2.speed * (multiplier * 4);
        }
        if (40 in keysDown) { // Player holding down arrow
            player2.position[1] += player2.speed * (multiplier * 4);
        }
        if (37 in keysDown) { // Player holding left arrow
            player2.position[0] -= player2.speed * (multiplier * 2);
        }
        if (39 in keysDown) { // Player holding right arrow
            player2.position[0] += player2.speed * (multiplier / 2);
        }
        if (87 in keysDown) { // Player holding w
            player1.position[1] -= player1.speed * (multiplier * 4);
        }
        if (83 in keysDown) { // Player holding s
            player1.position[1] += player1.speed * (multiplier * 4);
        }
        if (65 in keysDown) { // Player holding a
            player1.position[0] -= player1.speed * (multiplier * 2);
        }
        if (68 in keysDown) { // Player holding d
            player1.position[0] += player1.speed * (multiplier / 2);
        }
        
        game.setBoundries(player1);
        game.setBoundries(player2);
        
        player1.drawPlayer();
        player2.drawPlayer();
    }
   
    
    //adjust the width when the windows is resized
    window.onresize = function(){
        $('.fore').attr("width", $('div').width()) 
        canvasWidth = $('#canvas1-front').width();
        player1.drawPlayer();
        player2.drawPlayer();
    };
    //================================HERE IS MY MAIN GAME LOOP!==================================================================================
    setInterval(function(){ 
        //reset the canvas width to clear the frame
        $('.fore').attr("width", $('div').width())
        
        setPlayerPositions(player1, player2, speedMultiplier);
        //add asteroids
        generateAsteroids(tracks.topTrackCanvasContext, topAsteroids, images['asteroidImg']);
        updateAsteroids(topAsteroids);
        generateAsteroids(tracks.bottomTrackCanvasContext, bottomAsteroids, images['asteroidImg']);
        updateAsteroids(bottomAsteroids);
        
        //check for collisions
        topAsteroids.forEach(function(asteroid){
            if(collides(asteroid, player1)){
                    console.log("Boom! Player 1 is Hit!");
                    player1.position = [15, 80];
               }
        });
        bottomAsteroids.forEach(function(asteroid){
            if(collides(asteroid, player2)){
                    console.log("Boom! Player 2 is Hit!");
                    player2.position = [15, 80];
               }
        });
        game.checkForWinners();

        //allow for window resize during gameplay, cuz why not ;-P
        window.onresize = function(){
            $('.fore').attr("width", $('div').width()) 
            canvasWidth = $('#canvas1-front').width();
            console.log(canvasWidth);
            setPlayerPositions(player1, player2, speedMultiplier);
        };

    }, 15);
//==================================================================================================================================================    
    function Game(){
        this.setBoundries = function(player){
            if (player.position[0] < 0){
                player.position[0] = 1;
            } else if (player.position[0] > canvasWidth - player.size[0]){
                player.position[0] = canvasWidth - (player.size[0] - 1);
            }
            if (player.position[1] < 0){
                player.position[1] = 1;
            } else if (player.position[1] > canvasHeight - player.size[1]){
                player.position[1] = canvasHeight - (player.size[1] - 1);
            }
        };
        this.checkForWinners = function(){
            if ((player1.position[0] >= canvasWidth * .95)&&(player2.position[0] < canvasWidth * finishPosition)){
                alert('Player 1 Wins!');
                keysDown = {};
                player1.position = [15, 80];
                player2.position = [15, 80];
            }else if ((player2.position[0] >= canvasWidth * .95)&&(player1.position[0] < canvasWidth * finishPosition)){
                alert('Player 2 Wins!');
                keysDown = {};
                player1.position = [15, 80];
                player2.position = [15, 80];
            }
        };
    }
    
    function Player(context, avatar){
        this.size = [26, 26];
        this.position = [15, 80];
        this.speed = 10;
        this.avatar = avatar;
        this.context = context;
        this.drawPlayer =  function(){
            context.drawImage(avatar, this.position[0]
                              , this.position[1], this.size[0]
                              , this.size[1]);
        };
    }
    
    function Tracks(canvas1, canvas2){
        this.topTrackCanvas = canvas1[0];
        this.topTrackCanvasContext = this.topTrackCanvas.getContext('2d');
        this.bottomTrackCanvas = canvas2[0];
        this.bottomTrackCanvasContext = this.bottomTrackCanvas.getContext('2d');
    }
    
    function generateAsteroids(context, array, avatar){
        var newAsteroid;
        if(Math.random() > difficulty){
            for(i = 0; i < Math.floor(Math.random() * 3); i++){
                newAsteroid = new Player(context, avatar);
                newAsteroid.speed = 3 + Math.round(Math.random() * 3);
                newAsteroid.position = [canvasWidth - newAsteroid.size[0]
                                        ,(Math.random() * (canvasHeight - newAsteroid.size[1]))]; 
                array.push(newAsteroid);
            } 
        }
    }
    
    function updateAsteroids(array){
        array.forEach(function(asteroid, index){
            asteroid.drawPlayer();
            asteroid.position[0] -= asteroid.speed;
            //remove old asteroids from the array
            if(asteroid.position[0] <= 0){
                array.splice(index, 1);
            }
        });
    }
    
    function collides(asteroid, player) {
      return asteroid.position[0] < player.position[0] + player.size[0] &&
             asteroid.position[0] + asteroid.size[0] > player.position[0] &&
             asteroid.position[1] < player.position[1] + player.size[1] &&
             asteroid.position[1] + asteroid.size[1] > player.position[1];
    }
    
});