import { distributeAndNormalize } from './distribute';
import { getPathParamsForCorner, getSVGPathFromPathParams } from './draw';

export interface FigmaSquircleParams {
  radius?: number;
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomRightRadius?: number;
  bottomLeftRadius?: number;
  cornerSmoothing: number;
  width: number;
  height: number;
  preserveSmoothing?: boolean;
}

export function getSvgPath({
  radius = 0,
  topLeftRadius,
  topRightRadius,
  bottomRightRadius,
  bottomLeftRadius,
  cornerSmoothing,
  width,
  height,
  preserveSmoothing = false,
}: FigmaSquircleParams) {
  topLeftRadius = topLeftRadius ?? radius;
  topRightRadius = topRightRadius ?? radius;
  bottomLeftRadius = bottomLeftRadius ?? radius;
  bottomRightRadius = bottomRightRadius ?? radius;

  if (
    topLeftRadius === topRightRadius &&
    topRightRadius === bottomRightRadius &&
    bottomRightRadius === bottomLeftRadius &&
    bottomLeftRadius === topLeftRadius
  ) {
    const roundingAndSmoothingBudget = Math.min(width, height) / 2;
    const normalizedRadius = Math.min(topLeftRadius, roundingAndSmoothingBudget);

    const pathParams = getPathParamsForCorner({
      radius: normalizedRadius,
      cornerSmoothing,
      preserveSmoothing,
      roundingAndSmoothingBudget,
    });

    return getSVGPathFromPathParams({
      width,
      height,
      topLeftPathParams: pathParams,
      topRightPathParams: pathParams,
      bottomLeftPathParams: pathParams,
      bottomRightPathParams: pathParams,
    });
  }

  const { topLeft, topRight, bottomLeft, bottomRight } = distributeAndNormalize(
    {
      topLeftRadius,
      topRightRadius,
      bottomRightRadius,
      bottomLeftRadius,
      width,
      height,
    }
  );

  return getSVGPathFromPathParams({
    width,
    height,
    topLeftPathParams: getPathParamsForCorner({
      cornerSmoothing,
      preserveSmoothing,
      radius: topLeft.radius,
      roundingAndSmoothingBudget: topLeft.roundingAndSmoothingBudget,
    }),
    topRightPathParams: getPathParamsForCorner({
      cornerSmoothing,
      preserveSmoothing,
      radius: topRight.radius,
      roundingAndSmoothingBudget: topRight.roundingAndSmoothingBudget,
    }),
    bottomRightPathParams: getPathParamsForCorner({
      cornerSmoothing,
      preserveSmoothing,
      radius: bottomRight.radius,
      roundingAndSmoothingBudget: bottomRight.roundingAndSmoothingBudget,
    }),
    bottomLeftPathParams: getPathParamsForCorner({
      cornerSmoothing,
      preserveSmoothing,
      radius: bottomLeft.radius,
      roundingAndSmoothingBudget: bottomLeft.roundingAndSmoothingBudget,
    }),
  });
}