// =========================================
// APLUS TUTORS AUTHENTICATION SYSTEM
// =========================================


// =========================================
// HELPER FUNCTIONS
// =========================================

function showAuthMessage(message, type = "error") {

    const messageBox =
        document.getElementById("authMessage");

    if (!messageBox) return;

    messageBox.textContent = message;

    messageBox.className =
        `auth-message show ${type}`;
}


function hideAuthMessage() {

    const messageBox =
        document.getElementById("authMessage");

    if (!messageBox) return;

    messageBox.className =
        "auth-message";

    messageBox.textContent = "";
}


// =========================================
// PASSWORD TOGGLE
// =========================================

document
    .querySelectorAll(".password-toggle")
    .forEach(button => {

        button.addEventListener("click", () => {

            const targetId =
                button.dataset.target;

            const input =
                document.getElementById(targetId);

            const icon =
                button.querySelector("i");


            if (!input) return;


            if (input.type === "password") {

                input.type = "text";

                if (icon) {

                    icon.classList.remove(
                        "fa-eye"
                    );

                    icon.classList.add(
                        "fa-eye-slash"
                    );

                }

            } else {

                input.type = "password";

                if (icon) {

                    icon.classList.remove(
                        "fa-eye-slash"
                    );

                    icon.classList.add(
                        "fa-eye"
                    );

                }

            }

        });

    });


// =========================================
// STUDENT REGISTRATION
// =========================================

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            hideAuthMessage();


            // =========================================
            // GET FORM VALUES
            // =========================================

            const fullName =
                document
                    .getElementById("fullName")
                    ?.value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    ?.value
                    .trim()
                    .toLowerCase();


            const phone =
                document
                    .getElementById("phone")
                    ?.value
                    .trim();
                    
            const department =
    document
        .getElementById("department")
        ?.value;
        

            const password =
                document
                    .getElementById("password")
                    ?.value;


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    ?.value;


            const terms =
                document
                    .getElementById("terms")
                    ?.checked;


            const registerBtn =
                document
                    .getElementById("registerBtn");


            // =========================================
            // VALIDATION
            // =========================================

            if (!fullName) {

                showAuthMessage(
                    "Please enter your full name."
                );

                return;
            }


            if (!email) {

                showAuthMessage(
                    "Please enter your email address."
                );

                return;
            }


            if (!phone) {

                showAuthMessage(
                    "Please enter your phone number."
                );

                return;
            }
            
            if (!department) {

    showAuthMessage(
        "Please select your department."
    );

    return;

}


            if (!password) {

                showAuthMessage(
                    "Please create a password."
                );

                return;
            }


            if (password.length < 8) {

                showAuthMessage(
                    "Password must be at least 8 characters long."
                );

                return;
            }


            if (password !== confirmPassword) {

                showAuthMessage(
                    "Passwords do not match."
                );

                return;
            }


            if (!terms) {

                showAuthMessage(
                    "Please agree to the Terms of Service and Privacy Policy."
                );

                return;
            }


            // =========================================
            // LOADING STATE
            // =========================================

            if (registerBtn) {

                registerBtn.disabled = true;

                registerBtn.classList.add(
                    "loading"
                );

            }


            try {

                // =========================================
                // CREATE APPWRITE AUTH ACCOUNT
                // =========================================

                const authUser =
                    await account.create(
                        ID.unique(),
                        email,
                        password,
                        fullName
                    );


                console.log(
                    "Auth account created:",
                    authUser
                );


                // =========================================
                // CREATE USER PROFILE
                // =========================================

                const userProfile =
                    await tablesDB.createRow({

                        databaseId:
                            DATABASE_ID,

                        tableId:
                            USERS_TABLE_ID,

                        rowId:
                            ID.unique(),

                        data: {

                            userId:
                                authUser.$id,

                            fullName:
                                fullName,

                            email:
                                email,

                            // Students can never
                            // choose their own role

                            role:
                                "student",

                            // Account requires
                            // payment activation

                            status:
                                "pending",

                            phone:
    phone,

department:
    department,

photoUrl:
    ""

                        }

                    });


                console.log(
                    "User profile created:",
                    userProfile
                );


                // =========================================
                // SAVE REGISTRATION DETAILS
                // =========================================
                //
                // These are temporarily stored so the
                // registration-success.html page can
                // display the student's information.
                //
                // This is NOT used as the permanent
                // database record.
                // =========================================

                sessionStorage.setItem(
                    "registrationName",
                    fullName
                );


                sessionStorage.setItem(
                    "registrationEmail",
                    email
                );


                sessionStorage.setItem(
                    "registrationPhone",
                    phone
                );
                
                sessionStorage.setItem(
    "registrationDepartment",
    department
);


                sessionStorage.setItem(
                    "registrationUserId",
                    authUser.$id
                );


                // =========================================
                // REDIRECT TO PAYMENT INSTRUCTIONS
                // =========================================

                window.location.href =
                    "registration-success.html";



            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                let errorMessage =
                    "Something went wrong during registration. Please try again.";


                // =========================================
                // HANDLE APPWRITE ERRORS
                // =========================================

                if (
                    error.code === 409
                ) {

                    errorMessage =
                        "An account with this email already exists. Please login instead.";

                }


                else if (
                    error.code === 400
                ) {

                    errorMessage =
                        error.message ||
                        "Please check your information and try again.";

                }


                else if (
                    error.code === 401
                ) {

                    errorMessage =
                        "You are not authorized to create your profile. Please check your Appwrite permissions.";

                }


                else if (
                    error.code === 404
                ) {

                    errorMessage =
                        "The requested Appwrite resource was not found. Please check your database and table configuration.";

                }


                else if (
                    error.message
                ) {

                    errorMessage =
                        error.message;

                }


                showAuthMessage(
                    errorMessage
                );


            } finally {

                if (registerBtn) {

                    registerBtn.disabled =
                        false;

                    registerBtn.classList.remove(
                        "loading"
                    );

                }

            }

        }
    );

}


// =========================================
// STUDENT LOGIN
// =========================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            hideAuthMessage();


            // =========================================
            // GET LOGIN VALUES
            // =========================================

            const email =
                document
                    .getElementById("loginEmail")
                    ?.value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("loginPassword")
                    ?.value;


            const loginBtn =
                document
                    .getElementById("loginBtn");


            // =========================================
            // VALIDATION
            // =========================================

            if (!email) {

                showAuthMessage(
                    "Please enter your email address."
                );

                return;
            }


            if (!password) {

                showAuthMessage(
                    "Please enter your password."
                );

                return;
            }


            // =========================================
            // LOADING STATE
            // =========================================

            if (loginBtn) {

                loginBtn.disabled = true;

                loginBtn.classList.add(
                    "loading"
                );

            }


            try {

                // =========================================
                // CREATE LOGIN SESSION
                // =========================================

                await account.createEmailPasswordSession({
                    email:
                        email,

                    password:
                        password
                });


                console.log(
                    "Login session created."
                );


                // =========================================
                // GET CURRENT APPWRITE USER
                // =========================================

                const currentUser =
                    await account.get();


                console.log(
                    "Current user:",
                    currentUser
                );


                // =========================================
                // FIND USER PROFILE
                // =========================================

                const profileResponse =
                    await tablesDB.listRows({

                        databaseId:
                            DATABASE_ID,

                        tableId:
                            USERS_TABLE_ID,

                        queries: [

                            Query.equal(
                                "userId",
                                currentUser.$id
                            )

                        ]

                    });


                if (
                    !profileResponse.rows ||
                    profileResponse.rows.length === 0
                ) {

                    // No profile found

                    await account.deleteSession(
                        "current"
                    );


                    showAuthMessage(
                        "Your account profile could not be found. Please contact Aplus Tutors support."
                    );


                    return;

                }


                const profile =
                    profileResponse.rows[0];


                console.log(
                    "User profile:",
                    profile
                );


                // =========================================
                // CHECK USER ROLE
                // =========================================

                if (
                    profile.role !== "student"
                ) {

                    await account.deleteSession(
                        "current"
                    );


                    showAuthMessage(
                        "This login page is for students only."
                    );


                    return;

                }


                // =========================================
                // CHECK ACCOUNT STATUS
                // =========================================

                if (
                    profile.status === "pending"
                ) {

                    await account.deleteSession(
                        "current"
                    );


                    // Save information for payment page

                    sessionStorage.setItem(
                        "registrationName",
                        profile.fullName
                    );


                    sessionStorage.setItem(
                        "registrationEmail",
                        profile.email
                    );


                    sessionStorage.setItem(
                        "registrationPhone",
                        profile.phone || ""
                    );


                    sessionStorage.setItem(
                        "registrationUserId",
                        profile.userId
                    );


                    showAuthMessage(
                        "Your account is awaiting activation. Please complete your payment to access Aplus Tutors.",
                        "error"
                    );


                    setTimeout(() => {

                        window.location.href =
                            "registration-success.html";

                    }, 2000);


                    return;

                }


                if (
                    profile.status === "suspended"
                ) {

                    await account.deleteSession(
                        "current"
                    );


                    showAuthMessage(
                        "Your account has been suspended. Please contact Aplus Tutors support."
                    );


                    return;

                }


                if (
                    profile.status !== "active"
                ) {

                    await account.deleteSession(
                        "current"
                    );


                    showAuthMessage(
                        "Your account is not currently active. Please contact Aplus Tutors support."
                    );


                    return;

                }


                // =========================================
                // ACTIVE STUDENT
                // =========================================

                showAuthMessage(
                    "Login successful! Redirecting...",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        "student-dashboard.html";

                }, 700);


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                let errorMessage =
                    "Login failed. Please check your email and password.";


                // =========================================
                // HANDLE LOGIN ERRORS
                // =========================================

                if (
                    error.code === 401
                ) {

                    errorMessage =
                        "Invalid email or password.";

                }


                else if (
                    error.code === 404
                ) {

                    errorMessage =
                        "Your account profile could not be found.";

                }


                else if (
                    error.message
                ) {

                    errorMessage =
                        error.message;

                }


                showAuthMessage(
                    errorMessage
                );


            } finally {

                if (loginBtn) {

                    loginBtn.disabled =
                        false;

                    loginBtn.classList.remove(
                        "loading"
                    );

                }

            }

        }
    );

}


// =========================================
// LOGOUT
// =========================================

async function logoutUser() {

    try {

        await account.deleteSession(
            "current"
        );


        window.location.href =
            "student-login.html";


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        // Even if logout throws an error,
        // send user back to login

        window.location.href =
            "student-login.html";

    }

}


// =========================================
// MAKE LOGOUT AVAILABLE GLOBALLY
// =========================================

window.logoutUser =
    logoutUser;