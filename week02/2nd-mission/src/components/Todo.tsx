import { useState } from "react";
import type { TTodo } from "../types/todo";
import { TodoList } from "../components/TodoList";
import { TodoForm } from "../components/TdoForm";

const Todo = (): React.ReactElement => {
  const [todos, setTodos] = useState<TTodo[]>([]);
  const [doneTodos, setDoneTodos] = useState<TTodo[]>([]);
  const [input, setInput] = useState<string>("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e): void => {
    e.preventDefault();
    console.log("동작함");
    const text = input.trim();
    if (text) {
      const newTodo: TTodo = {
        id: Date.now(),
        text,
      };
      setTodos((prevTodos): TTodo[] => [...prevTodos, newTodo]);
      setInput("");
    }
  };
  const completeTodo = (todo: TTodo): void => {
    setTodos((prevTodos): TTodo[] => prevTodos.filter((t) => t.id !== todo.id));
    setDoneTodos((prevDoneTodos): TTodo[] => [...prevDoneTodos, todo]);
  };

  const deleteTodo = (todo: TTodo): void => {
    setDoneTodos((prevDoneTodo): TTodo[] =>
      prevDoneTodo.filter((t): boolean => t.id !== todo.id),
    );
  };

  return (
    <div className="todo-container">
      <h1 className="todo-container__header">Oner Todo</h1>
      <TodoForm
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
      ></TodoForm>
      <div className="render-container">
        <TodoList
          title="할 일"
          todos={todos}
          buttonLabel="완료"
          buttonColor="#28a745"
          onClick={completeTodo}
        />
        <TodoList
          title="완료"
          todos={doneTodos}
          buttonLabel="삭제"
          buttonColor="#dc3545"
          onClick={deleteTodo}
        />
      </div>
    </div>
  );
};

export default Todo;
