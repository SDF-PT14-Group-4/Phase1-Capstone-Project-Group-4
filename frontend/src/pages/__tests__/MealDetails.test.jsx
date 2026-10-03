import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MealDetails from '../MealDetails';

describe('MealDetails', () => {
  it('renders the meal id from the route params', () => {
    render(
      <MemoryRouter initialEntries={['/meal/52772']}>
        <Routes>
          <Route path="/meal/:id" element={<MealDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /meal details/i })).toBeInTheDocument();
    expect(screen.getByText(/meal id: 52772/i)).toBeInTheDocument();
  });

  it('handles a missing meal id gracefully', () => {
    render(
      <MemoryRouter initialEntries={['/meal']}>
        <Routes>
          <Route path="/meal" element={<MealDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /meal details/i })).toBeInTheDocument();
    expect(screen.getByText(/meal id: not provided/i)).toBeInTheDocument();
  });
});
