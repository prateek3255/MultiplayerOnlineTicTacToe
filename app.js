angular.module("tictactoe", ['ngRoute', 'firebase'])
    .config(function ($routeProvider) {

        $routeProvider
            .when("/", { templateUrl: "views/login.html" })
            .when("/game/:gameId", { templateUrl: "views/game.html" })
            .when("/leaderboard", { templateUrl: "views/leaderboard.html" })
            .otherwise({redirectTo:'/'});
    })
    .controller("tic", tic)
    .controller("loginCtrl", loginCtrl)
    .controller("leaderCtrl", leaderCtrl)


function loginCtrl($firebaseAuth, $location, $firebaseObject, $scope) {
    var login = this;
    var auth = $firebaseAuth();
    login.loginWithGoogle = function () {
        var promise = auth.$signInWithPopup("google")

        promise.then(function (result) {
            console.log("Signed in as:", result);
            var leaderRef = firebase.database().ref("leaderboard/" + result.user.uid);
            var leaderboard = $firebaseObject(leaderRef);
            // var leaderboard=$firebaseArray(leaderRef);
            var present = false;
            leaderboard.$loaded().then(function () {
                leaderboard.displayName = result.user.displayName;
                leaderboard.photoURL = result.user.photoURL;
                if (!('score' in leaderboard))
                    leaderboard.score = 0;
                leaderboard.challenge = "";
                leaderboard.accept = "";
                leaderboard.gameId = 0;
                // leaderboard.$add(player);
                leaderboard.$save().then(function () {
                    $location.path("/leaderboard");
                    console.log("working just fine");
                });

            });

            // $location.path("/leaderboard");
        })
            .catch(function (error) {
                console.error("Authentication failed:", error);
            });
    }
    login.loginWithFacebook = function () {
        var promise = auth.$signInWithPopup("facebook")

        promise.then(function (result) {
            console.log("Signed in as:", result);
            var leaderRef = firebase.database().ref("leaderboard/" + result.user.uid);
            var leaderboard = $firebaseObject(leaderRef);
            // var leaderboard=$firebaseArray(leaderRef);
            var present = false;
            leaderboard.$loaded().then(function () {
                leaderboard.displayName = result.user.displayName;
                leaderboard.photoURL = result.user.photoURL;
                if (!('score' in leaderboard))
                    leaderboard.score = 0;
                leaderboard.challenge = "";
                leaderboard.accept = "";
                leaderboard.gameId = 0;
                // leaderboard.$add(player);
                leaderboard.$save().then(function () {
                    $location.path("/leaderboard");
                    console.log("working just fine");
                });

            });

            // $location.path("/leaderboard");
        })
            .catch(function (error) {
                console.error("Authentication failed:", error);
            });
    }



}

function leaderCtrl($firebaseAuth, $location, $firebaseArray, $firebaseObject, $scope) {
    var auth = $firebaseAuth();
    var leader = this;
    var leadersRef = firebase.database().ref("leaderboard");
    leader.leaders = $firebaseArray(leadersRef)
    leader.ch = false;

    auth.$onAuthStateChanged(function (user) {
        if (user) {
            leader.user = user;
            for (i = 0; i < leader.user.displayName.length; i++) {
                if (leader.user.displayName[i] == " ") {
                    leader.dName = leader.user.displayName.substr(0, i);
                    break;
                }
            }
            var leaderRef = firebase.database().ref("leaderboard/" + leader.user.uid);
            var onlineRef = firebase.database().ref("online");
            leader.onlineUsers = $firebaseArray(onlineRef);
            leader.player = $firebaseObject(leaderRef);
            leader.onlineUsers.$loaded().then(function(){
                var connectedRef = firebase.database().ref(".info/connected");
                connectedRef.on("value", function (snap) {
                    if (snap.val() === true) {
                        console.log("connected");

                        var person = {};
                        person.uid = leader.user.uid;
                        person.photoURL = leader.user.photoURL;
                        person.displayName = leader.user.displayName;
                        flag=true
                        for(i=0;i<leader.onlineUsers.length;i++){
                            if(person.uid==leader.onlineUsers[i].uid){
                                flag=false;
                                console.log("lools like it will work");
                            }
                                
                        }
                        if(flag){
                            var con = onlineRef.push(person);
                            con.onDisconnect().remove();
                        }
                            

                    } else {

                    }

                });
            })
            leader.player.$loaded().then(function () {
                
                $scope.$watch(function (scope) { return leader.player.challenge },
                    function (newValue, oldValue) {
                        if (newValue != "") {
                            challengerRef = firebase.database().ref("leaderboard/" + newValue)
                            leader.challenger = $firebaseObject(challengerRef)
                            leader.challenger.$loaded().then(function () {
                                leader.ch = true;
                                console.log(leader.challenger)
                            })
                        }
                    }
                );
                $scope.$watch(function (scope) { return leader.player.accept },
                    function (newValue, oldValue) {
                        if (newValue != "") {
                            $location.path("/game/" + leader.player.gameId)
                        }
                    }
                );

            });
        }
        else {
            $location.path("/");
        }
    });



    leader.request = function (index) {
        opponentRef = firebase.database().ref("leaderboard/" + leader.onlineUsers[index].uid)
        opponent = $firebaseObject(opponentRef)
        opponent.$loaded().then(function () {
            opponent.challenge = leader.user.uid;
            console.log(opponent)
            opponent.$save();

        });


    }

    leader.declineRequest = function () {
        leader.player.challenge = "";
        leader.player.$save();
        leader.ch = false;
    }

    leader.acceptRequest = function () {
        leader.challenger.accept = leader.user.uid;
        ran = Math.round(Math.random() * 1000000);
        leader.challenger.gameId = ran;
        leader.player.gameId = ran;
        leader.player.$save().then(function () {
            gameRef = firebase.database().ref("game/" + ran)
            leader.game = $firebaseObject(gameRef);
            leader.game.player1 = leader.player.challenge;
            leader.game.player2 = leader.user.uid;
            buttons = [];
            for (i = 0; i < 9; i++) {
                button = {};
                button.id = i;
                button.state = true;
                button.value = "";
                buttons.push(button);
            }
            leader.game.buttons = buttons;
            leader.game.player = true;
            leader.game.win = 0;
            leader.game.tie = true;
            // console.log(leader.challenger.uid,leader.player.uid)
            leader.game.$save().then(function () {
                console.log(leader.challenger.accept)
                leader.challenger.$save().then(function () {
                    $location.path("/game/" + ran);
                });
            });

        });
        

    }



}


function tic($routeParams, $firebaseObject, $firebaseAuth,$location,$firebaseArray,$scope,$timeout) {
    var t = this;
    t.gameId = $routeParams.gameId
    var onlineRef = firebase.database().ref("game/"+t.gameId+"/online");
    var connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", function (snap) {
        if (snap.val() === true) {
            console.log("connected");

            var person = 0;
            var con = onlineRef.push(person);

            con.onDisconnect().remove();

        } else {

        }

    });
    onlineUsers = $firebaseArray(onlineRef);

    $scope.$watch(function (scope) { return onlineUsers.length },
        function (newValue, oldValue) {
           $timeout(function(){
               if(onlineUsers.length<2){
                   alert("Uh OH!! Looks like your opponent is no longer available. Press ok to go back to the leaderboard page.")
                   $location.path('/leaderboard');
                //    $window.location.reload();
               }
           },4000)
        }
    );
    gameRef = firebase.database().ref("game/" + t.gameId);
    t.game = $firebaseObject(gameRef);
    var auth = $firebaseAuth();
    auth.$onAuthStateChanged(function (user) {
        if (user) {
            t.user = user;
            t.game.$loaded().then(function () {
                p1Ref = firebase.database().ref("leaderboard/" + t.game.player1);             
                p1 = $firebaseObject(p1Ref);
                p1.$loaded().then(function () {
                    p1.accept = "";
                    p1.challenge = "";
                    p1.$save().then(function(){
                        p2Ref = firebase.database().ref("leaderboard/" + t.game.player2);
                        p2 = $firebaseObject(p2Ref);
                        p2.$loaded().then(function () {
                            p2.accept = "";
                            p2.challenge = "";
                            p2.$save().then(function(){
                                if (t.user.uid == t.game.player1) {
                                    t.player = true;
                                    t.symbol = "X";
                                }
                                else {
                                    t.player = false;
                                    t.symbol = "O";
                                }
                                if (t.player) {
                                    p2.$loaded().then(function () {
                                        t.opponent = p2;
                                        console.log(t.opponent)
                                    })
                                }
                                else {
                                    p1.$loaded().then(function () {
                                        t.opponent = p1;
                                        console.log(t.opponent)
                                    })
                                }
                            })
                        })
                    })
                })
                
            })
        }
        else {
            $location.path("/");
        }
    })
    t.changeState = function (id) {
        if (t.game.buttons[id].state&&t.player == t.game.player) {
            t.game.buttons[id].value = t.symbol;
            t.game.player = !t.game.player;
            t.game.buttons[id].state = false;
        }
        
        t.game.$save().then(function () {
            checkIfComplete();
        })


    }
    function checkIfComplete() {
        for (i = 0; i < 7; i = i + 3) {
            if (t.game.buttons[i].value == 'X' && t.game.buttons[i + 1].value == 'X' && t.game.buttons[i + 2].value == 'X') {
                t.game.win = 1;
                disableAll();
            }
            else
                if (t.game.buttons[i].value == 'O' && t.game.buttons[i + 1].value == 'O' && t.game.buttons[i + 2].value == 'O') {
                    t.game.win = 2;
                    disableAll();
                }
        }
        for (i = 0; i < 3; i++) {
            if (t.game.buttons[i].value == 'X' && t.game.buttons[i + 3].value == 'X' && t.game.buttons[i + 6].value == 'X') {
                t.game.win = 1;
                disableAll();
            }
            else
                if (t.game.buttons[i].value == 'O' && t.game.buttons[i + 3].value == 'O' && t.game.buttons[i + 6].value == 'O') {
                    t.game.win = 2;
                    disableAll();
                }
        }

        if (t.game.buttons[0].value == 'X' && t.game.buttons[4].value == 'X' && t.game.buttons[8].value == 'X') {
            t.game.win = 1;
            disableAll();
        }
        else
            if (t.game.buttons[0].value == 'O' && t.game.buttons[4].value == 'O' && t.game.buttons[8].value == 'O') {
                t.game.win = 2;
                disableAll();
            }


        if (t.game.buttons[2].value == 'X' && t.game.buttons[4].value == 'X' && t.game.buttons[6].value == 'X') {
            t.game.win = 1;
            disableAll();
        }
        else
            if (t.game.buttons[2].value == 'O' && t.game.buttons[4].value == 'O' && t.game.buttons[6].value == 'O') {
                t.game.win = 2;
                disableAll();
            }
        console.log(allSelected(), t.game.tie);
        if (allSelected() && t.game.tie)
            t.game.win = 3;
        t.game.$save();
        
    }
    $scope.$watch(function (scope) { return t.game.win},
        function (newValue, oldValue) {
            if(newValue>0){
                // console.log(p1,p2);
               if(newValue==1){
                   p1.score=p1.score+1;
                   p1.$save().then(function(){
                       alert("You will now be redirected to leaderboard");
                       $location.path("/leaderboard");
                    //    $window.location.reload();
                   })
               }
               else
    
               if(newValue==2){
                    p2.score=p2.score+1;
                    p2.$save().then(function(){
                        alert("You will now be redirected to leaderboard");
                        $location.path("/leaderboard");
                        // $window.location.reload();
                    })
                }
                else{
                    $timeout(function(){
                        alert("You will now be redirected to leaderboard");
                        $location.path("/leaderboard");
                        // $window.location.reload();
                    },2000)
                }
            }
            
        }
    );


    function disableAll() {
        for (i = 0; i < 9; i++) {
            t.game.buttons[i].state = false;
        }
        t.game.tie = false;
    }

    function allSelected() {
        flag = true;
        for (i = 0; i < 9; i++) {
            if (t.game.buttons[i].state)
                flag = false;
        }
        return flag;
    }

    t.reset = function () {
        // for(i=0;i<9;i++){
        //     t.game.buttons[i].state=true;
        //     t.game.buttons[i].value="";
        // }
        // t.game.win=0;
        // t.player=true;
        // t.game.tie=true;

    }
} 