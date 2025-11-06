import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from './Loading';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('Loading Component', () => {
  it('renders with default props', () => {
    render(<Loading />);
    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveClass('loading-container');
  });

  it('renders with custom size', () => {
    render(<Loading size="large" />);
    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toHaveClass('loading-container');
  });

  it('renders with custom color', () => {
    render(<Loading color="blue" />);
    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toHaveClass('loading-container');
  });

  it('renders with custom className', () => {
    render(<Loading className="custom-class" />);
    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toHaveClass('custom-class');
  });

  it('renders with custom text', () => {
    render(<Loading text="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('renders without text when text prop is empty', () => {
    render(<Loading text="" />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders with different types', () => {
    const { rerender } = render(<Loading type="spinner" />);
    expect(screen.getByRole('status')).toHaveClass('flex');

    rerender(<Loading type="dots" />);
    expect(screen.getByRole('status')).toHaveClass('flex');

    rerender(<Loading type="pulse" />);
    expect(screen.getByRole('status')).toHaveClass('flex');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Loading size="sm" />);
    const loadingElement = screen.getByRole('status');
    
    expect(loadingElement.querySelector('div')).toHaveClass('w-4', 'h-4');

    rerender(<Loading size="lg" />);
    expect(loadingElement.querySelector('div')).toHaveClass('w-12', 'h-12');
  });

  it('renders with different colors', () => {
    const { rerender } = render(<Loading color="primary" />);
    expect(screen.getByRole('status').querySelector('div')).toHaveClass('text-indigo-600');

    rerender(<Loading color="success" />);
    expect(screen.getByRole('status').querySelector('div')).toHaveClass('text-green-600');
  });

  it('renders in fullscreen mode', () => {
    render(<Loading fullScreen />);
    expect(screen.getByRole('status')).toHaveClass('fixed', 'inset-0');
  });

  it('renders with overlay', () => {
    render(<Loading overlay />);
    expect(screen.getByRole('status')).toHaveClass('bg-black', 'bg-opacity-50');
  });

  it('has proper accessibility attributes', () => {
    render(<Loading />);
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders with custom variant', () => {
    render(<Loading variant="dots" />);
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toBeInTheDocument();
  });
}); 