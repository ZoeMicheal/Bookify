import React from 'react';
import Image from 'next/image';
import HeroIllustration from '@/assets/hero-illustration.png';
import Link from 'next/link';


const Hero = () => {
    return (
        <section className="wrapper pt-28 mb-10 md:mb-16">
            <div className="library-hero-card">
                <div className="library-hero-content">
                    {/* Left Part */}
                    <div className="library-hero-text">
                        <h1 className="library-hero-title">Your Library</h1>
                        <p className="library-hero-description">
                            Convert your books into interactive AI conversations.<br className="hidden md:block"/>
                        Listen, learn, and discuss your favorite reads.</p>
                        <Link
                            href="/books/new"
                            className="library-cta-primary mt-4">
                            <span className="text-2xl mr-2">+</span>
                            Add new book
                        </Link>
                    </div>

                    {/* Center Part - Desktop */}
                    <div className="library-hero-illustration-desktop">
                            <Image
                                src={HeroIllustration}
                                alt="Vintage books and a globe"
                                width={400}
                                height={400}
                                className="object-contain"
                            />
                    </div>

                    {/*Center Part - Mobile (Hidden on Desktop) */}
                    <div className="library-hero-illustration">
                        <Image
                            src={HeroIllustration}
                            alt="Vintage books and a globe"
                            width={300}
                            height={300}
                            className="object-contain"/>
                    </div>

                    {/* Right Part */}
                    <div className="library-steps-card min-w-65 max-w-70 z-10 shadow-soft-md">
                        <ul className="space-y-6">
                            <li className="library-step-item">
                                <div className="library-step-number">1</div>
                                <div className="flex flex-col gap-0.5">
                                    <h3 className="library-step-title">Upload PDF</h3>
                                    <p className="library-step-description text-gray-500">Add your book file</p>
                                </div>
                            </li>
                            <li className="library-step-item">
                                <div className="library-step-number">2</div>
                                <div className="flex flex-col gap-0.5">
                                    <h3 className="library-step-title">AI Processing</h3>
                                    <p className="library-step-description text-gray-500">We analyze the content</p>
                                </div>
                            </li>
                            <li className="library-step-item">
                                <div className="library-step-number">3</div>
                                <div className="flex flex-col gap-0.5">
                                    <h3 className="library-step-title">Voice Chat</h3>
                                    <p className="library-step-description text-gray-500">Discuss with AI</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
