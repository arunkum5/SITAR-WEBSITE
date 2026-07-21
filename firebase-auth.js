import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5C2uLQ6rwriKfvHPko9Rnn5I7axQA4D4",
  authDomain: "sitar-fd63e.firebaseapp.com",
  projectId: "sitar-fd63e",
  storageBucket: "sitar-fd63e.firebasestorage.app",
  messagingSenderId: "45643534382",
  appId: "1:45643534382:web:bfa6d75f7d13d837860fbf",
  measurementId: "G-C6W0NZGF4N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let confirmationResult = null;

const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'auth-send-otp', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnSendOtp = document.getElementById('auth-send-otp');
    const btnVerifyOtp = document.getElementById('auth-verify-otp');
    const step1 = document.getElementById('auth-step-1');
    const step2 = document.getElementById('auth-step-2');
    const phoneInput = document.getElementById('auth-phone-input');
    const phoneError = document.getElementById('auth-phone-error');
    const otpInput = document.getElementById('auth-otp-input');

    if (btnSendOtp) {
        btnSendOtp.addEventListener('click', async () => {
            let rawPhone = phoneInput.value.replace(/\D/g, ''); // strip non-digits
            // Check if user entered country code, extract last 10 digits
            if (rawPhone.length > 10) {
                rawPhone = rawPhone.slice(-10);
            }

            if (rawPhone.length !== 10) {
                phoneError.textContent = "Please enter a valid 10-digit phone number.";
                phoneError.style.display = 'block';
                return;
            }
            
            const phoneNumber = "+91" + rawPhone;
            
            phoneError.style.display = 'none';
            setupRecaptcha();
            
            const appVerifier = window.recaptchaVerifier;
                
                try {
                    btnSendOtp.disabled = true;
                    btnSendOtp.textContent = "Sending OTP...";
                    
                    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
                    
                    // Switch UI to Step 2
                    step1.style.display = 'none';
                    step2.style.display = 'block';
                    btnSendOtp.disabled = false;
                    btnSendOtp.textContent = "Continue";
                    
                } catch (error) {
                    console.error("Error sending OTP:", error);
                    phoneError.textContent = "Failed to send OTP: " + error.message;
                    phoneError.style.display = 'block';
                    btnSendOtp.disabled = false;
                    btnSendOtp.textContent = "Continue";
                    
                    if (window.recaptchaVerifier) {
                        window.recaptchaVerifier.render().then(function(widgetId) {
                          grecaptcha.reset(widgetId);
                        });
                    }
                }

        });
    }

    if (btnVerifyOtp) {
        btnVerifyOtp.addEventListener('click', async () => {
            const otp = otpInput.value;
            if (otp.length > 0 && confirmationResult) {
                try {
                    btnVerifyOtp.disabled = true;
                    btnVerifyOtp.textContent = "Verifying...";
                    
                    const result = await confirmationResult.confirm(otp);
                    const user = result.user;
                    console.log("User signed in successfully via Firebase:", user);
                    
                    // Store locally to mark as logged in
                    localStorage.setItem('sitar_logged_in', 'true');
                    
                    // Save the validated phone number to localStorage for our app to use
                    let savedPhone = user.phoneNumber || phoneInput.value.replace(/\D/g, '');
                    if (savedPhone.length > 10) savedPhone = savedPhone.slice(-10); // store as 10 digits
                    localStorage.setItem('user_phone', savedPhone);

                    // Log user in backend
                    try {
                        await fetch("/api/loginUser", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ phone: user.phoneNumber || phoneInput.value })
                        });
                    } catch(e) {
                        console.error("Backend login tracking failed:", e);
                    }

                    
                    // Get the token for later bridging to Supabase
                    const firebaseToken = await user.getIdToken();
                    console.log("Firebase Token ready for Supabase bridge");
                    
                    // Notify UI to update navigation state and close modal
                    window.dispatchEvent(new Event('auth-success'));
                    
                    btnVerifyOtp.disabled = false;
                    btnVerifyOtp.textContent = "Verify & Login";
                    
                } catch (error) {
                    console.error("Error verifying OTP:", error);
                    alert("Invalid OTP. Please try again.");
                    btnVerifyOtp.disabled = false;
                    btnVerifyOtp.textContent = "Verify & Login";
                }
            } else {
                alert('Please enter the OTP.');
            }
        });
    }
});
