import Squircle from './Squircle.vue';
import type { SquircleProps } from './Squircle.vue';

export { Squircle };
export type { SquircleProps };
export { getSvgPath } from './utils';
export type { FigmaSquircleParams } from './utils';
export { distributeAndNormalize } from './distribute';
export { getPathParamsForCorner, getSVGPathFromPathParams } from './draw';

export default Squircle;