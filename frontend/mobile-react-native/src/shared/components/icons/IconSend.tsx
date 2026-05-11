import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export const IconSend = ({ size = 24, color = 'currentColor' }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
      fill={color}
    />
  </Svg>
);
