'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Check, Trash2, Plus, Loader2 } from 'lucide-react';

interface Todo {
  id: number;
  task: string;
  is_complete: boolean;
  created_at: string;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (err: any) {
      console.error('Error fetching todos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ task: newTask.trim() }])
        .select();

      if (error) throw error;

      if (data) {
        setTodos([data[0], ...todos]);
        setNewTask('');
      }
    } catch (err: any) {
      console.error('Error adding todo:', err);
      setError(err.message);
    }
  };

  const toggleTodo = async (id: number, is_complete: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: !is_complete })
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.map(t => 
        t.id === id ? { ...t, is_complete: !is_complete } : t
      ));
    } catch (err: any) {
      console.error('Error updating todo:', err);
      setError(err.message);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.filter(t => t.id !== id));
    } catch (err: any) {
      console.error('Error deleting todo:', err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-500 font-medium">Supabase Connected</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Supabase Connection Test</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
            <p className="mt-2 text-xs text-gray-500">
              Did you create the 'todos' table in Supabase? Check supabase/schema.sql
            </p>
          </div>
        )}

        <form onSubmit={addTodo} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!newTask.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks yet. Add one above to test the database!
          </div>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  todo.is_complete ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-blue-300'
                } transition-all`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleTodo(todo.id, todo.is_complete)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      todo.is_complete
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {todo.is_complete && <Check className="w-4 h-4" />}
                  </button>
                  <span className={`${todo.is_complete ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {todo.task}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
