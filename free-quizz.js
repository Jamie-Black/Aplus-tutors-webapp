// ============================================================
// APLUS TUTORS
// FREE QUIZ ENGINE
// ============================================================

// ============================================================
// CONFIGURATION
// ============================================================

const QUIZ_CONFIG = {

    maxQuestions: 10,

    defaultQuestions: 10,

    defaultTimePerQuestion: 60,

    passMark: 50,

    version: "1.0.0"

};

// ============================================================
// QUIZ STATE
// ============================================================

const quizState = {

    sessionId: "",

    candidateName: "Guest",

    subject: "",

    examType: "Mixed",

    difficulty: "Mixed",

    totalQuestions: 10,

    duration: 0,

    timeRemaining: 0,

    timerInterval: null,

    questions: [],

    currentQuestion: 0,

    score: 0,

    submitted: false,

    answers: [],

    visited: [],

    review: [],

    charts: {}

};

// ============================================================
// DOM CACHE
// ============================================================

const UI = {

    // Landing

    startButton:
        document.getElementById("startQuizBtn"),

    quizSetup:
        document.getElementById("quizSetupSection"),

    // Quiz

    quizContainer:
        document.getElementById("quizContainer"),

    questionText:
        document.getElementById("questionText"),

    optionsContainer:
        document.getElementById("optionsContainer"),

    progressBar:
        document.getElementById("quizProgressBar"),

    timer:
        document.getElementById("timerDisplay"),

    palette:
        document.getElementById("questionPalette"),

    previousButton:
        document.getElementById("previousBtn"),

    nextButton:
        document.getElementById("nextBtn"),

    submitButton:
        document.getElementById("submitQuizBtn"),

    markReviewButton:
        document.getElementById("markReviewBtn"),

    clearAnswerButton:
        document.getElementById("clearAnswerBtn"),

    loading:
        document.getElementById("quizLoading"),

    // Results

    resultsSection:
        document.getElementById("resultsSection"),

    correctionsSection:
        document.getElementById("correctionsSection"),
        
    // Results Details

resultScore:
    document.getElementById("resultScore"),

resultPercentage:
    document.getElementById("resultPercentage"),

resultGrade:
    document.getElementById("resultGrade"),

resultSubject:
    document.getElementById("resultSubject"),

resultCorrect:
    document.getElementById("resultCorrect"),

resultWrong:
    document.getElementById("resultWrong"),

resultUnanswered:
    document.getElementById("resultUnanswered"),

resultTotal:
    document.getElementById("resultTotal"),

resultMessage:
    document.getElementById("resultMessage")

};

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(

    "DOMContentLoaded",

    initializeQuiz

);

// ============================================================
// INITIALIZE APPLICATION
// ============================================================

function initializeQuiz() {

    console.log(

        "Aplus Tutors Free Quiz Loaded"

    );

    attachEvents();

}

// ============================================================
// EVENT LISTENERS
// ============================================================

function attachEvents() {

    if (UI.startButton) {

        UI.startButton.addEventListener(

            "click",

            startQuiz

        );

    }


    if(UI.submitButton){

        UI.submitButton.addEventListener(

            "click",

            submitQuiz

        );

    }

}

// ============================================================
// START QUIZ
// ============================================================

function startQuiz() {

    const subject = document

        .getElementById("subjectSelect")

        ?.value;

    const totalQuestions = parseInt(

        document

            .getElementById("questionCount")

            ?.value || "10"

    );

    const examType = document

        .getElementById("examType")

        ?.value || "Mixed";

    const difficulty = document

        .getElementById("difficulty")

        ?.value || "Mixed";

    if (!subject) {

        alert(

            "Please select a subject."

        );

        return;

    }

    quizState.subject = subject;

    quizState.examType = examType;

    quizState.difficulty = difficulty;

    quizState.totalQuestions = Math.min(

        totalQuestions,

        QUIZ_CONFIG.maxQuestions

    );

    quizState.duration =

        quizState.totalQuestions *

        QUIZ_CONFIG.defaultTimePerQuestion;

    quizState.timeRemaining =

        quizState.duration;

    quizState.sessionId =

        generateSessionId();

    quizState.currentQuestion = 0;

    quizState.score = 0;

    quizState.submitted = false;

    quizState.answers =

        new Array(

            quizState.totalQuestions

        ).fill(null);

    quizState.visited =

        new Array(

            quizState.totalQuestions

        ).fill(false);

    quizState.review =

        new Array(

            quizState.totalQuestions

        ).fill(false);

    console.log(quizState);

    showQuiz();

}

// ============================================================
// SHOW QUIZ
// ============================================================

function showQuiz() {

    if (UI.quizSetup) {

        UI.quizSetup.classList.add(

            "d-none"

        );

    }

    if (UI.quizContainer) {

        UI.quizContainer.classList.remove(

            "d-none"

        );

    }

}

// ============================================================
// GENERATE SESSION ID
// ============================================================

function generateSessionId() {

    const now = new Date();

    const stamp =

        now.getFullYear().toString() +

        String(

            now.getMonth() + 1

        ).padStart(2, "0") +

        String(

            now.getDate()

        ).padStart(2, "0") +

        "-" +

        String(

            now.getHours()

        ).padStart(2, "0") +

        String(

            now.getMinutes()

        ).padStart(2, "0") +

        String(

            now.getSeconds()

        ).padStart(2, "0");

    return `APL-FREE-${stamp}`;

}


// ============================================================
// QUESTION ENGINE
// ============================================================


// ============================================================
// LOAD QUESTIONS
// ============================================================

function loadQuestions(){

    if(
        typeof FREE_QUESTIONS === "undefined"
    ){

        console.error(
            "Question database not loaded."
        );

        alert(
            "Quiz questions are unavailable."
        );

        return false;

    }


    let questionBank =
        FREE_QUESTIONS[
            quizState.subject
        ];


    if(!questionBank || questionBank.length === 0){

        alert(
            "No questions available for this subject."
        );

        return false;

    }


    // Filter exam type

    if(
        quizState.examType !== "Mixed"
    ){

        questionBank =
            questionBank.filter(
                question =>
                question.exam === quizState.examType
            );

    }


    // Filter difficulty

    if(
        quizState.difficulty !== "Mixed"
    ){

        questionBank =
            questionBank.filter(
                question =>
                question.difficulty === quizState.difficulty
            );

    }


    if(questionBank.length === 0){

        alert(
            "No questions match your selection."
        );

        return false;

    }


    questionBank =
        shuffleArray(questionBank);


    quizState.questions =
        questionBank

        .slice(
            0,
            quizState.totalQuestions
        )

        .map(
            prepareQuestion
        );


    return true;

}



// ============================================================
// PREPARE QUESTION
// ============================================================

function prepareQuestion(question){


    const options =
        question.options.map(
            (option,index)=>({

                text: option,

                correct:
                    index === question.answer

            })

        );


    const shuffledOptions =
        shuffleArray(options);


    return {

        id:
            question.id,

        question:
            question.question,

        options:
            shuffledOptions,

        explanation:
            question.explanation,

        topic:
            question.topic,

        exam:
            question.exam,

        difficulty:
            question.difficulty

    };


}



// ============================================================
// START QUESTION SESSION
// ============================================================

function initializeQuestionEngine(){

    const loaded =
        loadQuestions();


    if(!loaded){

        return;

    }


    quizState.visited[0] = true;


    createQuestionPalette();


    renderQuestion();


    attachQuizNavigation();


    startTimer();

}



// ============================================================
// SHUFFLE ARRAY
// ============================================================

function shuffleArray(array){


    return array.sort(
        () => Math.random() - 0.5
    );


}


// ============================================================
// QUESTION RENDERER
// ============================================================


// ============================================================
// RENDER CURRENT QUESTION
// ============================================================

function renderQuestion(){


    const question =

        quizState.questions[
            quizState.currentQuestion
        ];


    if(!question){

        return;

    }


    quizState.visited[
        quizState.currentQuestion
    ] = true;



    // Question number

    const questionNumber =

        quizState.currentQuestion + 1;



    const total =

        quizState.questions.length;



    if(UI.questionText){

        UI.questionText.innerHTML = `

            <span class="question-number">

                Question ${questionNumber}

                of ${total}

            </span>

            <h4>

                ${question.question}

            </h4>

        `;

    }



    renderOptions(question);


    updateProgress();


    updatePalette();

}



// ============================================================
// RENDER OPTIONS
// ============================================================

function renderOptions(question){


    if(!UI.optionsContainer){

        return;

    }


    UI.optionsContainer.innerHTML = "";



    const letters = [

        "A",

        "B",

        "C",

        "D"

    ];



    question.options.forEach(

        (option,index)=>{


            const selected =

                quizState.answers[
                    quizState.currentQuestion
                ] === index;



            const button =

                document.createElement(

                    "div"

                );



            button.className =

                "option-card";



            if(selected){

                button.classList.add(

                    "selected"

                );

            }



            button.innerHTML = `

                <span class="option-letter">

                    ${letters[index]}

                </span>


                <span class="option-text">

                    ${option.text}

                </span>

            `;



            button.addEventListener(

                "click",

                ()=>{

                    selectAnswer(index);

                }

            );



            UI.optionsContainer.appendChild(

                button

            );


        }

    );


}



// ============================================================
// SELECT ANSWER
// ============================================================

function selectAnswer(index){



    quizState.answers[

        quizState.currentQuestion

    ] = index;



    renderOptions(

        quizState.questions[

            quizState.currentQuestion

        ]

    );



    updatePalette();


}



// ============================================================
// UPDATE PROGRESS
// ============================================================

function updateProgress(){



    if(!UI.progressBar){

        return;

    }



    const current =

        quizState.currentQuestion + 1;



    const total =

        quizState.questions.length;



    const percent =

        (

            current / total

        ) * 100;



    UI.progressBar.style.width =

        `${percent}%`;



}



// ============================================================
// UPDATE QUESTION PALETTE
// ============================================================

function updatePalette(){


    if(!UI.palette){

        return;

    }


    const buttons =

        UI.palette.querySelectorAll(

            ".palette-btn"

        );



    buttons.forEach(

        (button,index)=>{


            button.classList.remove(

                "current",

                "answered",

                "visited",

                "review"

            );



            if(

                index ===

                quizState.currentQuestion

            ){

                button.classList.add(

                    "current"

                );

            }

            else if(

                quizState.answers[index]

                !== null

            ){

                button.classList.add(

                    "answered"

                );

            }

            else if(

                quizState.review[index]

            ){

                button.classList.add(

                    "review"

                );

            }

            else if(

                quizState.visited[index]

            ){

                button.classList.add(

                    "visited"

                );

            }


        }

    );

}

// ============================================================
// CBT NAVIGATION
// ============================================================


// ============================================================
// ATTACH QUIZ NAVIGATION EVENTS
// ============================================================

function attachQuizNavigation(){


    if(UI.previousButton){

        UI.previousButton.addEventListener(

            "click",

            previousQuestion

        );

    }



    if(UI.nextButton){

        UI.nextButton.addEventListener(

            "click",

            nextQuestion

        );

    }



    if(UI.clearAnswerButton){

        UI.clearAnswerButton.addEventListener(

            "click",

            clearAnswer

        );

    }



    if(UI.markReviewButton){

        UI.markReviewButton.addEventListener(

            "click",

            toggleReview

        );

    }

}



// ============================================================
// NEXT QUESTION
// ============================================================

function nextQuestion(){


    const lastQuestion =

        quizState.questions.length - 1;



    if(

        quizState.currentQuestion

        >= lastQuestion

    ){

        alert(

            "You are on the last question."

        );

        return;

    }



    quizState.currentQuestion++;



    quizState.visited[

        quizState.currentQuestion

    ] = true;



    renderQuestion();


}



// ============================================================
// PREVIOUS QUESTION
// ============================================================

function previousQuestion(){



    if(

        quizState.currentQuestion <= 0

    ){

        alert(

            "You are already at the first question."

        );

        return;

    }



    quizState.currentQuestion--;



    renderQuestion();


}



// ============================================================
// GO TO QUESTION FROM PALETTE
// ============================================================

function goToQuestion(index){



    if(

        index < 0 ||

        index >= quizState.questions.length

    ){

        return;

    }



    quizState.currentQuestion = index;



    quizState.visited[index] = true;



    renderQuestion();



}

// ============================================================
// TIMER SYSTEM
// ============================================================


// ============================================================
// START TIMER
// ============================================================

function startTimer(){


    stopTimer();


    updateTimerDisplay();



    quizState.timerInterval =

        setInterval(

            ()=>{


                quizState.timeRemaining--;


                updateTimerDisplay();



                if(

                    quizState.timeRemaining <= 0

                ){

                    stopTimer();


                    alert(

                        "Time is up. Your quiz will be submitted."

                    );


                    submitQuiz();

                }


            },

            1000

        );


}



// ============================================================
// STOP TIMER
// ============================================================

function stopTimer(){


    if(

        quizState.timerInterval

    ){

        clearInterval(

            quizState.timerInterval

        );


        quizState.timerInterval = null;

    }


}



// ============================================================
// DISPLAY TIMER
// ============================================================

function updateTimerDisplay(){


    if(!UI.timer){

        return;

    }



    const minutes = Math.floor(

        quizState.timeRemaining / 60

    );



    const seconds =

        quizState.timeRemaining % 60;



    UI.timer.textContent =

        `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;



    updateTimerWarning();



}



// ============================================================
// TIMER WARNING
// ============================================================

function updateTimerWarning(){


    if(!UI.timer){

        return;

    }



    UI.timer.classList.remove(

        "text-danger",

        "text-warning"

    );



    if(

        quizState.timeRemaining <= 60

    ){

        UI.timer.classList.add(

            "text-danger"

        );

    }

    else if(

        quizState.timeRemaining <= 300

    ){

        UI.timer.classList.add(

            "text-warning"

        );

    }


}



// ============================================================
// QUIZ SUBMISSION
// ============================================================


// ============================================================
// SUBMIT QUIZ
// ============================================================

function submitQuiz(){


    if(quizState.submitted){

        return;

    }



    const unanswered =

        quizState.answers.filter(

            answer => answer === null

        ).length;



    if(unanswered > 0){


        const confirmSubmit = confirm(

            `You have ${unanswered} unanswered question(s). Submit anyway?`

        );


        if(!confirmSubmit){

            return;

        }


    }



    stopTimer();


    calculateScore();


    quizState.submitted = true;


    showResults();



}



// ============================================================
// CALCULATE SCORE
// ============================================================

function calculateScore(){


    let correct = 0;



    quizState.questions.forEach(

        (question,index)=>{


            const selected =

                quizState.answers[index];



            if(selected !== null){


                if(

                    question

                    .options[selected]

                    .correct

                ){

                    correct++;

                }

            }


        }

    );



    quizState.score = correct;



    quizState.percentage =

        Math.round(

            (

            correct /

            quizState.questions.length

            )

            *100

        );



    quizState.grade =

        calculateGrade(

            quizState.percentage

        );


}



// ============================================================
// GRADE SYSTEM
// ============================================================

function calculateGrade(score){


    if(score >= 80){

        return "A";

    }


    if(score >= 70){

        return "B";

    }


    if(score >= 60){

        return "C";

    }


    if(score >= 50){

        return "D";

    }


    return "F";


}



// ============================================================
// SHOW RESULTS PLACEHOLDER
// ============================================================

// ============================================================
// SHOW RESULTS
// ============================================================

function showResults(){


    if(UI.quizContainer){

        UI.quizContainer.classList.add(

            "d-none"

        );

    }



    if(UI.resultsSection){

        UI.resultsSection.classList.remove(

            "d-none"

        );

    }



    buildResultSummary();



}

// ============================================================
// BUILD RESULT SUMMARY
// ============================================================

function buildResultSummary(){


    const total =

        quizState.questions.length;



    const correct =

        quizState.score;



    const wrong =

        quizState.answers.filter(

            (answer,index)=>{


                if(answer === null){

                    return false;

                }


                return !

                quizState.questions[index]

                .options[answer]

                .correct;


            }

        ).length;



    const unanswered =

        quizState.answers.filter(

            answer => answer === null

        ).length;



    if(UI.resultScore){

        UI.resultScore.textContent =

            `${correct}/${total}`;

    }



    if(UI.resultPercentage){

        UI.resultPercentage.textContent =

            `${quizState.percentage}%`;

    }



    if(UI.resultGrade){

        UI.resultGrade.textContent =

            quizState.grade;

    }



    if(UI.resultSubject){

        UI.resultSubject.textContent =

            quizState.subject;

    }



    if(UI.resultCorrect){

        UI.resultCorrect.textContent =

            correct;

    }



    if(UI.resultWrong){

        UI.resultWrong.textContent =

            wrong;

    }



    if(UI.resultUnanswered){

        UI.resultUnanswered.textContent =

            unanswered;

    }



    if(UI.resultTotal){

        UI.resultTotal.textContent =

            total;

    }



    createResultMessage();



    quizState.resultData = {

        total,

        correct,

        wrong,

        unanswered,

        percentage:

            quizState.percentage

    };



}


// ============================================================
// RESULT MESSAGE
// ============================================================

function createResultMessage(){


    if(!UI.resultMessage){

        return;

    }



    let message;



    if(

        quizState.percentage >= 80

    ){

        message =

        "Excellent performance! You are on the right track. Keep practising to maintain your score.";

    }

    else if(

        quizState.percentage >= 50

    ){

        message =

        "Good attempt! More practice will help you improve and achieve higher grades.";

    }

    else{

        message =

        "Keep practising. Aplus Tutors provides unlimited CBT practice to help you improve.";

    }



    UI.resultMessage.textContent =

        message;


}






// ============================================================
// CLEAR ANSWER
// ============================================================

function clearAnswer(){



    quizState.answers[

        quizState.currentQuestion

    ] = null;



    renderQuestion();



}



// ============================================================
// MARK FOR REVIEW
// ============================================================

function toggleReview(){



    const index =

        quizState.currentQuestion;



    quizState.review[index] =

        !quizState.review[index];



    updatePalette();



    if(UI.markReviewButton){


        if(

            quizState.review[index]

        ){

            UI.markReviewButton.classList.add(

                "active"

            );

            UI.markReviewButton.innerHTML =

                `

                <i class="bi bi-star-fill"></i>

                Remove Review

                `;


        }

        else{


            UI.markReviewButton.classList.remove(

                "active"

            );


            UI.markReviewButton.innerHTML =

                `

                <i class="bi bi-star"></i>

                Mark Review

                `;

        }


    }


}



// ============================================================
// CREATE QUESTION PALETTE
// ============================================================

function createQuestionPalette(){



    if(!UI.palette){

        return;

    }



    UI.palette.innerHTML = "";



    quizState.questions.forEach(

        (question,index)=>{


            const button =

                document.createElement(

                    "button"

                );



            button.className =

                "palette-btn";



            button.textContent =

                index + 1;



            button.addEventListener(

                "click",

                ()=>{

                    goToQuestion(index);

                }

            );



            UI.palette.appendChild(

                button

            );


        }

    );



}



