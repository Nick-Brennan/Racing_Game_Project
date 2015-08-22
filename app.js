//DOCUMENT READY FUNCTION==========================
$(function(){
    //set canvas widths to the Div widths so that we can change them dynamically
    $('.fore').attr("width", $('div').width()) 
    //keeps track of the width of the tracks
    var canvasWidth = $('#canvas1-front').width();
    var canvasHeight = 200;
    console.log(canvasWidth);
    //adjust the width when the windows is resized
    window.onresize = function(){
        $('.fore').attr("width", $('div').width()) 
        canvasWidth = $('#canvas1-front').width();
        console.log(canvasWidth);
        topTrackCanvasContext.drawImage(xWing, 15, 80, 26, 26);
        bottomTrackCanvasContext.drawImage(interceptor, 15, 80, 26, 26);
    };
    
    //setting up the TOP track====TO DO: PACKAGE IN "TRACK" OBJECT=====
    var topTrackCanvas = $('#canvas1-front')[0];
    var topTrackCanvasContext = topTrackCanvas.getContext('2d');
    var xWing = $('#xWing')[0];
    
    //setting up the BOTTOM track====TO DO: PACKAGE IN "TRACK" OBJECT=====
    var bottomTrackCanvas = $('#canvas2-front')[0];
    var bottomTrackCanvasContext = bottomTrackCanvas.getContext('2d');
    var interceptor = $('#interceptor')[0];
    //instantiating both players
    var player1 = new Player(topTrackCanvasContext, xWing);
    var player2 = new Player(bottomTrackCanvasContext, interceptor);
    //drawing the players in the start position
    player1.drawPlayer();
    player2.drawPlayer();
    //asteroid prep
    var topAsteroids = [];
    var bottomAsteroids = [];
    var asteroidImg = $('#asteroid')[0];

    
    //Setting up event listeners for keyboard input====TO DO: PACKAGE IN "GAME" OBJECT or keyboard?==
    var keysDown = {};

    addEventListener("keydown", function(e) {
        keysDown[e.keyCode] = true;
    }, false);

    addEventListener("keyup", function(e) {
        delete keysDown[e.keyCode];
    }, false);

   // Update game objects
    var update = function (player1, player2, modifier) {
        if (38 in keysDown) { // Player holding up arrow
            player2.position[1] -= player2.speed * (modifier * 3);
        }
        if (40 in keysDown) { // Player holding down arrow
            player2.position[1] += player2.speed * (modifier * 3);
        }
        if (37 in keysDown) { // Player holding left arrow
            player2.position[0] -= player2.speed * (modifier * 2);
        }
        if (39 in keysDown) { // Player holding right arrow
            player2.position[0] += player2.speed * (modifier / 2);
        }
        if (87 in keysDown) { // Player holding w
            player1.position[1] -= player1.speed * (modifier * 3);
        }
        if (83 in keysDown) { // Player holding s
            player1.position[1] += player1.speed * (modifier * 3);
        }
        if (65 in keysDown) { // Player holding a
            player1.position[0] -= player1.speed * (modifier * 2);
        }
        if (68 in keysDown) { // Player holding d
            player1.position[0] += player1.speed * (modifier / 2);
        }
        
        setBoundries(player1);
        setBoundries(player2);
        
        player1.drawPlayer();
        player2.drawPlayer();
    }
    //keep the players on their canvases===TO DO: PACKAGE IN GAME OBJECT======
    function setBoundries(player){
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
    }
    //================================HERE IS MY MAIN GAME LOOP!==================================================================================
    setInterval(function(){ 
        //reset the canvas width to clear the frame
        $('.fore').attr("width", $('div').width())
        
        update(player1, player2, 0.125);
        //add asteroids
        generateAsteroids(topTrackCanvasContext, topAsteroids, asteroidImg);
        updateAsteroids(topAsteroids);
        generateAsteroids(bottomTrackCanvasContext, bottomAsteroids, asteroidImg);
        updateAsteroids(bottomAsteroids);
       
        //TO DO: make check for win part of "Game" object=============================================
        if ((player1.position[0] >= canvasWidth * .95)||(player2.position[0] >= canvasWidth * .95)){
            console.log('winner!!');//TO DO: ADD WIN CONDITION!! === redirect? save wins in localStorage
        }
        
        //allow for window resize during gameplay, cuz why not ;P
        window.onresize = function(){
        $('.fore').attr("width", $('div').width()) 
        canvasWidth = $('#canvas1-front').width();
        console.log(canvasWidth);
        update(player1, player2, 0.125);
    };
    //=============================================================================================================================================
    }, 15);
    
    function Player(context, avatar){
        this.size = [26, 26];
        this.position = [15, 80];
        this.speed = 10;
        this.avatar = avatar;
        this.context = context;
        this.drawPlayer =  function(){
            context.drawImage(avatar, this.position[0], this.position[1], this.size[0], this.size[1]);
        }
    };
    
    function generateAsteroids(context, array, avatar){
        var newAsteroid;
        if(Math.random() > 0.95){
            for(i = 0; i < Math.floor(Math.random() * 3); i++){
                newAsteroid = new Player(context, avatar);
                newAsteroid.speed = 3 + Math.round(Math.random() * 3);
                newAsteroid.position = [canvasWidth - newAsteroid.size[0], (Math.random() * canvasHeight) - newAsteroid.size[1]] 
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
    

    
    

});