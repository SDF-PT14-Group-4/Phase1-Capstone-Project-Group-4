import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import MainLayout from '../../layouts/MainLayout';
import { AuthProvider } from '../../context/AuthContext';

describe('MainLayout', () => {
  it('renders the app navigation and branding', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <MainLayout />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('link', { name: /globaltaste/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /categories/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cuisines/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /favorites/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /planner/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /basket/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /surprise me/i })).toBeInTheDocument();
    expect(screen.getByText(/© 2026 GlobalTaste/i)).toBeInTheDocument();
  });
});
