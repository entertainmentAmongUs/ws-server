import { shuffleArray } from './shuffleArray';

describe('shuffleArray', () => {
  it('should return a shuffled array', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffledArr = shuffleArray(arr);

    expect(shuffledArr).not.toEqual(arr);
  });
});
