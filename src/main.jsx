import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../assets/app.css";
import { apiFetch, clearStoredUser, getStoredUser, setStoredUser } from "./lib/api";
import { hrefFor, navigate, routeFromLocation } from "./lib/router";
import Header from "./components/Header";
import ServerInfoBar from "./components/ServerInfoBar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import InquiryPage from "./pages/InquiryPage";
import Mypage from "./pages/Mypage";

function App() {
  const [route, setRoute] = useState(routeFromLocation());
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    const onPopState = () => setRoute(routeFromLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((nextUser) => {
        setStoredUser(nextUser);
        setUser(nextUser);
      })
      .catch(() => setUser(getStoredUser()));
  }, []);

  const onNavigate = (event, path) => {
    event.preventDefault();
    navigate(path);
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.warn("로그아웃 API 호출 실패, 브라우저 로그인 정보만 삭제합니다.", error);
    }
    clearStoredUser();
    setUser(null);
    navigate(hrefFor("home"));
  };

  const commonProps = { user, setUser, onNavigate, logout };
  const page = {
    home: <HomePage onNavigate={onNavigate} />,
    detail: <DetailPage user={user} onNavigate={onNavigate} />,
    login: <LoginPage setUser={setUser} logout={logout} onNavigate={onNavigate} />,
    register: <RegisterPage setUser={setUser} onNavigate={onNavigate} />,
    inquiry: <InquiryPage user={user} />,
    mypage: <Mypage user={user} setUser={setUser} logout={logout} onNavigate={onNavigate} />,
  }[route];

  return (
    <>
      <ServerInfoBar />
      <Header {...commonProps} searchable={route === "home"} />
      {page}
      <Footer route={route} />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
