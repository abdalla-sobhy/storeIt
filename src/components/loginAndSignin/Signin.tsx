import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SigninCss from "/public/styles/Signin.module.css";

interface FormState {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}
interface ErrorState {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  otp: string;
}

export default function Signin() {
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [errors, setErrors] = useState<ErrorState>({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    otp: "",
  });

  const [isOtpStep, setIsOtpStep] = useState<boolean>(false); 
  const navigateTo = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^[a-zA-Z0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
  
      if (value && index < 5) {
        const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };
  
  

  async function handleSignin() {
    try {
      const response = await fetch("http://localhost:8000/api/signin", {
        method: "POST",
        body: JSON.stringify(form),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        // const data = await response.json();
        setIsOtpStep(true);
      } else {
        const backErrors = await response.json();
        setErrors((prevErrors) => ({
          ...prevErrors,
          username: backErrors.errors?.username || "",
          email: backErrors.errors?.email || "",
          password: backErrors.errors?.password || "",
          password_confirmation: backErrors.errors?.password_confirmation || "",
        }));
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  }

  async function handleOtpVerification() {
    const otpToBack_end =  otp.join('')
    try {
      const response = await fetch("http://localhost:8000/api/verifyOtp", {
        method: "POST",
        body: JSON.stringify({ email: form.email, otp: otpToBack_end }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setErrors((prevErrors) => ({
          ...prevErrors,
          otp:data.message || "Account created successfully. Please verify your OTP sent to your email.",
        }));
        const token = data.token;

        localStorage.setItem("authToken", token);
        
        navigateTo("/dashboard");
      } else {
        const backErrors = await response.json();
        setErrors((prevErrors) => ({
          ...prevErrors,
          otp: backErrors.error || "Invalid OTP",
        }));
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  }

  async function handleOtpResend() {
    try {
      const response = await fetch("http://localhost:8000/api/resendOtp", {
        method: "POST",
        body: JSON.stringify({ email: form.email }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setErrors((prevErrors) => ({
          ...prevErrors,
          otp:data.message || "A new OTP has been sent to your email.",
        }));

      } else {
        const backErrors = await response.json();
        setErrors((prevErrors) => ({
          ...prevErrors,
          otp: backErrors.error || "Oops, Something went wrong. Please try again. ",
        }));
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  }

  return (
    <div className="h-full w-full flex-row flex">
      <div className={`${SigninCss.leftPart}`}>
        <img src="/src/assets/Screenshot 2025-01-25 161714.png" alt="" className="h-full w-full" />
      </div>
      <div className={`${SigninCss.rightPart}`}>
        {isOtpStep ? (
          <div className={`${SigninCss.otpStep}`}>
  <div className={`${SigninCss.creatAcc}`}>Verify OTP</div>
  <form
    className={`${SigninCss.form} flex flex-col gap-4`}
    action=""
    onSubmit={(e) => e.preventDefault()}
  >
    <div className="font-bold">Account created successfully. Please verify your OTP sent to your email.</div>
    <div className={`${SigninCss.input_container}`}>
      <label htmlFor="otp" className={`${SigninCss.otpLabel}`}>
        OTP
      </label>
      <div className="flex gap-2">
        {[...Array(6)].map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            name={`otp-${index}`}
            value={otp[index] || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOtpChange(e, index)}
            className="border rounded-md text-center w-12 h-12 text-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        ))}
      </div>
      <label htmlFor="otp" className="text-red-600">{errors.otp}</label>
    </div>
    <div className={`${SigninCss.submitButtonDiv}`}>
      <input
        type="submit"
        className={`${SigninCss.submitButton}`}
        value={"Verify OTP"}
        onClick={handleOtpVerification}
      />
    </div>
    <div className={`${SigninCss.submitButtonDiv}`}>
      <input
        type="submit"
        className={`${SigninCss.submitButton}`}
        value={"Resend OTP"}
        onClick={handleOtpResend}
      />
    </div>
  </form>
</div>

        ) : (
          <>
            <div className={`${SigninCss.creatAcc}`}>Create Account</div>
            <form className={`${SigninCss.form} flex flex-col gap-4`} action="" onSubmit={(e) => e.preventDefault()}>
                <div className={`${SigninCss.input_container}`}>
                    <label htmlFor="username" className={`${SigninCss.label}`}>
                        username
                    </label>
                    <input type="text" name="username" value={form.username} onChange={handleChange} id="username" className={`${SigninCss.input}`} placeholder="Enter your username" />
                    <label htmlFor="username" className="text-red-600">{errors.username}</label>
                </div>
                <div className={`${SigninCss.input_container}`}>
                    <label htmlFor="email" className={`${SigninCss.label}`}>
                    Email
                    </label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} id="email" className={`${SigninCss.input}`} placeholder="Enter your email" />
                    <label htmlFor="email" className="text-red-600">{errors.email}</label>
                </div>
                <div className={`${SigninCss.input_container}`}>
                    <label htmlFor="password" className={`${SigninCss.label}`}>
                        Password
                    </label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} id="password" className={`${SigninCss.input}`} placeholder="Enter password" />
                    <label htmlFor="password" className="text-red-600">{errors.password}</label>
                </div>
                <div className={`${SigninCss.input_container}`}>
                    <label htmlFor="password_confirmation" className={`${SigninCss.label}`}>
                        Confirm Password
                    </label>
                    <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} id="password_confirmation" className={`${SigninCss.input}`} placeholder="Confirm Password" />
                    <label htmlFor="password_confirmation" className="text-red-600">{errors.password_confirmation}</label>
                </div>
                <div className={`${SigninCss.submitButtonDiv}`}>
                    <input type="submit" className={`${SigninCss.submitButton}`} value={"Create Account"} onClick={handleSignin}></input>
                </div>
            </form>
            <div className={`${SigninCss.divider}`}>
                <span>Or</span>
            </div>
            <div className={`${SigninCss.facebook_google} flex flex-row gap-11`}>
            <div className={`${SigninCss.buttons_container}`}>
    <div className={`${SigninCss.apple_login_button}`}>
      <svg stroke="currentColor" fill="currentColor" stroke-width="0" className={`${SigninCss.apple_icon}`} viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path d="M747.4 535.7c-.4-68.2 30.5-119.6 92.9-157.5-34.9-50-87.7-77.5-157.3-82.8-65.9-5.2-138 38.4-164.4 38.4-27.9 0-91.7-36.6-141.9-36.6C273.1 298.8 163 379.8 163 544.6c0 48.7 8.9 99 26.7 150.8 23.8 68.2 109.6 235.3 199.1 232.6 46.8-1.1 79.9-33.2 140.8-33.2 59.1 0 89.7 33.2 141.9 33.2 90.3-1.3 167.9-153.2 190.5-221.6-121.1-57.1-114.6-167.2-114.6-170.7zm-105.1-305c50.7-60.2 46.1-115 44.6-134.7-44.8 2.6-96.6 30.5-126.1 64.8-32.5 36.8-51.6 82.3-47.5 133.6 48.4 3.7 92.6-21.2 129-63.7z"></path>
      </svg>
      <span>Sign up with Apple</span>
    </div>
    <div className={`${SigninCss.google_login_button}`}>
      <svg stroke="currentColor" fill="currentColor" stroke-width="0" version="1.1" x="0px" y="0px" className={`${SigninCss.google_icon}`} viewBox="0 0 48 48" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
      </svg>
      <span>Sign up with Google</span>
    </div>
  </div>
            </div>
            <div className={`${SigninCss.haveAcc}`}>Already have an account?<span className={`${SigninCss.login}`} onClick={()=>navigateTo("/Login")}>Login</span></div>
            </>
        )}
      </div>
    </div>
  );
}
