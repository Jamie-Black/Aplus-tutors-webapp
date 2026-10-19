/* =========================================================
   APLUS TUTORS
   ADMIN VIDEO LESSONS
   ========================================================= */


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const videoLessonForm =
    document.getElementById("videoLessonForm");

const videoSubject =
    document.getElementById("videoSubject");

const videoTopic =
    document.getElementById("videoTopic");

const videoTitle =
    document.getElementById("videoTitle");

const videoDescription =
    document.getElementById("videoDescription");

const videoFile =
    document.getElementById("videoFile");

const videoThumbnail =
    document.getElementById("videoThumbnail");

const videoOrder =
    document.getElementById("videoOrder");

const videoStatus =
    document.getElementById("videoStatus");

const uploadVideoBtn =
    document.getElementById("uploadVideoBtn");

const videoFormMessage =
    document.getElementById("videoFormMessage");

const videoUploadProgress =
    document.getElementById("videoUploadProgress");

const videoProgressText =
    document.getElementById("videoProgressText");

const videoProgressPercent =
    document.getElementById("videoProgressPercent");

const videoProgressBar =
    document.getElementById("videoProgressBar");

const videoLessonsContainer =
    document.getElementById("videoLessonsContainer");

const videoFilterSubject =
    document.getElementById("videoFilterSubject");

const refreshVideosBtn =
    document.getElementById("refreshVideosBtn");


/* =========================================================
   LOCAL DATA
   ========================================================= */

let videoSubjects = [];

let videoTopics = [];

let videoLessons = [];


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeVideosPage
);


async function initializeVideosPage() {

    try {

        await loadVideoSubjects();

        await loadVideoLessons();

        setupVideoEvents();

    } catch (error) {

        console.error(
            "Video page initialization error:",
            error
        );

        showVideoMessage(
            "Unable to load the video lessons page.",
            "error"
        );

    }

}


/* =========================================================
   EVENTS
   ========================================================= */

function setupVideoEvents() {

    if (videoSubject) {

        videoSubject.addEventListener(
            "change",
            handleVideoSubjectChange
        );

    }


    if (videoLessonForm) {

        videoLessonForm.addEventListener(
            "submit",
            handleVideoLessonSubmit
        );

    }


    if (videoFilterSubject) {

        videoFilterSubject.addEventListener(
            "change",
            renderVideoLessons
        );

    }


    if (refreshVideosBtn) {

        refreshVideosBtn.addEventListener(
            "click",
            async () => {

                refreshVideosBtn.disabled = true;

                await loadVideoLessons();

                refreshVideosBtn.disabled = false;

            }
        );

    }

}


/* =========================================================
   LOAD SUBJECTS
   ========================================================= */

async function loadVideoSubjects() {

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

    videoSubjects =
        response.rows || [];

    populateSubjectSelects();

}


/* =========================================================
   POPULATE SUBJECT SELECTS
   ========================================================= */

function populateSubjectSelects() {

    const uploadSelect =
        videoSubject;

    const filterSelect =
        videoFilterSubject;


    if (uploadSelect) {

        uploadSelect.innerHTML = `
            <option value="">
                Select subject
            </option>
        `;

    }


    if (filterSelect) {

        filterSelect.innerHTML = `
            <option value="">
                All subjects
            </option>
        `;

    }


    videoSubjects.forEach(
        subject => {

            const subjectName =
                subject.name ||
                subject.title ||
                "Unnamed Subject";


            if (uploadSelect) {

                const option =
                    document.createElement("option");

                option.value =
                    subject.$id;

                option.textContent =
                    subjectName;

                uploadSelect.appendChild(
                    option
                );

            }


            if (filterSelect) {

                const option =
                    document.createElement("option");

                option.value =
                    subject.$id;

                option.textContent =
                    subjectName;

                filterSelect.appendChild(
                    option
                );

            }

        }
    );

}


/* =========================================================
   SUBJECT CHANGE
   ========================================================= */

async function handleVideoSubjectChange() {

    const subjectId =
        videoSubject.value;


    videoTopic.innerHTML = `
        <option value="">
            Loading topics...
        </option>
    `;

    videoTopic.disabled = true;


    if (!subjectId) {

        videoTopic.innerHTML = `
            <option value="">
                Select a subject first
            </option>
        `;

        return;

    }


    try {

        const response =
            await tablesDB.listRows(
                DATABASE_ID,
                TOPICS_TABLE_ID,
                [
                    Query.equal(
                        "subjectId",
                        subjectId
                    ),
                    Query.orderAsc(
                        "name"
                    ),
                    Query.limit(100)
                ]
            );


        videoTopics =
            response.rows || [];


        videoTopic.innerHTML = `
            <option value="">
                Select topic
            </option>
        `;


        videoTopics.forEach(
            topic => {

                const topicName =
                    topic.name ||
                    topic.title ||
                    "Unnamed Topic";


                const option =
                    document.createElement("option");

                option.value =
                    topic.$id;

                option.textContent =
                    topicName;

                videoTopic.appendChild(
                    option
                );

            }
        );


        videoTopic.disabled =
            videoTopics.length === 0;


        if (videoTopics.length === 0) {

            videoTopic.innerHTML = `
                <option value="">
                    No topics found
                </option>
            `;

        }

    } catch (error) {

        console.error(
            "Error loading topics:",
            error
        );

        videoTopic.innerHTML = `
            <option value="">
                Unable to load topics
            </option>
        `;

    }

}


/* =========================================================
   HANDLE FORM SUBMIT
   ========================================================= */

async function handleVideoLessonSubmit(event) {

    event.preventDefault();


    clearVideoMessage();


    const subjectId =
        videoSubject.value.trim();

    const topicId =
        videoTopic.value.trim();

    const title =
        videoTitle.value.trim();

    const description =
        videoDescription.value.trim();

    const order =
        Number(videoOrder.value);

    const status =
        videoStatus.value;

    const selectedVideo =
        videoFile.files[0];

    const selectedThumbnail =
        videoThumbnail.files[0];


    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (!subjectId) {

        showVideoMessage(
            "Please select a subject.",
            "error"
        );

        return;

    }


    if (!topicId) {

        showVideoMessage(
            "Please select a topic.",
            "error"
        );

        return;

    }


    if (!title) {

        showVideoMessage(
            "Please enter a lesson title.",
            "error"
        );

        return;

    }


    if (!selectedVideo) {

        showVideoMessage(
            "Please select a video file.",
            "error"
        );

        return;

    }


    if (!order || order < 1) {

        showVideoMessage(
            "Lesson order must be at least 1.",
            "error"
        );

        return;

    }


    /* -----------------------------------------------------
       VIDEO TYPE
    ----------------------------------------------------- */

    const allowedVideoTypes = [
        "video/mp4",
        "video/webm",
        "video/ogg"
    ];


    if (
        selectedVideo.type &&
        !allowedVideoTypes.includes(
            selectedVideo.type
        )
    ) {

        showVideoMessage(
            "Please select an MP4, WebM or OGG video.",
            "error"
        );

        return;

    }


    /* -----------------------------------------------------
       START
    ----------------------------------------------------- */

    setVideoFormLoading(true);

    showVideoUploadProgress(
        "Uploading video...",
        0
    );


    try {

        /* =================================================
           UPLOAD VIDEO
           ================================================= */

        const videoFileId =
            ID.unique();


        const uploadedVideo =
            await storage.createFile(
                VIDEO_LESSONS_BUCKET_ID,
                videoFileId,
                selectedVideo
            );


        setVideoProgress(
            100,
            "Video uploaded"
        );


        /* =================================================
           THUMBNAIL
           ================================================= */

        let thumbnailFileId = "";


        if (selectedThumbnail) {

            showVideoUploadProgress(
                "Uploading thumbnail...",
                100
            );


            thumbnailFileId =
                ID.unique();


            await storage.createFile(
                VIDEO_LESSONS_BUCKET_ID,
                thumbnailFileId,
                selectedThumbnail
            );

        }


        /* =================================================
           SAVE LESSON
           ================================================= */

        showVideoUploadProgress(
            "Saving lesson information...",
            100
        );


        await tablesDB.createRow(
            DATABASE_ID,
            VIDEO_LESSONS_TABLE_ID,
            ID.unique(),
            {
                title: title,

                description: description,

                subjectId: subjectId,

                topicId: topicId,

                videoFileId:
                    uploadedVideo.$id,

                thumbnailFileId:
                    thumbnailFileId,

                duration: "",

                status: status,

                order: order
            }
        );


        /* =================================================
           SUCCESS
           ================================================= */

        showVideoUploadProgress(
            "Upload completed.",
            100
        );


        showVideoMessage(
            "Video lesson uploaded successfully.",
            "success"
        );


        resetVideoForm();


        await loadVideoLessons();


    } catch (error) {

        console.error(
            "Video upload error:",
            error
        );


        showVideoMessage(
            getVideoErrorMessage(error),
            "error"
        );


    } finally {

        setVideoFormLoading(false);

        setTimeout(
            hideVideoUploadProgress,
            1500
        );

    }

}


/* =========================================================
   LOAD VIDEO LESSONS
   ========================================================= */

async function loadVideoLessons() {

    if (!videoLessonsContainer) {
        return;
    }


    videoLessonsContainer.innerHTML = `
        <div class="video-list-loading">

            <div class="video-small-spinner"></div>

            <span>
                Loading video lessons...
            </span>

        </div>
    `;


    try {

        const response =
            await tablesDB.listRows(
                DATABASE_ID,
                VIDEO_LESSONS_TABLE_ID,
                [
                    Query.orderAsc("order"),
                    Query.limit(100)
                ]
            );


        videoLessons =
            response.rows || [];


        renderVideoLessons();

    } catch (error) {

        console.error(
            "Error loading video lessons:",
            error
        );


        videoLessonsContainer.innerHTML = `
            <div class="video-list-empty">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <span>
                    Unable to load video lessons.
                </span>

            </div>
        `;

    }

}


/* =========================================================
   RENDER VIDEO LESSONS
   ========================================================= */

function renderVideoLessons() {

    if (!videoLessonsContainer) {
        return;
    }


    const selectedSubject =
        videoFilterSubject
            ? videoFilterSubject.value
            : "";


    let lessons =
        [...videoLessons];


    if (selectedSubject) {

        lessons =
            lessons.filter(
                lesson =>
                    lesson.subjectId ===
                    selectedSubject
            );

    }


    if (!lessons.length) {

        videoLessonsContainer.innerHTML = `
            <div class="video-list-empty">

                <i class="fa-solid fa-video-slash"></i>

                <span>
                    No video lessons found.
                </span>

            </div>
        `;

        return;

    }


    videoLessonsContainer.innerHTML =
        lessons
            .map(
                lesson =>
                    createVideoLessonHTML(
                        lesson
                    )
            )
            .join("");


    attachVideoLessonActions();

}


/* =========================================================
   CREATE LESSON HTML
   ========================================================= */

function createVideoLessonHTML(
    lesson
) {

    const subject =
        getSubjectName(
            lesson.subjectId
        );


    const topic =
        getTopicName(
            lesson.topicId
        );


    const status =
        lesson.status ||
        "draft";


    const thumbnail =
        lesson.thumbnailFileId
            ? getFileViewUrl(
                lesson.thumbnailFileId
            )
            : "";


    const description =
        lesson.description ||
        "No description provided.";


    const safeTitle =
        escapeVideoHTML(
            lesson.title ||
            "Untitled Lesson"
        );


    const safeDescription =
        escapeVideoHTML(
            description
        );


    return `
        <article
            class="video-lesson-item"
            data-video-id="${lesson.$id}"
        >

            <div class="video-lesson-thumbnail">

                ${
                    thumbnail
                        ? `
                            <img
                                src="${thumbnail}"
                                alt=""
                            >
                        `
                        : `
                            <div class="video-placeholder-thumbnail">

                                <i class="fa-solid fa-play"></i>

                            </div>
                        `
                }

            </div>


            <div class="video-lesson-info">

                <h3>
                    ${safeTitle}
                </h3>


                <div class="video-lesson-meta">

                    <span class="video-meta-tag">
                        ${escapeVideoHTML(subject)}
                    </span>

                    <span class="video-meta-tag">
                        ${escapeVideoHTML(topic)}
                    </span>

                    <span
                        class="video-meta-tag status-${status}"
                    >
                        ${escapeVideoHTML(status)}
                    </span>

                    <span class="video-meta-tag">
                        Lesson ${lesson.order || 1}
                    </span>

                </div>


                <p class="video-lesson-description">
                    ${safeDescription}
                </p>

            </div>


            <div class="video-lesson-actions">

                <button
                    type="button"
                    class="video-action-btn"
                    data-action="open"
                    data-id="${lesson.$id}"
                    title="Open video"
                >

                    <i class="fa-solid fa-play"></i>

                </button>


                <button
                    type="button"
                    class="video-action-btn delete"
                    data-action="delete"
                    data-id="${lesson.$id}"
                    title="Delete lesson"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </article>
    `;

}


/* =========================================================
   ACTION BUTTONS
   ========================================================= */

function attachVideoLessonActions() {

    const buttons =
        document.querySelectorAll(
            ".video-action-btn"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const action =
                        button.dataset.action;

                    const id =
                        button.dataset.id;


                    if (action === "open") {

                        openVideoLesson(id);

                    }


                    if (action === "delete") {

                        await deleteVideoLesson(id);

                    }

                }
            );

        }
    );

}


/* =========================================================
   OPEN VIDEO
   ========================================================= */

function openVideoLesson(id) {

    const lesson =
        videoLessons.find(
            item =>
                item.$id === id
        );


    if (!lesson) {
        return;
    }


    if (!lesson.videoFileId) {

        showVideoMessage(
            "This lesson does not have a video file.",
            "error"
        );

        return;

    }


    const url =
        getFileViewUrl(
            lesson.videoFileId
        );


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   DELETE VIDEO LESSON
   ========================================================= */

async function deleteVideoLesson(id) {

    const lesson =
        videoLessons.find(
            item =>
                item.$id === id
        );


    if (!lesson) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete "${lesson.title}"?\n\nThis will remove the lesson record and its stored files.`
        );


    if (!confirmed) {
        return;
    }


    try {

        /* -------------------------------------------------
           DELETE VIDEO FILE
        ------------------------------------------------- */

        if (lesson.videoFileId) {

            try {

                await storage.deleteFile(
                    VIDEO_LESSONS_BUCKET_ID,
                    lesson.videoFileId
                );

            } catch (storageError) {

                console.warn(
                    "Video file deletion warning:",
                    storageError
                );

            }

        }


        /* -------------------------------------------------
           DELETE THUMBNAIL
        ------------------------------------------------- */

        if (lesson.thumbnailFileId) {

            try {

                await storage.deleteFile(
                    VIDEO_LESSONS_BUCKET_ID,
                    lesson.thumbnailFileId
                );

            } catch (storageError) {

                console.warn(
                    "Thumbnail deletion warning:",
                    storageError
                );

            }

        }


        /* -------------------------------------------------
           DELETE DATABASE ROW
        ------------------------------------------------- */

        await tablesDB.deleteRow(
            DATABASE_ID,
            VIDEO_LESSONS_TABLE_ID,
            lesson.$id
        );


        showVideoMessage(
            "Video lesson deleted successfully.",
            "success"
        );


        await loadVideoLessons();


    } catch (error) {

        console.error(
            "Delete video lesson error:",
            error
        );


        showVideoMessage(
            getVideoErrorMessage(error),
            "error"
        );

    }

}


/* =========================================================
   SUBJECT NAME
   ========================================================= */

function getSubjectName(
    subjectId
) {

    const subject =
        videoSubjects.find(
            item =>
                item.$id === subjectId
        );


    if (!subject) {
        return "Unknown subject";
    }


    return (
        subject.name ||
        subject.title ||
        "Unknown subject"
    );

}


/* =========================================================
   TOPIC NAME
   ========================================================= */

function getTopicName(
    topicId
) {

    const topic =
        videoTopics.find(
            item =>
                item.$id === topicId
        );


    if (topic) {

        return (
            topic.name ||
            topic.title ||
            "Unknown topic"
        );

    }


    for (
        const lesson of videoLessons
    ) {

        if (
            lesson.topicId ===
            topicId
        ) {

            return (
                lesson.topicName ||
                "Topic"
            );

        }

    }


    return "Topic";

}


/* =========================================================
   FILE VIEW URL
   ========================================================= */

function getFileViewUrl(
    fileId
) {

    return storage.getFileView(
        VIDEO_LESSONS_BUCKET_ID,
        fileId
    ).toString();

}


/* =========================================================
   FORM LOADING
   ========================================================= */

function setVideoFormLoading(
    loading
) {

    if (!uploadVideoBtn) {
        return;
    }


    uploadVideoBtn.disabled =
        loading;


    if (loading) {

        uploadVideoBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Uploading...
            </span>
        `;

    } else {

        uploadVideoBtn.innerHTML = `
            <i class="fa-solid fa-cloud-arrow-up"></i>

            <span>
                Upload Video Lesson
            </span>
        `;

    }

}


/* =========================================================
   RESET FORM
   ========================================================= */

function resetVideoForm() {

    if (!videoLessonForm) {
        return;
    }


    videoLessonForm.reset();


    videoTopic.innerHTML = `
        <option value="">
            Select a subject first
        </option>
    `;


    videoTopic.disabled = true;


    videoOrder.value = 1;

}


/* =========================================================
   PROGRESS
   ========================================================= */

function showVideoUploadProgress(
    text,
    percent
) {

    videoUploadProgress.hidden =
        false;


    setVideoProgress(
        percent,
        text
    );

}


function setVideoProgress(
    percent,
    text
) {

    const safePercent =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );


    videoProgressText.textContent =
        text;


    videoProgressPercent.textContent =
        `${safePercent}%`;


    videoProgressBar.style.width =
        `${safePercent}%`;

}


function hideVideoUploadProgress() {

    videoUploadProgress.hidden =
        true;

}


/* =========================================================
   MESSAGE
   ========================================================= */

function showVideoMessage(
    message,
    type = "info"
) {

    if (!videoFormMessage) {
        return;
    }


    videoFormMessage.hidden =
        false;


    videoFormMessage.className =
        `video-form-message ${type}`;


    videoFormMessage.textContent =
        message;

}


function clearVideoMessage() {

    if (!videoFormMessage) {
        return;
    }


    videoFormMessage.hidden =
        true;

    videoFormMessage.textContent = "";

    videoFormMessage.className =
        "video-form-message";

}


/* =========================================================
   ERROR MESSAGE
   ========================================================= */

function getVideoErrorMessage(
    error
) {

    if (
        error &&
        error.message
    ) {

        return error.message;

    }


    return "Something went wrong. Please try again.";

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeVideoHTML(
    value
) {

    return String(
        value ?? ""
    )
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