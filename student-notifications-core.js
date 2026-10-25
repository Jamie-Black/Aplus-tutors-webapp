"use strict";

/* =========================================================
   APLUS TUTORS
   STUDENT NOTIFICATIONS
   BATCH 1 — CORE NOTIFICATION LOGIC

   Dependencies:
   - js/appwrite.js
   - Student authentication
   - Existing users table
   - notifications table
   - notification_reads table
========================================================= */


/* =========================================================
   1. NOTIFICATION STATE
========================================================= */

let studentNotifications = [];

let studentNotificationReads = [];

let studentNotificationLoading = false;


/* =========================================================
   2. CURRENT STUDENT HELPERS
========================================================= */

/**
 * Returns the authenticated student's profile.
 *
 * The dashboard currently assigns event.detail.user
 * to currentStudent.
 */
function getNotificationStudent() {

    if (
        typeof currentStudent !== "undefined" &&
        currentStudent
    ) {
        return currentStudent;
    }

    if (window.aplusUser) {
        return window.aplusUser;
    }

    return null;
}


/**
 * Gets the student's profile document ID.
 *
 * Individual notifications currently use the student
 * profile document ID in their studentId field.
 */
function getNotificationStudentId() {

    const student = getNotificationStudent();

    return (
        student?.$id ||
        student?.profileId ||
        student?.userId ||
        ""
    );
}


/**
 * Normalize text for consistent comparisons.
 */
function normalizeStudentNotificationValue(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase();

}


/**
 * Normalize department names.
 *
 * Science and Sciences are treated as equivalent.
 */
function normalizeStudentNotificationDepartment(value) {

    const department =
        normalizeStudentNotificationValue(value);

    if (
        department === "science" ||
        department === "sciences"
    ) {
        return "science";
    }

    return department;

}


/* =========================================================
   3. NOTIFICATION AUDIENCE FILTERING
========================================================= */

/**
 * Determines whether a notification is intended
 * for the currently authenticated student.
 */
function studentCanReceiveNotification(notification) {

    const student = getNotificationStudent();

    if (!student) {
        return false;
    }

    const audience = normalizeStudentNotificationValue(
        notification.audienceType || "all"
    );

    const studentId = getNotificationStudentId();

    const studentDepartment =
        normalizeStudentNotificationDepartment(
            student.department
        );

    /*
     * Notifications for all students.
     */
    if (
        audience === "all" ||
        audience === "all_students"
    ) {
        return true;
    }

    /*
     * Department-specific notifications.
     */
    if (audience === "department") {

        const notificationDepartment =
            normalizeStudentNotificationDepartment(
                notification.department
            );

        return Boolean(
            studentDepartment &&
            notificationDepartment &&
            studentDepartment === notificationDepartment
        );

    }

    /*
     * Individual student notifications.
     */
    if (audience === "individual") {

        return Boolean(
            studentId &&
            notification.studentId &&
            String(notification.studentId) ===
                String(studentId)
        );

    }

    return false;

}


/* =========================================================
   4. EXPIRY CHECK
========================================================= */

/**
 * A notification with no expiry date remains eligible
 * until its status changes.
 */
function isStudentNotificationExpired(notification) {

    if (!notification.expiresAt) {
        return false;
    }

    const expiryDate = new Date(
        notification.expiresAt
    );

    if (Number.isNaN(expiryDate.getTime())) {
        return false;
    }

    return expiryDate <= new Date();

}


/* =========================================================
   5. LOAD NOTIFICATION READ RECORDS
========================================================= */

async function loadStudentNotificationReads() {

    const studentId = getNotificationStudentId();

    if (!studentId) {

        throw new Error(
            "Unable to identify the student profile."
        );

    }

    const response = await tablesDB.listRows(
        DATABASE_ID,
        NOTIFICATION_READS_TABLE_ID,
        [
            Query.equal("studentId", studentId),
            Query.limit(500)
        ]
    );

    studentNotificationReads = response.rows || [];

    return studentNotificationReads;

}


/* =========================================================
   6. FIND A READ RECORD
========================================================= */

function findStudentNotificationRead(notificationId) {

    return studentNotificationReads.find(
        record =>
            String(record.notificationId) ===
            String(notificationId)
    ) || null;

}


/* =========================================================
   7. CHECK READ STATUS
========================================================= */

function isStudentNotificationRead(notificationId) {

    const readRecord =
        findStudentNotificationRead(notificationId);

    if (!readRecord) {
        return false;
    }

    const value = readRecord.isRead;

    return (
        value === true ||
        value === 1 ||
        value === "true"
    );

}


/* =========================================================
   8. LOAD PUBLISHED NOTIFICATIONS
========================================================= */

async function loadStudentNotifications() {

    if (studentNotificationLoading) {
        return studentNotifications;
    }

    studentNotificationLoading = true;

    try {

        const student = getNotificationStudent();

        if (!student) {

            throw new Error(
                "Student authentication is not ready."
            );

        }

        const studentId = getNotificationStudentId();

        if (!studentId) {

            throw new Error(
                "The authenticated student profile ID is missing."
            );

        }

        /*
         * Load notifications and read records.
         *
         * Both requests use the existing Appwrite
         * database configuration.
         */
        const [
            notificationResponse
        ] = await Promise.all([

            tablesDB.listRows(
                DATABASE_ID,
                NOTIFICATIONS_TABLE_ID,
                [
                    Query.equal("status", "published"),
                    Query.orderDesc("$createdAt"),
                    Query.limit(500)
                ]
            )

        ]);

        /*
         * Load the student's read records.
         */
        await loadStudentNotificationReads();

        const rows =
            notificationResponse.rows || [];
            
        console.log(
    "[Aplus Notifications] Current student:",
    getNotificationStudent()
);

console.log(
    "[Aplus Notifications] Student profile ID:",
    getNotificationStudentId()
);

console.log(
    "[Aplus Notifications] Raw published notifications from Appwrite:",
    rows
);

console.log(
    "[Aplus Notifications] Total raw notification records:",
    rows.length
);

console.table(
    rows.map(notification => ({
        id: notification.$id,
        title: notification.title,
        status: notification.status,
        audienceType: notification.audienceType,
        department: notification.department,
        studentId: notification.studentId,
        expiresAt: notification.expiresAt
    }))
);
        /*
         * Filter for the current student's audience
         * and remove expired notifications.
         */
        studentNotifications = rows.filter(
            notification => {

                return (
                    normalizeStudentNotificationValue(
                        notification.status
                    ) === "published" &&

                    studentCanReceiveNotification(
                        notification
                    ) &&

                    !isStudentNotificationExpired(
                        notification
                    )
                );

            }
        );

        /*
         * Most recent notifications first.
         */
        studentNotifications.sort(
            (a, b) => {

                const dateA = new Date(
                    a.publishedAt ||
                    a.$createdAt ||
                    0
                ).getTime();

                const dateB = new Date(
                    b.publishedAt ||
                    b.$createdAt ||
                    0
                ).getTime();

                return dateB - dateA;

            }
        );

        /*
         * Notify the dashboard and notification page
         * that fresh data is available.
         */
        document.dispatchEvent(
            new CustomEvent(
                "aplusStudentNotificationsLoaded",
                {
                    detail: {
                        notifications:
                            studentNotifications,

                        unreadCount:
                            getStudentUnreadNotificationCount()
                    }
                }
            )
        );

        return studentNotifications;

    } catch (error) {

        console.error(
            "Aplus Tutors: Failed to load student notifications:",
            error
        );

        throw error;

    } finally {

        studentNotificationLoading = false;

    }

}


/* =========================================================
   9. UNREAD COUNT
========================================================= */

function getStudentUnreadNotificationCount() {

    return studentNotifications.filter(
        notification =>
            !isStudentNotificationRead(
                notification.$id
            )
    ).length;

}


/* =========================================================
   10. MARK A NOTIFICATION AS READ
========================================================= */

async function markStudentNotificationAsRead(notificationId) {

    const studentId = getNotificationStudentId();

    if (!studentId) {
        throw new Error(
            "Unable to identify the student profile."
        );
    }

    const notification = studentNotifications.find(
        item => String(item.$id) === String(notificationId)
    );

    if (!notification) {
        throw new Error(
            "The notification could not be found."
        );
    }

    const existingRecord =
        findStudentNotificationRead(notificationId);

    if (isStudentNotificationRead(notificationId)) {
        return existingRecord;
    }

    const data = {
        notificationId: String(notificationId),
        studentId: String(studentId),
        isRead: true,
        readAt: new Date().toISOString()
    };

    let savedRecord;

    if (existingRecord) {

        savedRecord = await tablesDB.updateRow(
            DATABASE_ID,
            NOTIFICATION_READS_TABLE_ID,
            existingRecord.$id,
            data
        );

        studentNotificationReads =
            studentNotificationReads.map(record =>
                record.$id === existingRecord.$id
                    ? savedRecord
                    : record
            );

    } else {

        savedRecord = await tablesDB.createRow(
            DATABASE_ID,
            NOTIFICATION_READS_TABLE_ID,
            ID.unique(),
            data
        );

        studentNotificationReads.push(savedRecord);

    }

    // Refresh the unread badge immediately.
    updateStudentNotificationCount();

    // Notify other components.
    document.dispatchEvent(
        new CustomEvent(
            "aplusStudentNotificationReadUpdated",
            {
                detail: {
                    notificationId: String(notificationId),
                    unreadCount: getStudentUnreadNotificationCount()
                }
            }
        )
    );

    return savedRecord;
}


/* =========================================================
   11. MARK ALL NOTIFICATIONS AS READ
========================================================= */

async function markAllStudentNotificationsAsRead() {

    const unreadNotifications =
        studentNotifications.filter(
            notification =>
                !isStudentNotificationRead(notification.$id)
        );

    for (const notification of unreadNotifications) {

        await markStudentNotificationAsRead(
            notification.$id
        );

    }

    updateStudentNotificationCount();

    document.dispatchEvent(
        new CustomEvent(
            "aplusStudentNotificationsReadAll",
            {
                detail: {
                    unreadCount: getStudentUnreadNotificationCount()
                }
            }
        )
    );

    return getStudentUnreadNotificationCount();
}


/* =========================================================
   12. FORMAT NOTIFICATION DATE
========================================================= */

function formatStudentNotificationDate(value) {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString(
        "en-NG",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}

/* =========================================================
   APLUS TUTORS
   STUDENT NOTIFICATIONS
   BATCH 2 — PANEL, RENDERING AND INITIALIZATION
========================================================= */


/* =========================================================
   1. NOTIFICATION ELEMENTS
========================================================= */

let studentNotificationElements = {
    trigger: null,
    panel: null,
    count: null,
    headerCount: null,
    list: null,
    footer: null
};

let studentNotificationPanelInitialized = false;


/* =========================================================
   2. REFRESH DYNAMIC ELEMENT REFERENCES
========================================================= */

function refreshStudentNotificationElements() {

    studentNotificationElements = {
        trigger: document.getElementById(
            "studentNotificationTrigger"
        ),

        panel: document.getElementById(
            "studentNotificationPanel"
        ),

        count: document.getElementById(
            "studentNotificationCount"
        ),

        headerCount: document.getElementById(
            "studentNotificationHeaderCount"
        ),

        list: document.getElementById(
            "studentNotificationList"
        ),

        footer: document.getElementById(
            "studentNotificationFooterText"
        )
    };

    return studentNotificationElements;
}


/* =========================================================
   3. UPDATE UNREAD COUNT
========================================================= */

function updateStudentNotificationCount() {

    refreshStudentNotificationElements();

    const unreadCount =
        getStudentUnreadNotificationCount();

    const countElement =
        studentNotificationElements.count;

    const headerCountElement =
        studentNotificationElements.headerCount;

    if (countElement) {

        countElement.textContent =
            unreadCount > 99
                ? "99+"
                : String(unreadCount);

        countElement.hidden =
            unreadCount === 0;

    }

    if (headerCountElement) {

        headerCountElement.textContent =
            String(unreadCount);

    }

}


/* =========================================================
   4. ESCAPE HTML
========================================================= */

function escapeStudentNotificationHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   5. RENDER NOTIFICATION LIST
========================================================= */

function renderStudentNotificationList() {

    refreshStudentNotificationElements();

    const list =
        studentNotificationElements.list;

    if (!list) {

        console.error(
            "[Aplus Notifications] Notification list element is missing."
        );

        return;

    }

    updateStudentNotificationCount();

    console.log(
        "[Aplus Notifications] Notifications available for display:",
        studentNotifications.length
    );

    if (studentNotifications.length === 0) {

        list.innerHTML = `
            <div class="student-notification-empty">

                <i
                    class="fa-regular fa-bell-slash"
                    aria-hidden="true">
                </i>

                <h5>No notifications yet</h5>

                <p>
                    New updates from Aplus Tutors
                    will appear here.
                </p>

            </div>
        `;

        return;

    }

    list.innerHTML = studentNotifications
        .map(notification => {

            const isRead =
                isStudentNotificationRead(
                    notification.$id
                );

            const title =
                escapeStudentNotificationHTML(
                    notification.title || "Notification"
                );

            const message =
                escapeStudentNotificationHTML(
                    notification.message || ""
                );

            const date =
                escapeStudentNotificationHTML(
                    formatStudentNotificationDate(
                        notification.publishedAt ||
                        notification.$createdAt
                    )
                );

            const id =
                escapeStudentNotificationHTML(
                    notification.$id
                );

            return `
                <button
                    type="button"
                    class="student-notification-item ${
                        isRead ? "is-read" : "is-unread"
                    }"
                    data-notification-id="${id}"
                >

                    <span class="student-notification-item-icon">
                        <i
                            class="fa-solid fa-bell"
                            aria-hidden="true">
                        </i>
                    </span>

                    <span class="student-notification-item-content">

                        <span class="student-notification-item-title">
                            ${title}
                        </span>

                        <span class="student-notification-item-message">
                            ${message}
                        </span>

                        <span class="student-notification-item-date">
                            ${date}
                        </span>

                    </span>

                    ${
                        !isRead
                            ? `
                                <span
                                    class="student-notification-unread-dot"
                                    aria-label="Unread">
                                </span>
                            `
                            : ""
                    }

                </button>
            `;

        })
        .join("");

}


/* =========================================================
   6. SHOW LOADING ERROR
========================================================= */

function showStudentNotificationLoadError() {

    refreshStudentNotificationElements();

    const list =
        studentNotificationElements.list;

    if (!list) {
        return;
    }

    list.innerHTML = `
        <div class="student-notification-error">

            <i
                class="fa-solid fa-triangle-exclamation"
                aria-hidden="true">
            </i>

            <p>Unable to load notifications.</p>

            <button
                type="button"
                id="retryStudentNotifications"
                class="btn btn-sm btn-outline-dark">

                Try again

            </button>

        </div>
    `;

}


/* =========================================================
   7. OPEN NOTIFICATION PANEL
========================================================= */

async function openStudentNotificationPanel() {

    refreshStudentNotificationElements();

    const panel =
        studentNotificationElements.panel;

    const trigger =
        studentNotificationElements.trigger;

    const list =
        studentNotificationElements.list;

    if (!panel || !trigger || !list) {

        console.error(
            "[Aplus Notifications] Required panel elements are missing."
        );

        return;

    }

    panel.hidden = false;

    trigger.setAttribute(
        "aria-expanded",
        "true"
    );

    list.innerHTML = `
        <div class="student-notification-loading">
            Loading notifications...
        </div>
    `;

    try {

        await loadStudentNotifications();

        renderStudentNotificationList();

    } catch (error) {

        console.error(
            "[Aplus Notifications] Failed to load notifications:",
            error
        );

        showStudentNotificationLoadError();

    }

}


/* =========================================================
   8. CLOSE NOTIFICATION PANEL
========================================================= */

function closeStudentNotificationPanel() {

    refreshStudentNotificationElements();

    const panel =
        studentNotificationElements.panel;

    const trigger =
        studentNotificationElements.trigger;

    if (panel) {
        panel.hidden = true;
    }

    if (trigger) {

        trigger.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* =========================================================
   9. TOGGLE NOTIFICATION PANEL
========================================================= */

function toggleStudentNotificationPanel() {

    refreshStudentNotificationElements();

    const panel =
        studentNotificationElements.panel;

    if (!panel) {
        return;
    }

    if (panel.hidden) {

        openStudentNotificationPanel();

    } else {

        closeStudentNotificationPanel();

    }

}


/* =========================================================
   10. INITIALIZE NOTIFICATION PANEL
========================================================= */

function initializeStudentNotificationPanel() {

    if (studentNotificationPanelInitialized) {
        return;
    }

    refreshStudentNotificationElements();

    const {
        trigger,
        panel
    } = studentNotificationElements;

    if (!trigger || !panel) {

        console.log(
            "[Aplus Notifications] Waiting for dashboard topbar."
        );

        return;

    }

    trigger.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            toggleStudentNotificationPanel();

        }
    );

/* =========================================================
   HANDLE NOTIFICATION CLICKS AND RETRY BUTTON
========================================================= */

panel.addEventListener(
    "click",
    async event => {

        event.stopPropagation();

        // ---------------------------------------------
        // RETRY BUTTON
        // ---------------------------------------------

        const retryButton = event.target.closest(
            "#retryStudentNotifications"
        );

        if (retryButton) {

            await openStudentNotificationPanel();

            return;

        }

        // ---------------------------------------------
        // NOTIFICATION ITEM
        // ---------------------------------------------

        const notificationButton = event.target.closest(
            ".student-notification-item"
        );

        if (!notificationButton) {
            return;
        }

        const notificationId =
            notificationButton.dataset.notificationId;

        if (!notificationId) {

            console.error(
                "[Aplus Notifications] Notification ID is missing."
            );

            return;

        }

        // Prevent repeated clicks while marking as read.
        if (notificationButton.dataset.processing === "true") {
            return;
        }

        notificationButton.dataset.processing = "true";

        try {

            // Mark this notification as read in Appwrite.
            await markStudentNotificationAsRead(
                notificationId
            );

            // Refresh the displayed notification list.
            renderStudentNotificationList();

            // Update the unread badge immediately.
            updateStudentNotificationCount();

            console.log(
                "[Aplus Notifications] Notification marked as read:",
                notificationId
            );

        } catch (error) {

            console.error(
                "[Aplus Notifications] Failed to mark notification as read:",
                error
            );

        } finally {

            notificationButton.dataset.processing = "false";

        }

    }
);

    document.addEventListener(
        "click",
        event => {

            if (
                !panel.hidden &&
                !panel.contains(event.target) &&
                !trigger.contains(event.target)
            ) {

                closeStudentNotificationPanel();

            }

        }
    );

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !panel.hidden
            ) {

                closeStudentNotificationPanel();

                trigger.focus();

            }

        }
    );

    document.addEventListener(
        "aplusStudentNotificationsLoaded",
        updateStudentNotificationCount
    );

    document.addEventListener(
        "aplusStudentNotificationReadUpdated",
        updateStudentNotificationCount
    );

    document.addEventListener(
        "aplusStudentNotificationsReadAll",
        updateStudentNotificationCount
    );

    studentNotificationPanelInitialized = true;

// Initially display the current count.
updateStudentNotificationCount();

console.log(
    "[Aplus Notifications] Notification panel initialized."
);

// Load notifications immediately in the background.
// This allows the unread badge to appear without
// requiring the student to click the bell first.

loadStudentNotifications()
    .then(() => {

        updateStudentNotificationCount();

        console.log(
            "[Aplus Notifications] Initial unread count:",
            getStudentUnreadNotificationCount()
        );

    })
    .catch(error => {

        console.error(
            "[Aplus Notifications] Initial notification loading failed:",
            error
        );

    });

}


/* =========================================================
   11. INITIALIZATION EVENTS
========================================================= */

// The topbar is generated dynamically by student-dashboard.js.
document.addEventListener(
    "aplusDashboardTopbarReady",
    initializeStudentNotificationPanel
);

// Also try immediately in case the topbar already exists.
initializeStudentNotificationPanel();