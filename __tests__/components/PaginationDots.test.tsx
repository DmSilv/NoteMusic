import React from 'react';
import { render } from '@testing-library/react-native';
import PaginationDots from '@/shared/components/layout/PaginationDots/PaginationDots';

describe('PaginationDots', () => {
  it('renderiza um dot para cada etapa', () => {
    const { getByTestId } = render(<PaginationDots total={5} currentIndex={2} />);

    for (let i = 0; i < 5; i += 1) {
      expect(getByTestId(`pagination-dot-${i}`)).toBeTruthy();
    }
  });

  it('destaca o dot correspondente à etapa atual', () => {
    const { getByTestId } = render(
      <PaginationDots total={3} currentIndex={1} activeColor="#0087D3" inactiveColor="#D9E6F2" />
    );

    const activeDot = getByTestId('pagination-dot-1');
    const inactiveDot = getByTestId('pagination-dot-0');

    expect(activeDot.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: '#0087D3' })])
    );
    expect(inactiveDot.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: '#D9E6F2' })])
    );
  });

  it('não renderiza nada quando há apenas uma etapa', () => {
    const { toJSON } = render(<PaginationDots total={1} currentIndex={0} />);
    expect(toJSON()).toBeNull();
  });
});
