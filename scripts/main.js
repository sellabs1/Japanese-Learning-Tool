/*
||==
||	Bryce Sellars
||	Nihongo Renshuu - Japanese Practise Game
||	brycesellars.co.nz
||==
*/

//Added a shuffle method to array prototype
Array.prototype.shuffle = function(){
	var arrayLength = this.length;
	var	tempValue;
	var	randIndex;

	while(arrayLength != 0){
		randIndex = Math.floor(Math.random() * arrayLength);
		arrayLength --;

		tempValue = this[arrayLength];
		this[arrayLength] = this[randIndex];
		this[randIndex] = tempValue;
	}
};

//Global game object 
var game = game || {};

(function(game, $){

	//"Global" variables
	var currentGameQuestions = [];
	var currentGameAnswers = [];
	var questionsCompleted = 0;
	var currentQuestion;
	var correctAnswers = 0;

	//Returns the text file name pertaining to the level chosen by the user 
	//NOTE - Year 12 and 13 question/answer files are yet to be created. Year 9-11 are functional
	var LevelChoice = function(level){
		var txtFile;

		switch(level){
			case 9:
				txtFile = "Y9Hiragana.txt";
				break;
			case 10:
				txtFile = "Y10Katakana.txt";
				break;
			case 11:
				txtFile = "Y11Kanji.txt";
				break;
			case 12:
				txtFile = "Y12Kanji.txt";
				break;
			case 13:
				txtFile = "Y13Kanji.txt";
				break;
			default:
				txtFile = false;
		}
		return txtFile;
	};

	//Populates the currentGameQuestions array from the text file returned from
	//the LevelChoice method
	var PopulateArray = function(level){
		var txtFile = LevelChoice(level);
		//Clear the array before populating 
		currentGameQuestions.length = 0;

		//Return the ajax request so that the promise can be checked in StartGame method
		return $.getJSON(txtFile, function(data){
			$.each(data, function(index, object){
				currentGameQuestions.push(object);
			});
		}).error(function(){
			alert("Questions array failed to populate. Refresh page and try again.");
		});
	};

	//Displays the question and possible answers
	var DisplayQuestion = function(question){
		var parent = $(".wrapper");
		var questionDiv; 
		var questionNumber;
		var row;
		var column, column2;
		var buttonArray = AnswerOrder(question); 

		//Clear wrapper's child elements before displaying the new question
		parent.empty();

		questionDiv = $("<div />", {
		    "class" : "question",
		    "text" : question["question"]
	  	}).appendTo(parent);

	  	questionNumber = $("<div />", {
	  		"class" : "numOfQuestions",
	  		"text" : questionsCompleted + 1 + "/" + currentGameQuestions.length 
	  	}).appendTo(parent);

	  	row = $("<div />", {
	  		"class" : "row"
	  	}).appendTo(parent);

	  	column = $("<div />", {
	  		"class" : "six columns answers"
	  	}).appendTo(row);

	  	column2 = $("<div />", {
	  		"class" : "six columns answers"
	  	}).appendTo(row);

	  	buttonArray[0].appendTo(column);
	  	buttonArray[1].appendTo(column);
	  	buttonArray[2].appendTo(column2);
	  	buttonArray[3].appendTo(column2);
	};

	//Displays a new question if there are questions left in the currentGameQuestions array
	var NewQuestion = function(){
		questionsCompleted ++;

		if (questionsCompleted < 5) {
			setTimeout(function() {
				//Display next question in question array
				currentQuestion = currentGameQuestions[questionsCompleted];
				DisplayQuestion(currentQuestion);
			}, 2000);
		}
		else{
			//When there are no questions left in the question array, display the user's score
			DisplayScore();
		}
	};

	//Returns a shuffled array of answer buttons to be used in DisplayQuestion method
	var AnswerOrder = function(q){
		var buttonArray = [];
		var correctAnswer = q;
		var arrLength = currentGameQuestions.length;
		//Shuffle the answers array
		currentGameAnswers.shuffle();

		for (var i = 0; i < 3; i++) {
			var randAnswer = currentGameAnswers[i];
			//If the random answer is the same as the correct answer, choose a new random answer
			while (randAnswer["id"] == correctAnswer["id"]) {
				randAnswer = currentGameAnswers[Math.floor(Math.random() * arrLength)];
			}

			buttonArray.push(
				$("<button />",{
					"text" : randAnswer["answer"],
					"onclick" : "game.CheckAnswer(this)",
					"id" : randAnswer["id"]
				})
			);	
		}
		//The correct answer to the current question
		buttonArray.push(
			$("<button />",{
				"text" : correctAnswer["answer"],
				"onclick" : "game.CheckAnswer(this)",
				"id" : correctAnswer["id"]
			})			
		);
		//Shuffle the array before returning it
		buttonArray.shuffle();
		return buttonArray;
	};

	//Display the table of correct/incorrect answers and the users score
	var DisplayScore = function(){
		var wrapper = $(".wrapper");
		var $table = $("<table>");

		//Clear child elements
		wrapper.empty();

		$("<h2 />", {
			"text" : "Score: " + correctAnswers + "/" + currentGameQuestions.length,
			"class" : "center"
		}).appendTo(wrapper);

		$("<th />", {
			"text" : "Question"
		}).appendTo($table);

		$("<th />", {
			"text" : "Answer"
		}).appendTo($table);

		$("<th />", {
			"text" : "You Guessed"
		}).appendTo($table);		

		//Builds the incorrect/correct table
		for (question in currentGameQuestions) {
			var $row;
			var rowClass;

			if (currentGameQuestions[question]["correct"] == true) {
				rowClass = "correct";
			}
			else{
				rowClass = "incorrect";
			}

			$row = $("<tr />", {"class" : rowClass});

			$("<td />", {"text" : currentGameQuestions[question]["question"]}).appendTo($row);
			$("<td />", {"text" : currentGameQuestions[question]["answer"]}).appendTo($row);
			$("<td />", {"text" : currentGameQuestions[question]["guess"]}).appendTo($row);

			$row.appendTo($table);
		};

		$table.appendTo(wrapper);
	};

	//Checks the user's chosen answer to the correct answer
	game.CheckAnswer = function(guess){
		var correctAnswer = $("#" + currentQuestion["id"]);
		var guess = $(guess).attr("id");
		var guessText = $("#" + guess).text();

		//Disables all buttons to prevent multiple inputs
		$("button").prop("disabled", true);

		if (guess == currentQuestion["id"]) {
			currentGameQuestions[questionsCompleted].correct = true;
			correctAnswer.addClass("correct");
			currentGameQuestions[questionsCompleted].guess = "Correct";
			correctAnswers += 1;
		}
		else{
			$("#" + guess).addClass("incorrect");
			correctAnswer.addClass("correct");
			currentGameQuestions[questionsCompleted].guess = guessText;
		}
		NewQuestion();
	};

	game.MainMenu = function(){
		window.location = "index.html";
	};

	game.showArray = function(){
		console.log(currentGameQuestions.length);
	};

	//Starts the game. Populates the question array, and displays the first question.
	game.StartGame = function(level){
		window.location.hash = "Game";
		//Once the Questions Array has been populated, start the game
		PopulateArray(level).done(function(){
			currentGameQuestions.shuffle();
			currentGameAnswers = currentGameQuestions.slice();
			currentQuestion = currentGameQuestions[questionsCompleted];
			DisplayQuestion(currentQuestion);
		});
	};

})(game, jQuery);