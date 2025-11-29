"use client";

import { verifyEmail } from "@/api/authApi";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/global_provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface RegisterFormData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirmPassword: string;
  phone_number: string;
  company_name: string;
  city: string;
  district: string;
  terms: boolean;
}

type Translation = {
  [key: string]: string;
};

type LanguageTranslations = {
  user: Translation;
  hr: Translation;
};

const translations: {
  en: LanguageTranslations;
  vi: LanguageTranslations;
} = {
  en: {
    user: {
      title: "Create Account",
      subtitle: "Sign up to get started",
      firstName: "First Name",
      firstNamePlaceholder: "Enter your first name",
      lastName: "Last Name",
      lastNamePlaceholder: "Enter your last name",
      email: "Email",
      emailPlaceholder: "Enter your email",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm your password",
      phone: "Phone Number (optional)",
      phonePlaceholder: "Enter your phone number",
      address: "Address (optional)",
      addressPlaceholder: "Enter your address",
      registerButton: "Create Account",
      haveAccount: "Already have an account?",
      loginLink: "Sign in",
      requiredFields: "Please fill in all required fields!",
      invalidEmail: "Please enter a valid email address!",
      invalidPhone: "Phone number must be 10 digits and start with 0!",
      passwordMismatch: "Passwords do not match!",
      registerSuccess: "Registration successful!",
      registerFailed: "Registration failed",
      checkEmail: "Please check your email for verification",
      emailSent: "Verification email sent!",
      emailSentDesc:
        "We've sent a verification link to your email. Please check your inbox and spam folder.",
      emailError: "Failed to send verification email",
      emailErrorDesc:
        "There was a problem sending the verification email. Please try again.",
    },
    hr: {
      loginInfoTitle: "Register HR Account",
      emailLabel: "Email",
      emailPlaceholder: "Email",
      passwordLabel: "Password",
      passwordPlaceholder: "Password (from 6 to 25 characters)",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm your password",
      recruiterInfoTitle: "HR Information",
      lastNameLabel: "Last Name",
      lastNamePlaceholder: "Last Name",
      firstNameLabel: "First Name",
      firstNamePlaceholder: "First Name",
      phoneLabel: "Personal Phone Number",
      phonePlaceholder: "Personal Phone Number",
      companyLabel: "Company",
      companyPlaceholder: "Company Name",
      workLocationLabel: "Work Location",
      cityPlaceholder: "Select province/city",
      districtLabel: "District",
      districtPlaceholder: "Select district",
      terms: "I have read and agree to the",
      termsLink: "Terms of Service",
      and: "and",
      privacyLink: "Privacy Policy",
      of: "of CVOne.",
      submitButton: "Create Account",
      haveAccount: "Already have an account?",
      loginLink: "Login now",
      requiredFields: "Please fill in all required fields!",
      invalidEmail: "Please enter a valid email address!",
      passwordMismatch: "Passwords do not match!",
      registerSuccess: "Registration successful!",
      registerFailed: "Registration failed",
      checkEmail: "Please check your email for verification",
      agreeToTerms: "You must agree to the terms and conditions.",
    },
  },
  vi: {
    user: {
      title: "Tạo tài khoản",
      subtitle: "Đăng ký để bắt đầu",
      firstName: "Tên",
      firstNamePlaceholder: "Nhập tên của bạn",
      lastName: "Họ",
      lastNamePlaceholder: "Nhập họ của bạn",
      email: "Email",
      emailPlaceholder: "Nhập email của bạn",
      password: "Mật khẩu",
      passwordPlaceholder: "Nhập mật khẩu của bạn",
      confirmPassword: "Xác nhận mật khẩu",
      confirmPasswordPlaceholder: "Xác nhận mật khẩu của bạn",
      phone: "Số điện thoại (không bắt buộc)",
      phonePlaceholder: "Nhập số điện thoại của bạn",
      address: "Địa chỉ (không bắt buộc)",
      addressPlaceholder: "Nhập địa chỉ của bạn",
      registerButton: "Tạo tài khoản",
      haveAccount: "Đã có tài khoản?",
      loginLink: "Đăng nhập",
      requiredFields: "Vui lòng nhập đầy đủ thông tin bắt buộc!",
      invalidEmail: "Vui lòng nhập địa chỉ email hợp lệ!",
      invalidPhone: "Số điện thoại phải có 10 số và bắt đầu bằng số 0!",
      passwordMismatch: "Mật khẩu xác nhận không khớp!",
      registerSuccess: "Đăng ký thành công!",
      registerFailed: "Đăng ký thất bại",
      checkEmail: "Vui lòng kiểm tra email của bạn để xác nhận",
      emailSent: "Đã gửi email xác thực!",
      emailSentDesc:
        "Chúng tôi đã gửi link xác thực đến email của bạn. Vui lòng kiểm tra hộp thư đến và thư rác.",
      emailError: "Không thể gửi email xác thực",
      emailErrorDesc: "Có lỗi khi gửi email xác thực. Vui lòng thử lại.",
    },
    hr: {
      loginInfoTitle: "Đăng ký tài khoản nhà tuyển dụng",
      emailLabel: "Email",
      emailPlaceholder: "Email",
      passwordLabel: "Mật khẩu",
      passwordPlaceholder: "Mật khẩu (từ 6 đến 25 ký tự)",
      confirmPasswordLabel: "Nhập lại mật khẩu",
      confirmPasswordPlaceholder: "Nhập lại mật khẩu",
      recruiterInfoTitle: "Thông tin nhà tuyển dụng",
      lastNameLabel: "Họ",
      lastNamePlaceholder: "Họ",
      firstNameLabel: "Tên",
      firstNamePlaceholder: "Tên",
      phoneLabel: "Số điện thoại cá nhân",
      phonePlaceholder: "Số điện thoại cá nhân",
      companyLabel: "Công ty",
      companyPlaceholder: "Tên công ty",
      workLocationLabel: "Địa điểm làm việc",
      cityPlaceholder: "Chọn tỉnh/thành phố",
      districtLabel: "Quận/ huyện",
      districtPlaceholder: "Chọn quận/huyện",
      terms: "Tôi đã đọc và đồng ý với",
      termsLink: "Điều khoản dịch vụ",
      and: "và",
      privacyLink: "Chính sách bảo mật",
      of: "của CVOne.",
      submitButton: "Tạo tài khoản",
      haveAccount: "Đã có tài khoản?",
      loginLink: "Đăng nhập ngay",
      requiredFields: "Vui lòng nhập đầy đủ thông tin bắt buộc!",
      invalidEmail: "Vui lòng nhập địa chỉ email hợp lệ!",
      passwordMismatch: "Mật khẩu xác nhận không khớp!",
      registerSuccess: "Đăng ký thành công!",
      registerFailed: "Đăng ký thất bại",
      checkEmail: "Vui lòng kiểm tra email của bạn để xác nhận",
      agreeToTerms: "Bạn phải đồng ý với các điều khoản và điều kiện.",
    },
  },
};

export function useRegisterForm(formType: "user" | "hr" = "user") {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    company_name: "",
    city: "",
    district: "",
    terms: false,
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const { language } = useLanguage();
  const { register } = useAuth();
  const t = translations[language][formType];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [id]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsSuccess(false);

    const {
      email,
      first_name,
      last_name,
      password,
      confirmPassword,
      phone_number,
      company_name,
      terms,
    } = formData;

    // Validate Email Format
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email!)) {
      setMessage(t.invalidEmail);
      setIsLoading(false);
      return;
    }

    // Validate Password Match
    if (password !== confirmPassword) {
      setMessage(t.passwordMismatch);
      setIsLoading(false);
      return;
    }

    if (formType === "user") {
      // Validate Required Fields for User
      if (
        !email ||
        !first_name ||
        !last_name ||
        !password ||
        !confirmPassword
      ) {
        setMessage(t.requiredFields);
        setIsLoading(false);
        return;
      }

      try {
        // 1. Gọi API đăng ký
        await register(first_name, email, password, last_name);

        // 2. Gửi email xác thực (Optional: nếu lỗi gửi mail vẫn cho qua để user đăng nhập rồi gửi lại sau)
        try {
          await verifyEmail(email);
        } catch (err) {
          console.warn("Failed to auto-send verify email:", err);
        }

        // 3. Navigate CHỈ KHI đăng ký thành công
        router.push("verify-email");
      } catch (error) {
        console.error("Registration error:", error);
        // Hiển thị lỗi (Ví dụ: Email đã tồn tại)
        setMessage(error instanceof Error ? error.message : t.registerFailed);
      } finally {
        // Dù thành công hay thất bại thì cũng tắt loading
        setIsLoading(false);
      }
    } else if (formType === "hr") {
      // Validate Required Fields for HR
      if (
        !email ||
        !password ||
        !confirmPassword ||
        !first_name ||
        !last_name ||
        !phone_number ||
        !company_name
      ) {
        setMessage(t.requiredFields);
        setIsLoading(false);
        return;
      }

      if (!terms) {
        setMessage(t.agreeToTerms);
        setIsLoading(false);
        return;
      }

      try {
        // Logic đăng ký cho HR (hiện tại đang là placeholder)
        console.log("Registering HR with data:", formData);

        // Giả lập thành công
        setMessage(t.registerSuccess);
        setIsSuccess(true);
      } catch (error) {
        console.error("Registration error:", error);
        setMessage(error instanceof Error ? error.message : t.registerFailed);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    formData,
    showPassword,
    showConfirmPassword,
    message,
    isLoading,
    isSuccess,
    t,
    handleInputChange,
    handleRegister,
    setShowPassword,
    setShowConfirmPassword,
  };
}
