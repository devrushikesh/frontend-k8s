import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { todoAPI } from './api/todoAPI';

// Mock the todoAPI module
vi.mock('./api/todoAPI', () => ({
  todoAPI: {
    getAllTodos: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders app title', () => {
    todoAPI.getAllTodos.mockResolvedValue([]);
    render(<App />);

    expect(screen.getByText(/todo app/i)).toBeInTheDocument();
  });

  it('fetches and displays todos on mount', async () => {
    const mockTodos = [
      { id: 1, title: 'Test Todo 1', description: 'Desc 1', completed: false },
      { id: 2, title: 'Test Todo 2', description: 'Desc 2', completed: true },
    ];
    todoAPI.getAllTodos.mockResolvedValue(mockTodos);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    todoAPI.getAllTodos.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<App />);

    expect(screen.getByText(/loading todos/i)).toBeInTheDocument();
  });

  it('shows error message when fetching todos fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    todoAPI.getAllTodos.mockRejectedValue(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load todos/i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('shows empty state when no todos exist', async () => {
    todoAPI.getAllTodos.mockResolvedValue([]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });
  });

  it('adds a new todo when form is submitted', async () => {
    todoAPI.getAllTodos.mockResolvedValue([]);
    const newTodo = { id: 1, title: 'New Todo', description: 'New Desc', completed: false };
    todoAPI.createTodo.mockResolvedValue(newTodo);

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText(/todo title/i);
    const descInput = screen.getByPlaceholderText(/description/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(titleInput, 'New Todo');
    await user.type(descInput, 'New Desc');
    await user.click(submitButton);

    await waitFor(() => {
      expect(todoAPI.createTodo).toHaveBeenCalledWith({
        title: 'New Todo',
        description: 'New Desc',
      });
      expect(screen.getByText('New Todo')).toBeInTheDocument();
    });
  });

  it('toggles todo completion status', async () => {
    const mockTodos = [
      { id: 1, title: 'Test Todo', description: 'Desc', completed: false },
    ];
    todoAPI.getAllTodos.mockResolvedValue(mockTodos);
    const updatedTodo = { ...mockTodos[0], completed: true };
    todoAPI.updateTodo.mockResolvedValue(updatedTodo);

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(todoAPI.updateTodo).toHaveBeenCalledWith(1, { completed: true });
    });
  });

  it('deletes a todo when delete button is clicked', async () => {
    const mockTodos = [
      { id: 1, title: 'Test Todo', description: 'Desc', completed: false },
    ];
    todoAPI.getAllTodos.mockResolvedValue(mockTodos);
    todoAPI.deleteTodo.mockResolvedValue({});

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(todoAPI.deleteTodo).toHaveBeenCalledWith(1);
      expect(screen.queryByText('Test Todo')).not.toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  it('updates todos list when a todo is added', async () => {
    todoAPI.getAllTodos.mockResolvedValue([]);
    const newTodo = { id: 1, title: 'First Todo', description: '', completed: false };
    todoAPI.createTodo.mockResolvedValue(newTodo);

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText(/todo title/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(titleInput, 'First Todo');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First Todo')).toBeInTheDocument();
      expect(screen.queryByText(/no todos yet/i)).not.toBeInTheDocument();
    });
  });

  it('renders TodoForm component', async () => {
    todoAPI.getAllTodos.mockResolvedValue([]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/todo title/i)).toBeInTheDocument();
    });
  });

  it('renders TodoList component', async () => {
    todoAPI.getAllTodos.mockResolvedValue([]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });
  });

  it('displays multiple todos correctly', async () => {
    const mockTodos = [
      { id: 1, title: 'Todo 1', description: 'Desc 1', completed: false },
      { id: 2, title: 'Todo 2', description: 'Desc 2', completed: false },
      { id: 3, title: 'Todo 3', description: 'Desc 3', completed: true },
    ];
    todoAPI.getAllTodos.mockResolvedValue(mockTodos);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Todo 2')).toBeInTheDocument();
      expect(screen.getByText('Todo 3')).toBeInTheDocument();
    });
  });
});
