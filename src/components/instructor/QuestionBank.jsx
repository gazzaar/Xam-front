import { useState } from 'react';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([
    {
      question_id: 1,
      question_text: 'What is the capital of France?',
      question_type: 'multiple-choice',
      category: 'Geography',
      difficulty: 'easy',
      options: [
        { text: 'Paris', is_correct: true },
        { text: 'London', is_correct: false },
        { text: 'Berlin', is_correct: false },
      ],
      score: 1,
    },
    {
      question_id: 2,
      question_text: 'What is 2 + 2?',
      question_type: 'multiple-choice',
      category: 'Math',
      difficulty: 'easy',
      options: [
        { text: '3', is_correct: false },
        { text: '4', is_correct: true },
        { text: '5', is_correct: false },
      ],
      score: 1,
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(null);
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'multiple-choice',
    category: '',
    difficulty: 'easy',
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
    score: 1,
  });

  const addQuestion = () => {
    const newQuestion = {
      question_id: questions.length + 1,
      ...formData,
    };
    setQuestions([...questions, newQuestion]);
    setShowAddForm(false);
    setFormData({
      question_text: '',
      question_type: 'multiple-choice',
      category: '',
      difficulty: 'easy',
      options: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
      score: 1,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      ),
    }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { text: '', is_correct: false }],
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      setFormData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form data
    if (!formData.question_text.trim()) {
      setError('Question text is required');
      return;
    }
    if (!formData.category.trim()) {
      setError('Category is required');
      return;
    }
    if (formData.options.some((opt) => !opt.text.trim())) {
      setError('All options must have text');
      return;
    }
    if (!formData.options.some((opt) => opt.is_correct)) {
      return;
    }

    if (showEditForm) {
      const updatedQuestions = questions.map((question) =>
        question.question_id === showEditForm
          ? { ...question, ...formData }
          : question
      );
      setQuestions(updatedQuestions);
      setShowEditForm(null);
    } else {
      addQuestion();
    }

    setFormData({
      question_text: '',
      question_type: 'multiple-choice',
      category: '',
      difficulty: 'easy',
      options: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
      score: 1,
    });
  };

  const handleEdit = (question) => {
    setShowEditForm(question.question_id);
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      category: question.category,
      difficulty: question.difficulty,
      options: question.options,
      score: question.score,
    });
  };

  const handleDelete = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter((question) => question.question_id !== questionId));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600"
        >
          Add New Question
        </button>
      </div>

      {(showAddForm || showEditForm) && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {showEditForm ? 'Edit Question' : 'Add New Question'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Question Text
              </label>
              <textarea
                name="question_text"
                value={formData.question_text}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Score
                </label>
                <input
                  type="number"
                  name="score"
                  value={formData.score}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Options
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  + Add Option
                </button>
              </div>
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) =>
                      handleOptionChange(index, 'text', e.target.value)
                    }
                    required
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder={`Option ${index + 1}`}
                  />
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="correct_option"
                      checked={option.is_correct}
                      onChange={(e) =>
                        handleOptionChange(
                          index,
                          'is_correct',
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Correct</span>
                  </label>
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(null);
                  setFormData({
                    question_text: '',
                    question_type: 'multiple-choice',
                    category: '',
                    difficulty: 'easy',
                    options: [
                      { text: '', is_correct: false },
                      { text: '', is_correct: false },
                      { text: '', is_correct: false },
                    ],
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600"
              >
                {showEditForm ? 'Update' : 'Save'} Question
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {questions.map((question) => (
            <li key={question.question_id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-medium text-gray-900">
                      {question.question_text}
                    </h2>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="mr-4">
                        Category: {question.category}
                      </span>
                      <span className="mr-4">
                        Difficulty: {question.difficulty}
                      </span>
                      <span>Type: {question.question_type}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-4">
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(question.question_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Options:
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {question.options.map((option, index) => (
                      <li
                        key={index}
                        className={`text-sm ${
                          option.is_correct
                            ? 'text-green-600 font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        {option.text}
                        {option.is_correct && (
                          <span className="ml-2 text-xs text-green-500">
                            (Correct)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
