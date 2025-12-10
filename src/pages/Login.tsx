// src/pages/auth/LoginPage.tsx
import styles from "./Login.module.css";
import InputField from "../shared/InputField/InputField";
import CheckboxField from "../shared/CheckboxField/CheckboxField";
import loginBg from "../assets/login/login_page_image.png";
import logo from "../assets/logos/main-logo.png";
import { useForm, FormProvider } from "react-hook-form";
import Button from "../shared/Button/Button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Apiservice from "../services/apiService";
import { API_ENDPOINTS } from "../constants/apiUrls";
import { toast } from "react-toastify";
import { ROUTES } from "../constants/routes";
import { Box, Paper } from "@mui/material";
import { LOCAL_STORAGE_VARIABLES } from "../constants/storageVariables";

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
    const [remember, setRemember] = useState(false);
    const [tempToken, setTempToken] = useState("");
    const [mfaImage, setMfaImage] = useState<string | null>(null);
    const [apiError, _setApiError] = useState<string | null>(null);
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
                const dat = res?.data?.data ?? {};
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
        <div className={styles.loginContainer}>
            <div className={styles.leftSection}>
                <img src={loginBg} alt="Login Background" className={styles.image} />
            </div>

            <div className={styles.rightSection}>
                {!showMfa ? (
                    <div className={styles.loginBox} key="login-form">
                        <div className={styles.logoParent}>
                            <img src={logo} alt="main logo" className={styles.logo} />
                        </div>
                        <p>Enter your login id and password to proceed</p>

                        <FormProvider {...loginMethods}>
                            <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
                                <InputField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    rules={{ required: "Email is required" }}
                                    autoComplete="username"
                                />

                                <InputField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    rules={{ required: "Password is required" }}
                                    autoComplete="current-password"
                                />

                                <div className={styles.options}>
                                    <div className={styles.parentForgotReset}>
                                        <a className={styles.forgotPass}>Forgot password?</a>
                                        <a className={styles.forgotPass} href={ROUTES.RESET_PASSWORD}>
                                            Reset password
                                        </a>
                                    </div>
                                </div>

                                {apiError && <div className={styles.errorBanner}>{apiError}</div>}

                                <Button
                                    label={loading ? "Logging in..." : "Login"}
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    disabled={loading}
                                />
                            </form>
                        </FormProvider>
                    </div>
                ) : (
                    <Paper
                        elevation={3}
                        sx={{
                            maxWidth: 420,
                            mx: "auto",
                            mt: 4,
                            p: 3,
                            borderRadius: 3,
                        }}
                    >
                        <div className={styles.logoParent}>
                            <img src={logo} alt="main logo" className={styles.logo} />
                        </div>

                        <FormProvider {...otpMethods}>
                            <form onSubmit={handleOtpSubmit(onOtpSubmit)}>
                                <p className={styles.verificationHeader}>Please complete an extra verification step.</p>
                                {mfaImage && (
                                    <div>
                                        <p>Scan the QR code with your preferred authenticator app to configure MFA for your account.</p>
                                        <div className={styles.mfaImageContainer}>
                                            <img src={mfaImage} alt="MFA" className={styles.mfaImage} style={{ maxWidth: "140px" }} />
                                        </div>
                                    </div>
                                )}

                                <p>For added security, please provide the MFA code from your registered device to finish signing in.</p>

                                <InputField label="MFA Code" name="mfaOtp" type="mfa" placeholder="Enter MFA Code" rules={{ required: "OTP is required" }} />

                                <Button label={loading ? "Verifying..." : "Verify Code"} type="submit" variant="primary" fullWidth disabled={loading} />
                                <Box mt={2}>
                                    <Button label={loading ? "Cancelling..." : "Cancel"} type="button" variant="secondary" fullWidth disabled={loading} onClick={handleMfaCancel} />
                                </Box>
                            </form>
                        </FormProvider>
                    </Paper>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
