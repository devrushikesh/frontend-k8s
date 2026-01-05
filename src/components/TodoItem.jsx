import './TodoItem.css';

const TodoItem = ({ todo, onToggleComplete, onDelete, onUpdate }) => {
  const handleToggle = async () => {
    try {
      await onToggleComplete(todo.id, !todo.completed);
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await onDelete(todo.id);
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="todo-checkbox"
        />
        <div className="todo-text">
          <h3 className="todo-title">{todo.title}</h3>
          {todo.description && (
            <p className="todo-description">{todo.description}</p>
          )}
        </div>
      </div>
      <button onClick={handleDelete} className="btn-delete">
        Delete
      </button>
    </div>
  );
};

export default TodoItem;
