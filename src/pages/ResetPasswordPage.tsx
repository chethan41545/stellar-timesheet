// src/pages/auth/ResetPasswordPage.tsx
import styles from "./login.module.css";
import InputField from "../shared/InputField/InputField";
import Button from "../shared/Button/Button";
import { FormProvider, useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Apiservice from "../services/apiService";
import { API_ENDPOINTS } from "../constants/apiUrls";
import { toast } from "react-toastify";
import { ROUTES } from "../constants/routes";
import logo from "../assets/logos/main-logo.png";

type ResetPasswordFormValues = {
    email: string;
    old_password: string;
    new_password: string;
    confirm_password: string;
};

const ResetPasswordPage = () => {
    const methods = useForm<ResetPasswordFormValues>();
    const { handleSubmit, watch } = methods;

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const newPassword = watch("new_password");

    const onSubmit = (form: ResetPasswordFormValues) => {
        setLoading(true);

        const payload = {
            email: form.email,
            old_password: form.old_password,
            new_password: form.new_password,
            confirm_password: form.confirm_password,
        };

        Apiservice.postMethod(API_ENDPOINTS.RESET_PASSWORD, payload)
            .then((res: any) => {
                if (res?.data?.status === "success") {
                    toast.success(res?.data?.message || "Password reset successful");
                    navigate(ROUTES.LOGIN);
                } else {
                    toast.error(res?.data?.message || "Reset password failed");
                }
            })
            .catch((error: any) => {
                toast.error(
                    error?.response?.data?.message || "Something went wrong"
                );
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className={styles.page}>
            <div className={styles.background} />
            <div className={styles.overlay} />

            <div className={styles.centerWrapper}>
                <div className={styles.card}>
                    <div className={styles.logoParent}>
                        <img src={logo} alt="main logo" className={styles.logo} />
                    </div>

                    <h2 className={styles.title}>Reset Password</h2>
                    <p className={styles.subtitle}>
                        Update your account password
                    </p>

                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <InputField
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="employee@stellarit.com"
                                rules={{ required: "Email is required" }}
                            />

                            <InputField
                                label="Old Password"
                                name="old_password"
                                type="password"
                                placeholder="••••••••"
                                rules={{ required: "Old password is required" }}
                            />

                            <InputField
                                label="New Password"
                                name="new_password"
                                type="password"
                                placeholder="••••••••"
                                rules={{
                                    required: "New password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters",
                                    },
                                }}
                            />

                            <InputField
                                label="Confirm Password"
                                name="confirm_password"
                                type="password"
                                placeholder="••••••••"
                                rules={{
                                    required: "Confirm password is required",
                                    validate: (value) =>
                                        value === newPassword || "Passwords do not match",
                                }}
                            />

                            <Button
                                label={loading ? "Resetting..." : "Reset Password"}
                                type="submit"
                                fullWidth
                                disabled={loading}
                            />

                        </form>
                    </FormProvider>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
