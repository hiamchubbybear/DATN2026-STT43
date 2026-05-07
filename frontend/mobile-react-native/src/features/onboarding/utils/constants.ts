import { Dimensions } from 'react-native';
import { spacing, scale } from '../../../shared/utils/responsive';

const { width, height } = Dimensions.get('window');

export const ONBOARDING_ITEM_WIDTH = width * 0.68;
export const ONBOARDING_SPACING = spacing(16);
export const ONBOARDING_SPACED_ITEM_WIDTH = ONBOARDING_ITEM_WIDTH + ONBOARDING_SPACING;
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;
