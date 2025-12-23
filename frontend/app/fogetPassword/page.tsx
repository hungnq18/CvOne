"use client"

import { forgotPassword } from "@/api/authApi"
import { toast } from "sonner"
import { useLanguage } from "@/providers/global_provider"
import Image from "next/image"
import React, { useState } from "react"
import styled from "styled-components"
import logoImg from "../../public/logo/logoCVOne.svg"

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  padding: 20px;
`

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
`

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
`

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  max-width: 300px;
  max-height: 300px;
  position: relative;
  margin: auto;
`

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
`

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const Title = styled.h2`
  text-align: center;
  margin-bottom: 8px;
  color: #058ac3;
  letter-spacing: 1px;
  font-size: 1.5rem;
  font-weight: 500;
`

const Label = styled.label`
  font-weight: 500;
  color: #222;
`

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
`

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
`

const Message = styled.div`
  font-size: 15px;
  margin-top: 8px;
  text-align: center;
`

const BackToLogin = styled.div`
  text-align: center;
  margin-top: 18px;
  a {
    color: #058ac3;
    font-weight: 500;
    text-decoration: underline;
    cursor: pointer;
  }
`

const translations = {
  en: {
    forgotPassword: {
      title: "Forgot Password",
      emailLabel: "Email",
      emailPlaceholder: "Enter your email",
      sendButton: "Send reset password email",
      sending: "Sending...",
      success: "Password reset email sent. Please check your inbox. May be email will be in spam",
      backToLogin: "Back to login",
    },
  },
  vi: {
    forgotPassword: {
      title: "Quên mật khẩu",
      emailLabel: "Email",
      emailPlaceholder: "Nhập email của bạn",
      sendButton: "Gửi email đặt lại mật khẩu",
      sending: "Đang gửi...",
      success: "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn. có thể email sẽ ở trong mục spam.",
      backToLogin: "Quay lại đăng nhập",
    },
  },
};

export default function ForgotPasswordPage() {
  const { language } = useLanguage ? useLanguage() : { language: "vi" };
  const lang = (language === "en" || language === "vi") ? language : "vi";
  const t = translations[lang as 'vi' | 'en'].forgotPassword;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [requestCount, setRequestCount] = useState(0);

  // Cooldown timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) {
      toast.info(`Vui lòng chờ ${cooldown}s rồi thử lại`);
      return;
    }
    if (requestCount >= 5) {
      setMessage("Bạn đã đạt giới hạn 5 lần yêu cầu trong ngày cho email này.");
      setSuccess(false);
      toast.error("Đã quá số lần yêu cầu trong ngày");
      return;
    }
    setLoading(true);
    setMessage("");
    setSuccess(false);
    try {
      await forgotPassword(email);
      setMessage(t.success);
      setSuccess(true);
      setRequestCount((prev) => prev + 1);
      const nextCount = requestCount + 1;
      const nextCooldown = Math.min(30 * nextCount, 120);
      setCooldown(nextCooldown);
    } catch (err: any) {
      setMessage(err?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      setSuccess(false);
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
            <div>
              <Label htmlFor="email">{t.emailLabel}</Label>
              <Input
                type="email"
                id="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <SubmitButton type="submit" disabled={loading || !email || cooldown > 0 || requestCount >= 5}>
              {loading
                ? t.sending
                : requestCount >= 5
                  ? "Đã đạt 5 lần/ngày"
                  : cooldown > 0
                    ? `Gửi lại sau ${cooldown}s`
                    : t.sendButton}
            </SubmitButton>
            {message && (
              <Message style={{ color: success ? '#16a34a' : '#dc2626' }}>{message}</Message>
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
