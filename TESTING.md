# Frontend Testing Documentation

This frontend project includes comprehensive component testing using **Vitest** and **React Testing Library**.

## Test Results Summary
- **Component Tests**: 39 tests covering all React components
- **Test Files**: 4 test files
- **Coverage**: All components (App, TodoForm, TodoItem, TodoList)

## Test Framework
- **Vitest**: Fast unit test framework built for Vite
- **React Testing Library**: Testing utilities for React components
- **jsdom**: Browser environment simulation

## Test Structure

### 1. Component Tests

#### App.test.jsx (12 tests)
Tests for the main App component:
- Rendering and initialization
- Fetching todos on mount
- Loading and error states
- Adding new todos
- Toggling todo completion
- Deleting todos
- Integration between components

#### TodoForm.test.jsx (8 tests)
Tests for the TodoForm component:
- Form input rendering
- Input value changes
- Form submission with valid data
- Form clearing after submission
- Validation (empty title)
- Loading states during submission
- Error handling

#### TodoItem.test.jsx (12 tests)
Tests for the TodoItem component:
- Rendering todo data (title, description)
- Checkbox state (checked/unchecked)
- CSS classes for completed state
- Toggle completion functionality
- Delete functionality with confirmation
- Error handling for toggle/delete operations

#### TodoList.test.jsx (7 tests)
Tests for the TodoList component:
- Loading state display
- Empty state display
- Rendering multiple todos
- Correct prop passing to TodoItem
- Todo ordering

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests Once (CI Mode)
```bash
npm test -- --run
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Watch Mode (Development)
```bash
npm test
# Tests will re-run automatically when files change
```

## Test Configuration

Tests are configured in `vite.config.js`:
- **Environment**: jsdom (browser simulation)
- **Globals**: true (no need to import describe, it, expect)
- **Setup**: ./src/test/setup.js (includes jest-dom matchers)
- **CSS**: enabled (CSS imports don't break tests)

## Writing New Tests

### Basic Test Structure
```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const mockFn = vi.fn();
    render(<YourComponent onAction={mockFn} />);
    
    await user.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Mocking API Calls
```javascript
vi.mock('./api/todoAPI', () => ({
  todoAPI: {
    getAllTodos: vi.fn(),
    createTodo: vi.fn(),
  },
}));

// In test:
todoAPI.getAllTodos.mockResolvedValue([/* mock data */]);
```

## Best Practices

1. **Test User Behavior**: Focus on what users see and do, not implementation details
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText`, `getByText` over `getByTestId`
3. **Mock External Dependencies**: Mock API calls and external modules
4. **Async Testing**: Use `waitFor` and `async/await` for asynchronous operations
5. **Clean Up**: Tests automatically clean up after each test (via setup.js)
6. **User Events**: Use `userEvent` instead of `fireEvent` for more realistic interactions

## Common Testing Patterns

### Testing Form Submission
```javascript
const user = userEvent.setup();
const input = screen.getByPlaceholderText('Enter text');
await user.type(input, 'test value');
await user.click(screen.getByRole('button'));
expect(mockSubmit).toHaveBeenCalledWith({ value: 'test value' });
```

### Testing Loading States
```javascript
todoAPI.getAllTodos.mockImplementation(() => new Promise(() => {}));
render(<App />);
expect(screen.getByText(/loading/i)).toBeInTheDocument();
```

### Testing Error Handling
```javascript
todoAPI.getAllTodos.mockRejectedValue(new Error('Failed'));
render(<App />);
await waitFor(() => {
  expect(screen.getByText(/failed/i)).toBeInTheDocument();
});
```

### Testing Conditional Rendering
```javascript
const { rerender } = render(<TodoItem todo={{ completed: false }} />);
expect(screen.getByRole('checkbox')).not.toBeChecked();

rerender(<TodoItem todo={{ completed: true }} />);
expect(screen.getByRole('checkbox')).toBeChecked();
```

## CI/CD Integration

Tests can be run in continuous integration:
```bash
npm test -- --run --reporter=verbose
```

For coverage reports:
```bash
npm run test:coverage
```

## Troubleshooting

### Act Warnings
If you see "not wrapped in act(...)" warnings:
- These are usually harmless if tests pass
- Ensure async operations use `await` and `waitFor`
- Mock API calls to control timing

### Tests Timing Out
- Check for unmocked API calls
- Ensure promises resolve/reject in tests
- Use `--testTimeout` flag if needed

### Import Errors
- Ensure all dependencies are installed
- Check vite.config.js setup
- Verify test setup file is configured

## Resources
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event API](https://testing-library.com/docs/user-event/intro)
