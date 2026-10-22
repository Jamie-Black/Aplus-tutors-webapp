"use strict";

/*==================================================
APLUS TUTORS
STUDENT PROFILE

PHASE 2
FOUNDATION
AUTHENTICATION
STUDENT VERIFICATION
PROFILE DATA
PROFILE EDITING
==================================================*/


/*==================================================
APPLICATION CONFIGURATION
==================================================*/

const STUDENT_PROFILE_APP_NAME =
    "Aplus Tutors";


/*==================================================
DOM ELEMENTS
==================================================*/

const profilePage =
    document.getElementById(
        "profilePage"
    );


const profileLoader =
    document.getElementById(
        "pageLoader"
    );


const profileForm =
    document.getElementById(
        "profileForm"
    );


const profileMessage =
    document.getElementById(
        "profileMessage"
    );


const profilePhoto =
    document.getElementById(
        "profilePhoto"
    );


const photoPreview =
    document.getElementById(
        "photoPreview"
    );





/*==================================================
PROFILE STATE
==================================================*/

let profileAuthUser =
    null;


let profileStudent =
    null;


/*==================================================
DEFAULT PROFILE PHOTO
==================================================*/

const DEFAULT_STUDENT_PHOTO =
    "Screenshot_20260806-223602.png";


/*==================================================
AUTHENTICATION READY EVENT
==================================================*/

document.addEventListener(
    "aplusAuthReady",
    initializeStudentProfile
);


/*==================================================
INITIALIZE STUDENT PROFILE
==================================================*/

function initializeStudentProfile(
    event
) {

    try {

        console.log(
            "========================================"
        );

        console.log(
            "APLUS TUTORS STUDENT PROFILE"
        );

        console.log(
            "========================================"
        );


        /*------------------------------------------
        VERIFY AUTH EVENT
        ------------------------------------------*/

        if (!event) {

            throw new Error(
                "Authentication event was not received."
            );

        }


        if (!event.detail) {

            throw new Error(
                "Authentication information is unavailable."
            );

        }


        /*------------------------------------------
        AUTHENTICATED APPWRITE USER
        ------------------------------------------*/

        profileAuthUser =
            event.detail.authUser;


        /*------------------------------------------
        DATABASE USER
        ------------------------------------------*/

        profileStudent =
            event.detail.user;


        console.log(
            "Authenticated student:",
            profileAuthUser
        );


        console.log(
            "Student profile:",
            profileStudent
        );


        /*------------------------------------------
        VERIFY AUTHENTICATED USER
        ------------------------------------------*/

        if (!profileAuthUser) {

            throw new Error(
                "Your account could not be identified."
            );

        }


        /*------------------------------------------
        VERIFY DATABASE PROFILE
        ------------------------------------------*/

        if (!profileStudent) {

            throw new Error(
                "Your student profile could not be found."
            );

        }


        /*------------------------------------------
        VERIFY STUDENT ROLE
        ------------------------------------------*/

        verifyStudentRole();


        /*------------------------------------------
        INITIALIZE PAGE
        ------------------------------------------*/

        initializeProfilePage();

    }

    catch (error) {

        console.error(
            "========================================"
        );

        console.error(
            "STUDENT PROFILE INITIALIZATION ERROR"
        );

        console.error(
            "========================================"
        );

        console.error(
            error
        );


        showProfileMessage(
            error.message ||
            "Unable to load your profile.",
            "error"
        );


        hideProfileLoader();

    }

}


/*==================================================
VERIFY STUDENT ROLE
==================================================*/

function verifyStudentRole() {

    if (!profileStudent) {

        throw new Error(
            "Student profile information is unavailable."
        );

    }


    const role =
        String(
            profileStudent.role || ""
        )
        .trim()
        .toLowerCase();


    console.log(
        "Detected account role:",
        role
    );


    /*------------------------------------------
    STUDENT ROLE
    ------------------------------------------*/

    if (
        role === "student"
    ) {

        return true;

    }


    /*------------------------------------------
    NO ROLE
    ------------------------------------------*/

    if (!role) {

        throw new Error(
            "Your account role could not be determined."
        );

    }


    /*------------------------------------------
    INVALID ROLE
    ------------------------------------------*/

    throw new Error(
        "This page is only available to student accounts."
    );

}


/*==================================================
INITIALIZE PROFILE PAGE
==================================================*/

function initializeProfilePage() {

    console.log(
        "Initializing student profile page..."
    );


    /*------------------------------------------
    POPULATE PROFILE
    ------------------------------------------*/

    populateProfile();


    /*------------------------------------------
    PHOTO ERROR HANDLING
    ------------------------------------------*/

    attachPhotoErrorHandler();
    
    
    attachProfilePhotoControls();

    /*------------------------------------------
    PROFILE FORM
    ------------------------------------------*/

    attachProfileForm();


    /*------------------------------------------
    PAGE READY
    ------------------------------------------*/
    attachChangePasswordButton();
    
    
    attachChangePasswordForm();
    
    

    hideProfileLoader();


    console.log(
        "========================================"
    );

    console.log(
        "STUDENT PROFILE READY"
    );

    console.log(
        "========================================"
    );

}


/*==================================================
POPULATE PROFILE
==================================================*/

function populateProfile() {

    if (!profileStudent) {

        console.warn(
            "No student profile data available."
        );

        return;

    }


    console.log(
        "Populating student profile..."
    );


    /*------------------------------------------
    PROFILE HEADER
    ------------------------------------------*/

    setProfileText(
        "profileName",
        profileStudent.fullName
    );


    setProfileText(
        "profileEmail",
        profileStudent.email
    );


    /*------------------------------------------
    PROFILE FORM
    ------------------------------------------*/

    setProfileValue(
        "fullName",
        profileStudent.fullName
    );


    setProfileValue(
        "email",
        profileStudent.email
    );


    setProfileValue(
        "department",
        profileStudent.department
    );


    setProfileValue(
        "role",
        formatRole(
            profileStudent.role
        )
    );


    setProfileValue(
        "status",
        formatStatus(
            profileStudent.status
        )
    );


    /*------------------------------------------
    PROFILE BADGES
    ------------------------------------------*/

    updateProfileStatus(
        profileStudent.status
    );


    updateProfileDepartment(
        profileStudent.department
    );


    /*------------------------------------------
    ACCOUNT INFORMATION
    ------------------------------------------*/

    setProfileText(
        "accountRole",
        formatRole(
            profileStudent.role
        )
    );


    setProfileText(
        "accountDepartment",
        formatDepartment(
            profileStudent.department
        )
    );


    setProfileText(
        "accountStatus",
        formatStatus(
            profileStudent.status
        )
    );


    /*------------------------------------------
    PROFILE PHOTO
    ------------------------------------------*/

    loadProfilePhoto();

}


/*==================================================
ATTACH PROFILE FORM
==================================================*/

function attachProfileForm() {

    if (!profileForm) {

        console.warn(
            "Student profile form was not found."
        );

        return;

    }


    profileForm.addEventListener(
        "submit",
        handleProfileSubmit
    );


    console.log(
        "Student profile form connected."
    );

}


/*==================================================
PROFILE SAVE BUTTON STATE
==================================================*/

function setProfileSaveState(
    saving
) {

    if (!saveProfileBtn) {

        return;

    }


    if (saving) {

        saveProfileBtn.disabled =
            true;


        saveProfileBtn.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
            ></span>
            Saving...
        `;

    }

    else {

        saveProfileBtn.disabled =
            false;


        saveProfileBtn.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            <span>
                Save Changes
            </span>
        `;

    }

}


/*==================================================
UPDATE DASHBOARD STUDENT NAME
==================================================*/

function updateStudentDashboardName(
    fullName
) {

    if (!fullName) {

        return;

    }


    /*------------------------------------------
    COMMON STUDENT NAME SELECTORS
    ------------------------------------------*/

    const studentNames =
        document.querySelectorAll(
            ".student-name"
        );


    studentNames.forEach(
        function (element) {

            element.textContent =
                fullName;

        }
    );


    /*------------------------------------------
    TOPBAR / SIDEBAR FALLBACK
    ------------------------------------------*/

    const dashboardNames =
        document.querySelectorAll(
            ".user-name, .student-name, .profile-name"
        );


    dashboardNames.forEach(
        function (element) {

            element.textContent =
                fullName;

        }
    );


    console.log(
        "Dashboard student name updated."
    );

}


/*==================================================
UPDATE STORED STUDENT
==================================================*/

function updateStoredStudent() {

    try {

        const storedUser =
            localStorage.getItem(
                "aplusUser"
            );


        if (!storedUser) {

            console.log(
                "No stored Aplus user found."
            );

            return;

        }


        const parsedUser =
            JSON.parse(
                storedUser
            );


        const updatedStoredUser =
            {
                ...parsedUser,
                ...profileStudent
            };


        localStorage.setItem(
            "aplusUser",
            JSON.stringify(
                updatedStoredUser
            )
        );


        console.log(
            "Stored student information updated."
        );

    }

    catch (error) {

        console.warn(
            "Unable to update stored student information:",
            error
        );

    }

}


/*==================================================
PROFILE ERROR MESSAGE
==================================================*/

function getProfileErrorMessage(
    error
) {

    if (!error) {

        return (
            "Unable to save your profile information."
        );

    }


    /*------------------------------------------
    PERMISSION ERROR
    ------------------------------------------*/

    if (
        error.code === 401 ||
        error.code === 403
    ) {

        return (
            "You do not have permission to update your profile."
        );

    }


    /*------------------------------------------
    NETWORK ERROR
    ------------------------------------------*/

    if (
        error.message &&
        error.message
            .toLowerCase()
            .includes("network")
    ) {

        return (
            "Network error. Please check your internet connection and try again."
        );

    }


    /*------------------------------------------
    DOCUMENT / ROW ERROR
    ------------------------------------------*/

    if (
        error.message &&
        (
            error.message
                .toLowerCase()
                .includes("document") ||

            error.message
                .toLowerCase()
                .includes("row")
        )
    ) {

        return (
            "Unable to update your profile record. Please try again."
        );

    }


    /*------------------------------------------
    GENERAL ERROR
    ------------------------------------------*/

    return (
        error.message ||
        "Unable to save your profile information. Please try again."
    );

}


/*==================================================
SET PROFILE TEXT
==================================================*/

function setProfileText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        console.warn(
            "Profile element not found:",
            elementId
        );

        return;

    }


    element.textContent =
        value ||
        "Not provided";

}


/*==================================================
SET PROFILE INPUT VALUE
==================================================*/

function setProfileValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (!element) {
        return;
    }

    element.value =
        value !== undefined &&
        value !== null
            ? value
            : "";
}


/*==================================================
UPDATE PROFILE STATUS
==================================================*/

function updateProfileStatus(
    status
) {

    const badge =
        document.getElementById(
            "profileStatusBadge"
        );

    if (!badge) {
        return;
    }

    const formattedStatus =
        formatStatus(status);

    badge.textContent =
        formattedStatus;

    badge.className =
        "profile-status-badge";

    const normalizedStatus =
        String(status || "")
            .trim()
            .toLowerCase();

    if (
        normalizedStatus ===
        "active"
    ) {

        badge.classList.add(
            "status-active"
        );

    } else if (
        normalizedStatus ===
        "inactive"
    ) {

        badge.classList.add(
            "status-inactive"
        );

    } else if (
        normalizedStatus ===
        "suspended"
    ) {

        badge.classList.add(
            "status-suspended"
        );

    } else {

        badge.classList.add(
            "status-default"
        );
    }
}


/*==================================================
UPDATE PROFILE DEPARTMENT
==================================================*/

function updateProfileDepartment(
    department
) {

    const badge =
        document.getElementById(
            "profileDepartmentBadge"
        );

    if (!badge) {
        return;
    }

    badge.textContent =
        formatDepartment(
            department
        );
}


/*==================================================
FORMAT ROLE
==================================================*/

function formatRole(
    role
) {

    if (!role) {
        return "Student";
    }

    return capitalizeWords(
        String(role)
    );
}


/*==================================================
FORMAT STATUS
==================================================*/

function formatStatus(
    status
) {

    if (!status) {
        return "Unknown";
    }

    return capitalizeWords(
        String(status)
    );
}


/*==================================================
FORMAT DEPARTMENT
==================================================*/

function formatDepartment(
    department
) {

    if (!department) {
        return "Not assigned";
    }

    return capitalizeWords(
        String(department)
    );
}


/*==================================================
CAPITALIZE WORDS
==================================================*/

function capitalizeWords(
    value
) {

    return value
        .replace(
            /[_-]+/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim()
        .replace(
            /\b\w/g,
            function (letter) {
                return letter.toUpperCase();
            }
        );
}



/*==================================================
UPDATE DASHBOARD PHOTOS
==================================================*/

function updateStudentDashboardPhotos(
    photoUrl
) {

    if (!photoUrl) {
        return;
    }

    const studentPhotos =
        document.querySelectorAll(
            ".student-photo"
        );

    studentPhotos.forEach(
        function (photo) {

            photo.src =
                photoUrl;

        }
    );
}


/* =========================================================
   APLUS TUTORS
   STUDENT PROFILE PHOTO MANAGEMENT

   Features:
   - Select and preview images
   - Validate image type and size
   - Upload to Appwrite Storage
   - Save file ID to users.photoUrl
   - Synchronize profile/sidebar/topbar photos
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const PROFILE_PHOTO_MAX_SIZE = 5 * 1024 * 1024;

const PROFILE_PHOTO_ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const PROFILE_PHOTO_FALLBACK =
    "assets/Screenshot_20260806-223602.png";


/* =========================================================
   PHOTO ELEMENTS
========================================================= */

const profilePhotoInput =
    document.getElementById("profilePhotoInput");

const changePhotoBtn =
    document.getElementById("changePhotoBtn");

const selectPhotoBtn =
    document.getElementById("selectPhotoBtn");

const photoUploadStatus =
    document.getElementById("photoUploadStatus");


/* =========================================================
   PHOTO STATE
========================================================= */

let selectedProfilePhotoFile = null;

let profilePhotoPreviewUrl = null;

let originalProfilePhotoUrl = null;

let profilePhotoUploadInProgress = false;


/* =========================================================
   IMAGE URL MANAGEMENT
========================================================= */

function revokeProfilePhotoPreviewUrl() {

    if (profilePhotoPreviewUrl) {

        URL.revokeObjectURL(profilePhotoPreviewUrl);

        profilePhotoPreviewUrl = null;

    }

}


/* =========================================================
   DISPLAY PROFILE PHOTO EVERYWHERE
========================================================= */

function setStudentPhoto(imageUrl) {

    const finalImageUrl =
        imageUrl || PROFILE_PHOTO_FALLBACK;

    const profileImages = document.querySelectorAll(
        "#profilePhoto, #photoPreview, .student-photo"
    );

    profileImages.forEach(function (image) {

        if (!(image instanceof HTMLImageElement)) {
            return;
        }

        // Prevent repeated fallback loops.
        image.onerror = function () {

            console.error(
                "Profile image failed to load:",
                image.currentSrc || image.src
            );

            const fallbackUrl = new URL(
                PROFILE_PHOTO_FALLBACK,
                document.baseURI
            ).href;

            if (image.src !== fallbackUrl) {

                image.onerror = null;
                image.src = fallbackUrl;

            }

        };

        image.src = finalImageUrl;

    });

}


/* =========================================================
   DEFAULT PHOTO
========================================================= */

function setDefaultProfilePhoto() {

    setStudentPhoto(PROFILE_PHOTO_FALLBACK);

}


/* =========================================================
   DISPLAY UPLOAD STATUS
========================================================= */

function setPhotoUploadStatus(message, type = "info") {

    if (!photoUploadStatus) {
        return;
    }

    photoUploadStatus.textContent = message;

    photoUploadStatus.classList.remove(
        "success",
        "error",
        "warning",
        "info"
    );

    photoUploadStatus.classList.add(type);

}


/* =========================================================
   GET APPWRITE STORAGE PREVIEW URL
========================================================= */

/* =========================================================
   GET APPWRITE PROFILE PHOTO URL
========================================================= */

function getProfilePhotoPreviewUrl(fileId) {

    if (!fileId) {
        return null;
    }

    try {

        const imageUrl = storage.getFileView(
            PROFILE_PHOTOS_BUCKET_ID,
            fileId
        );

        return imageUrl ? imageUrl.toString() : null;

    } catch (error) {

        console.error(
            "Could not generate profile photo URL:",
            error
        );

        return null;

    }

}

/* =========================================================
   LOAD SAVED PROFILE PHOTO
========================================================= */

async function loadProfilePhoto() {

    if (!profileStudent) {
        setDefaultProfilePhoto();
        return;
    }

    const fileId = profileStudent.photoUrl;

    if (!fileId) {

        originalProfilePhotoUrl = null;

        setDefaultProfilePhoto();

        return;

    }

    try {

        const imageUrl =
            await getProfilePhotoPreviewUrl(fileId);

        if (!imageUrl) {
            throw new Error("Could not load profile photo.");
        }

        originalProfilePhotoUrl = imageUrl;

        setStudentPhoto(imageUrl);

    } catch (error) {

        console.error(
            "Failed to load student profile photo:",
            error
        );

        /*
           Don't modify the database here.
           A failed preview does not mean the file
           should be deleted or photoUrl cleared.
        */

        setDefaultProfilePhoto();

    }

}


/* =========================================================
   OPEN FILE PICKER
========================================================= */

function openProfilePhotoPicker() {

    if (profilePhotoUploadInProgress) {
        return;
    }

    if (!profilePhotoInput) {
        return;
    }

    profilePhotoInput.click();

}


/* =========================================================
   VALIDATE SELECTED IMAGE
========================================================= */

function validateProfilePhoto(file) {

    if (!file) {

        return {
            valid: false,
            message: "Please select an image."
        };

    }

    if (!PROFILE_PHOTO_ALLOWED_TYPES.includes(file.type)) {

        return {
            valid: false,
            message: "Use a JPG, PNG, or WEBP image."
        };

    }

    if (file.size > PROFILE_PHOTO_MAX_SIZE) {

        return {
            valid: false,
            message: "Your image must not exceed 5 MB."
        };

    }

    if (file.size === 0) {

        return {
            valid: false,
            message: "The selected image is empty."
        };

    }

    return {
        valid: true,
        message: "Image selected successfully."
    };

}


/* =========================================================
   PREVIEW SELECTED IMAGE
========================================================= */

function previewSelectedProfilePhoto(file) {

    revokeProfilePhotoPreviewUrl();

    profilePhotoPreviewUrl =
        URL.createObjectURL(file);

    /*
       Update the preview and overview immediately.
       The saved image is restored if upload fails.
    */

    setStudentPhoto(profilePhotoPreviewUrl);

}


/* =========================================================
   HANDLE FILE SELECTION
========================================================= */

function handleProfilePhotoSelection(event) {

    if (profilePhotoUploadInProgress) {
        return;
    }

    const file =
        event.target.files &&
        event.target.files[0];

    if (!file) {
        return;
    }

    const validation =
        validateProfilePhoto(file);

    if (!validation.valid) {

        selectedProfilePhotoFile = null;

        event.target.value = "";

        setPhotoUploadStatus(
            validation.message,
            "error"
        );

        return;

    }

    selectedProfilePhotoFile = file;

    previewSelectedProfilePhoto(file);

    setPhotoUploadStatus(
        "Photo selected. Click Upload Photo to save it.",
        "success"
    );

}


/* =========================================================
   CREATE UPLOAD BUTTON
========================================================= */

function createProfilePhotoUploadButton() {

    let uploadBtn =
        document.getElementById("uploadProfilePhotoBtn");

    if (uploadBtn) {
        return uploadBtn;
    }

    uploadBtn = document.createElement("button");

    uploadBtn.type = "button";

    uploadBtn.id = "uploadProfilePhotoBtn";

    uploadBtn.className = "profile-primary-btn";

    uploadBtn.innerHTML = `
        <i class="fa-solid fa-cloud-arrow-up"></i>
        <span>Upload Photo</span>
    `;

    uploadBtn.style.display = "none";

    /*
       Place the button after the existing Select Photo
       button so we don't need to rewrite the HTML.
    */

    if (selectPhotoBtn) {

        selectPhotoBtn.insertAdjacentElement(
            "afterend",
            uploadBtn
        );

    }

    uploadBtn.addEventListener(
        "click",
        uploadSelectedProfilePhoto
    );

    return uploadBtn;

}


/* =========================================================
   SET UP PHOTO BUTTONS
========================================================= */

function attachProfilePhotoControls() {

    if (
        !profilePhotoInput ||
        !changePhotoBtn ||
        !selectPhotoBtn
    ) {
        console.warn(
            "Profile photo controls are missing from the HTML."
        );

        return;

    }

    const uploadBtn =
        createProfilePhotoUploadButton();

    changePhotoBtn.addEventListener(
        "click",
        openProfilePhotoPicker
    );

    selectPhotoBtn.addEventListener(
        "click",
        openProfilePhotoPicker
    );

    profilePhotoInput.addEventListener(
        "change",
        handleProfilePhotoSelection
    );

    /*
       Show Upload Photo only when a valid image
       has been selected.
    */

    profilePhotoInput.addEventListener(
        "change",
        () => {

            uploadBtn.style.display =
                selectedProfilePhotoFile
                    ? "inline-flex"
                    : "none";

        }
    );

}


/* =========================================================
   RESTORE SAVED PHOTO
========================================================= */

async function restoreSavedProfilePhoto() {

    revokeProfilePhotoPreviewUrl();

    selectedProfilePhotoFile = null;

    if (profilePhotoInput) {
        profilePhotoInput.value = "";
    }

    const uploadBtn =
        document.getElementById("uploadProfilePhotoBtn");

    if (uploadBtn) {
        uploadBtn.style.display = "none";
    }

    await loadProfilePhoto();

}


/* =========================================================
   UPLOAD SELECTED PHOTO
========================================================= */

async function uploadSelectedProfilePhoto() {

    if (profilePhotoUploadInProgress) {
        return;
    }

    if (!selectedProfilePhotoFile) {

        setPhotoUploadStatus(
            "Please select a photo first.",
            "warning"
        );

        return;

    }

    if (!profileStudent || !profileStudent.$id) {

        setPhotoUploadStatus(
            "Your student profile is not ready. Refresh and try again.",
            "error"
        );

        return;

    }

    if (
        typeof storage === "undefined" ||
        typeof tablesDB === "undefined"
    ) {

        setPhotoUploadStatus(
            "Appwrite is not configured correctly.",
            "error"
        );

        return;

    }

    const validation =
        validateProfilePhoto(selectedProfilePhotoFile);

    if (!validation.valid) {

        setPhotoUploadStatus(
            validation.message,
            "error"
        );

        return;

    }

    profilePhotoUploadInProgress = true;

    const uploadBtn =
        document.getElementById("uploadProfilePhotoBtn");

    const previousButtonHtml =
        uploadBtn ? uploadBtn.innerHTML : "";

    if (uploadBtn) {

        uploadBtn.disabled = true;

        uploadBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm"
                  aria-hidden="true"></span>
            Uploading...
        `;

    }

    changePhotoBtn.disabled = true;

    selectPhotoBtn.disabled = true;

    let uploadedFile = null;

    try {

        setPhotoUploadStatus(
            "Uploading your photo...",
            "info"
        );

        /*
           STEP 1:
           Upload the new image to Appwrite Storage.
        */

        uploadedFile = await storage.createFile(
            PROFILE_PHOTOS_BUCKET_ID,
            ID.unique(),
            selectedProfilePhotoFile
        );

        /*
           STEP 2:
           Save the new file ID in the existing
           student profile row.
        */

        let updatedProfile;

        try {

            updatedProfile = await tablesDB.updateRow(
                DATABASE_ID,
                USERS_TABLE_ID,
                profileStudent.$id,
                {
                    photoUrl: uploadedFile.$id
                }
            );

        } catch (databaseError) {

            /*
               The database update failed.
               Attempt to remove the newly uploaded
               image so it doesn't become an orphan.
            */

            try {

                await storage.deleteFile(
                    PROFILE_PHOTOS_BUCKET_ID,
                    uploadedFile.$id
                );

            } catch (cleanupError) {

                console.error(
                    "Could not remove unused uploaded photo:",
                    cleanupError
                );

            }

            throw databaseError;

        }

        /*
           STEP 3:
           Update the active student profile.
        */

        profileStudent = {
            ...profileStudent,
            ...updatedProfile,
            photoUrl: uploadedFile.$id
        };

        /*
           STEP 4:
           Update locally stored profile information.
        */

        if (typeof updateStoredStudent === "function") {

            updateStoredStudent();

        } else {

            try {

                const savedUser =
                    JSON.parse(
                        localStorage.getItem("aplusUser") || "null"
                    );

                if (savedUser) {

                    localStorage.setItem(
                        "aplusUser",
                        JSON.stringify({
                            ...savedUser,
                            photoUrl: uploadedFile.$id
                        })
                    );

                }

            } catch (storageError) {

                console.warn(
                    "Could not update cached student information:",
                    storageError
                );

            }

        }

        /*
           STEP 5:
           Load the permanent Appwrite image URL
           and synchronize dashboard images.
        */

        const permanentImageUrl =
            await getProfilePhotoPreviewUrl(uploadedFile.$id);

        originalProfilePhotoUrl = permanentImageUrl;

        setStudentPhoto(permanentImageUrl);

        /*
           STEP 6:
           Clear temporary preview state.
        */

        revokeProfilePhotoPreviewUrl();

        selectedProfilePhotoFile = null;

        if (profilePhotoInput) {
            profilePhotoInput.value = "";
        }

        if (uploadBtn) {
            uploadBtn.style.display = "none";
        }

        setPhotoUploadStatus(
            "Your profile photo has been updated successfully.",
            "success"
        );

        if (typeof showProfileMessage === "function") {

            showProfileMessage(
                "Your profile photo has been updated successfully.",
                "success"
            );

        }

    } catch (error) {

        console.error(
            "Profile photo upload failed:",
            error
        );

        /*
           The database may already have been updated
           if a later operation failed. Reload the saved
           profile before restoring the image.
        */

        if (uploadedFile) {

            try {

                const savedProfile = await tablesDB.getRow(
                    DATABASE_ID,
                    USERS_TABLE_ID,
                    profileStudent.$id
                );

                profileStudent = {
                    ...profileStudent,
                    ...savedProfile
                };

            } catch (reloadError) {

                console.error(
                    "Could not reload saved profile:",
                    reloadError
                );

            }

        }

        await restoreSavedProfilePhoto();

        const errorMessage =
            error && error.message
                ? error.message
                : "An unexpected error occurred.";

        setPhotoUploadStatus(
            "Photo upload failed: " + errorMessage,
            "error"
        );

    } finally {

        profilePhotoUploadInProgress = false;

        changePhotoBtn.disabled = false;

        selectPhotoBtn.disabled = false;

        if (uploadBtn) {

            uploadBtn.disabled = false;

            uploadBtn.innerHTML =
                previousButtonHtml ||
                `
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    <span>Upload Photo</span>
                `;

        }

    }

}


/* =========================================================
   PHOTO ERROR HANDLER
========================================================= */

function attachPhotoErrorHandler() {

    const profileImages =
        document.querySelectorAll(
            "#profilePhoto, #photoPreview, .student-photo"
        );

    profileImages.forEach((image) => {

        image.onerror = () => {

            const fallbackUrl =
                new URL(
                    PROFILE_PHOTO_FALLBACK,
                    document.baseURI
                ).href;

            if (image.src !== fallbackUrl) {
                image.src = fallbackUrl;
            }

        };

    });

}


/*==================================================
SHOW PROFILE MESSAGE
==================================================*/

function showProfileMessage(
    message,
    type = "info"
) {

    if (!profileMessage) {
        return;
    }

    profileMessage.textContent =
        message;

    profileMessage.className =
        "alert";

    if (type === "success") {

        profileMessage.classList.add(
            "alert-success"
        );

    } else if (type === "danger") {

        profileMessage.classList.add(
            "alert-danger"
        );

    } else if (type === "warning") {

        profileMessage.classList.add(
            "alert-warning"
        );

    } else {

        profileMessage.classList.add(
            "alert-info"
        );
    }

    profileMessage.hidden =
        false;
}


/*==================================================
CLEAR PROFILE MESSAGE
==================================================*/

function clearProfileMessage() {

    if (!profileMessage) {
        return;
    }

    profileMessage.textContent =
        "";

    profileMessage.hidden =
        true;
}


/*==================================================
HIDE PROFILE LOADER
==================================================*/

function hideProfileLoader() {

    if (!profileLoader) {
        return;
    }

    profileLoader.classList.add(
        "hidden"
    );

    setTimeout(
        function () {

            profileLoader.hidden =
                true;

        },
        300
    );
}


/*==================================================
PHASE 2
PROFILE FORM
==================================================*/

const saveProfileBtn =
    document.getElementById(
        "saveProfileBtn"
    );


/*==================================================
HANDLE PROFILE SUBMIT
==================================================*/

async function handleProfileSubmit(
    event
) {

    event.preventDefault();

    clearProfileMessage();

    const fullNameInput =
        document.getElementById(
            "fullName"
        );

    if (!fullNameInput) {
        return;
    }

    const fullName =
        fullNameInput.value.trim();


    /*------------------------------------------
    VALIDATION
    ------------------------------------------*/

    if (!fullName) {

        showProfileMessage(
            "Please enter your full name.",
            "danger"
        );

        fullNameInput.focus();

        return;
    }


    if (fullName.length < 3) {

        showProfileMessage(
            "Your full name must contain at least 3 characters.",
            "danger"
        );

        fullNameInput.focus();

        return;
    }


    if (fullName.length > 100) {

        showProfileMessage(
            "Your full name is too long.",
            "danger"
        );

        fullNameInput.focus();

        return;
    }


    /*------------------------------------------
    CHECK PROFILE
    ------------------------------------------*/

    if (
        !profileStudent ||
        !profileStudent.$id
    ) {

        showProfileMessage(
            "Your student profile could not be found. Please refresh the page and try again.",
            "danger"
        );

        return;
    }


    /*------------------------------------------
    CHECK IF ANYTHING CHANGED
    ------------------------------------------*/

    const currentName =
        String(
            profileStudent.fullName || ""
        ).trim();

    if (
        fullName ===
        currentName
    ) {

        showProfileMessage(
            "There are no changes to save.",
            "warning"
        );

        return;
    }


    /*------------------------------------------
    DISABLE SAVE BUTTON
    ------------------------------------------*/

    setProfileSaveState(
        true
    );


    try {

        /*--------------------------------------
        UPDATE USERS TABLE
        --------------------------------------*/

        const updatedUser =
            await tablesDB.updateRow(
                DATABASE_ID,
                USERS_TABLE_ID,
                profileStudent.$id,
                {
                    fullName: fullName
                }
            );


        /*--------------------------------------
        UPDATE LOCAL PROFILE STATE
        --------------------------------------*/

        profileStudent = {
            ...profileStudent,
            ...updatedUser
        };


        /*--------------------------------------
        UPDATE PAGE
        --------------------------------------*/

        setProfileText(
            "profileName",
            profileStudent.fullName
        );

        setProfileValue(
            "fullName",
            profileStudent.fullName
        );


        /*--------------------------------------
        UPDATE DASHBOARD NAME
        --------------------------------------*/

        updateStudentDashboardName(
            profileStudent.fullName
        );


        /*--------------------------------------
        UPDATE LOCAL STORAGE
        --------------------------------------*/

        updateStoredStudent();


        /*--------------------------------------
        SUCCESS MESSAGE
        --------------------------------------*/

        showProfileMessage(
            "Your profile has been updated successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Failed to update student profile:",
            error
        );

        showProfileMessage(
            getProfileErrorMessage(
                error
            ),
            "danger"
        );

    } finally {

        setProfileSaveState(
            false
        );
    }
}



/* =========================================================
   CHANGE PASSWORD
========================================================= */

function attachChangePasswordForm() {
    const passwordForm = document.getElementById("passwordForm");

    if (!passwordForm || passwordForm.dataset.initialized === "true") {
        return;
    }

    passwordForm.dataset.initialized = "true";

    passwordForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const currentPassword = document
            .getElementById("currentPassword")
            ?.value;

        const newPassword = document
            .getElementById("newPassword")
            ?.value;

        const confirmPassword = document
            .getElementById("confirmPassword")
            ?.value;

        const saveButton = document.getElementById("savePasswordBtn");
        const messageBox = document.getElementById("passwordMessage");

        if (!currentPassword || !newPassword || !confirmPassword) {
            showPasswordMessage(
                "Please complete all password fields.",
                "danger"
            );
            return;
        }

        if (newPassword.length < 8) {
            showPasswordMessage(
                "Your new password must contain at least 8 characters.",
                "danger"
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showPasswordMessage(
                "The new passwords do not match.",
                "danger"
            );
            return;
        }

        if (currentPassword === newPassword) {
            showPasswordMessage(
                "Your new password must be different from your current password.",
                "danger"
            );
            return;
        }

        const originalButtonText = saveButton
            ? saveButton.innerHTML
            : "";

        try {
            if (saveButton) {
                saveButton.disabled = true;
                saveButton.innerHTML =
                    '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
            }

            clearPasswordMessage();

            /*
             * Appwrite updates the password of the currently
             * authenticated account after verifying the
             * current password.
             */
            await account.updatePassword(
                newPassword,
                currentPassword
            );

            showPasswordMessage(
                "Your password has been changed successfully.",
                "success"
            );

            passwordForm.reset();

            /*
             * Keep the success message visible briefly,
             * then close the modal.
             */
            window.setTimeout(function () {
                const modalElement = document.getElementById(
                    "changePasswordModal"
                );

                if (modalElement && window.bootstrap) {
                    const modalInstance =
                        bootstrap.Modal.getInstance(modalElement);

                    if (modalInstance) {
                        modalInstance.hide();
                    }
                }

                clearPasswordMessage();
            }, 1800);

        } catch (error) {
            console.error("Password change failed:", error);

            let message =
                "Unable to change your password. Please try again.";

            if (
                error.code === 401 ||
                error.type === "user_invalid_credentials"
            ) {
                message =
                    "Your current password is incorrect. Please try again.";
            } else if (
                error.code === 400 &&
                error.type === "password_recently_used"
            ) {
                message =
                    "Please choose a password you have not used recently.";
            } else if (
                error.type === "password_personal_data"
            ) {
                message =
                    "Please choose a password that does not contain your personal information.";
            } else if (
                error.message &&
                /password/i.test(error.message)
            ) {
                message = error.message;
            }

            showPasswordMessage(message, "danger");

        } finally {
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.innerHTML = originalButtonText;
            }
        }
    });
}


/* =========================================================
   PASSWORD MESSAGE HELPERS
========================================================= */

function showPasswordMessage(message, type = "info") {
    const messageBox = document.getElementById("passwordMessage");

    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.className = `alert alert-${type}`;
    messageBox.classList.remove("d-none");
}

function clearPasswordMessage() {
    const messageBox = document.getElementById("passwordMessage");

    if (!messageBox) return;

    messageBox.textContent = "";
    messageBox.className = "alert d-none";
}



/* =========================================================
   OPEN CHANGE PASSWORD MODAL
========================================================= */

function attachChangePasswordButton() {
    const button = document.getElementById("changePasswordBtn");
    const modalElement = document.getElementById("changePasswordModal");

    if (!button || !modalElement) {
        console.error("Change password button or modal not found.", {
            buttonFound: !!button,
            modalFound: !!modalElement
        });
        return;
    }

    if (button.dataset.initialized === "true") {
        return;
    }

    button.dataset.initialized = "true";

    button.addEventListener("click", function () {
        clearPasswordMessage();

        const passwordForm = document.getElementById("passwordForm");

        if (passwordForm) {
            passwordForm.reset();
        }

        if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
            modal.show();
        } else {
            console.error(
                "Bootstrap JavaScript is not loaded. The password modal cannot open."
            );
        }
    });
}