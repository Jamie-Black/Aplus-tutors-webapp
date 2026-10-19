// =========================================================
// APLUS TUTORS
// REGISTRATION SUCCESS / PAYMENT SCRIPT
// =========================================================


// =========================================================
// CONFIGURATION
// =========================================================

// Aplus Tutors WhatsApp Business Number
const WHATSAPP_NUMBER = "2349152769294";


// =========================================================
// DOM READY
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------------------------------
    // GET ELEMENTS
    // -----------------------------------------------------

    const studentName =
        document.getElementById("studentName");

    const studentEmail =
        document.getElementById("studentEmail");

    const studentPhone =
        document.getElementById("studentPhone");

    const whatsappButton =
        document.getElementById("whatsappButton");

    const currentYear =
        document.getElementById("currentYear");


    // -----------------------------------------------------
    // DISPLAY CURRENT YEAR
    // -----------------------------------------------------

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    // -----------------------------------------------------
    // GET REGISTRATION DATA
    // -----------------------------------------------------

    /*
        The registration page should save the user's details
        before redirecting here.

        Example:

        sessionStorage.setItem(
            "registrationData",
            JSON.stringify({
                fullName: fullName,
                email: email,
                phone: phone
            })
        );
    */

    const savedRegistration =
        sessionStorage.getItem(
            "registrationData"
        );


    // -----------------------------------------------------
    // CHECK IF REGISTRATION DATA EXISTS
    // -----------------------------------------------------

    if (!savedRegistration) {

        console.warn(
            "No registration data found."
        );


        // Show a friendly fallback
        if (studentName) {

            studentName.textContent =
                "Registration details unavailable";

        }


        if (studentEmail) {

            studentEmail.textContent =
                "Please contact Aplus Tutors";

        }


        if (studentPhone) {

            studentPhone.textContent =
                "WhatsApp: +234 915 276 9294";

        }


        // Still create a generic WhatsApp link
        if (whatsappButton) {

            const genericMessage =
                `Hello Aplus Tutors,

I have registered for the Aplus Tutors platform and would like to submit my payment details.

Please assist me with payment verification and account activation.

Thank you.`;

            whatsappButton.href =
                `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    genericMessage
                )}`;

        }


        return;

    }


    // =====================================================
    // PARSE REGISTRATION DATA
    // =====================================================

    let registrationData;


    try {

        registrationData =
            JSON.parse(
                savedRegistration
            );

    } catch (error) {

        console.error(
            "Unable to read registration data:",
            error
        );

        return;

    }


    // =====================================================
    // GET USER DETAILS
    // =====================================================

    const fullName =
        registrationData.fullName ||
        "Not provided";


    const email =
        registrationData.email ||
        "Not provided";


    const phone =
        registrationData.phone ||
        "Not provided";


    // =====================================================
    // DISPLAY USER DETAILS
    // =====================================================

    if (studentName) {

        studentName.textContent =
            fullName;

    }


    if (studentEmail) {

        studentEmail.textContent =
            email;

    }


    if (studentPhone) {

        studentPhone.textContent =
            phone;

    }


    // =====================================================
    // CREATE PERSONALIZED WHATSAPP MESSAGE
    // =====================================================

    const whatsappMessage =

        `Hello Aplus Tutors,

I have completed my payment for my Aplus Tutors account and I would like to submit my payment proof for verification.

REGISTRATION DETAILS

Full Name: ${fullName}

Email: ${email}

Phone Number: ${phone}

I have attached my payment receipt/screenshot to this WhatsApp message.

Please verify my payment and activate my Aplus Tutors account.

Thank you.

Aplus Tutors Student`;


    // =====================================================
    // CREATE WHATSAPP LINK
    // =====================================================

    if (whatsappButton) {

        whatsappButton.href =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                whatsappMessage
            )}`;

    }


});