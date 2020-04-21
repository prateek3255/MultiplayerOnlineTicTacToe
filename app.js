angular.module("tictactoe", ['ngRoute', 'firebase'])
    .config(function ($routeProvider) {

        $routeProvider
            .when("/", { templateUrl: "views/login.html" })
            .when("/game", { templateUrl: "views/game.html" })
            .otherwise({redirectTo:'/'});
    })
    .controller("tic", tic)
    .controller("loginCtrl", loginCtrl)

gridSizeX = 1000;
gridSizeY = 1000;

icon_size = 100;


function loginCtrl($firebaseAuth, $location, $firebaseObject, $scope) {
    var login = this;
    var auth = $firebaseAuth();
    login.loginWithGoogle = function () {
        var promise = auth.$signInWithPopup("google")

        promise.then(function (result) {
            var leaderRef = firebase.database().ref("leaderboard/" + result.user.uid);
            var leaderboard = $firebaseObject(leaderRef);
            leaderboard.$loaded().then(function () {
                if (leaderboard.lat == null){
                    leaderboard.displayName = result.user.displayName;
                    leaderboard.photoURL = result.user.photoURL;
                    leaderboard.msg = "";
                    leaderboard.lat = 0;
                    leaderboard.lon = 0;
                }
                var gX = Math.floor(leaderboard.lon/gridSizeX);
                var gY = Math.floor(leaderboard.lat/gridSizeY);
                leaderboard.gridId = gX + '_' + gY
                var gridRef = firebase.database().ref("grid/" + leaderboard.gridId +'/'+result.user.uid);
                grid = $firebaseObject(gridRef);

                grid.displayName = result.user.displayName;
                grid.photoURL = result.user.photoURL;
                grid.msg = "";
                grid.lat = leaderboard.lat;
                grid.lon = leaderboard.lon;

                grid.$save().then(function () {
                    leaderboard.$save().then(function () {
                        $location.path("/game");
                        console.log("working just fine");
                    });
                });

            });

            // $location.path("/leaderboard");
        })
            .catch(function (error) {
                console.error("Authentication failed:", error);
            });
    }



}


function tic($routeParams, $firebaseObject, $firebaseAuth,$location,$firebaseArray,$scope,$timeout) {
    var t = this;
    var auth = $firebaseAuth();
    auth.$onAuthStateChanged(function (user) {
        if (user) {
            t.user = user;
            leaderRef = firebase.database().ref("leaderboard/" + t.user.uid);
            t.leaderboard = $firebaseObject(leaderRef);
            t.leaderboard.$loaded().then(function () {
                gridRef = firebase.database().ref("grid/" + t.leaderboard.gridId + '/' + t.user.uid);
                t.grid = $firebaseObject(gridRef);
            });
        }
        else {
            $location.path("/");
        }
    })

    up = false; right = false; left = false; down = false;
    stopUp = false; stopRight = false; stopLeft = false; stopDown = false;

    gameloop = setInterval(update, 100);
    peeppoll = setInterval(pollPeeps, 1000);
    clientTime = 0;
    longupdate = setInterval(longtemps, 10000);
    document.addEventListener("keydown",keyDownHandler, false);
    document.addEventListener("keyup",keyUpHandler, false);
    t.neighbors = []

    function keyDownHandler(event) {
        if (event.keyCode == '38') {
            up = true;
            stopUp = false;
        } else if (event.keyCode == '39') {
            right = true;
            stopRight = false;
        } else if (event.keyCode == '40') {
            down = true;
            stopDown = false;
        } else if (event.keyCode == '37') {
            left = true;
            stopLeft = false;
        }
    }

    function keyUpHandler(event) {
        if (event.keyCode == '38') {
            stopUp = true;
        } else if (event.keyCode == '39') {
            stopRight = true;
        } else if (event.keyCode == '40') {
            stopDown = true;
        } else if (event.keyCode == '37') {
            stopLeft = true;
        }
    }

    function update() {
        stepSize = 10
        if (up | right | down | left){
            if (up) {
                t.leaderboard.lat = t.leaderboard.lat + stepSize;
                if (stopUp){
                    up = false
                }
            }
            if (right){
                t.leaderboard.lon = t.leaderboard.lon - stepSize;
                if (stopRight){
                    right = false
                }
            }
            if (down){
                t.leaderboard.lat = t.leaderboard.lat - stepSize;
                if (stopDown){
                    down = false
                }
            }
            if (left){
                t.leaderboard.lon = t.leaderboard.lon + stepSize;
                if (stopLeft){
                    left = false
                }
            }
            t.leaderboard.$save()
            // svgElement.style.transform = "translate("+(t.leaderboard.lon-x)+"px, "+(t.leaderboard.lat-y)+"px)";
        }

        document.querySelectorAll('.neighbors').forEach(e => e.remove());

        var x = window.innerWidth / 2;
        var y = window.innerHeight / 2;

        for (var i = 0; i < t.neighbors.length; i++) {
            n = t.neighbors[i]
            elem = document.createElement("h5");
            elem.className = "neighbors"
            elem.style.textAlign = "center"
            elem.style.position = "fixed"
            elem.style.top = (-n.lat + t.leaderboard.lat) + (y - icon_size/2) + "px"
            elem.style.left = (-n.lon + t.leaderboard.lon) + (x - icon_size/2) + "px"
            elem.innerHTML = n['innerHTML']
            document.body.appendChild(elem);
        }

        svgElement = document.getElementById('brcmap')
        svgElement.style.left = (-(svgElement.width/2)+t.leaderboard.lon+x)+'px';
        svgElement.style.top = (-(svgElement.height/2)+t.leaderboard.lat+y)+'px';
    }

    function pollPeeps() {
        var gX = Math.floor(t.leaderboard.lon/gridSizeX);
        var gY = Math.floor(t.leaderboard.lat/gridSizeY);
        var gridId = gX + '_' + gY
        var msg = document.getElementById('message').value
        if (t.leaderboard.gridId != gridId){
            firebase.database().ref("grid/" + t.leaderboard.gridId +'/'+t.user.uid).remove().then(function (){
                t.leaderboard.gridId = gridId;

                var gridRef = firebase.database().ref("grid/" + gridId +'/'+t.user.uid);
                t.grid = $firebaseObject(gridRef);

                t.grid.displayName = t.user.displayName;
                t.grid.photoURL = t.user.photoURL;
                t.grid.msg = msg;
                t.grid.lat = t.leaderboard.lat;
                t.grid.lon = t.leaderboard.lon;
                t.grid.$save();

            });
        }

        if (msg != t.leaderboard.msg){
            t.leaderboard.msg = msg;
            t.leaderboard.$save();
            t.grid.msg = msg;
            t.grid.$save();
        }
        t.neighbors = [];
        var gX = Math.floor(t.leaderboard.lon/gridSizeX);
        var gY = Math.floor(t.leaderboard.lat/gridSizeY);
        for (ix=-1; ix<2; ix++){
            for (iy=-1; iy<2; iy++){
                gridId = (gX+ix)+'_'+(gY+iy)
                firebase.database().ref("grid/" + gridId).on('value', function(snap){
                    snap.forEach(function(childNode){
                        if (childNode.key != t.user.uid) {
                            displayObj = {};
                            displayObj.lat = childNode.val().lat;
                            displayObj.lon = childNode.val().lon;
                            displayObj.innerHTML = childNode.val().displayName+'<br/><img src="'+childNode.val().photoURL+'" alt="loading" class="img-circle image"><br/><span style="border-color: grey; border-style: solid; border-width:thin;padding:0 2px;width:20px;">'+childNode.val().msg+'</span>';
                            t.neighbors.push(displayObj);
                        }
                    });
                });
            }
        }
    }

    function longtemps() {
        // var clientdate = new Date();
        // var clientTime = clientdate.getHours();
        clientTime = clientTime + 1;
        var r0 = 252;
        var g0 = 249;
        var b0 = 242;
        var r1 = 237;
        var g1 = 147;
        var b1 = 82;
        var rt = r0 + (r1-r0)*(clientTime/23.0);
        var gt = g0 + (g1-g0)*(clientTime/23.0);
        var bt = b0 + (b1-b0)*(clientTime/23.0);


        document.body.style.backgroundColor = 'rgb(' + rt + ',' + gt + ',' + bt + ')';
    }
}