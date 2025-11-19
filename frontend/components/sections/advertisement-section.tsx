"use client";

import React from 'react';
import Image from 'next/image';
import styled from 'styled-components';

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
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  transition: background-color 300ms, transform 300ms;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const AdCard = styled.div`
  position: relative;
  background-color: #ffffff;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: box-shadow 300ms;

  &:hover {
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  }
`;

const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
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


export const AdvertisementSection = () => {
  return (
    <SectionWrapper>
      <AdLink href="/lien-he-quang-cao" target="_blank" rel="noopener noreferrer">
        <AdCard>
          <AdImage
            src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Digital_rain_banner.gif"
            alt="Banner quảng cáo"
            width={1000}
            height={200}
          />
          <Overlay />
          <ButtonWrapper>
             <AdButton>
              Read more
            </AdButton>
          </ButtonWrapper>
        </AdCard>
      </AdLink>
    </SectionWrapper>
  );
};

export const VerticalAdvertisementSection = () => {
  return (
    <SectionWrapper>
      <VerticalAdWrapper>
        <AdLink href="/lien-he-quang-cao" target="_blank" rel="noopener noreferrer">
          <VerticalAdCard>
            <VerticalAdImage
              src="https://lh3.googleusercontent.com/proxy/nxlLhZnbX0xnUIq2uAvI_bmr4BqhcT0OGwgzrqAzV5zR0NajEQHaqdX9aeHrcLVnT9VIykTlB505ChzUc-Au9dqLrB1twxLTSbiY1obHBeLnS3t2mg0MW4ZGMBkua6s"
              alt="Banner quảng cáo dọc"
              width={300}
              height={800}
            />
            <Overlay />
          </VerticalAdCard>
        </AdLink>
      </VerticalAdWrapper>
    </SectionWrapper>
  );
};

export default AdvertisementSection;
