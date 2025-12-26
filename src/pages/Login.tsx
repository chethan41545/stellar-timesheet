// src/pages/auth/LoginPage.tsx
import styles from "./Login.module.css";
import InputField from "../shared/InputField/InputField";
import logo from "../assets/logos/main-logo.png";
import { useForm, FormProvider } from "react-hook-form";
import Button from "../shared/Button/Button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Apiservice from "../services/apiService";
import { API_ENDPOINTS } from "../constants/apiUrls";
import { toast } from "react-toastify";
import { ROUTES } from "../constants/routes";

type LoginFormValues = {
    email: string;
    password: string;
    remember?: boolean;
};

type OtpFormValues = {
    mfaOtp: string;
};

const LoginPage = () => {
    const loginMethods = useForm<LoginFormValues>({ defaultValues: { remember: true } });
    const otpMethods = useForm<OtpFormValues>();
    const { handleSubmit: handleLoginSubmit } = loginMethods;
    const { handleSubmit: handleOtpSubmit } = otpMethods;

    const [loading, setLoading] = useState(false);
    const [showMfa, setShowMfa] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [userPwd, setUserPwd] = useState("");
    const [_remember, setRemember] = useState(false);
    const [tempToken, _setTempToken] = useState("");
    const [_apiError, _setApiError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.clear();
        sessionStorage.clear();
    }, []);

    const onLoginSubmit = (form: LoginFormValues) => {
        setLoading(true);
        setUserEmail(form.email);
        setUserPwd(form.password);
        setRemember(!!form.remember);

        const payload = {
            email: form.email,
            password: form.password,
        };

        Apiservice.postMethod(API_ENDPOINTS.LOGIN, payload)
            .then(async (res: any) => {
                // Expecting the top-level status and data shape you provided:
                // { status: "success", data: { access_token, refresh_token, user: { ... } }, message: "..." }
                const status = res?.data?.status;
                // const dat = res?.data?.data ?? {};
                if (status === "success") {
                    const dat = res.data.data;

                    const accessToken = dat.access_token;
                    const refreshToken = dat.refresh_token;
                    const user = dat.user;

                    const storage = localStorage;

                    storage.setItem("access_token", accessToken);
                    storage.setItem("refresh_token", refreshToken);
                    storage.setItem("user_email", user.email);
                    storage.setItem("user_full_name", user.full_name);
                    storage.setItem("role", user.role);

                    const role = user.role?.toLowerCase();

                    if (role === "employee" || role === "candidate") {
                        navigate("/timesheets", { replace: true });
                    } else {
                        navigate("/users-timesheet", { replace: true });
                    }
                }
                else if (status === "error") {
                    toast.error(res?.data?.message || "Login failed");
                } else {
                    // fallback: try to read tokens if backend returned quick success in a different shape
                    const fallbackToken = res?.data?.data?.access_token;
                    if (fallbackToken) {
                        localStorage.setItem("access_token", fallbackToken);
                        navigate("/dashboard");
                    } else {
                        toast.error(res?.data?.message || "Login failed");
                    }
                }
            })
            .catch((error: any) => {
                const status = error?.response?.status;
                const msg =
                    status === 401
                        ? "Invalid email or password"
                        : error?.response?.data?.message || "Something went wrong";
                toast.error(msg);
            })
            .finally(() => setLoading(false));
    };

    const onOtpSubmit = (form: OtpFormValues) => {
        setLoading(true);

        const verifyOtpPayload = {
            ...(tempToken && { token: tempToken }),
            otpCode: form.mfaOtp,
            email: userEmail,
            password: userPwd,
        };

        Apiservice.postMethod(API_ENDPOINTS.VERIFY_OTP, verifyOtpPayload)
            .then(async (res: any) => {
                toast.success(res?.data?.message || "Verified");
                const dat = res?.data?.data ?? {};
                const jwtToken = dat.access_token ?? dat.jwtToken;
                const jwtRefreshToken = dat.refresh_token ?? dat.jwtRefreshToken;
                const user = dat.user ?? {};
                const userEmail = user.email ?? dat.userEmail;
                const roles = user.role ? [user.role] : dat.roles ?? [];
                const countyId = dat.countyId ?? dat.county_id;
                const userFullName = user.full_name ?? dat.userFullName;

                const storage = localStorage;
                if (jwtToken) storage.setItem("access_token", jwtToken);
                if (jwtRefreshToken) storage.setItem("refresh_token", jwtRefreshToken);
                if (userEmail) storage.setItem("user_email", userEmail);
                if (roles && roles.length) {
                    storage.setItem("role", roles[0]);
                    storage.setItem("roles", JSON.stringify(roles));
                }
                if (countyId) storage.setItem("county_id", String(countyId));
                if (userFullName) storage.setItem("user_full_name", userFullName);

                try {
                    const lookupRes = await Apiservice.getMethod(API_ENDPOINTS.LOOKUP);
                    const lookupData = lookupRes?.data?.data ?? lookupRes?.data ?? {};
                    localStorage.setItem("lookup", JSON.stringify(lookupData));
                } catch (e: any) {
                    console.error("Failed to fetch lookup:", e?.response?.data || e?.message || e);
                }

                if (roles && roles[0] !== "candidate") navigate(ROUTES.DASHBOARD || "/dashboard");
                else navigate(ROUTES.TIMESHEETS_CANDIDATE || "/timesheets/cand50600");
            })
            .catch((error: any) => {
                console.error(error);
                toast.error(error?.response?.data?.message || "Invalid OTP");
            })
            .finally(() => setLoading(false));
    };

    const handleMfaCancel = () => {
        setShowMfa(false);
        otpMethods.reset();
    };

    return (
  <div className={styles.page}>
    {/* Background Image */}
    <div className={styles.background} />

    {/* Overlay */}
    <div className={styles.overlay} />

    {/* Center Card */}
    <div className={styles.centerWrapper}>
      {!showMfa ? (
        <div className={styles.card}>
          <div className={styles.logoParent}>
            <img src={logo} alt="main logo" className={styles.logo} />
          </div>

          {/* <h2 className={styles.title}>Sign in to Timesheets</h2> */}
          <p className={styles.subtitle}>
            Submit timesheets. Stay compliant.
          </p>

          <FormProvider {...loginMethods}>
            <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
              <InputField
                label="Email"
                name="email"
                type="email"
                placeholder="employee@stellarit.com"
                rules={{ required: "Email is required" }}
              />

              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                rules={{ required: "Password is required" }}
              />

              <div className={styles.options}>
                <a className={styles.link} href={ROUTES.RESET_PASSWORD}>
                  Forgot password?
                </a>
              </div>

              <Button
                label={loading ? "Signing in..." : "Sign In"}
                type="submit"
                fullWidth
                disabled={loading}
              />
            </form>
          </FormProvider>
        </div>
      ) : (
        <div className={styles.card}>
          <h2 className={styles.title}>MFA Verification</h2>
          <p className={styles.subtitle}>
            Enter the verification code from your authenticator app
          </p>

          <FormProvider {...otpMethods}>
            <form onSubmit={handleOtpSubmit(onOtpSubmit)}>
              <InputField
                label="MFA Code"
                name="mfaOtp"
                placeholder="123 456"
                rules={{ required: "OTP is required" }}
              />

              <Button
                label={loading ? "Verifying..." : "Verify"}
                type="submit"
                fullWidth
              />

              <Button
                label="Cancel"
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleMfaCancel}
                style={{ marginTop: 12 }}
              />
            </form>
          </FormProvider>
        </div>
      )}
    </div>
  </div>
);

};

export default LoginPage;
