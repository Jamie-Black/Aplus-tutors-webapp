"use strict";

/*==================================================
APLUS TUTORS
ADMIN PROFILE

BATCH 1
FOUNDATION
CONFIGURATION
AUTHENTICATION
==================================================*/


const ADMIN_PROFILE_APP_NAME =
"Aplus Tutors";

const ADMIN_PROFILE_BUCKET_ID =
PROFILE_PHOTOS_BUCKET_ID;



const profilePage =
document.getElementById(
"profileContent"
);

const profileLoader =
document.getElementById(
"pageLoader"
);

const profileForm =
document.getElementById(
"profileForm"
);

const profilePhotoInput =
document.getElementById(
"profilePhotoInput"
);

const profilePhoto =
document.getElementById(
"profilePhoto"
);

const photoPreview =
document.getElementById(
"photoPreview"
);

const selectPhotoBtn =
document.getElementById(
"selectPhotoBtn"
);

const changePhotoBtn =
document.getElementById(
"changePhotoBtn"
);

const saveProfileBtn =
document.getElementById(
"saveProfileBtn"
);

const changePasswordBtn =
document.getElementById(
"changePasswordBtn"
);

const profileLogoutBtn =
document.getElementById(
"profileLogoutBtn"
);

const profileMessage =
document.getElementById(
"profileMessage"
);

const photoUploadStatus =
document.getElementById(
"photoUploadStatus"
);



let profileAuthUser =
null;

let profileAdmin =
null;



let selectedProfilePhoto =
null;



const DEFAULT_ADMIN_PHOTO =
"assets/Screenshot_20260806-223602.png";



document.addEventListener(

"aplusAuthReady",

initializeAdminProfile

);

//==================================================
//INITIALIZE ADMIN PROFILE
//==================================================

function initializeAdminProfile(event) {

try {

    console.log(
        "========================================"
    );

    console.log(
        "APLUS TUTORS ADMIN PROFILE"
    );

    console.log(
        "========================================"
    );


    /*------------------------------------------
    AUTHENTICATED APPWRITE USER
    ------------------------------------------*/

    profileAuthUser =
        event.detail.authUser;


    /*------------------------------------------
    ADMIN DATABASE USER
    ------------------------------------------*/

    profileAdmin =
        event.detail.user;


    console.log(
        "Authenticated user:",
        profileAuthUser
    );

    console.log(
        "Admin profile:",
        profileAdmin
    );


    /*------------------------------------------
    VERIFY ADMIN
    ------------------------------------------*/

    if (!profileAdmin) {

        throw new Error(
            "Administrator profile was not found."
        );

    }


    /*------------------------------------------
VERIFY ADMIN
------------------------------------------*/

if (
  profileAdmin.role &&
  String(profileAdmin.role).toLowerCase() !== "admin"
) {
  throw new Error(
    "This account is not authorized as an administrator."
  );
}


    /*------------------------------------------
    CONTINUE INITIALIZATION
    ------------------------------------------*/

    initializeProfilePage();


}

catch (error) {

    console.error(
        "========================================"
    );

    console.error(
        "ADMIN PROFILE INITIALIZATION ERROR"
    );

    console.error(
        "========================================"
    );

    console.error(
        error
    );


    showProfileMessage(
        error.message ||
        "Unable to load administrator profile.",
        "error"
    );


    hideProfileLoader();

}

}





function hideProfileLoader() {

if (!profileLoader) {

    return;

}


profileLoader.style.opacity =
    "0";


setTimeout(

    function () {

        profileLoader.style.display =
            "none";

    },

    300

);

}


function showProfileMessage(
message,
type = "error"
) {

if (!profileMessage) {

    return;

}


profileMessage.textContent =
    message;


profileMessage.className =
    "profile-message " + type;

}


function clearProfileMessage() {

if (!profileMessage) {

    return;

}


profileMessage.textContent =
    "";


profileMessage.className =
    "profile-message";

}



function showPhotoStatus(
message,
type = ""
) {

if (!photoUploadStatus) {

    return;

}


photoUploadStatus.textContent =
    message;


photoUploadStatus.className =
    "photo-upload-status";


if (type) {

    photoUploadStatus.classList.add(
        type
    );

}

}


function clearPhotoStatus() {

if (!photoUploadStatus) {

    return;

}


photoUploadStatus.textContent =
    "";


photoUploadStatus.className =
    "photo-upload-status";

}


/*==================================================
BATCH 2
PROFILE DATA
POPULATE PROFILE
PROFILE PHOTO DISPLAY
==================================================*/


/*==================================================
POPULATE PROFILE INFORMATION
==================================================*/

function populateProfile() {

    if (!profileAdmin) {
        console.warn(
            "No administrator data available."
        );

        return;
    }

    /*------------------------------------------
    HEADER
    ------------------------------------------*/

    setProfileText(
        "profileName",
        profileAdmin.fullName
    );

    setProfileText(
        "profileEmail",
        profileAdmin.email
    );


    /*------------------------------------------
    FORM
    ------------------------------------------*/

    setProfileValue(
        "fullName",
        profileAdmin.fullName
    );

    setProfileValue(
        "email",
        profileAdmin.email
    );

    setProfileValue(
        "department",
        profileAdmin.department
    );

    setProfileValue(
        "role",
        profileAdmin.role
    );

    setProfileValue(
        "status",
        profileAdmin.status
    );


    /*------------------------------------------
    STATUS BADGE
    ------------------------------------------*/

    updateProfileStatus(
        profileAdmin.status
    );


    /*------------------------------------------
    PROFILE PHOTO
    ------------------------------------------*/

    loadProfilePhoto();

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
        return;
    }

    element.textContent =
        value || "Not provided";

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
        value || "";

}


/*==================================================
UPDATE STATUS BADGE
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

    const normalizedStatus =
        String(
            status || "unknown"
        ).toLowerCase();


    /*------------------------------------------
    RESET
    ------------------------------------------*/

    badge.className =
        "profile-status-badge";


    /*------------------------------------------
    STATUS CLASS
    ------------------------------------------*/

    if (
        normalizedStatus ===
        "active"
    ) {

        badge.classList.add(
            "active"
        );

    }
    else if (
        normalizedStatus ===
        "pending"
    ) {

        badge.classList.add(
            "pending"
        );

    }
    else if (
        normalizedStatus ===
        "suspended"
    ) {

        badge.classList.add(
            "suspended"
        );

    }
    else {

        badge.classList.add(
            "unknown"
        );

    }


    /*------------------------------------------
    DISPLAY TEXT
    ------------------------------------------*/

    badge.textContent =
        formatStatus(
            normalizedStatus
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

    return status
        .charAt(0)
        .toUpperCase() +
        status.slice(1);

}


/*==================================================
LOAD PROFILE PHOTO
==================================================*/

async function loadProfilePhoto() {

    if (!profileAdmin) {
        return;
    }


    const photoFileId =
        profileAdmin.photoUrl;


    /*------------------------------------------
    NO PHOTO
    ------------------------------------------*/

    if (!photoFileId) {

        setDefaultProfilePhoto();

        return;
    }


    /*------------------------------------------
    LOAD APPWRITE PHOTO
    ------------------------------------------*/

    try {

        console.log(
            "Loading profile photo file:",
            photoFileId
        );


        const preview =
            storage.getFilePreview(
                ADMIN_PROFILE_BUCKET_ID,
                photoFileId,
                800,
                800
            );


        console.log(
            "Appwrite profile preview:",
            preview
        );


        /*--------------------------------------
        APPWRITE RETURNS THE URL DIRECTLY
        --------------------------------------*/

        const photoUrl =
            preview;


        console.log(
            "Profile photo URL:",
            photoUrl
        );


        if (!photoUrl) {

            throw new Error(
                "Appwrite did not return a valid photo URL."
            );

        }


        /*--------------------------------------
        MAIN PROFILE PHOTO
        --------------------------------------*/

        if (profilePhoto) {

            profilePhoto.src =
                photoUrl;

        }


        /*--------------------------------------
        PHOTO PREVIEW
        --------------------------------------*/

        if (photoPreview) {

            photoPreview.src =
                photoUrl;

        }


        /*--------------------------------------
        DASHBOARD PHOTOS
        --------------------------------------*/

        const dashboardPhotos =
            document.querySelectorAll(
                ".admin-photo"
            );


        dashboardPhotos.forEach(
            function (image) {

                image.src =
                    photoUrl;

            }
        );


        console.log(
            "Profile photo loaded successfully."
        );

    }
    catch (error) {

        console.error(
            "Profile photo loading error:",
            error
        );

        setDefaultProfilePhoto();

    }

}


/*==================================================
SET DEFAULT PROFILE PHOTO
==================================================*/

function setDefaultProfilePhoto() {

    if (profilePhoto) {

        profilePhoto.src =
            DEFAULT_ADMIN_PHOTO;

    }


    if (photoPreview) {

        photoPreview.src =
            DEFAULT_ADMIN_PHOTO;

    }


    updateDashboardPhotos(
        DEFAULT_ADMIN_PHOTO
    );

}


/*==================================================
UPDATE DASHBOARD PROFILE PHOTOS
==================================================*/

function updateDashboardPhotos(
    photoUrl
) {

    const dashboardPhotos =
        document.querySelectorAll(
            ".admin-photo"
        );


    dashboardPhotos.forEach(
        function (image) {

            image.src =
                photoUrl;

        }
    );

}


/*==================================================
PROFILE PHOTO ERROR HANDLER
==================================================*/

function attachPhotoErrorHandler() {

    const photos =
        document.querySelectorAll(
            ".admin-photo, #profilePhoto, #photoPreview"
        );


    photos.forEach(
        function (image) {

            image.addEventListener(
                "error",
                function () {

                    if (
                        image.src.includes(
                            DEFAULT_ADMIN_PHOTO
                        )
                    ) {
                        return;
                    }

                    image.src =
                        DEFAULT_ADMIN_PHOTO;

                }
            );

        }
    );

}



/*==================================================
BATCH 3
PROFILE FORM
SAVE PROFILE INFORMATION
==================================================*/


/*==================================================
ATTACH PROFILE FORM
==================================================*/

function attachProfileForm() {

    if (!profileForm) {
        console.warn(
            "Profile form was not found."
        );

        return;
    }


    profileForm.addEventListener(
        "submit",
        handleProfileSubmit
    );

}


/*==================================================
HANDLE PROFILE SUBMIT
==================================================*/

async function handleProfileSubmit(
    event
) {

    event.preventDefault();


    clearProfileMessage();


    /*------------------------------------------
    GET FULL NAME
    ------------------------------------------*/

    const fullNameInput =
        document.getElementById(
            "fullName"
        );


    if (!fullNameInput) {

        showProfileMessage(
            "Full name field was not found.",
            "error"
        );

        return;
    }


    const fullName =
        fullNameInput.value.trim();


    /*------------------------------------------
    VALIDATE NAME
    ------------------------------------------*/

    if (!fullName) {

        showProfileMessage(
            "Please enter your full name.",
            "error"
        );

        fullNameInput.focus();

        return;
    }


    if (fullName.length < 3) {

        showProfileMessage(
            "Full name must contain at least 3 characters.",
            "error"
        );

        fullNameInput.focus();

        return;
    }


    /*------------------------------------------
    CHECK ADMIN RECORD
    ------------------------------------------*/

    if (!profileAdmin) {

        showProfileMessage(
            "Administrator information is unavailable.",
            "error"
        );

        return;
    }


    if (!profileAdmin.$id) {

        showProfileMessage(
            "Administrator record ID was not found.",
            "error"
        );

        console.error(
            "Profile record does not contain $id:",
            profileAdmin
        );

        return;
    }


    /*------------------------------------------
    PREVENT DUPLICATE SUBMISSION
    ------------------------------------------*/

    setProfileSaveState(
        true
    );


    try {

        console.log(
            "Saving administrator profile..."
        );


        /*--------------------------------------
        UPDATE USERS TABLE
        --------------------------------------*/

        const updatedUser =
            await tablesDB.updateRow(
                DATABASE_ID,
                USERS_TABLE_ID,
                profileAdmin.$id,
                {
                    fullName: fullName
                }
            );


        /*--------------------------------------
        UPDATE LOCAL ADMIN DATA
        --------------------------------------*/

        profileAdmin =
            {
                ...profileAdmin,
                ...updatedUser
            };


        /*--------------------------------------
        UPDATE DISPLAY
        --------------------------------------*/

        setProfileText(
            "profileName",
            profileAdmin.fullName
        );


        setProfileValue(
            "fullName",
            profileAdmin.fullName
        );


        /*--------------------------------------
        UPDATE DASHBOARD NAME
        --------------------------------------*/

        const adminNames =
            document.querySelectorAll(
                ".admin-name"
            );


        adminNames.forEach(
            function (element) {

                element.textContent =
                    profileAdmin.fullName;

            }
        );


        /*--------------------------------------
        UPDATE LOCAL STORAGE
        --------------------------------------*/

        updateStoredAdmin();


        /*--------------------------------------
        SUCCESS
        --------------------------------------*/

        showProfileMessage(
            "Profile information saved successfully.",
            "success"
        );


        console.log(
            "Administrator profile updated:",
            updatedUser
        );

    }
    catch (error) {

        console.error(
            "Profile update error:",
            error
        );


        showProfileMessage(
            getProfileErrorMessage(
                error
            ),
            "error"
        );

    }
    finally {

        setProfileSaveState(
            false
        );

    }

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
            <i class="fa-solid fa-floppy-disk me-2"></i>
            Save Changes
        `;

    }

}


/*==================================================
UPDATE STORED ADMIN
==================================================*/

function updateStoredAdmin() {

    try {

        const storedUser =
            localStorage.getItem(
                "aplusUser"
            );


        if (!storedUser) {
            return;
        }


        const parsedUser =
            JSON.parse(
                storedUser
            );


        const updatedStoredUser =
            {
                ...parsedUser,
                ...profileAdmin
            };


        localStorage.setItem(
            "aplusUser",
            JSON.stringify(
                updatedStoredUser
            )
        );


        console.log(
            "Local administrator data updated."
        );

    }
    catch (error) {

        console.warn(
            "Unable to update local administrator data:",
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
    APPWRITE PERMISSION ERROR
    ------------------------------------------*/

    if (
        error.code === 401 ||
        error.code === 403
    ) {

        return (
            "You do not have permission to update this profile."
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
    GENERAL ERROR
    ------------------------------------------*/

    console.error(
        "Detailed profile error:",
        error
    );


    return (
        error.message ||
        "Unable to save your profile information. Please try again."
    );

}



/*==================================================
BATCH 4
PROFILE PHOTO
PHOTO SELECTION
PHOTO PREVIEW
APPWRITE STORAGE UPLOAD
==================================================*/


/*==================================================
ATTACH PHOTO EVENTS
==================================================*/

function attachPhotoEvents() {

    /*------------------------------------------
    SELECT PHOTO BUTTON
    ------------------------------------------*/

    if (selectPhotoBtn) {

        selectPhotoBtn.addEventListener(
            "click",
            function () {

                if (profilePhotoInput) {
                    profilePhotoInput.click();
                }

            }
        );

    }


    /*------------------------------------------
    HEADER PHOTO BUTTON
    ------------------------------------------*/

    if (changePhotoBtn) {

        changePhotoBtn.addEventListener(
            "click",
            function () {

                if (profilePhotoInput) {
                    profilePhotoInput.click();
                }

            }
        );

    }


    /*------------------------------------------
    FILE INPUT
    ------------------------------------------*/

    if (profilePhotoInput) {

        profilePhotoInput.addEventListener(
            "change",
            handleProfilePhotoSelection
        );

    }

}


/*==================================================
HANDLE PHOTO SELECTION
==================================================*/

function handleProfilePhotoSelection(
    event
) {

    clearProfileMessage();
    clearPhotoStatus();


    const files =
        event.target.files;


    /*------------------------------------------
    NO FILE
    ------------------------------------------*/

    if (
        !files ||
        files.length === 0
    ) {
        return;
    }


    const file =
        files[0];


    /*------------------------------------------
    VALIDATE FILE
    ------------------------------------------*/

    const validation =
        validateProfilePhoto(
            file
        );


    if (!validation.valid) {

        showPhotoStatus(
            validation.message,
            "error"
        );

        profilePhotoInput.value =
            "";

        selectedProfilePhoto =
            null;

        return;
    }


    /*------------------------------------------
    STORE SELECTED FILE
    ------------------------------------------*/

    selectedProfilePhoto =
        file;


    /*------------------------------------------
    SHOW LOCAL PREVIEW
    ------------------------------------------*/

    showLocalPhotoPreview(
        file
    );


    /*------------------------------------------
    SHOW STATUS
    ------------------------------------------*/

    showPhotoStatus(
        "Photo selected. Uploading...",
        "success"
    );


    /*------------------------------------------
    UPLOAD PHOTO
    ------------------------------------------*/

    uploadProfilePhoto(
        file
    );

}


/*==================================================
VALIDATE PROFILE PHOTO
==================================================*/

function validateProfilePhoto(
    file
) {

    if (!file) {

        return {
            valid: false,
            message: "Please select a photo."
        };

    }


    /*------------------------------------------
    FILE TYPE
    ------------------------------------------*/

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        return {
            valid: false,
            message:
                "Please select a JPG, PNG or WEBP image."
        };

    }


    /*------------------------------------------
    FILE SIZE
    ------------------------------------------*/

    const maxSize =
        5 * 1024 * 1024;


    if (
        file.size > maxSize
    ) {

        return {
            valid: false,
            message:
                "Photo size must not exceed 5 MB."
        };

    }


    return {
        valid: true,
        message: ""
    };

}


/*==================================================
SHOW LOCAL PHOTO PREVIEW
==================================================*/

function showLocalPhotoPreview(
    file
) {

    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            const imageUrl =
                event.target.result;


            /*--------------------------------------
            PROFILE HEADER
            --------------------------------------*/

            if (profilePhoto) {

                profilePhoto.src =
                    imageUrl;

            }


            /*--------------------------------------
            PHOTO PREVIEW CARD
            --------------------------------------*/

            if (photoPreview) {

                photoPreview.src =
                    imageUrl;

            }


            /*--------------------------------------
            DASHBOARD
            --------------------------------------*/

            updateDashboardPhotos(
                imageUrl
            );

        };


    reader.onerror =
        function () {

            showPhotoStatus(
                "Unable to preview the selected photo.",
                "error"
            );

        };


    reader.readAsDataURL(
        file
    );

}


/*==================================================
UPLOAD PROFILE PHOTO
==================================================*/

async function uploadProfilePhoto(
    file
) {

    if (!file) {
        return;
    }


    if (!profileAdmin) {

        showPhotoStatus(
            "Administrator information is unavailable.",
            "error"
        );

        return;
    }


    /*------------------------------------------
    PREVENT MULTIPLE UPLOADS
    ------------------------------------------*/

    setPhotoUploadState(
        true
    );


    let uploadedFileId =
        null;


    try {

        console.log(
            "Uploading profile photo..."
        );


        /*--------------------------------------
        GENERATE FILE ID
        --------------------------------------*/

        const fileId =
            ID.unique();


        /*--------------------------------------
        UPLOAD TO APPWRITE STORAGE
        --------------------------------------*/

        const uploadedFile =
            await storage.createFile(
                ADMIN_PROFILE_BUCKET_ID,
                fileId,
                file
            );


        uploadedFileId =
            uploadedFile.$id;


        console.log(
            "Photo uploaded:",
            uploadedFile
        );


        /*--------------------------------------
        UPDATE USERS TABLE
        --------------------------------------*/

        const updatedUser =
            await tablesDB.updateRow(
                DATABASE_ID,
                USERS_TABLE_ID,
                profileAdmin.$id,
                {
                    photoUrl:
                        uploadedFileId
                }
            );


        /*--------------------------------------
        STORE UPDATED USER
        --------------------------------------*/

        profileAdmin =
            {
                ...profileAdmin,
                ...updatedUser,
                photoUrl:
                    uploadedFileId
            };


        /*--------------------------------------
        UPDATE LOCAL STORAGE
        --------------------------------------*/

        updateStoredAdmin();


        /*--------------------------------------
        DISPLAY APPWRITE PHOTO
        --------------------------------------*/

        await loadProfilePhoto();


        /*--------------------------------------
        SUCCESS
        --------------------------------------*/

        showPhotoStatus(
            "Profile photo updated successfully.",
            "success"
        );


        showProfileMessage(
            "Your profile photo has been updated successfully.",
            "success"
        );


        console.log(
            "Profile photo update completed."
        );


    }
    catch (error) {

        console.error(
            "Profile photo upload error:",
            error
        );


        /*--------------------------------------
        DELETE ORPHANED FILE
        --------------------------------------*/

        if (uploadedFileId) {

            try {

                await storage.deleteFile(
                    ADMIN_PROFILE_BUCKET_ID,
                    uploadedFileId
                );

                console.log(
                    "Orphaned uploaded file deleted."
                );

            }
            catch (deleteError) {

                console.warn(
                    "Unable to delete orphaned file:",
                    deleteError
                );

            }

        }


        /*--------------------------------------
        RESTORE OLD PHOTO
        --------------------------------------*/

        await loadProfilePhoto();


        showPhotoStatus(
            getPhotoErrorMessage(
                error
            ),
            "error"
        );


        showProfileMessage(
            getPhotoErrorMessage(
                error
            ),
            "error"
        );

    }
    finally {

        setPhotoUploadState(
            false
        );

        selectedProfilePhoto =
            null;

        if (profilePhotoInput) {
            profilePhotoInput.value =
                "";
        }

    }

}


/*==================================================
PHOTO UPLOAD BUTTON STATE
==================================================*/

function setPhotoUploadState(
    uploading
) {

    if (selectPhotoBtn) {

        selectPhotoBtn.disabled =
            uploading;


        if (uploading) {

            selectPhotoBtn.innerHTML = `
                <span
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                ></span>
                Uploading...
            `;

        }
        else {

            selectPhotoBtn.innerHTML = `
                <i class="fa-solid fa-camera me-2"></i>
                Select Photo
            `;

        }

    }


    if (changePhotoBtn) {

        changePhotoBtn.disabled =
            uploading;

    }

}


/*==================================================
PHOTO ERROR MESSAGE
==================================================*/

function getPhotoErrorMessage(
    error
) {

    if (!error) {

        return (
            "Unable to update your profile photo."
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
            "You do not have permission to upload a profile photo."
        );

    }


    /*------------------------------------------
    FILE SIZE ERROR
    ------------------------------------------*/

    if (
        error.message &&
        error.message
            .toLowerCase()
            .includes("size")
    ) {

        return (
            "The selected photo is too large."
        );

    }


    /*------------------------------------------
    GENERAL ERROR
    ------------------------------------------*/

    return (
        error.message ||
        "Unable to update your profile photo. Please try again."
    );

}


/*==================================================
BATCH 5
SECURITY
CHANGE PASSWORD
LOGOUT
FINAL INITIALIZATION
==================================================*/


/*==================================================
PASSWORD ELEMENTS
==================================================*/

const passwordForm =
    document.getElementById(
        "passwordForm"
    );

const currentPasswordInput =
    document.getElementById(
        "currentPassword"
    );

const newPasswordInput =
    document.getElementById(
        "newPassword"
    );

const confirmPasswordInput =
    document.getElementById(
        "confirmPassword"
    );

const savePasswordBtn =
    document.getElementById(
        "savePasswordBtn"
    );

const passwordMessage =
    document.getElementById(
        "passwordMessage"
    );

const changePasswordModalElement =
    document.getElementById(
        "changePasswordModal"
    );


/*==================================================
BOOTSTRAP PASSWORD MODAL
==================================================*/

let changePasswordModal =
    null;


/*==================================================
ATTACH SECURITY EVENTS
==================================================*/

function attachSecurityEvents() {

    /*------------------------------------------
    CHANGE PASSWORD BUTTON
    ------------------------------------------*/

    if (changePasswordBtn) {

        changePasswordBtn.addEventListener(
            "click",
            openChangePasswordModal
        );

    }


    /*------------------------------------------
    PASSWORD FORM
    ------------------------------------------*/

    if (passwordForm) {

        passwordForm.addEventListener(
            "submit",
            handlePasswordSubmit
        );

    }


    /*------------------------------------------
    LOGOUT
    ------------------------------------------*/

    if (profileLogoutBtn) {

        profileLogoutBtn.addEventListener(
            "click",
            handleProfileLogout
        );

    }


    /*------------------------------------------
    MODAL CLOSED
    ------------------------------------------*/

    if (changePasswordModalElement) {

        changePasswordModalElement.addEventListener(
            "hidden.bs.modal",
            clearPasswordForm
        );

    }

}


/*==================================================
OPEN CHANGE PASSWORD MODAL
==================================================*/

function openChangePasswordModal() {

    clearPasswordMessage();


    if (!changePasswordModalElement) {
        return;
    }


    /*------------------------------------------
    CREATE BOOTSTRAP MODAL INSTANCE
    ------------------------------------------*/

    if (!changePasswordModal) {

        changePasswordModal =
            bootstrap.Modal.getOrCreateInstance(
                changePasswordModalElement
            );

    }


    changePasswordModal.show();

}


/*==================================================
HANDLE PASSWORD SUBMIT
==================================================*/

async function handlePasswordSubmit(
    event
) {

    event.preventDefault();


    clearPasswordMessage();


    /*------------------------------------------
    GET VALUES
    ------------------------------------------*/

    const currentPassword =
        currentPasswordInput
            ? currentPasswordInput.value
            : "";

    const newPassword =
        newPasswordInput
            ? newPasswordInput.value
            : "";

    const confirmPassword =
        confirmPasswordInput
            ? confirmPasswordInput.value
            : "";


    /*------------------------------------------
    VALIDATE CURRENT PASSWORD
    ------------------------------------------*/

    if (!currentPassword) {

        showPasswordMessage(
            "Please enter your current password.",
            "error"
        );

        currentPasswordInput.focus();

        return;

    }


    /*------------------------------------------
    VALIDATE NEW PASSWORD
    ------------------------------------------*/

    if (!newPassword) {

        showPasswordMessage(
            "Please enter a new password.",
            "error"
        );

        newPasswordInput.focus();

        return;

    }


    if (newPassword.length < 8) {

        showPasswordMessage(
            "Your new password must contain at least 8 characters.",
            "error"
        );

        newPasswordInput.focus();

        return;

    }


    /*------------------------------------------
    CONFIRM PASSWORD
    ------------------------------------------*/

    if (!confirmPassword) {

        showPasswordMessage(
            "Please confirm your new password.",
            "error"
        );

        confirmPasswordInput.focus();

        return;

    }


    if (
        newPassword !==
        confirmPassword
    ) {

        showPasswordMessage(
            "The new passwords do not match.",
            "error"
        );

        confirmPasswordInput.focus();

        return;

    }


    /*------------------------------------------
    PREVENT SAME PASSWORD
    ------------------------------------------*/

    if (
        currentPassword ===
        newPassword
    ) {

        showPasswordMessage(
            "Your new password must be different from your current password.",
            "error"
        );

        newPasswordInput.focus();

        return;

    }


    /*------------------------------------------
    SAVE PASSWORD
    ------------------------------------------*/

    setPasswordSaveState(
        true
    );


    try {

        console.log(
            "Changing administrator password..."
        );


        await account.updatePassword(
            newPassword,
            currentPassword
        );


        /*--------------------------------------
        SUCCESS
        --------------------------------------*/

        showPasswordMessage(
            "Password changed successfully.",
            "success"
        );


        showProfileMessage(
            "Your password has been changed successfully.",
            "success"
        );


        console.log(
            "Administrator password changed successfully."
        );


        /*--------------------------------------
        RESET FORM
        --------------------------------------*/

        setTimeout(
            function () {

                clearPasswordForm();


                if (changePasswordModal) {

                    changePasswordModal.hide();

                }

            },
            1500
        );

    }
    catch (error) {

        console.error(
            "Password change error:",
            error
        );


        showPasswordMessage(
            getPasswordErrorMessage(
                error
            ),
            "error"
        );

    }
    finally {

        setPasswordSaveState(
            false
        );

    }

}


/*==================================================
PASSWORD SAVE BUTTON STATE
==================================================*/

function setPasswordSaveState(
    saving
) {

    if (!savePasswordBtn) {
        return;
    }


    if (saving) {

        savePasswordBtn.disabled =
            true;

        savePasswordBtn.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
            ></span>
            Updating...
        `;

    }
    else {

        savePasswordBtn.disabled =
            false;

        savePasswordBtn.innerHTML = `
            <i class="fa-solid fa-key me-2"></i>
            Change Password
        `;

    }

}


/*==================================================
PASSWORD MESSAGE
==================================================*/

function showPasswordMessage(
    message,
    type = "error"
) {

    if (!passwordMessage) {
        return;
    }


    passwordMessage.textContent =
        message;


    passwordMessage.className =
        "password-message " + type;

}


/*==================================================
CLEAR PASSWORD MESSAGE
==================================================*/

function clearPasswordMessage() {

    if (!passwordMessage) {
        return;
    }


    passwordMessage.textContent =
        "";


    passwordMessage.className =
        "password-message";

}


/*==================================================
CLEAR PASSWORD FORM
==================================================*/

function clearPasswordForm() {

    if (passwordForm) {

        passwordForm.reset();

    }


    clearPasswordMessage();

}


/*==================================================
PASSWORD ERROR MESSAGE
==================================================*/

function getPasswordErrorMessage(
    error
) {

    if (!error) {

        return (
            "Unable to change your password."
        );

    }


    /*------------------------------------------
    WRONG CURRENT PASSWORD
    ------------------------------------------*/

    if (
        error.code === 401
    ) {

        return (
            "Your current password is incorrect."
        );

    }


    /*------------------------------------------
    PASSWORD VALIDATION
    ------------------------------------------*/

    if (
        error.message &&
        (
            error.message
                .toLowerCase()
                .includes("password")
        )
    ) {

        return error.message;

    }


    /*------------------------------------------
    GENERAL ERROR
    ------------------------------------------*/

    return (
        error.message ||
        "Unable to change your password. Please try again."
    );

}


/*==================================================
PROFILE LOGOUT
==================================================*/

async function handleProfileLogout() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {
        return;
    }


    /*------------------------------------------
    DISABLE BUTTON
    ------------------------------------------*/

    profileLogoutBtn.disabled =
        true;


    profileLogoutBtn.innerHTML = `
        <span
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
        ></span>
        Logging out...
    `;


    try {

        await account.deleteSession(
            "current"
        );

    }
    catch (error) {

        console.error(
            "Profile logout error:",
            error
        );

    }


    /*------------------------------------------
    CLEAR LOCAL USER DATA
    ------------------------------------------*/

    localStorage.removeItem(
        "aplusUser"
    );


    /*------------------------------------------
    REDIRECT
    ------------------------------------------*/

    window.location.href =
        "login.html";

}


/*==================================================
FINALIZE PROFILE PAGE
==================================================*/

function finalizeAdminProfile() {

    console.log(
        "Finalizing administrator profile..."
    );


    /*------------------------------------------
    PROFILE EVENTS
    ------------------------------------------*/

    attachSecurityEvents();


    /*------------------------------------------
    INITIAL PAGE STATE
    ------------------------------------------*/

    clearProfileMessage();

    clearPhotoStatus();

    clearPasswordMessage();


    /*------------------------------------------
    PROFILE READY
    ------------------------------------------*/

    console.log(
        "========================================"
    );

    console.log(
        "ADMIN PROFILE READY"
    );

    console.log(
        "========================================"
    );

}


/*==================================================
UPDATE INITIALIZATION
==================================================*/

function initializeProfilePage() {

    console.log(
        "Initializing admin profile page..."
    );


    /*------------------------------------------
    PROFILE DATA
    ------------------------------------------*/

    populateProfile();


    /*------------------------------------------
    PHOTO ERROR HANDLING
    ------------------------------------------*/

    attachPhotoErrorHandler();


    /*------------------------------------------
    PROFILE FORM
    ------------------------------------------*/

    attachProfileForm();


    /*------------------------------------------
    PHOTO EVENTS
    ------------------------------------------*/

    attachPhotoEvents();


    /*------------------------------------------
    SECURITY EVENTS
    ------------------------------------------*/

    finalizeAdminProfile();


    /*------------------------------------------
    PAGE READY
    ------------------------------------------*/

    hideProfileLoader();

}