"use strict";

/* =========================================================
   APLUS TUTORS
   ADMIN NOTIFICATION CENTER
   BATCH 1 — FOUNDATION, LOADING, FILTERING & PAGINATION
========================================================= */


/* =========================================================
   1. APPWRITE CONFIGURATION
========================================================= */


/* =========================================================
   2. PAGE CONFIGURATION
========================================================= */

const NOTIFICATIONS_PAGE_SIZE = 10;


/* =========================================================
   3. PAGE STATE
========================================================= */

let allNotifications = [];

let filteredNotifications = [];

let currentNotificationsPage = 1;

let notificationsLoading = false;


/* =========================================================
   4. DOM ELEMENTS
========================================================= */

const notificationElements = {
    page: document.getElementById(
        "adminNotificationsPage"
    ),

    total: document.getElementById(
        "totalNotifications"
    ),

    published: document.getElementById(
        "publishedNotifications"
    ),

    drafts: document.getElementById(
        "draftNotifications"
    ),

    archived: document.getElementById(
        "archivedNotifications"
    ),

    search: document.getElementById(
        "notificationSearch"
    ),

    clearSearch: document.getElementById(
        "clearNotificationSearch"
    ),

    statusFilter: document.getElementById(
        "notificationStatusFilter"
    ),

    audienceFilter: document.getElementById(
        "notificationAudienceFilter"
    ),

    resetFilters: document.getElementById(
        "resetNotificationFilters"
    ),

    resultsCount: document.getElementById(
        "notificationsResultsCount"
    ),

    tableBody: document.getElementById(
        "notificationsTableBody"
    ),

    emptyState: document.getElementById(
        "notificationsEmptyState"
    ),

    paginationInfo: document.getElementById(
        "notificationsPaginationInfo"
    ),

    previousPage: document.getElementById(
        "previousNotificationsPage"
    ),

    pageIndicator: document.getElementById(
        "notificationsPageIndicator"
    ),

    nextPage: document.getElementById(
        "nextNotificationsPage"
    ),

    refreshButton: document.getElementById(
        "refreshNotificationsBtn"
    ),

    createButton: document.getElementById(
        "createNotificationBtn"
    ),

    emptyCreateButton: document.getElementById(
        "emptyStateCreateBtn"
    )
};


/* =========================================================
   5. GENERAL HELPERS
========================================================= */

/**
 * Safely escape text before inserting it into HTML.
 */
function escapeNotificationHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/**
 * Normalize text for case-insensitive comparisons.
 */
function normalizeNotificationText(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}


/**
 * Format a date for display.
 */
function formatNotificationDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/**
 * Convert a stored audience value into a readable label.
 */
function getNotificationAudienceLabel(notification) {
    const audience = normalizeNotificationText(
        notification.audienceType
    );

    if (
        audience === "all" ||
        audience === "all_students"
    ) {
        return "All Students";
    }

    if (audience === "department") {
        return notification.department
            ? escapeNotificationHTML(
                notification.department
            )
            : "Department";
    }

    if (audience === "individual") {
        return "Individual Student";
    }

    return "Unspecified";
}


/**
 * Return a CSS-safe status class.
 */
function getNotificationStatusClass(status) {
    const normalized = normalizeNotificationText(
        status
    );

    const allowedStatuses = [
        "published",
        "draft",
        "archived"
    ];

    return allowedStatuses.includes(normalized)
        ? normalized
        : "unknown";
}


/**
 * Return a CSS-safe priority class.
 */
function getNotificationPriorityClass(priority) {
    const normalized = normalizeNotificationText(
        priority
    );

    const allowedPriorities = [
        "low",
        "normal",
        "high"
    ];

    return allowedPriorities.includes(normalized)
        ? normalized
        : "normal";
}


/**
 * Display a temporary message.
 *
 * Uses an existing notification helper if the project
 * provides one; otherwise falls back to alert().
 */
function showAdminNotificationMessage(
    message,
    type = "info"
) {
    if (typeof window.showToast === "function") {
        window.showToast(message, type);
        return;
    }

    if (typeof window.showNotification === "function") {
        window.showNotification(message, type);
        return;
    }

    console.log(
        `[Aplus Notifications: ${type}] ${message}`
    );
}


/* =========================================================
   6. LOAD NOTIFICATIONS FROM APPWRITE
========================================================= */

async function loadAdminNotifications() {
    if (notificationsLoading) {
        return;
    }

    notificationsLoading = true;

    if (notificationElements.refreshButton) {
        notificationElements.refreshButton.disabled = true;
    }

    if (notificationElements.tableBody) {
        notificationElements.tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <span
                        class="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                    ></span>
                    Loading notifications...
                </td>
            </tr>
        `;
    }

    try {
        const response = await tablesDB.listRows(
            DATABASE_ID,
            NOTIFICATIONS_TABLE_ID,
            [
                Query.orderDesc("$createdAt"),
                Query.limit(100)
            ]
        );

        allNotifications = response.rows || [];

        updateNotificationStatistics();

        applyNotificationFilters();

    } catch (error) {
        console.error(
            "Failed to load admin notifications:",
            error
        );

        if (notificationElements.tableBody) {
            notificationElements.tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="text-danger">
                            Unable to load notifications.
                        </div>

                        <small class="text-muted">
                            Check your connection and Appwrite permissions,
                            then try refreshing.
                        </small>
                    </td>
                </tr>
            `;
        }

        showAdminNotificationMessage(
            "Unable to load notifications. Please try again.",
            "error"
        );

    } finally {
        notificationsLoading = false;

        if (notificationElements.refreshButton) {
            notificationElements.refreshButton.disabled = false;
        }
    }
}


/* =========================================================
   7. UPDATE NOTIFICATION STATISTICS
========================================================= */

function updateNotificationStatistics() {
    const total = allNotifications.length;

    const published = allNotifications.filter(
        notification =>
            normalizeNotificationText(
                notification.status
            ) === "published"
    ).length;

    const drafts = allNotifications.filter(
        notification =>
            normalizeNotificationText(
                notification.status
            ) === "draft"
    ).length;

    const archived = allNotifications.filter(
        notification =>
            normalizeNotificationText(
                notification.status
            ) === "archived"
    ).length;

    if (notificationElements.total) {
        notificationElements.total.textContent = total;
    }

    if (notificationElements.published) {
        notificationElements.published.textContent =
            published;
    }

    if (notificationElements.drafts) {
        notificationElements.drafts.textContent = drafts;
    }

    if (notificationElements.archived) {
        notificationElements.archived.textContent =
            archived;
    }
}


/* =========================================================
   8. FILTER NOTIFICATIONS
========================================================= */

function applyNotificationFilters() {
    const searchTerm = normalizeNotificationText(
        notificationElements.search?.value
    );

    const selectedStatus = normalizeNotificationText(
        notificationElements.statusFilter?.value || "all"
    );

    const selectedAudience = normalizeNotificationText(
        notificationElements.audienceFilter?.value || "all"
    );

    filteredNotifications = allNotifications.filter(
        notification => {

            /* SEARCH FILTER */

            const searchableText = [
                notification.title,
                notification.message,
                notification.type,
                notification.priority,
                notification.status,
                notification.audienceType,
                notification.department
            ]
                .map(value =>
                    normalizeNotificationText(value)
                )
                .join(" ");

            const matchesSearch =
                !searchTerm ||
                searchableText.includes(searchTerm);


            /* STATUS FILTER */

            const notificationStatus =
                normalizeNotificationText(
                    notification.status
                );

            const matchesStatus =
                selectedStatus === "all" ||
                notificationStatus === selectedStatus;


            /* AUDIENCE FILTER */

            const notificationAudience =
                normalizeNotificationText(
                    notification.audienceType
                );

            let matchesAudience = true;

            if (selectedAudience !== "all") {
                if (selectedAudience === "all_students") {
                    matchesAudience =
                        notificationAudience === "all" ||
                        notificationAudience === "all_students";

                } else {
                    matchesAudience =
                        notificationAudience === selectedAudience;
                }
            }

            return (
                matchesSearch &&
                matchesStatus &&
                matchesAudience
            );
        }
    );

    currentNotificationsPage = 1;

    renderAdminNotifications();
}


/* =========================================================
   9. RENDER NOTIFICATION TABLE
========================================================= */

function renderAdminNotifications() {
    if (!notificationElements.tableBody) {
        console.error(
            "Notifications table body was not found."
        );

        return;
    }

    const totalResults = filteredNotifications.length;

    const totalPages = Math.max(
        1,
        Math.ceil(
            totalResults / NOTIFICATIONS_PAGE_SIZE
        )
    );

    if (currentNotificationsPage > totalPages) {
        currentNotificationsPage = totalPages;
    }

    const startIndex =
        (currentNotificationsPage - 1) *
        NOTIFICATIONS_PAGE_SIZE;

    const endIndex = Math.min(
        startIndex + NOTIFICATIONS_PAGE_SIZE,
        totalResults
    );

    const pageNotifications =
        filteredNotifications.slice(
            startIndex,
            endIndex
        );

    if (notificationElements.resultsCount) {
        notificationElements.resultsCount.textContent =
            `${totalResults} notification${totalResults === 1 ? "" : "s"} found`;
    }

    if (notificationElements.emptyState) {
        notificationElements.emptyState.style.display =
            totalResults === 0 ? "" : "none";
    }

    notificationElements.tableBody.innerHTML = "";

    if (totalResults === 0) {
        notificationElements.tableBody.innerHTML = `
            <tr class="notification-no-results-row">
                <td colspan="6" class="text-center py-4">
                    No notifications match your filters.
                </td>
            </tr>
        `;

        updateNotificationPagination(
            0,
            0,
            totalResults,
            totalPages
        );

        return;
    }

    const rowsHTML = pageNotifications.map(
        notification => {

            const id = escapeNotificationHTML(
                notification.$id
            );

            const title = escapeNotificationHTML(
                notification.title || "Untitled notification"
            );

            const message = escapeNotificationHTML(
                notification.message || ""
            );

            const priority = normalizeNotificationText(
                notification.priority || "normal"
            );

            const priorityClass =
                getNotificationPriorityClass(priority);

            const status = normalizeNotificationText(
                notification.status || "draft"
            );

            const statusClass =
                getNotificationStatusClass(status);

            const createdDate = formatNotificationDate(
                notification.$createdAt
            );

            const audienceLabel =
                getNotificationAudienceLabel(notification);

            return `
                <tr data-notification-id="${id}">

                    <td class="notification-title-cell">
                        <div class="notification-title">
                            ${title}
                        </div>

                        <div class="notification-message-preview">
                            ${message}
                        </div>
                    </td>

                    <td>
                        ${audienceLabel}
                    </td>

                    <td>
                        <span class="notification-priority priority-${priorityClass}">
                            ${escapeNotificationHTML(
                                priority.charAt(0).toUpperCase() +
                                priority.slice(1)
                            )}
                        </span>
                    </td>

                    <td>
                        <span class="notification-status status-${statusClass}">
                            ${escapeNotificationHTML(
                                status.charAt(0).toUpperCase() +
                                status.slice(1)
                            )}
                        </span>
                    </td>

                    <td>
                        ${createdDate}
                    </td>

                    <td>
<div class="notification-actions">

    <!-- VIEW -->
    <button
        type="button"
        class="btn btn-sm btn-outline-dark notification-view-btn"
        data-id="${id}"
        title="View notification"
        aria-label="View ${title}"
    >
        <i class="fas fa-eye"></i>
    </button>


    <!-- EDIT -->
    <button
        type="button"
        class="btn btn-sm btn-outline-primary notification-edit-btn"
        data-id="${id}"
        title="Edit notification"
        aria-label="Edit ${title}"
    >
        <i class="fas fa-edit"></i>
    </button>


    <!-- PUBLISH DRAFT -->
    ${
        status === "draft"
            ? `
                <button
                    type="button"
                    class="btn btn-sm btn-outline-success notification-publish-btn"
                    data-id="${id}"
                    title="Publish notification"
                    aria-label="Publish ${title}"
                >
                    <i class="fas fa-paper-plane"></i>
                </button>
            `
            : ""
    }


    <!-- ARCHIVE ACTIVE NOTIFICATIONS -->
    ${
        status !== "archived"
            ? `
                <button
                    type="button"
                    class="btn btn-sm btn-outline-warning notification-archive-btn"
                    data-id="${id}"
                    title="Archive notification"
                    aria-label="Archive ${title}"
                >
                    <i class="fas fa-archive"></i>
                </button>
            `
            : `
                <button
                    type="button"
                    class="btn btn-sm btn-outline-success notification-restore-btn"
                    data-id="${id}"
                    title="Restore to drafts"
                    aria-label="Restore ${title}"
                >
                    <i class="fas fa-undo"></i>
                </button>
            `
    }


    <!-- PERMANENT DELETE -->
    <button
        type="button"
        class="btn btn-sm btn-outline-danger notification-delete-btn"
        data-id="${id}"
        title="Delete permanently"
        aria-label="Delete ${title}"
    >
        <i class="fas fa-trash"></i>
    </button>

</div>
                    </td>

                </tr>
            `;
        }
    ).join("");

    notificationElements.tableBody.innerHTML = rowsHTML;

    updateNotificationPagination(
        totalResults === 0 ? 0 : startIndex + 1,
        endIndex,
        totalResults,
        totalPages
    );
}


/* =========================================================
   10. UPDATE PAGINATION
========================================================= */

function updateNotificationPagination(
    start,
    end,
    total,
    totalPages
) {
    if (notificationElements.paginationInfo) {
        notificationElements.paginationInfo.textContent =
            total === 0
                ? "Showing 0 notifications"
                : `Showing ${start}–${end} of ${total} notifications`;
    }

    if (notificationElements.pageIndicator) {
        notificationElements.pageIndicator.textContent =
            `${currentNotificationsPage} / ${totalPages}`;
    }

    if (notificationElements.previousPage) {
        notificationElements.previousPage.disabled =
            currentNotificationsPage <= 1 ||
            total === 0;
    }

    if (notificationElements.nextPage) {
        notificationElements.nextPage.disabled =
            currentNotificationsPage >= totalPages ||
            total === 0;
    }
}


/* =========================================================
   11. EVENT LISTENERS
========================================================= */

function initializeNotificationFilters() {

    notificationElements.search?.addEventListener(
        "input",
        applyNotificationFilters
    );

    notificationElements.statusFilter?.addEventListener(
        "change",
        applyNotificationFilters
    );

    notificationElements.audienceFilter?.addEventListener(
        "change",
        applyNotificationFilters
    );

    notificationElements.clearSearch?.addEventListener(
        "click",
        () => {
            if (notificationElements.search) {
                notificationElements.search.value = "";
            }

            applyNotificationFilters();

            notificationElements.search?.focus();
        }
    );

    notificationElements.resetFilters?.addEventListener(
        "click",
        () => {
            if (notificationElements.search) {
                notificationElements.search.value = "";
            }

            if (notificationElements.statusFilter) {
                notificationElements.statusFilter.value = "all";
            }

            if (notificationElements.audienceFilter) {
               notificationElements.audienceFilter.value = "all";
            }

            applyNotificationFilters();
        }
    );

    notificationElements.previousPage?.addEventListener(
        "click",
        () => {
            if (currentNotificationsPage > 1) {
                currentNotificationsPage--;

                renderAdminNotifications();
            }
        }
    );

    notificationElements.nextPage?.addEventListener(
        "click",
        () => {
            const totalPages = Math.max(
                1,
                Math.ceil(
                    filteredNotifications.length /
                    NOTIFICATIONS_PAGE_SIZE
                )
            );

            if (currentNotificationsPage < totalPages) {
                currentNotificationsPage++;

                renderAdminNotifications();
            }
        }
    );

    notificationElements.refreshButton?.addEventListener(
        "click",
        loadAdminNotifications
    );
}


/* =========================================================
   12. INITIALIZE NOTIFICATION CENTER
========================================================= */

function initializeAdminNotificationCenter() {
    initializeNotificationFilters();

    loadAdminNotifications();
}


/* =========================================================
   13. START WHEN THE PAGE IS READY
========================================================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeAdminNotificationCenter
    );
} else {
    initializeAdminNotificationCenter();
}



/* =========================================================
   APLUS TUTORS
   ADMIN NOTIFICATION CENTER
   BATCH 2 — CREATE & EDIT NOTIFICATIONS
========================================================= */


/* =========================================================
   1. FORM ELEMENTS
========================================================= */

const notificationFormElements = {
    modal: document.getElementById(
        "notificationFormModal"
    ),

    modalTitle: document.getElementById(
        "notificationFormModalTitle"
    ),

    form: document.getElementById(
        "notificationForm"
    ),

    id: document.getElementById(
        "notificationId"
    ),

    title: document.getElementById(
        "notificationTitle"
    ),

    message: document.getElementById(
        "notificationMessage"
    ),

    type: document.getElementById(
        "notificationType"
    ),

    audience: document.getElementById(
        "notificationFormAudience"
    ),

    departmentGroup: document.getElementById(
        "notificationDepartmentGroup"
    ),

    department: document.getElementById(
        "notificationDepartment"
    ),

    studentGroup: document.getElementById(
        "notificationStudentGroup"
    ),

    studentId: document.getElementById(
        "notificationStudentId"
    ),

    priority: document.getElementById(
        "notificationPriority"
    ),

    status: document.getElementById(
        "notificationStatus"
    ),

    targetUrl: document.getElementById(
        "notificationTargetUrl"
    ),

    expiresAt: document.getElementById(
        "notificationExpiresAt"
    ),

    messageBox: document.getElementById(
        "notificationFormMessage"
    ),

    saveButton: document.getElementById(
        "saveNotificationBtn"
    )
};


let notificationFormModalInstance = null;


/* =========================================================
   2. SHOW / HIDE FORM MESSAGES
========================================================= */

function showNotificationFormMessage(
    message,
    type = "danger"
) {
    const box = notificationFormElements.messageBox;

    if (!box) {
        return;
    }

    box.className = `alert alert-${type}`;
    box.textContent = message;
    box.classList.remove("d-none");
}


function clearNotificationFormMessage() {
    const box = notificationFormElements.messageBox;

    if (!box) {
        return;
    }

    box.textContent = "";
    box.className = "alert d-none";
}


/* =========================================================
   3. FORMAT DATE FOR DATETIME-LOCAL INPUT
========================================================= */

function toNotificationDateTimeLocal(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const offset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 16);
}


/* =========================================================
   4. TOGGLE AUDIENCE FIELDS
========================================================= */

function updateNotificationAudienceFields() {
    const audience =
        notificationFormElements.audience?.value || "all";

    const showDepartment = audience === "department";
    const showStudent = audience === "individual";

    if (notificationFormElements.departmentGroup) {
        notificationFormElements.departmentGroup.hidden =
            !showDepartment;
    }

    if (notificationFormElements.studentGroup) {
        notificationFormElements.studentGroup.hidden =
            !showStudent;
    }

    if (notificationFormElements.department) {
        notificationFormElements.department.required =
            showDepartment;
    }

    if (notificationFormElements.studentId) {
        notificationFormElements.studentId.required =
            showStudent;
    }
}


/* =========================================================
   5. RESET FORM
========================================================= */

function resetNotificationForm() {
    const form = notificationFormElements.form;

    if (!form) {
        return;
    }

    form.reset();

    notificationFormElements.id.value = "";

    notificationFormElements.priority.value = "normal";

    notificationFormElements.status.value = "draft";

    notificationFormElements.audience.value = "all";

    notificationFormElements.type.value = "general";

    form.classList.remove("was-validated");

    form.querySelectorAll(".is-invalid").forEach(
        element => element.classList.remove("is-invalid")
    );

    clearNotificationFormMessage();

    updateNotificationAudienceFields();
}


/* =========================================================
   6. OPEN CREATE FORM
========================================================= */

function openCreateNotificationModal() {
    if (!notificationFormElements.modal) {
        console.error(
            "Notification form modal was not found."
        );

        showAdminNotificationMessage(
            "The notification form could not be opened. Check the modal HTML.",
            "error"
        );

        return;
    }

    resetNotificationForm();

    notificationFormElements.modalTitle.textContent =
        "Create Notification";

    notificationFormElements.saveButton.innerHTML = `
        <i class="fas fa-save me-2"></i>
        Save Notification
    `;

    notificationFormModalInstance =
        bootstrap.Modal.getOrCreateInstance(
            notificationFormElements.modal
        );

    notificationFormModalInstance.show();
}


/* =========================================================
   7. OPEN EDIT FORM
========================================================= */

function openEditNotificationModal(notificationId) {
    const notification = allNotifications.find(
        item => item.$id === notificationId
    );

    if (!notification) {
        showAdminNotificationMessage(
            "The selected notification could not be found.",
            "error"
        );

        return;
    }

    resetNotificationForm();

    notificationFormElements.id.value =
        notification.$id;

    notificationFormElements.title.value =
        notification.title || "";

    notificationFormElements.message.value =
        notification.message || "";

    notificationFormElements.type.value =
        notification.type || "general";

    notificationFormElements.audience.value =
        notification.audienceType || "all";

    notificationFormElements.department.value =
        notification.department || "";

    notificationFormElements.studentId.value =
        notification.studentId || "";

    notificationFormElements.priority.value =
        notification.priority || "normal";

    notificationFormElements.status.value =
        notification.status === "published"
            ? "published"
            : "draft";

    notificationFormElements.targetUrl.value =
        notification.targetUrl || "";

    notificationFormElements.expiresAt.value =
        toNotificationDateTimeLocal(
            notification.expiresAt
        );

    updateNotificationAudienceFields();

    notificationFormElements.modalTitle.textContent =
        "Edit Notification";

    notificationFormElements.saveButton.innerHTML = `
        <i class="fas fa-save me-2"></i>
        Update Notification
    `;

    notificationFormModalInstance =
        bootstrap.Modal.getOrCreateInstance(
            notificationFormElements.modal
        );

    notificationFormModalInstance.show();
}


/* =========================================================
   8. VALIDATE FORM
========================================================= */

function validateNotificationForm() {
    const form = notificationFormElements.form;

    if (!form) {
        return false;
    }

    clearNotificationFormMessage();

    updateNotificationAudienceFields();

    form.classList.add("was-validated");

    const title =
        notificationFormElements.title.value.trim();

    const message =
        notificationFormElements.message.value.trim();

    const audience =
        notificationFormElements.audience.value;

    const department =
        notificationFormElements.department.value.trim();

    const studentId =
        notificationFormElements.studentId.value.trim();

    const targetUrl =
        notificationFormElements.targetUrl.value.trim();

    if (!title || !message) {
        showNotificationFormMessage(
            "Please enter both a title and a message."
        );

        return false;
    }

    if (
        audience === "department" &&
        !department
    ) {
        showNotificationFormMessage(
            "Please select the target department."
        );

        return false;
    }

    if (
        audience === "individual" &&
        !studentId
    ) {
        showNotificationFormMessage(
            "Please enter the target student's profile document ID."
        );

        return false;
    }

    if (targetUrl) {
        try {
            const parsedUrl = new URL(targetUrl);

            if (
                parsedUrl.protocol !== "https:" &&
                parsedUrl.protocol !== "http:"
            ) {
                throw new Error("Invalid URL protocol.");
            }
        } catch {
            showNotificationFormMessage(
                "Enter a valid destination URL beginning with https:// or http://."
            );

            notificationFormElements.targetUrl.classList.add(
                "is-invalid"
            );

            return false;
        }
    }

    const expiryValue =
        notificationFormElements.expiresAt.value;

    if (expiryValue) {
        const expiryDate = new Date(expiryValue);

        if (Number.isNaN(expiryDate.getTime())) {
            showNotificationFormMessage(
                "Please enter a valid expiry date."
            );

            return false;
        }

        if (
            notificationFormElements.status.value === "published" &&
            expiryDate <= new Date()
        ) {
            showNotificationFormMessage(
                "A published notification must have an expiry date in the future."
            );

            return false;
        }
    }

    return form.checkValidity();
}


/* =========================================================
   9. BUILD APPWRITE DOCUMENT DATA
========================================================= */

function buildNotificationDocumentData() {
    const audience =
        notificationFormElements.audience.value;

    const status =
        notificationFormElements.status.value;

    const existingId =
        notificationFormElements.id.value.trim();

    const existingNotification = existingId
        ? allNotifications.find(
            item => item.$id === existingId
        )
        : null;

    const existingPublishedAt =
        existingNotification?.publishedAt || null;

    const expiryValue =
        notificationFormElements.expiresAt.value;

    const expiresAt = expiryValue
        ? new Date(expiryValue).toISOString()
        : null;

    let publishedAt = null;

    if (status === "published") {
        publishedAt = existingPublishedAt ||
            new Date().toISOString();
    }

    const data = {
        title: notificationFormElements.title.value.trim(),

        message: notificationFormElements.message.value.trim(),

        type: notificationFormElements.type.value,

        audienceType: audience,

        department:
            audience === "department"
                ? notificationFormElements.department.value
                : null,

        studentId:
            audience === "individual"
                ? notificationFormElements.studentId.value.trim()
                : null,

        targetUrl:
            notificationFormElements.targetUrl.value.trim() || null,

        priority: notificationFormElements.priority.value,

        status,

        publishedAt,

        expiresAt
    };

    return data;
}


/* =========================================================
   10. SAVE OR UPDATE NOTIFICATION
========================================================= */

async function saveAdminNotification(event) {
    event.preventDefault();

    if (!validateNotificationForm()) {
        return;
    }

    const button = notificationFormElements.saveButton;

    const originalButtonHTML = button.innerHTML;

    button.disabled = true;

    button.innerHTML = `
        <span
            class="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
        ></span>
        Saving...
    `;

    try {
        const data = buildNotificationDocumentData();

        const notificationId =
            notificationFormElements.id.value.trim();

        if (notificationId) {
            await tablesDB.updateRow(
                DATABASE_ID,
                NOTIFICATIONS_TABLE_ID,
                notificationId,
                data
            );

            showAdminNotificationMessage(
                "Notification updated successfully.",
                "success"
            );

        } else {
            /*
             * Preserve the admin document ID for auditing.
             * Adjust this only if your existing auth setup
             * stores the current user differently.
             */
            const currentAdminId =
                window.aplusUser?.$id ||
                window.aplusUser?.id ||
                "";

            if (!currentAdminId) {
                throw new Error(
                    "Could not identify the signed-in administrator. Please sign in again."
                );
            }

            data.createdBy = currentAdminId;

            await tablesDB.createRow(
                DATABASE_ID,
                NOTIFICATIONS_TABLE_ID,
                ID.unique(),
                data
            );

            showAdminNotificationMessage(
                "Notification created successfully.",
                "success"
            );
        }

        notificationFormModalInstance?.hide();

        await loadAdminNotifications();

    } catch (error) {
        console.error(
            "Failed to save notification:",
            error
        );

        showNotificationFormMessage(
            error.message ||
            "Unable to save the notification. Please try again."
        );

    } finally {
        button.disabled = false;

        button.innerHTML = originalButtonHTML;
    }
}


/* =========================================================
   11. CONNECT FORM EVENTS
========================================================= */

function initializeNotificationForm() {
    if (
        !notificationFormElements.modal ||
        !notificationFormElements.form
    ) {
        console.warn(
            "Notification form modal is not present. Add the Batch 2A HTML."
        );

        return;
    }

    notificationFormElements.audience?.addEventListener(
        "change",
        updateNotificationAudienceFields
    );

    notificationFormElements.form.addEventListener(
        "submit",
        saveAdminNotification
    );

    notificationElements.createButton?.addEventListener(
        "click",
        openCreateNotificationModal
    );

    notificationElements.emptyCreateButton?.addEventListener(
        "click",
        openCreateNotificationModal
    );

    notificationElements.tableBody?.addEventListener(
        "click",
        event => {
            const editButton = event.target.closest(
                ".notification-edit-btn"
            );

            if (!editButton) {
                return;
            }

            openEditNotificationModal(
                editButton.dataset.id
            );
        }
    );

    notificationFormElements.modal.addEventListener(
        "hidden.bs.modal",
        resetNotificationForm
    );

    updateNotificationAudienceFields();
}


/* =========================================================
   12. INITIALIZE FORM
========================================================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeNotificationForm
    );
} else {
    initializeNotificationForm();
}





/* =========================================================
   APLUS TUTORS
   ADMIN NOTIFICATION CENTER
   BATCH 3 — NOTIFICATION ACTIONS
========================================================= */


/* =========================================================
   1. FIND NOTIFICATION
========================================================= */

function findAdminNotification(notificationId) {
    return allNotifications.find(
        notification =>
            notification.$id === notificationId
    );
}


/* =========================================================
   2. CONFIRM ACTION
========================================================= */

function confirmAdminNotificationAction(message) {
    return window.confirm(message);
}


/* =========================================================
   3. UPDATE NOTIFICATION STATUS
========================================================= */

async function updateAdminNotificationStatus(
    notificationId,
    newStatus
) {
    const notification =
        findAdminNotification(notificationId);

    if (!notification) {
        showAdminNotificationMessage(
            "The selected notification could not be found.",
            "error"
        );

        return;
    }

    const validStatuses = [
        "draft",
        "published",
        "archived"
    ];

    if (!validStatuses.includes(newStatus)) {
        showAdminNotificationMessage(
            "Invalid notification status.",
            "error"
        );

        return;
    }

    const statusLabels = {
        draft: "Draft",
        published: "Published",
        archived: "Archived"
    };

    const oldStatus = normalizeNotificationText(
        notification.status
    );

    if (oldStatus === newStatus) {
        showAdminNotificationMessage(
            `This notification is already ${statusLabels[newStatus].toLowerCase()}.`,
            "info"
        );

        return;
    }

    const updateData = {
        status: newStatus
    };

    /*
     * Set publishedAt when publishing for the first time.
     * Preserve the original publication date when restoring
     * or changing the status of an already-published record.
     */
    if (newStatus === "published") {
        updateData.publishedAt =
            notification.publishedAt ||
            new Date().toISOString();
    }

    try {
        await tablesDB.updateRow(
            DATABASE_ID,
            NOTIFICATIONS_TABLE_ID,
            notificationId,
            updateData
        );

        showAdminNotificationMessage(
            `Notification ${statusLabels[newStatus].toLowerCase()} successfully.`,
            "success"
        );

        await loadAdminNotifications();

    } catch (error) {
        console.error(
            `Failed to change notification status to ${newStatus}:`,
            error
        );

        showAdminNotificationMessage(
            error.message ||
            "Unable to update notification status.",
            "error"
        );
    }
}


/* =========================================================
   4. PUBLISH NOTIFICATION
========================================================= */

async function publishAdminNotification(notificationId) {
    const notification =
        findAdminNotification(notificationId);

    if (!notification) {
        showAdminNotificationMessage(
            "Notification not found.",
            "error"
        );

        return;
    }

    const title =
        notification.title || "Untitled notification";

    const confirmed = confirmAdminNotificationAction(
        `Publish "${title}"?\n\n` +
        "The notification will become available to its intended audience, subject to your student-page filtering and Appwrite permissions."
    );

    if (!confirmed) {
        return;
    }

    await updateAdminNotificationStatus(
        notificationId,
        "published"
    );
}


/* =========================================================
   5. ARCHIVE NOTIFICATION
========================================================= */

async function archiveAdminNotification(notificationId) {
    const notification =
        findAdminNotification(notificationId);

    if (!notification) {
        showAdminNotificationMessage(
            "Notification not found.",
            "error"
        );

        return;
    }

    const title =
        notification.title || "Untitled notification";

    const confirmed = confirmAdminNotificationAction(
        `Archive "${title}"?\n\n` +
        "The notification record will be preserved, but your student-facing page must exclude archived notifications."
    );

    if (!confirmed) {
        return;
    }

    await updateAdminNotificationStatus(
        notificationId,
        "archived"
    );
}


/* =========================================================
   6. RESTORE ARCHIVED NOTIFICATION
========================================================= */

async function restoreAdminNotification(notificationId) {
    const notification =
        findAdminNotification(notificationId);

    if (!notification) {
        showAdminNotificationMessage(
            "Notification not found.",
            "error"
        );

        return;
    }

    const title =
        notification.title || "Untitled notification";

    const confirmed = confirmAdminNotificationAction(
        `Restore "${title}" to drafts?\n\n` +
        "The notification will return to draft status and will not be published automatically."
    );

    if (!confirmed) {
        return;
    }

    await updateAdminNotificationStatus(
        notificationId,
        "draft"
    );
}


/* =========================================================
   7. PERMANENTLY DELETE NOTIFICATION
========================================================= */

async function deleteAdminNotification(notificationId) {
    const notification =
        findAdminNotification(notificationId);

    if (!notification) {
        showAdminNotificationMessage(
            "Notification not found.",
            "error"
        );

        return;
    }

    const title =
        notification.title || "Untitled notification";

    const confirmed = confirmAdminNotificationAction(
        `PERMANENTLY DELETE "${title}"?\n\n` +
        "This operation cannot be undone. Any notification read records associated with it may also need to be deleted."
    );

    if (!confirmed) {
        return;
    }

    try {
        await tablesDB.deleteRow(
            DATABASE_ID,
            NOTIFICATIONS_TABLE_ID,
            notificationId
        );

        showAdminNotificationMessage(
            "Notification deleted successfully.",
            "success"
        );

        await loadAdminNotifications();

    } catch (error) {
        console.error(
            "Failed to delete notification:",
            error
        );

        showAdminNotificationMessage(
            error.message ||
            "Unable to delete notification.",
            "error"
        );
    }
}


/* =========================================================
   8. CONNECT ACTION BUTTONS
========================================================= */

function initializeNotificationActions() {
    const tableBody =
        notificationElements.tableBody;

    if (!tableBody) {
        console.error(
            "Cannot initialize notification actions: table body not found."
        );

        return;
    }

    /*
     * Event delegation allows buttons to continue working
     * after the table is refreshed or re-rendered.
     */
    tableBody.addEventListener("click", async event => {

        const button = event.target.closest("button");

        if (!button || !tableBody.contains(button)) {
            return;
        }

        const notificationId = button.dataset.id;

        if (!notificationId) {
            return;
        }

        /*
         * Prevent repeated clicks while an action runs.
         */
        if (button.dataset.processing === "true") {
            return;
        }

        if (
            button.classList.contains(
                "notification-publish-btn"
            )
        ) {
            button.dataset.processing = "true";
            button.disabled = true;

            try {
                await publishAdminNotification(
                    notificationId
                );
            } finally {
                button.dataset.processing = "false";
                button.disabled = false;
            }

            return;
        }

        if (
            button.classList.contains(
                "notification-archive-btn"
            )
        ) {
            button.dataset.processing = "true";
            button.disabled = true;

            try {
                await archiveAdminNotification(
                    notificationId
                );
            } finally {
                button.dataset.processing = "false";
                button.disabled = false;
            }

            return;
        }

        if (
            button.classList.contains(
                "notification-restore-btn"
            )
        ) {
            button.dataset.processing = "true";
            button.disabled = true;

            try {
                await restoreAdminNotification(
                    notificationId
                );
            } finally {
                button.dataset.processing = "false";
                button.disabled = false;
            }

            return;
        }

        if (
            button.classList.contains(
                "notification-delete-btn"
            )
        ) {
            button.dataset.processing = "true";
            button.disabled = true;

            try {
                await deleteAdminNotification(
                    notificationId
                );
            } finally {
                button.dataset.processing = "false";
                button.disabled = false;
            }

            return;
        }

        /*
         * Batch 2 already handles the edit button.
         * Do not handle it here, or the edit modal could
         * open twice.
         */

    });
}


/* =========================================================
   9. INITIALIZE ACTIONS
========================================================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeNotificationActions
    );
} else {
    initializeNotificationActions();
}




/* =========================================================
APLUS TUTORS
ADMIN NOTIFICATION CENTER
BATCH 4 — NOTIFICATION PREVIEW
========================================================= */

"use strict";

/* =========================================================
PREVIEW ELEMENTS
========================================================= */

const notificationPreviewElements = {
modal: document.getElementById("notificationPreviewModal"),

title: document.getElementById("previewNotificationTitle"),
status: document.getElementById("previewNotificationStatus"),
priority: document.getElementById("previewNotificationPriority"),
date: document.getElementById("previewNotificationDate"),
message: document.getElementById("previewNotificationMessage"),

type: document.getElementById("previewNotificationType"),
audience: document.getElementById("previewNotificationAudience"),
department: document.getElementById("previewNotificationDepartment"),
student: document.getElementById("previewNotificationStudent"),

published: document.getElementById("previewNotificationPublished"),
expiry: document.getElementById("previewNotificationExpiry"),

link: document.getElementById("previewNotificationLink"),
noLink: document.getElementById("previewNotificationNoLink"),

alert: document.getElementById("notificationPreviewAlert"),

editButton: document.getElementById("previewEditNotificationBtn"),
publishButton: document.getElementById("previewPublishNotificationBtn")

};

let notificationPreviewModalInstance = null;
let currentlyPreviewedNotificationId = null;

/* =========================================================
PREVIEW HELPERS
========================================================= */

function setNotificationPreviewText(element, value, fallback = "—") {
if (!element) return;

element.textContent =
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
        ? String(value)
        : fallback;

}

function formatNotificationPreviewDate(value, fallback = "—") {
if (!value) return fallback;

const date = new Date(value);

if (Number.isNaN(date.getTime())) {
    return fallback;
}

return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
});

}

function getNotificationPreviewAudience(notification) {
const audience = String(notification.audienceType || "all")
.toLowerCase();

if (audience === "department") {
    return "Department-specific";
}

if (audience === "individual") {
    return "Individual student";
}

return "All students";

}

function getNotificationPreviewStatusClass(status) {
const normalized = String(status || "draft").toLowerCase();

if (normalized === "published") return "is-published";
if (normalized === "archived") return "is-archived";

return "is-draft";

}

function getNotificationPreviewPriorityClass(priority) {
const normalized = String(priority || "normal").toLowerCase();

if (normalized === "high") return "is-high";
if (normalized === "low") return "is-low";

return "is-normal";

}

/* =========================================================
OPEN NOTIFICATION PREVIEW
========================================================= */

function openNotificationPreview(notificationId) {
const notification = findAdminNotification(notificationId);

if (!notification) {
    showAdminNotificationMessage(
        "The selected notification could not be found. Refresh the list and try again.",
        "error"
    );

    return;
}

if (
    !notificationPreviewElements.modal ||
    typeof bootstrap === "undefined"
) {
    showAdminNotificationMessage(
        "The preview window could not be opened. Check that the preview modal HTML and Bootstrap are loaded.",
        "error"
    );

    return;
}

currentlyPreviewedNotificationId = notificationId;

if (!notificationPreviewModalInstance) {
    notificationPreviewModalInstance =
        bootstrap.Modal.getOrCreateInstance(
            notificationPreviewElements.modal
        );
}

const status = String(notification.status || "draft").toLowerCase();
const priority = String(notification.priority || "normal").toLowerCase();

setNotificationPreviewText(
    notificationPreviewElements.title,
    notification.title,
    "Untitled notification"
);

setNotificationPreviewText(
    notificationPreviewElements.status,
    status.charAt(0).toUpperCase() + status.slice(1)
);

setNotificationPreviewText(
    notificationPreviewElements.priority,
    priority.charAt(0).toUpperCase() + priority.slice(1)
);

setNotificationPreviewText(
    notificationPreviewElements.date,
    "Created " + formatNotificationPreviewDate(notification.$createdAt)
);

setNotificationPreviewText(
    notificationPreviewElements.message,
    notification.message,
    "No message provided."
);

setNotificationPreviewText(
    notificationPreviewElements.type,
    notification.type || "General"
);

setNotificationPreviewText(
    notificationPreviewElements.audience,
    getNotificationPreviewAudience(notification)
);

setNotificationPreviewText(
    notificationPreviewElements.department,
    notification.department,
    "Not applicable"
);

setNotificationPreviewText(
    notificationPreviewElements.student,
    notification.studentId,
    "Not applicable"
);

setNotificationPreviewText(
    notificationPreviewElements.published,
    formatNotificationPreviewDate(
        notification.publishedAt,
        "Not published"
    )
);

setNotificationPreviewText(
    notificationPreviewElements.expiry,
    formatNotificationPreviewDate(
        notification.expiresAt,
        "No expiry date"
    )
);

/* Status badge */

if (notificationPreviewElements.status) {
    notificationPreviewElements.status.className =
        "notification-status-badge " +
        getNotificationPreviewStatusClass(status);
}

/* Priority badge */

if (notificationPreviewElements.priority) {
    notificationPreviewElements.priority.className =
        "notification-priority-badge " +
        getNotificationPreviewPriorityClass(priority);
}

/* Target link */

const targetUrl = String(notification.targetUrl || "").trim();

if (notificationPreviewElements.link) {
    notificationPreviewElements.link.hidden = true;
    notificationPreviewElements.link.removeAttribute("href");

    try {
        const parsedUrl = new URL(targetUrl, window.location.origin);

        const allowedProtocol =
            parsedUrl.protocol === "https:" ||
            parsedUrl.protocol === "http:";

        if (targetUrl && allowedProtocol) {
            notificationPreviewElements.link.href = parsedUrl.href;
            notificationPreviewElements.link.hidden = false;

            if (notificationPreviewElements.noLink) {
                notificationPreviewElements.noLink.hidden = true;
            }
        } else if (notificationPreviewElements.noLink) {
            notificationPreviewElements.noLink.hidden = false;
        }
    } catch (error) {
        if (notificationPreviewElements.noLink) {
            notificationPreviewElements.noLink.hidden = false;
        }
    }
}

/* Publish button appears only for drafts */

if (notificationPreviewElements.publishButton) {
    notificationPreviewElements.publishButton.hidden =
        status !== "draft";
}

/* Clear previous preview alerts */

if (notificationPreviewElements.alert) {
    notificationPreviewElements.alert.hidden = true;
    notificationPreviewElements.alert.textContent = "";
}

notificationPreviewModalInstance.show();

}

/* =========================================================
PREVIEW MODAL ACTIONS
========================================================= */

function initializeNotificationPreview() {
if (!notificationPreviewElements.modal) {
console.warn(
"Aplus Tutors: Notification preview modal was not found."
);

    return;
}

/*
 * The existing Batch 2 listener handles Edit buttons.
 * This listener handles View buttons only.
 */

if (notificationElements.tableBody) {
notificationElements.tableBody.addEventListener("click", function (event) {
const viewButton = event.target.closest(
".notification-view-btn"
);

    if (!viewButton) return;

    // Your View button already stores the Appwrite document ID.
    const notificationId = viewButton.getAttribute("data-id");

    if (!notificationId) {
        console.error(
            "[Aplus Notifications: error] Notification ID missing from View button.",
            viewButton
        );

        showAdminNotificationMessage(
            "Unable to identify this notification. Please refresh the page and try again.",
            "error"
        );

        return;
    }

    openNotificationPreview(notificationId);
});

}

/* Edit from the preview */

if (notificationPreviewElements.editButton) {
    notificationPreviewElements.editButton.addEventListener(
        "click",
        function () {
            if (!currentlyPreviewedNotificationId) return;

            const notificationId = currentlyPreviewedNotificationId;

            if (notificationPreviewModalInstance) {
                notificationPreviewModalInstance.hide();
            }

            if (typeof openEditNotificationModal === "function") {
                openEditNotificationModal(notificationId);
            } else {
                showAdminNotificationMessage(
                    "The notification editing function is unavailable.",
                    "error"
                );
            }
        }
    );
}

/* Publish from the preview */

if (notificationPreviewElements.publishButton) {
    notificationPreviewElements.publishButton.addEventListener(
        "click",
        async function () {
            if (!currentlyPreviewedNotificationId) return;

            const button = this;

            if (button.dataset.processing === "true") return;

            button.dataset.processing = "true";
            button.disabled = true;

            try {
                await publishAdminNotification(
                    currentlyPreviewedNotificationId
                );

                const updatedNotification = findAdminNotification(
                    currentlyPreviewedNotificationId
                );

                if (
                    updatedNotification &&
                    updatedNotification.status === "published"
                ) {
                    if (notificationPreviewModalInstance) {
                        notificationPreviewModalInstance.hide();
                    }
                }
            } finally {
                button.dataset.processing = "false";
                button.disabled = false;
            }
        }
    );
}

notificationPreviewElements.modal.addEventListener(
    "hidden.bs.modal",
    function () {
        currentlyPreviewedNotificationId = null;
    }
);

}

/* =========================================================
INITIALIZE PREVIEW
========================================================= */

if (document.readyState === "loading") {
document.addEventListener(
"DOMContentLoaded",
initializeNotificationPreview
);
} else {
initializeNotificationPreview();
}

