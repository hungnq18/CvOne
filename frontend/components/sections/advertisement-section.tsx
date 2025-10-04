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


export const AdvertisementSection = () => {
  return (
    <SectionWrapper>
      <AdLink href="/lien-he-quang-cao" target="_blank" rel="noopener noreferrer">
        <AdCard>
          <AdImage
            src="https://www.pollfish.com/wp-content/uploads/2017/12/Mobile_AD_FORMATS3-1.png"
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

export default AdvertisementSection;
