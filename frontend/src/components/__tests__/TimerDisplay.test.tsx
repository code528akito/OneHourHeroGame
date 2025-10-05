import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TimerDisplay from '../TimerDisplay';

describe('TimerDisplay Component', () => {
  it('renders timer with formatted time', () => {
    render(<TimerDisplay formattedTime="01:30" progress={90} />);
    expect(screen.getByText('01:30')).toBeInTheDocument();
    expect(screen.getByText('残り時間')).toBeInTheDocument();
  });

  it('shows green color when progress is high', () => {
    const { container } = render(<TimerDisplay formattedTime="01:30" progress={90} />);
    const timeElement = screen.getByText('01:30');
    expect(timeElement).toHaveClass('text-green-500');
  });

  it('shows yellow color when progress is medium', () => {
    const { container } = render(<TimerDisplay formattedTime="00:45" progress={40} />);
    const timeElement = screen.getByText('00:45');
    expect(timeElement).toHaveClass('text-yellow-500');
  });

  it('shows red color and pulse animation when progress is low', () => {
    const { container } = render(<TimerDisplay formattedTime="00:10" progress={10} />);
    const timeElement = screen.getByText('00:10');
    expect(timeElement).toHaveClass('text-red-500');
    expect(timeElement).toHaveClass('animate-pulse');
  });

  it('renders progress bar with correct width', () => {
    const { container } = render(<TimerDisplay formattedTime="01:00" progress={75} />);
    const progressBar = container.querySelector('[style*="width: 75%"]');
    expect(progressBar).toBeInTheDocument();
  });
});
