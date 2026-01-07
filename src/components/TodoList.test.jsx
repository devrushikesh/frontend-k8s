import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TodoList from './TodoList';

describe('TodoList', () => {
  const mockTodos = [
    {
      id: 1,
      title: 'Test Todo 1',
      description: 'Description 1',
      completed: false,
    },
    {
      id: 2,
      title: 'Test Todo 2',
      description: 'Description 2',
      completed: true,
    },
  ];

  it('shows loading state when isLoading is true', () => {
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnUpdate = vi.fn();
    render(
      <TodoList
        todos={[]}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        isLoading={true}
      />
    );

    expect(screen.getByText(/loading todos/i)).toBeInTheDocument();
  });

  it('shows empty state when there are no todos', () => {
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnUpdate = vi.fn();
    render(
      <TodoList
        todos={[]}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        isLoading={false}
      />
    );

    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('renders all todos when provided', () => {
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnUpdate = vi.fn();
    render(
      <TodoList
        todos={mockTodos}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        isLoading={false}
      />
    );

    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
  });

  it('renders correct number of todo items', () => {
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnUpdate = vi.fn();
    const { container } = render(
      <TodoList
        todos={mockTodos}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        isLoading={false}
      />
    );

    const todoItems = container.querySelectorAll('.todo-item');
    expect(todoItems).toHaveLength(2);
  });

  it('passes correct props to TodoItem components', () => {
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnUpdate = vi.fn();
    render(
      <TodoList
        todos={[mockTodos[0]]}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        isLoading={false}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    const deleteButton = screen.getByRole('button', { name: /delete/i });

    expect(checkbox).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it('renders todos in the correct order', () => {
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnUpdate = vi.fn();
    const { container } = render(
      <TodoList
        todos={mockTodos}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        isLoading={false}
      />
    );

    const todoTitles = container.querySelectorAll('.todo-title');
    expect(todoTitles[0]).toHaveTextContent('Test Todo 1');
    expect(todoTitles[1]).toHaveTextContent('Test Todo 2');
  });

  it('handles single todo correctly', () => {
    const mockOnToggle = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnUpdate = vi.fn();
    render(
      <TodoList
        todos={[mockTodos[0]]}
        onToggleComplete={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
        isLoading={false}
      />
    );

    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Todo 2')).not.toBeInTheDocument();
  });
});
