import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export const IconFilter = ({ size = 24, color = '#ff4d6d' }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M4 6H20M7 12H17M10 18H14" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
  </Svg>
);
