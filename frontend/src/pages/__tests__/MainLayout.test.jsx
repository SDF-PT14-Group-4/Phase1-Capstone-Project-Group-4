import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

describe('MainLayout', () => {
  it('renders the app navigation and branding', () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /globaltaste/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /categories/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /favorites/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /planner/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /basket/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /surprise me/i })).toBeInTheDocument();
    expect(screen.getByText(/© 2026 GlobalTaste/i)).toBeInTheDocument();
  });
});
