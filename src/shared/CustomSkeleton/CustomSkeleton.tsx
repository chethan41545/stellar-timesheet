

import React from 'react';
import { Skeleton } from '@mui/material';

interface CustomSkeletonProps {
    width?: number | string;
    height?: number | string;
    variant?: 'text' | 'rectangular' | 'rounded' | 'circular';
    animation?: 'pulse' | 'wave' | false;
    sx?: any; // For custom styling if needed
}

const CustomSkeleton: React.FC<CustomSkeletonProps> = ({
    width = '100%',
    height = 40,
    variant = 'rounded',
    animation = 'wave',
    sx = {},
}) => {
    return (
        <Skeleton
            variant={variant}
            width={width}
            height={height}
            animation={animation}
            sx={sx}
        />
    );
};

export default CustomSkeleton;
