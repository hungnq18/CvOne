"use client";
import React from 'react';
import { Carousel } from 'antd';

const slides = [
    {
        title: 'Tham gia đội ngũ công nghệ hàng đầu!',
        description: 'Khám phá các cơ hội việc làm tại các công ty công nghệ tiên phong.',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
    },
    {
        title: 'Khởi đầu sự nghiệp mơ ước của bạn!',
        description: 'Tìm kiếm công việc phù hợp với kỹ năng và đam mê của bạn.',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
    },
    {
        title: 'Phát triển cùng các chuyên gia!',
        description: 'Làm việc với những người giỏi nhất trong lĩnh vực của bạn.',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
    },
];

const PromoSlider: React.FC = () => {
    return (
        <div>
            <Carousel autoplay autoplaySpeed={5000} style={{ marginBottom: '30px', borderRadius: '8px', overflow: 'hidden' }}>
                {slides.map((slide, index) => (
                    <div key={index}>
                        <div
                            style={{
                                height: '300px',
                                backgroundImage: `url(${slide.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div
                                style={{
                                    textAlign: 'center',
                                    color: 'white',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    padding: '20px',
                                    borderRadius: '8px',
                                }}
                            >
                                <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '10px' }}>{slide.title}</h2>
                                <p style={{ fontSize: '1rem' }}>{slide.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </Carousel>
        </div>
    );
};

export default PromoSlider;