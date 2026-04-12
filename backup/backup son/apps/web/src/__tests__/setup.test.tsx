import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple test to verify Jest setup works
describe('Jest Setup', () => {
  it('should work with jest-dom matchers', () => {
    render(<div data-testid="test">Hello World</div>);
    expect(screen.getByTestId('test')).toBeInTheDocument();
    expect(screen.getByTestId('test')).toHaveTextContent('Hello World');
  });

  it('should mock next/navigation', () => {
    const { useRouter } = require('next/navigation');
    const router = useRouter();
    expect(router.push).toBeDefined();
    expect(typeof router.push).toBe('function');
  });

  it('should mock next-auth', () => {
    const { useSession } = require('next-auth/react');
    const session = useSession();
    expect(session.status).toBe('unauthenticated');
  });
});

// Example component test
describe('Example Component Tests', () => {
  it('renders without crashing', () => {
    const TestComponent = () => <div>Test Component</div>;
    const { container } = render(<TestComponent />);
    expect(container).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const { userEvent } = require('@testing-library/user-event');
    const user = userEvent.setup();
    
    const Button = ({ onClick }: { onClick: () => void }) => (
      <button onClick={onClick}>Click me</button>
    );
    
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} />);
    
    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
