import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoForm from './TodoForm';

describe('TodoForm', () => {
  it('renders form inputs', () => {
    const mockOnAddTodo = vi.fn();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    expect(screen.getByPlaceholderText(/todo title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('updates title input value on change', async () => {
    const mockOnAddTodo = vi.fn();
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const titleInput = screen.getByPlaceholderText(/todo title/i);
    await user.type(titleInput, 'New Todo');

    expect(titleInput).toHaveValue('New Todo');
  });

  it('updates description input value on change', async () => {
    const mockOnAddTodo = vi.fn();
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const descriptionInput = screen.getByPlaceholderText(/description/i);
    await user.type(descriptionInput, 'Todo description');

    expect(descriptionInput).toHaveValue('Todo description');
  });

  it('calls onAddTodo with correct data when form is submitted', async () => {
    const mockOnAddTodo = vi.fn().mockResolvedValue({});
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const titleInput = screen.getByPlaceholderText(/todo title/i);
    const descriptionInput = screen.getByPlaceholderText(/description/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(titleInput, 'Test Todo');
    await user.type(descriptionInput, 'Test Description');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnAddTodo).toHaveBeenCalledWith({
        title: 'Test Todo',
        description: 'Test Description',
      });
    });
  });

  it('clears form after successful submission', async () => {
    const mockOnAddTodo = vi.fn().mockResolvedValue({});
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const titleInput = screen.getByPlaceholderText(/todo title/i);
    const descriptionInput = screen.getByPlaceholderText(/description/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(titleInput, 'Test Todo');
    await user.type(descriptionInput, 'Test Description');
    await user.click(submitButton);

    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
    });
  });

  it('shows alert when submitting with empty title', async () => {
    const mockOnAddTodo = vi.fn();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const submitButton = screen.getByRole('button', { name: /add todo/i });
    await user.click(submitButton);

    expect(alertSpy).toHaveBeenCalledWith('Please enter a title');
    expect(mockOnAddTodo).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('disables form inputs while submitting', async () => {
    let resolvePromise;
    const mockOnAddTodo = vi.fn(() => new Promise((resolve) => {
      resolvePromise = resolve;
    }));
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const titleInput = screen.getByPlaceholderText(/todo title/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(titleInput, 'Test Todo');
    await user.click(submitButton);

    // Check if inputs are disabled during submission
    expect(titleInput).toBeDisabled();
    expect(submitButton).toBeDisabled();

    // Resolve the promise to finish submission
    resolvePromise({});

    await waitFor(() => {
      expect(titleInput).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('handles error during submission', async () => {
    const mockOnAddTodo = vi.fn().mockRejectedValue(new Error('Failed'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const titleInput = screen.getByPlaceholderText(/todo title/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(titleInput, 'Test Todo');
    await user.click(submitButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to add todo');
    });

    alertSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
