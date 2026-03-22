import React, { FC } from 'react'

interface HeadProps {
    title: string;
    description: string;
    keywords: string;
}

const Heading: FC<HeadProps> = ({ title, description, keywords }) => {
    return (
        <>
            <title>{title}</title>
            <meta name='viewport' content='width=device-width, initial-scale=1' />
            <meta name='description' content={description} />
            <meta name='keywords' content={keywords} />

            {/* Open Graph meta tags for social media sharing */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content='/images/bitbandy.png' />
            <meta property="og:type" content="website" />

            {/* Twitter Card meta tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content='/images/bitbandy.png' />
        </>
    );
};

export default Heading;