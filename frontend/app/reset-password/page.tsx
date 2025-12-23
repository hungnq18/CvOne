"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyToken, resetPassword } from "@/api/authApi";
import Image from "next/image";
import logoImg from "../../public/logo/logoCVOne.svg";
import { useToast } from "@/components/ui/use-toast";
// 1. Import hook ngôn ngữ
import { useLanguage } from "@/providers/global_provider";

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  padding: 20px;
`;

const Container = styled.div`
  display: flex;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  overflow: hidden;
  max-width: 800px;
  width: 100%;
  min-height: 400px;
  margin: 0 auto;
`;

const LogoSide = styled.div`
  background: linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(109, 193, 235) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  max-width: 400px;
  padding: 40px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  max-width: 300px;
  max-height: 300px;
  position: relative;
  margin: auto;
`;

const FormSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
  min-width: 320px;

  @media (max-width: 768px) {
    padding: 20px;
    width: 100%;
  }
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 8px;
  color: #058ac3;
  letter-spacing: 1px;
  font-size: 1.5rem;
  font-weight: 500;
`;

const Label = styled.label`
  font-weight: 500;
  color: #222;
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d0d7de;
  font-size: 16px;
  outline: none;
  transition: border 0.2s;
  width: 100%;

  &:focus {
    border-color: #058ac3;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  margin-top: 8px;
  padding: 12px 0;
  border-radius: 8px;
  border: none;
  background: linear-gradient(90deg,rgb(75, 195, 246) 0%,rgb(17, 135, 195) 100%);
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(46,204,64,0.10);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(46,204,64,0.15);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Message = styled.div`
  font-size: 15px;
  margin-top: 8px;
  text-align: center;
`;

const BackToLogin = styled.div`
  text-align: center;
  margin-top: 18px;
  a {
    color: #058ac3;
    font-weight: 500;
    text-decoration: underline;
    cursor: pointer;
  }
`;

// 2. Định nghĩa object Translations
const translations = {
  en: {
    title: "Reset Password",
    newPasswordLabel: "New Password",
    confirmPasswordLabel: "Confirm Password",
    newPasswordPlaceholder: "Min 8 chars, 1 number, 1 special char",
    confirmPasswordPlaceholder: "Re-enter new password",
    submitButton: "Reset Password",
    submittingButton: "Resetting...",
    backToLogin: "Back to Login",
    tokenInvalid: "Invalid or expired token.",
    passwordTooShort: "Password must be at least 8 characters.",
    passwordNoNumber: "Password must contain at least one number.",
    passwordNoSpecial: "Password must contain at least one special character.",
    passwordMismatch: "Passwords do not match.",
    successTitle: "Success",
    successMessage: "Password reset successfully! Redirecting...",
    errorTitle: "Error",
    systemError: "An error occurred. Please try again.",
    validationErrorTitle: "Invalid Password",
    mismatchErrorTitle: "Mismatch Error",
  },
  vi: {
    title: "Đặt lại mật khẩu",
    newPasswordLabel: "Mật khẩu mới",
    confirmPasswordLabel: "Xác nhận mật khẩu",
    newPasswordPlaceholder: "Tối thiểu 8 ký tự, 1 số, 1 ký tự đặc biệt",
    confirmPasswordPlaceholder: "Nhập lại mật khẩu mới",
    submitButton: "Đặt lại mật khẩu",
    submittingButton: "Đang đặt lại...",
    backToLogin: "Quay lại đăng nhập",
    tokenInvalid: "Token không hợp lệ hoặc đã hết hạn.",
    passwordTooShort: "Mật khẩu phải có ít nhất 8 ký tự.",
    passwordNoNumber: "Mật khẩu phải chứa ít nhất một số.",
    passwordNoSpecial: "Mật khẩu phải chứa ít nhất một ký tự đặc biệt.",
    passwordMismatch: "Mật khẩu xác nhận không khớp.",
    successTitle: "Thành công",
    successMessage: "Đặt lại mật khẩu thành công! Đang chuyển hướng...",
    errorTitle: "Lỗi",
    systemError: "Có lỗi xảy ra. Vui lòng thử lại.",
    validationErrorTitle: "Mật khẩu không hợp lệ",
    mismatchErrorTitle: "Lỗi xác nhận",
  }
};

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  // 3. Sử dụng hook language và lấy text tương ứng
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations]; // Ép kiểu để TS hiểu key

  const token = searchParams.get("token") || "";

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setMessage(t.tokenInvalid);
      return;
    }
    verifyToken(token)
      .then(() => {
        setTokenValid(true);
      })
      .catch(() => {
        setTokenValid(false);
        setMessage(t.tokenInvalid);
      });
  }, [token, t.tokenInvalid]);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
      return t.passwordTooShort;
    }
    if (!/\d/.test(pass)) {
      return t.passwordNoNumber;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
      return t.passwordNoSpecial;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setMessage(passwordError);
      toast({
        variant: "destructive",
        title: t.validationErrorTitle,
        description: passwordError,
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage(t.passwordMismatch);
      toast({
        variant: "destructive",
        title: t.mismatchErrorTitle,
        description: t.passwordMismatch,
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      
      setMessage(t.successMessage);
      setSuccess(true);
      
      toast({
        title: t.successTitle,
        description: t.successMessage,
        variant: "default",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      const errorMsg = err?.message || t.systemError;
      setMessage(errorMsg);
      setSuccess(false);
      
      toast({
        variant: "destructive",
        title: t.errorTitle,
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Container>
        <LogoSide>
          <ImageWrapper>
            <Image
              src={logoImg}
              alt="Logo"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </ImageWrapper>
        </LogoSide>
        <FormSide>
          <Form onSubmit={handleSubmit}>
            <Title>{t.title}</Title>
            {tokenValid === false && (
              <Message style={{ color: '#dc2626' }}>{message}</Message>
            )}
            {tokenValid && (
              <>
                <div>
                  <Label htmlFor="password">{t.newPasswordLabel}</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder={t.newPasswordPlaceholder}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">{t.confirmPasswordLabel}</Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    placeholder={t.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <SubmitButton type="submit" disabled={loading}>
                  {loading ? t.submittingButton : t.submitButton}
                </SubmitButton>
                {message && (
                  <Message style={{ color: success ? '#16a34a' : '#dc2626' }}>{message}</Message>
                )}
              </>
            )}
          </Form>
          <BackToLogin>
            <a href="/login">{t.backToLogin}</a>
          </BackToLogin>
        </FormSide>
      </Container>
    </Wrapper>
  );
}