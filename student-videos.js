"use strict";

/* =========================================================
   APLUS TUTORS
   STUDENT VIDEO LESSONS

   PHASE 2
   VIDEO PLAYER
   ========================================================= */


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const studentVideoLessons =
    document.getElementById(
        "studentVideoLessons"
    );

const videoSubjectFilter =
    document.getElementById(
        "videoSubjectFilter"
    );

const videoLessonCount =
    document.getElementById(
        "videoLessonCount"
    );

const videoPageMessage =
    document.getElementById(
        "videoPageMessage"
    );


/* =========================================================
   LOCAL DATA
   ========================================================= */

let studentVideoSubjects = [];

let studentVideoTopics = [];

let studentVideoLessonsData = [];

let currentStudentVideoId = null;


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeStudentVideos
);


async function initializeStudentVideos() {

    try {

        await loadStudentVideoSubjects();

        await loadStudentVideoLessons();

        setupStudentVideoEvents();

        hideStudentVideosPageLoader();

    } catch (error) {

        console.error(
            "Student videos initialization error:",
            error
        );

        showStudentVideoMessage(
            "Unable to load your video lessons. Please try again.",
            "error"
        );

        hideStudentVideosPageLoader();

    }

}


/* =========================================================
   EVENTS
   ========================================================= */

function setupStudentVideoEvents() {

    if (videoSubjectFilter) {

        videoSubjectFilter.addEventListener(
            "change",
            handleVideoSubjectFilter
        );

    }


    if (studentVideoLessons) {

        studentVideoLessons.addEventListener(
            "click",
            handleStudentVideoClick
        );

    }


    document.addEventListener(
        "keydown",
        handleStudentVideoKeyboard
    );

}


/* =========================================================
   VIDEO CARD CLICK HANDLER
   ========================================================= */

function handleStudentVideoClick(event) {

    const watchButton =
        event.target.closest(
            ".student-watch-video-btn"
        );

    const thumbnail =
        event.target.closest(
            ".student-video-thumbnail"
        );

    const card =
        event.target.closest(
            ".student-video-card"
        );


    if (!card) {
        return;
    }


    const videoId =
        card.dataset.videoId;


    if (!videoId) {
        return;
    }


    if (watchButton) {

        openStudentVideoPlayer(
            videoId
        );

        return;

    }


    if (thumbnail) {

        openStudentVideoPlayer(
            videoId
        );

    }

}


/* =========================================================
   KEYBOARD HANDLER
   ========================================================= */

function handleStudentVideoKeyboard(event) {

    if (
        event.key === "Escape" &&
        currentStudentVideoId
    ) {

        closeStudentVideoPlayer();

    }

}


/* =========================================================
   LOAD ACTIVE SUBJECTS
   ========================================================= */

async function loadStudentVideoSubjects() {

    try {

        const response =
            await tablesDB.listRows(
                DATABASE_ID,
                SUBJECTS_TABLE_ID,
                [
                    Query.equal(
                        "status",
                        "active"
                    ),

                    Query.orderAsc(
                        "name"
                    ),

                    Query.limit(100)
                ]
            );


        studentVideoSubjects =
            response.rows || [];


        populateStudentVideoSubjectFilter();


    } catch (error) {

        console.error(
            "Error loading video subjects:",
            error
        );


        studentVideoSubjects = [];

    }

}


/* =========================================================
   POPULATE SUBJECT FILTER
   ========================================================= */

function populateStudentVideoSubjectFilter() {

    if (!videoSubjectFilter) {
        return;
    }


    videoSubjectFilter.innerHTML = `
        <option value="">
            All subjects
        </option>
    `;


    studentVideoSubjects.forEach(
        subject => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                subject.$id;


            option.textContent =
                subject.name ||
                subject.title ||
                "Unnamed Subject";


            videoSubjectFilter.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   LOAD PUBLISHED VIDEO LESSONS
   ========================================================= */

async function loadStudentVideoLessons() {

    if (!studentVideoLessons) {
        return;
    }


    showStudentVideoLoading();


    try {

        const response =
            await tablesDB.listRows(
                DATABASE_ID,
                VIDEO_LESSONS_TABLE_ID,
                [

                    Query.equal(
                        "status",
                        "published"
                    ),

                    Query.orderAsc(
                        "order"
                    ),

                    Query.limit(100)

                ]
            );


        studentVideoLessonsData =
            response.rows || [];


        await loadStudentVideoTopics();

        renderStudentVideoLessons();

        hideStudentVideoLoading();


    } catch (error) {

        console.error(
            "Error loading student video lessons:",
            error
        );


        studentVideoLessonsData = [];

        hideStudentVideoLoading();


        showStudentVideoError(
            "Unable to load video lessons. Please try again."
        );

    }

}


/* =========================================================
   LOAD TOPICS
   ========================================================= */

async function loadStudentVideoTopics() {

    try {

        const response =
            await tablesDB.listRows(
                DATABASE_ID,
                TOPICS_TABLE_ID,
                [
                    Query.orderAsc(
                        "name"
                    ),

                    Query.limit(100)
                ]
            );


        studentVideoTopics =
            response.rows || [];


    } catch (error) {

        console.error(
            "Error loading video topics:",
            error
        );


        studentVideoTopics = [];

    }

}


/* =========================================================
   SUBJECT FILTER
   ========================================================= */

function handleVideoSubjectFilter() {

    renderStudentVideoLessons();

}


/* =========================================================
   RENDER VIDEO LESSONS
   ========================================================= */

function renderStudentVideoLessons() {

    if (!studentVideoLessons) {
        return;
    }


    const selectedSubject =
        videoSubjectFilter
            ? videoSubjectFilter.value
            : "";


    let lessons =
        [...studentVideoLessonsData];


    if (selectedSubject) {

        lessons =
            lessons.filter(
                lesson =>
                    lesson.subjectId ===
                    selectedSubject
            );

    }


    updateStudentVideoCount(
        lessons.length
    );


    if (!lessons.length) {

        showStudentVideoEmpty();

        return;

    }


    studentVideoLessons.innerHTML =
        lessons
            .map(
                lesson =>
                    createStudentVideoCard(
                        lesson
                    )
            )
            .join("");

}


/* =========================================================
   CREATE VIDEO CARD
   ========================================================= */

function createStudentVideoCard(lesson) {

    const title =
        lesson.title ||
        "Untitled Lesson";


    const description =
        lesson.description ||
        "Watch this lesson to strengthen your understanding.";


    const subject =
        getStudentVideoSubjectName(
            lesson.subjectId
        );


    const topic =
        getStudentVideoTopicName(
            lesson.topicId
        );


    const thumbnail =
        lesson.thumbnailFileId
            ? getStudentVideoFileUrl(
                lesson.thumbnailFileId
            )
            : "";


    const safeTitle =
        escapeStudentVideoHTML(
            title
        );


    const safeDescription =
        escapeStudentVideoHTML(
            description
        );


    const safeSubject =
        escapeStudentVideoHTML(
            subject
        );


    const safeTopic =
        escapeStudentVideoHTML(
            topic
        );


    const thumbnailHTML =
        thumbnail
            ? `
                <img
                    src="${thumbnail}"
                    alt="${safeTitle}"
                    class="student-video-thumbnail-image"
                    loading="lazy"
                >
            `
            : `
                <div class="student-video-placeholder">

                    <i class="fa-solid fa-circle-play"></i>

                </div>
            `;


    return `
        <article
            class="student-video-card"
            data-video-id="${lesson.$id}"
        >

            <div class="student-video-thumbnail">

                ${thumbnailHTML}

                <div class="student-video-play">

                    <i class="fa-solid fa-play"></i>

                </div>

                <span class="student-video-lesson-number">
                    Lesson ${lesson.order || 1}
                </span>

            </div>


            <div class="student-video-card-content">

                <div class="student-video-meta">

                    <span>
                        ${safeSubject}
                    </span>

                    ${
                        safeTopic
                            ? `
                                <span>
                                    ${safeTopic}
                                </span>
                            `
                            : ""
                    }

                </div>


                <h2 class="student-video-title">
                    ${safeTitle}
                </h2>


                <p class="student-video-description">
                    ${safeDescription}
                </p>


                <button
                    type="button"
                    class="student-watch-video-btn"
                    data-video-id="${lesson.$id}"
                >

                    <i class="fa-solid fa-play"></i>

                    <span>
                        Watch Lesson
                    </span>

                </button>

            </div>

        </article>
    `;

}


/* =========================================================
   OPEN VIDEO PLAYER
   ========================================================= */

function openStudentVideoPlayer(videoId) {

    const lesson =
        studentVideoLessonsData.find(
            item =>
                item.$id === videoId
        );


    if (!lesson) {

        showStudentVideoMessage(
            "The selected video lesson could not be found.",
            "error"
        );

        return;

    }


    if (!lesson.videoFileId) {

        showStudentVideoMessage(
            "This lesson does not have a video file.",
            "error"
        );

        return;

    }


    currentStudentVideoId =
        videoId;


    createStudentVideoPlayer(
        lesson
    );


    document.body.classList.add(
        "student-video-player-open"
    );

}


/* =========================================================
   CREATE VIDEO PLAYER
   ========================================================= */

function createStudentVideoPlayer(lesson) {

    removeExistingStudentVideoPlayer();


    const videoUrl =
        getStudentVideoFileUrl(
            lesson.videoFileId
        );


    const thumbnailUrl =
        lesson.thumbnailFileId
            ? getStudentVideoFileUrl(
                lesson.thumbnailFileId
            )
            : "";


    const title =
        escapeStudentVideoHTML(
            lesson.title ||
            "Video Lesson"
        );


    const description =
        escapeStudentVideoHTML(
            lesson.description ||
            "No description provided."
        );


    const subject =
        escapeStudentVideoHTML(
            getStudentVideoSubjectName(
                lesson.subjectId
            )
        );


    const topic =
        escapeStudentVideoHTML(
            getStudentVideoTopicName(
                lesson.topicId
            )
        );


    const player =
        document.createElement(
            "div"
        );


    player.id =
        "studentVideoPlayer";


    player.className =
        "student-video-player";


    player.innerHTML = `

        <div
            class="student-video-player-backdrop"
            data-player-close="true"
        ></div>


        <div
            class="student-video-player-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="${title}"
        >

            <div class="student-video-player-header">

                <div class="student-video-player-heading">

                    <span class="student-video-player-icon">

                        <i class="fa-solid fa-play"></i>

                    </span>


                    <div>

                        <span class="student-video-player-label">
                            Now Watching
                        </span>

                        <h2>
                            ${title}
                        </h2>

                    </div>

                </div>


                <button
                    type="button"
                    class="student-video-player-close"
                    id="closeStudentVideoPlayer"
                    aria-label="Close video"
                >

                    <i class="fa-solid fa-xmark"></i>

                </button>

            </div>


            <div class="student-video-player-video-wrapper">

                <video
                    id="studentVideoElement"
                    class="student-video-element"
                    controls
                    playsinline
                    preload="metadata"
                    ${
                        thumbnailUrl
                            ? `poster="${thumbnailUrl}"`
                            : ""
                    }
                >

                    <source
                        src="${videoUrl}"
                        type="video/mp4"
                    >

                    Your browser does not support
                    HTML5 video playback.

                </video>

            </div>


            <div class="student-video-player-information">

                <div class="student-video-player-meta">

                    <span>

                        <i class="fa-solid fa-book"></i>

                        ${subject}

                    </span>


                    ${
                        topic
                            ? `
                                <span>

                                    <i class="fa-solid fa-list"></i>

                                    ${topic}

                                </span>
                            `
                            : ""
                    }


                    <span>

                        <i class="fa-solid fa-layer-group"></i>

                        Lesson ${lesson.order || 1}

                    </span>

                </div>


                <div class="student-video-player-description">

                    <h3>
                        About this lesson
                    </h3>

                    <p>
                        ${description}
                    </p>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        player
    );


    const closeButton =
        document.getElementById(
            "closeStudentVideoPlayer"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeStudentVideoPlayer
        );

    }


    const backdrop =
        player.querySelector(
            ".student-video-player-backdrop"
        );


    if (backdrop) {

        backdrop.addEventListener(
            "click",
            closeStudentVideoPlayer
        );

    }


    requestAnimationFrame(
        () => {

            player.classList.add(
                "visible"
            );

        }
    );


    player.scrollTop = 0;

}


/* =========================================================
   CLOSE PLAYER
   ========================================================= */

function closeStudentVideoPlayer() {

    const player =
        document.getElementById(
            "studentVideoPlayer"
        );


    if (!player) {

        currentStudentVideoId =
            null;

        document.body.classList.remove(
            "student-video-player-open"
        );

        return;

    }


    const video =
        document.getElementById(
            "studentVideoElement"
        );


    if (video) {

        video.pause();

        video.removeAttribute(
            "src"
        );

        const source =
            video.querySelector(
                "source"
            );

        if (source) {

            source.removeAttribute(
                "src"
            );

        }

        video.load();

    }


    player.classList.remove(
        "visible"
    );


    setTimeout(
        () => {

            if (player) {
                player.remove();
            }

        },
        220
    );


    currentStudentVideoId =
        null;


    document.body.classList.remove(
        "student-video-player-open"
    );

}


/* =========================================================
   REMOVE EXISTING PLAYER
   ========================================================= */

function removeExistingStudentVideoPlayer() {

    const existingPlayer =
        document.getElementById(
            "studentVideoPlayer"
        );


    if (!existingPlayer) {
        return;
    }


    const video =
        existingPlayer.querySelector(
            "video"
        );


    if (video) {

        video.pause();

        video.removeAttribute(
            "src"
        );

        const source =
            video.querySelector(
                "source"
            );

        if (source) {

            source.removeAttribute(
                "src"
            );

        }

        video.load();

    }


    existingPlayer.remove();

}

/* =========================================================
   SUBJECT NAME
   ========================================================= */

function getStudentVideoSubjectName(subjectId) {

    const subject =
        studentVideoSubjects.find(
            item =>
                item.$id === subjectId
        );


    return subject
        ? (
            subject.name ||
            subject.title ||
            "Unnamed Subject"
        )
        : "General";

}


/* =========================================================
   TOPIC NAME
   ========================================================= */

function getStudentVideoTopicName(topicId) {

    if (!topicId) {
        return "";
    }


    const topic =
        studentVideoTopics.find(
            item =>
                item.$id === topicId
        );


    return topic
        ? (
            topic.name ||
            topic.title ||
            ""
        )
        : "";

}


/* =========================================================
   VIDEO FILE URL
   ========================================================= */

function getStudentVideoFileUrl(fileId) {

    if (!fileId) {
        return "";
    }


    return storage.getFileView(
        VIDEO_LESSONS_BUCKET_ID,
        fileId
    );

}


/* =========================================================
   PAGE MESSAGE
   ========================================================= */

function showStudentVideoMessage(
    message,
    type = "info"
) {

    if (!videoPageMessage) {
        return;
    }


    videoPageMessage.className =
        "student-video-page-message";


    if (type === "error") {

        videoPageMessage.classList.add(
            "student-video-message-error"
        );

    } else if (type === "success") {

        videoPageMessage.classList.add(
            "student-video-message-success"
        );

    } else if (type === "warning") {

        videoPageMessage.classList.add(
            "student-video-message-warning"
        );

    }


    videoPageMessage.textContent =
        message;


    videoPageMessage.style.display =
        message
            ? "block"
            : "none";

}


/* =========================================================
   HIDE PAGE MESSAGE
   ========================================================= */

function hideStudentVideoMessage() {

    if (!videoPageMessage) {
        return;
    }


    videoPageMessage.textContent =
        "";


    videoPageMessage.style.display =
        "none";

}


/* =========================================================
   LOADING STATE
   ========================================================= */

function showStudentVideoLoading() {

    if (!studentVideoLessons) {
        return;
    }


    studentVideoLessons.innerHTML = `
        <div class="student-video-loading">

            <div class="student-video-spinner"></div>

            <p>
                Loading video lessons...
            </p>

        </div>
    `;

}


/* =========================================================
   HIDE LOADING STATE
   ========================================================= */

function hideStudentVideoLoading() {

    if (!studentVideoLessons) {
        return;
    }


    const loading =
        studentVideoLessons.querySelector(
            ".student-video-loading"
        );


    if (loading) {
        loading.remove();
    }

}


/* =========================================================
   PAGE LOADER
   ========================================================= */

function hideStudentVideosPageLoader() {

    const loader =
        document.getElementById(
            "pageLoader"
        );


    if (!loader) {
        return;
    }


    loader.classList.add(
        "hidden"
    );


    setTimeout(
        () => {

            loader.style.display =
                "none";

        },
        300
    );

}


/* =========================================================
   SHOW PAGE LOADER
   ========================================================= */

function showStudentVideosPageLoader() {

    const loader =
        document.getElementById(
            "pageLoader"
        );


    if (!loader) {
        return;
    }


    loader.style.display =
        "flex";


    requestAnimationFrame(
        () => {

            loader.classList.remove(
                "hidden"
            );

        }
    );

}


/* =========================================================
   VIDEO LESSON COUNT
   ========================================================= */

function updateStudentVideoCount(count) {

    if (!videoLessonCount) {
        return;
    }


    const total =
        Number(count) || 0;


    videoLessonCount.textContent =
        `${total} ${
            total === 1
                ? "lesson"
                : "lessons"
        }`;

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function showStudentVideoEmpty() {

    if (!studentVideoLessons) {
        return;
    }


    studentVideoLessons.innerHTML = `
        <div class="student-video-empty-state">

            <div class="student-video-empty-icon">

                <i class="fa-solid fa-video-slash"></i>

            </div>


            <h3>
                No video lessons available
            </h3>


            <p>
                There are no published video lessons
                available for your selection yet.
            </p>

        </div>
    `;

}


/* =========================================================
   ERROR STATE
   ========================================================= */

function showStudentVideoError(message) {

    if (!studentVideoLessons) {
        return;
    }


    studentVideoLessons.innerHTML = `
        <div class="student-video-error-state">

            <div class="student-video-error-icon">

                <i class="fa-solid fa-triangle-exclamation"></i>

            </div>


            <h3>
                Something went wrong
            </h3>


            <p>
                ${escapeStudentVideoHTML(message)}
            </p>


            <button
                type="button"
                class="student-video-retry-btn"
                id="studentVideoRetryBtn"
            >

                <i class="fa-solid fa-rotate-right"></i>

                Try Again

            </button>

        </div>
    `;


    const retryButton =
        document.getElementById(
            "studentVideoRetryBtn"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadStudentVideoLessons
        );

    }

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeStudentVideoHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

           