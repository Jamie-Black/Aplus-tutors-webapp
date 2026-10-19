// js/appwrite.js

const { ID, Query } = Appwrite;

// ===============================
// APPWRITE CLIENT
// ===============================

const client = new Appwrite.Client();

client
    .setEndpoint("https://nyc.cloud.appwrite.io/v1")
    .setProject("6a72288b002e599f824a");

// ===============================
// APPWRITE SERVICES
// ===============================

const account = new Appwrite.Account(client);

const tablesDB = new Appwrite.TablesDB(client);

// ===============================
// APPWRITE STORAGE
// ===============================

const storage =
    new Appwrite.Storage(client);

// ===============================
// DATABASE CONFIGURATION
// ===============================

const DATABASE_ID = "6a7229780032c26f0ce8";

const USERS_TABLE_ID = "users";

const SUBJECTS_TABLE_ID = "subjects";

const TOPICS_TABLE_ID = "topics";

const QUESTIONS_TABLE_ID = "questions";

const QUIZ_ATTEMPTS_TABLE_ID = "quiz_attempts";

const STUDY_NOTES_ID = "study_notes";

const QUIZ_ANSWERS_TABLE_ID = "quiz_answers";

// VIDEO LESSONS

const VIDEO_LESSONS_TABLE_ID = "6ac10e2e0008b4baea18";

const STUDY_NOTE_PROGRESS_TABLE_ID = "6ac8a45c003d8bc38a58";

const CBT_ATTEMPTS_TABLE_ID = "6acbb0dd002f4c86fce2";

const CBT_ANSWERS_TABLE_ID = "6acbe459003c1fe45a42";



//Media bucket

const PROFILE_PHOTOS_BUCKET_ID = "6aa1c8740005e3b99f09";


const QUESTION_IMAGES_BUCKET_ID = "6aa1c8740005e3b99f09";


const VIDEO_LESSONS_BUCKET_ID = "6aa1c8740005e3b99f09";