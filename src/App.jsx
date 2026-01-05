import { useState, useEffect } from 'react';
import './App.css';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { todoAPI } from './api/todoAPI';

function App() {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await todoAPI.getAllTodos();
      setTodos(data);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load todos. Make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTodo = async (todoData) => {
    const newTodo = await todoAPI.createTodo(todoData);
    setTodos([newTodo, ...todos]);
  };

  const handleToggleComplete = async (id, completed) => {
    const updatedTodo = await todoAPI.updateTodo(id, { completed });
    setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
  };

  const handleDeleteTodo = async (id) => {
    await todoAPI.deleteTodo(id);
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleUpdateTodo = async (id, todoData) => {
    const updatedTodo = await todoAPI.updateTodo(id, todoData);
    setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
  };

  const completedCount = todos.filter((todo) => todo.completed).length;

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <h1>Todo App</h1>
          <p className="stats">
            {completedCount} of {todos.length} completed
          </p>
        </header>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <TodoForm onAddTodo={handleAddTodo} />

        <TodoList
          todos={todos}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTodo}
          onUpdate={handleUpdateTodo}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default App;
