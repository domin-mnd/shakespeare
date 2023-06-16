export function calcPropertyValue(
  propName: string,
  originalValue: string,
  modificator: number
) {
  const computedStyle = {
    [propName]: originalValue
  };
  const timeQuantityOuter = +(originalValue.match(/^\d*\.?\d+/) as RegExpMatchArray)[0];
  const timeUnit = (originalValue.match(/s|(ms)$/) as RegExpMatchArray)[0];
  const timeQuantityInner =
    Math.round(timeQuantityOuter * 1000 * modificator) / 1000;

  computedStyle[propName] = timeQuantityInner + timeUnit;
  return computedStyle;
}
