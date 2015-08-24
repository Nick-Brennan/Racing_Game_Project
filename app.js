
$(function(){
    //instantiate a new game
    var game = new Game();
    var music = new Audio('StarWarsElevatorMusic.mp3');
    music.volume = 0.4;
    music.loop = true;
    music.play();
    $('#muteButton').click(function(){
        if(music.volume > 0){
            music.volume = 0;
        } else{
            music.volume = 0.4;
        }
    })

    //set canvas widths to the Div #frame widths so that we can change them dynamically
    $('.fore').attr("width", $('div').width()) 
    //keeps track of the width of the tracks
    var canvasWidth = $('#canvas1-front').width();
    var canvasHeight = 200;
    //initialize the race tracks
    var tracks = new Tracks($('#canvas1-front'), $('#canvas2-front'), $('#top-effects'), $('#bottom-effects'));

    /*CHANGE THESE TO TWEAK GAME-PLAY*///=====================================
    //difficulty: Lower is Harder! 1 === asteroids off. 0 === impossible!!!
    //Speed multiplier: small changes make a large impact.
    //adjust if altering FPS (setInterval time value) or to make ships snappier
    //Lowering finish position brings it closer to the start.
    var difficulty = 0.97;
    var speedMultiplier = 0.15;
    var finishPosition = .9;
    //=========================================================================
       
    //prep holding arrays for the spawned asteroids and explosions
    var topAsteroids = [];
    var bottomAsteroids = [];
    var topExplosions = [];
    var bottomExplosions = [];
    
    //instantiatie both players
    var player1 = new Player(tracks.topTrackCanvasContext, game.images[$('#p1-avatar').val()]);
    var player2 = new Player(tracks.bottomTrackCanvasContext, game.images[$('#p2-avatar').val()]);
    console.log(player1.avatar);
    
    $('#p1-avatar').change(function(){
            var p1Avatar = $('#p1-avatar').val();
            var p2Avatar = $('#p2-avatar').val();
            console.log(p1Avatar);
            console.log(game.images[p1Avatar]);
            player1.avatar = game.images[p1Avatar];
            player2.avatar = game.images[p2Avatar];
       });
    $('#p2-avatar').change(function(){
            var p1Avatar = $('#p1-avatar').val();
            var p2Avatar = $('#p2-avatar').val();
            player1.avatar = game.images[p1Avatar];
            player2.avatar = game.images[p2Avatar];
       });
   
    
    //draw the players in the start position
    player1.drawPlayer();
    player2.drawPlayer();
    
    //adjust the width when the windows is resized
    window.onresize = function(){
        $('.fore').attr("width", $('div').width()) 
        canvasWidth = $('#canvas1-front').width();
        player1.drawPlayer();
        player2.drawPlayer();
    };
    
    //Setting up event listeners for keyboard input====TO DO: PACKAGE IN "GAME" OBJECT or keyboard?==
    var keysDown = {};

    addEventListener("keydown", function(e){
        keysDown[e.keyCode] = true;
    });

    addEventListener("keyup", function(e){
        delete keysDown[e.keyCode];
    });

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
    
    //================================HERE IS MY MAIN GAME LOOP!==================================================================================
    setInterval(function(){ 

        //reset the canvas widths to clear the frame
        $('.fore').attr("width", $('div').width())
        tracks.topEffectsCanvas.width = canvasWidth;
        tracks.bottomEffectsCanvas.width = canvasWidth;
        
        //move the players
        setPlayerPositions(player1, player2, speedMultiplier);
        
        //add asteroids to both tracks
        generateAsteroids(tracks.topTrackCanvasContext, topAsteroids, game.images['asteroidImg']);
        updateAsteroids(topAsteroids);
        generateAsteroids(tracks.bottomTrackCanvasContext, bottomAsteroids, game.images['asteroidImg']);
        updateAsteroids(bottomAsteroids);
        
        //check for collisions with both players and apply effects "BOOM!!!" :)
        topAsteroids.forEach(function(asteroid, index){
            if(collides(asteroid, player1)){
                var explosion = new Explosion(tracks.topEffectsCanvasContext
                                            , [player1.position[0], player1.position[1] - 7]);
                topExplosions.unshift(explosion);
                player1.position = [15, 80];
                topAsteroids.splice(index, 1);
                var boom = new Audio('Explosion_04.wav');
                boom.volume = 0.75;
                boom.play();
            }
        });
        bottomAsteroids.forEach(function(asteroid, index){
            if(collides(asteroid, player2)){
                    var explosion = new Explosion(tracks.bottomEffectsCanvasContext
                                                , [player2.position[0], player2.position[1] - 7]);
                    topExplosions.unshift(explosion);
                    player2.position = [15, 80];
                    bottomAsteroids.splice(index, 2);
                    var boom = new Audio('Explosion_04.wav');
                    boom.volume = 0.75;
                    boom.play();
               }
        });
        
        bottomExplosions.forEach(function(explosion, index){
            if(explosion.frameCounter <= 0){
                topExplosions.splice(index, 1);
            } else{
                explosion.animate();
            }
        });
        
        topExplosions.forEach(function(explosion, index){
            if(explosion.frameCounter <= 0){
                topExplosions.splice(index, 1);
            } else{
                explosion.animate();
            }
        });
        
        //check for a winner
        game.checkForWinners();

        //allow for window resize during gameplay, cuz why not ;-P ...actualy pretty handy while debugging
        window.onresize = function(){
            $('.fore').attr("width", $('div').width()) 
            canvasWidth = $('#canvas1-front').width();
            tracks.topEffectsCanvas.width = canvasWidth;
            tracks.bottomEffectsCanvas.width = canvasWidth;
            console.log(canvasWidth);
            setPlayerPositions(player1, player2, speedMultiplier);
        };
    }, 15);
//==================================================================================================================================================    
    function Game(){
        this.images = {
            xWing : $('#xWing')[0],
            interceptor : $('#interceptor')[0],
            tardis : $('#tardis')[0],
            viper : $('#viper')[0],
            TB04 : $('#TB04')[0],
            delorean : $('#delorean')[0],
            slave1 : $('#slave1')[0],
            asteroidImg : $('#asteroid')[0]
        };
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
            if ((player1.position[0] >= canvasWidth * .95)
                    &&(player2.position[0] < canvasWidth * finishPosition)){
                alert('Player 1 Wins!');
                keysDown = {};
                player1.position = [15, 80];
                player2.position = [15, 80];
            }else if ((player2.position[0] >= canvasWidth * .95)
                      &&(player1.position[0] < canvasWidth * finishPosition)){
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
            this.context.drawImage(this.avatar, this.position[0]
                              , this.position[1], this.size[0]
                              , this.size[1]);
        };
    }
    
    function Tracks(canvas1, canvas2, canvas3, canvas4){
        this.topTrackCanvas = canvas1[0];
        this.topTrackCanvasContext = this.topTrackCanvas.getContext('2d');
        this.bottomTrackCanvas = canvas2[0];
        this.bottomTrackCanvasContext = this.bottomTrackCanvas.getContext('2d');
        this.topEffectsCanvas = canvas3[0];
        this.topEffectsCanvasContext = this.topEffectsCanvas.getContext('2d');
        this.bottomEffectsCanvas = canvas4[0];
        this.bottomEffectsCanvasContext = this.bottomEffectsCanvas.getContext('2d');
        this.topEffectsCanvas.width = this.topTrackCanvas.width;
        this.bottomEffectsCanvas.width = this.bottomTrackCanvas.width;
    }
    
    function Explosion(context, position){
        this.size = [50, 50];
        this.position = position;
        this.frames = [$('#explosion1')[0], $('#explosion3')[0], $('#explosion3')[0]]
        this.frameCounter = 10;
        this.context = context;
        this.activeFrame = this.frames[0];
        this.constructor.prototype.animate = function(){
            if(this.frameCounter < 7){
                this.activeFrame = this.frames[1];
            } else if (this.frameCounter < 4){
                this.activeFrame = this.frames[2];
            }
            
            this.context.drawImage(this.activeFrame, this.position[0]
                              , this.position[1], this.size[0]
                              , this.size[1]);
            this.frameCounter--;
        }
    }
    
    function generateAsteroids(context, array, avatar){
        var newAsteroid;
        if(Math.random() > difficulty){
            for(i = 0; i < Math.floor(Math.random() * 3); i++){
                newAsteroid = new Player(context, avatar);
                newAsteroid.speed = 3 + Math.round(Math.random() * 3);
                newAsteroid.position = [canvasWidth - newAsteroid.size[0]
                                        ,(Math.random() * (canvasHeight - newAsteroid.size[1]))]; 
                array.unshift(newAsteroid);
            } 
        }
    }
    
    function updateAsteroids(array){
        array.forEach(function(asteroid, index){
            asteroid.drawPlayer();
            asteroid.position[0] -= asteroid.speed;
            //remove old asteroids from the array
            if(asteroid.position[0] <= -300){
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