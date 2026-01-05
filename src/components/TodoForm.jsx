import { useState } from 'react';
import './TodoForm.css';

const TodoForm = ({ onAddTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsLoading(true);
    try {
      await onAddTodo({ title, description });
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Failed to add todo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="form-group">
        <input
          type="text"
          placeholder="Todo title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <textarea
          placeholder="Description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          className="form-textarea"
          rows="3"
        />
      </div>
      <button type="submit" disabled={isLoading} className="btn-add">
        {isLoading ? 'Adding...' : 'Add Todo'}
      </button>
    </form>
  );
};

export default TodoForm;
