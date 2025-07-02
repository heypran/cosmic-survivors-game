import { render, screen } from '@testing-library/react';
import App from './App';

test('renders cosmic survivors game', () => {
  render(<App />);
  const titleElement = screen.getByText(/cosmic survivors/i);
  expect(titleElement).toBeInTheDocument();
});
