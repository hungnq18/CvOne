"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Image from "next/image";
import { Ad, getAdsForUser } from "@/api/adsApi";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const ModalCard = styled.div`
  position: relative;
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  max-width: 640px;
  width: 90%;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  cursor: pointer;
  z-index: 10;
`;

const AdImage = styled(Image)`
  width: 100%;
  height: auto;
  display: block;
`;

const PopupAd: React.FC = () => {
  const [banner, setBanner] = useState<Ad | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("popupAdDismissed");
      if (dismissed === "true") {
        setHidden(true);
        return;
      }
    }

    let isMounted = true;

    const fetchPopupBanner = async () => {
      try {
        const ads = await getAdsForUser();
        if (!isMounted) return;

        const found = ads.find(
          (ad) =>
            ad.position === "center" &&
            ad.imageUrl &&
            ad.redirectUrl &&
            ad.isActive !== false,
        );

        if (found) {
          setBanner(found);
        }
      } catch (error) {
        console.error("Failed to fetch popup ad:", error);
      }
    };

    fetchPopupBanner();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!banner || hidden || !banner.imageUrl || !banner.redirectUrl) {
    return null;
  }

  return (
    <Overlay>
      <ModalCard>
        <CloseButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setHidden(true);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("popupAdDismissed", "true");
            }
          }}
        >
          ×
        </CloseButton>
        <a
          href={banner.redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <AdImage
            src={banner.imageUrl}
            alt={banner.title || "Popup quảng cáo"}
            width={640}
            height={360}
          />
        </a>
      </ModalCard>
    </Overlay>
  );
};

export default PopupAd;


