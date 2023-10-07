/**
 * Calculates the new value of a CSS property by applying a time modificator
 * to the original value.
 *
 * @param {string} propName - The name of the CSS property to modify.
 * @param {string} originalValue - The original value of the property.
 * @param {number} modificator - The modificator to apply to the time value of the property.
 * @return {Object} An object containing the computed CSS style with the modified property.
 */
export function calcPropertyValue(
  propName: string,
  originalValue: string,
  modificator: number,
) {
  const computedStyle = {
    [propName]: originalValue,
  };
  const timeQuantityOuter = +(
    originalValue.match(/^\d*\.?\d+/) as RegExpMatchArray
  )[0];
  const timeUnit = (originalValue.match(/s|(ms)$/) as RegExpMatchArray)[0];
  const timeQuantityInner =
    Math.round(timeQuantityOuter * 1000 * modificator) / 1000;

  computedStyle[propName] = timeQuantityInner + timeUnit;
  return computedStyle;
}
