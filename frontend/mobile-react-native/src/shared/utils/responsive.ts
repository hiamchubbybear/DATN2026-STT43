import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;
const fontScale = PixelRatio.getFontScale();

export const scale = (size: number) => Math.round(size * widthScale);
export const verticalScale = (size: number) => Math.round(size * heightScale);
export const moderateScale = (size: number, factor = 0.5) =>
  Math.round(size + (scale(size) - size) * factor);

export const normalizeFont = (size: number, factor = 0.5) =>
  Math.round(moderateScale(size, factor) / fontScale);

export const isTablet = SCREEN_WIDTH >= 768;

export const spacing = (size: number) => moderateScale(size, 0.4);
export const radius = (size: number) => moderateScale(size, 0.6);

export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  contentMaxWidth: isTablet ? 720 : SCREEN_WIDTH,
};
