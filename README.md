# Multiplayer Online TicTacToe
A Tic tac toe game made with Angular JS and firebase as database.
Play online with your friends, track your score and compete with them on the leaderboard.

# Table of Contents
* [Getting Started](#getting-started)
* [How to Play?](#how-to)
* [Live Project](#live-project)
* [Features](#features)
* [Built with](#built-with)
* [Author](#author)
 
# <a name="getting-started"></a>Getting Started
First thing you need to do to use this project is to clone it using the following command -
```
git clone https://github.com/prateek3255/MultiplayerOnlineTicTacToe.git
```
Initially you would need to replace the firebase config in the index.html with your own firebase config settings so that it works on your firebase database, for more details on how to do that you can follow the process described [here](https://firebase.google.com/docs/web/setup).

The project is divided into three sections namely Login, Leaderboard and Game. Each of these pages have their separate html files under the views folder.
App.js also has three separate controllers for each of these components namely `LoginCtrl`, `LeaderCtrl` and `tic` respectively.


# <a name="how-to"></a>How to Play?
<ol>
` <li> Sign in using any of the provided services - Google or Facebook</li>
  <li> See the currently online users and challenge them using the button provided against their name.</li>
  <li> If someone else challanges you then you will get a message to accept or reject their request.</li>
  <li> Once your accept someone else's request or vice-versa then you will be directed towards the game screen.</li>
  <li> You can play the game using the buttons provided in the grid when it is your turn.</li>
  <li> Once the game is completed both the players will be directed back to the leaderboard and the winners score will be updated on the leaderboard.</li>
</ol>

# <a name="live-project"></a> Live Project
Multiplayer TicTacToe is live <a href="https://tic-tac-toe-3eed7.firebaseapp.com">here.</a> 

# <a name="features"></a>Features
* Easy Sign in
* Track your score on the leaderboard
* Easy gameplay
* See all the online users and challenge them

# <a name="built-with"></a>Built with
* <a href="https://angularjs.org/">Angular JS</a> - Superheroic JavaScript MVW Framework
* <a href="https://firebase.google.com/">Firebase</a> - Used for Authentication, Database, Storage and Hosting in thi app.
* <a href="http://getbootstrap.com/">Bootstrap</a> - Used in designing.
* Programming languages used - HTML5, CSS3, JavaScript

# <a name="author"></a>Author
* <b>Prateek Surana   </b>
<a href="mailto:prateeksurana3255@gmail.com">Email</a>
