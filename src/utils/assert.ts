export const assert = (value: boolean, msg = 'Assertion failed') => {
  if (value === false) {
    throw new Error(msg);
  }
};
