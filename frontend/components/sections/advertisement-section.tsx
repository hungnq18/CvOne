"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import { Ad, getAdsForUser } from "@/api/adsApi";

type BannerPosition = "top" | "bottom" | "center" | "left" | "right";

interface AdvertisementProps {
  position?: BannerPosition;
}

const SectionWrapper = styled.section`
  background-color: #f9fafb;
  width: 100%;
`;

const AdImage = styled(Image)`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.2);
  transition: background-color 300ms;
`;

const AdButton = styled.button`
  background-color: #2563eb;
  color: #ffffff;
  font-weight: 600;
  padding: 0.75rem 2rem;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: background-color 300ms, transform 300ms;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const AdCard = styled.div`
  position: relative;
  background-color: #ffffff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: box-shadow 300ms;

  &:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
`;

const AdLink = styled.a`
  display: block;
  text-decoration: none;

  &:hover ${Overlay} {
    background-color: rgba(0, 0, 0, 0.1);
  }

  &:hover ${AdButton} {
    transform: scale(1.05);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  cursor: pointer;
  z-index: 10;
`;

const VerticalAdCard = styled(AdCard)`
  width: 300px;
  height: 800px;
  margin: 0 auto;
`;

const VerticalAdWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 1.5rem 0;
`;

const VerticalAdImage = styled(AdImage)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const useBannerByPosition = (position: BannerPosition) => {
  const [banner, setBanner] = useState<Ad | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBanner = async () => {
      try {
        const ads = await getAdsForUser();
        if (!isMounted) return;

        const found = ads.find((ad) => ad.position === position);
        if (found) {
          setBanner(found);
        }
      } catch (error) {
        console.error("Failed to fetch ads for position:", position, error);
      }
    };

    fetchBanner();

    return () => {
      isMounted = false;
    };
  }, [position]);

  return { banner, hidden, setHidden };
};

export const AdvertisementSection: React.FC<AdvertisementProps> = ({
  position = "center",
}) => {
  const { banner, hidden, setHidden } = useBannerByPosition(position);

  if (!banner || hidden || !banner.imageUrl || !banner.redirectUrl) return null;

  return (
    <SectionWrapper>
      <AdLink
        href={banner.redirectUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <AdCard>
          <AdImage
            src={banner.imageUrl}
            alt={banner.title || "Banner quảng cáo"}
            width={1000}
            height={200}
          />
          <Overlay />
          <CloseButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setHidden(true);
            }}
          >
            ×
          </CloseButton>
        </AdCard>
      </AdLink>
    </SectionWrapper>
  );
};

export const VerticalAdvertisementSection: React.FC<AdvertisementProps> = ({
  position = "left",
}) => {
  const { banner, hidden, setHidden } = useBannerByPosition(position);

  if (!banner || hidden || !banner.imageUrl || !banner.redirectUrl) return null;

  return (
    <SectionWrapper>
      <VerticalAdWrapper>
        <AdLink
          href={banner.redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <VerticalAdCard>
            <VerticalAdImage
              src={banner.imageUrl}
              alt={banner.title || "Banner quảng cáo dọc"}
              width={300}
              height={800}
            />
            <Overlay />
            <CloseButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setHidden(true);
              }}
            >
              ×
            </CloseButton>
          </VerticalAdCard>
        </AdLink>
      </VerticalAdWrapper>
    </SectionWrapper>
  );
};

export default AdvertisementSection;
