import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from './TodoItem';

describe('TodoItem', () => {
  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
  };

  it('renders todo item with title and description', () => {
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn();
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders todo item without description', () => {
    const todoWithoutDesc = { ...mockTodo, description: '' };
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn();
    render(
      <TodoItem
        todo={todoWithoutDesc}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('renders checkbox as unchecked when todo is not completed', () => {
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn();
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders checkbox as checked when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn();
    render(
      <TodoItem
        todo={completedTodo}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('applies completed class when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn();
    const { container } = render(
      <TodoItem
        todo={completedTodo}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const todoItem = container.querySelector('.todo-item');
    expect(todoItem).toHaveClass('completed');
  });

  it('calls onToggleComplete when checkbox is clicked', async () => {
    const mockOnToggle = vi.fn().mockResolvedValue({});
    const mockOnDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith(1, true);
  });

  it('calls onToggleComplete with false when unchecking completed todo', async () => {
    const completedTodo = { ...mockTodo, completed: true };
    const mockOnToggle = vi.fn().mockResolvedValue({});
    const mockOnDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <TodoItem
        todo={completedTodo}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith(1, false);
  });

  it('shows confirmation dialog when delete button is clicked', async () => {
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
    confirmSpy.mockRestore();
  });

  it('calls onDelete when delete is confirmed', async () => {
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn().mockResolvedValue({});
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
    confirmSpy.mockRestore();
  });

  it('does not call onDelete when delete is cancelled', async () => {
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockOnDelete).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('handles toggle error gracefully', async () => {
    const mockOnToggle = vi.fn().mockRejectedValue(new Error('Failed'));
    const mockOnDelete = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles delete error gracefully', async () => {
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn().mockRejectedValue(new Error('Failed'));
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(consoleSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
