import React from 'react';

const CATEGORIES = [
  'All',
  'Technology',
  'Artificial Intelligence',
  'Programming',
  'Web Development',
  'Data Science',
  'Cybersecurity',
  'Gaming',
  'Education',
];

export const CategoryPills = ({ selectedCategory = 'All', onSelectCategory }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory.toLowerCase() === category.toLowerCase();
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-150 ${
              isSelected
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};
